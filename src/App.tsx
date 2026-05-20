import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

// Active progress phase (shown while isGenerating is true)
export type GenerationPhase = 'uploading' | 'starting' | 'generating';

// Which pipeline stage produced the error — drives phase-specific user copy
export type GenerationErrorPhase =
  | 'uploading_inputs'
  | 'starting_generation'
  | 'polling_generation'
  | 'preloading_result'
  | 'other';

export interface GenerationError {
  phase: GenerationErrorPhase;
  message: string;
}

// ─── Supabase client (singleton) ─────────────────────────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// ─── HEIC conversion ──────────────────────────────────────────────────────────

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  console.log('[HEIC] converting', file.name, file.type, '->', 'image/jpeg');
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 }) as Blob;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
}

const HEIC_TYPES = new Set(['image/heic', 'image/heif']);

async function normalizeFile(file: File): Promise<File> {
  const ltype = file.type.toLowerCase();
  if (HEIC_TYPES.has(ltype)) return convertHeicToJpeg(file);
  if (/\.(heic|heif)$/i.test(file.name)) return convertHeicToJpeg(file);
  return file;
}

// ─── Image preload with decode() + timeout ────────────────────────────────────

function preloadImage(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const PRELOAD_TIMEOUT_MS = 15_000;

    if (signal.aborted) {
      reject(new DOMException('Preload aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => reject(new Error('Preload timeout')), PRELOAD_TIMEOUT_MS);
    const cleanup = () => clearTimeout(timer);

    const tryDecode = (img: HTMLImageElement) => {
      if (typeof img.decode === 'function') {
        img.decode()
          .then(() => { cleanup(); resolve(); })
          .catch(() => { cleanup(); resolve(); }); // decode failure is non-fatal
      } else {
        cleanup(); resolve();
      }
    };

    const onAbort = () => { cleanup(); reject(new DOMException('Preload aborted', 'AbortError')); };
    signal.addEventListener('abort', onAbort, { once: true });

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { signal.removeEventListener('abort', onAbort); tryDecode(img); };
    img.onerror = () => {
      const img2 = new window.Image();
      img2.onload = () => { signal.removeEventListener('abort', onAbort); tryDecode(img2); };
      img2.onerror = () => {
        signal.removeEventListener('abort', onAbort);
        cleanup();
        reject(new Error(`Image failed to preload: ${url.substring(0, 80)}`));
      };
      img2.src = url;
    };
    img.src = url;
  });
}

// ─── Error normalization ──────────────────────────────────────────────────────

function makeError(phase: GenerationErrorPhase, message: string): GenerationError {
  return { phase, message };
}

function normalizeError(error: unknown, phase: GenerationErrorPhase): GenerationError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return makeError(phase, 'Generation cancelled.');
  }

  const raw = error instanceof Error ? error.message : String(error ?? '');
  const lo = raw.toLowerCase();

  if (lo.includes('moderation') || lo.includes('policy') || lo.includes('unsafe') ||
      lo.includes('blocked') || lo.includes('content_violation') || lo.includes('flagged')) {
    return makeError(phase, 'This image could not be generated because it did not pass moderation checks.');
  }

  if (lo.includes('timeout') || lo.includes('timed out')) {
    return makeError(phase, 'Generation is taking longer than expected. Please try again.');
  }

  // Phase-specific network messages
  if (phase === 'uploading_inputs') {
    return makeError(phase, 'Connection issue while uploading images. Please try again.');
  }
  if (phase === 'starting_generation') {
    return makeError(phase, 'Connection issue while starting generation. Please try again.');
  }
  if (phase === 'polling_generation') {
    return makeError(phase, 'Connection issue while waiting for the result. Please try again.');
  }
  if (phase === 'preloading_result') {
    return makeError(phase, 'Generated image could not be loaded. Please try again.');
  }

  if (lo.includes('500') || lo.includes('internal server error') ||
      lo.includes('edge function') || lo.includes('storage upload') ||
      lo.includes('database')) {
    return makeError(phase, 'Server issue detected. Please try again in a moment.');
  }

  if (lo.includes('unexpected response') || lo.includes('unexpected content-type') ||
      lo.includes('no output url') || lo.includes('not a valid https') ||
      lo.includes('temporary openai url') || lo.includes('generation succeeded but no output')) {
    return makeError(phase, 'Server issue detected. Please try again in a moment.');
  }

  if (raw.length > 0 && raw.length < 200 && !raw.includes('\n') && !raw.includes(' at ')) {
    return makeError(phase, raw);
  }

  return makeError(phase, 'Generation failed. Please try again.');
}

function errDetail(err: unknown): Record<string, string> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: (err.stack ?? '').substring(0, 400) };
  }
  return { name: 'unknown', message: String(err) };
}

// ─── URL validation ───────────────────────────────────────────────────────────

function validateOutputUrl(url: string | undefined): string {
  if (!url) throw new Error('Generation succeeded but no output URL was returned');
  if (!url.startsWith('https://')) {
    throw new Error(`Output URL is not a valid HTTPS URL: "${url.substring(0, 80)}"`);
  }
  if (url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
      url.includes('openai.com/files/')) {
    throw new Error('Received temporary OpenAI URL — backend must upload to storage first');
  }
  return url;
}

// ─── Storage upload helper ────────────────────────────────────────────────────
// Uploads a single file to the generation-inputs bucket with up to 2 retries.
// Returns the signed URL the backend will use to download it.

async function uploadInputImage(
  file: File,
  path: string,
  fieldName: string,
  requestId: string,
  signal: AbortSignal,
): Promise<string> {
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 2000;

  let lastErr: Error = new Error('Upload failed');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) throw new DOMException('Upload aborted', 'AbortError');

    const t0 = Date.now();
    console.log('[UPLOAD INPUT START]', {
      requestId, field: fieldName, attempt, maxAttempts: MAX_ATTEMPTS,
      fileName: file.name, fileSize: file.size, mimeType: file.type, path,
    });

    try {
      const { error: uploadError } = await supabase.storage
        .from('generation-inputs')
        .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true });

      if (uploadError) {
        // Log the raw storage error object before normalising
        console.error('[UPLOAD INPUT STORAGE ERROR]', {
          requestId, field: fieldName, attempt, path,
          fileName: file.name, fileSize: file.size, mimeType: file.type,
          statusCode: (uploadError as { statusCode?: string | number }).statusCode,
          message: uploadError.message,
          error: (uploadError as { error?: string }).error,
          cause: (uploadError as { cause?: unknown }).cause,
          ua: navigator.userAgent,
        });
        throw new Error(`Storage upload error (${(uploadError as { statusCode?: string | number }).statusCode ?? 'unknown'}): ${uploadError.message}`);
      }

      const { data: signedData, error: signErr } = await supabase.storage
        .from('generation-inputs')
        .createSignedUrl(path, 1800);

      if (signErr || !signedData?.signedUrl) {
        throw new Error(`Failed to create signed URL: ${signErr?.message ?? 'no URL returned'}`);
      }

      console.log('[UPLOAD INPUT SUCCESS]', {
        requestId, field: fieldName, attempt, durationMs: Date.now() - t0,
        fileName: file.name, fileSize: file.size, path,
        signedUrl: signedData.signedUrl.substring(0, 80),
      });
      return signedData.signedUrl;

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;

      lastErr = err instanceof Error ? err : new Error(String(err));
      // Only log here if it wasn't already logged as a storage error above
      if (!lastErr.message.startsWith('Storage upload error')) {
        console.error('[UPLOAD INPUT FAILURE]', {
          requestId, field: fieldName, attempt, durationMs: Date.now() - t0,
          fileName: file.name, fileSize: file.size, mimeType: file.type, path,
          ...errDetail(lastErr),
          ua: navigator.userAgent,
        });
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise<void>(r => setTimeout(r, RETRY_DELAY_MS));
        if (signal.aborted) throw new DOMException('Upload aborted', 'AbortError');
      }
    }
  }

  throw lastErr;
}

// Delete uploaded input files after the job starts — best effort, non-blocking
function cleanupInputFiles(paths: string[]): void {
  if (paths.length === 0) return;
  supabase.storage.from('generation-inputs').remove(paths)
    .then(() => console.log('[CLEANUP] removed input files:', paths.join(', ')))
    .catch(e => console.warn('[CLEANUP] failed to remove input files:', e));
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRef, setSelectedRef] = useState<ReferenceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>('uploading');
  const [generationError, setGenerationError] = useState<GenerationError | null>(null);

  // Photos
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');
  const [photo1b, setPhoto1b] = useState<File | null>(null);
  const [photo2b, setPhoto2b] = useState<File | null>(null);
  const [preview1b, setPreview1b] = useState<string>('');
  const [preview2b, setPreview2b] = useState<string>('');

  // ── Lifecycle refs ──────────────────────────────────────────────────────────
  const activeRequestId = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollInFlightRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const cooldownUntilRef = useRef<number>(0);

  // ── Cleanup helpers ─────────────────────────────────────────────────────────

  const abortActive = (reason: string) => {
    if (pollTimeoutRef.current !== null) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('[GENERATION CLEANUP]', reason);
    }
    pollInFlightRef.current = false;
  };

  const fullCleanup = (reason: string) => {
    abortActive(reason);
    activeRequestId.current = '';
    isGeneratingRef.current = false;
  };

  useEffect(() => {
    return () => { fullCleanup('unmount'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleImageSelect = (ref: ReferenceItem) => {
    setSelectedCategory(ref.style);
    setSelectedRef(ref);
    setCurrentView('upload');
  };

  const handleBackToHome = () => {
    fullCleanup('back to home');
    if (generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(generatedImageUrl);
    setIsGenerating(false);
    setCurrentView('home');
    setSelectedRef(null);
    setSelectedCategory(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError(null);
    setPhoto1(null); setPhoto2(null);
    setPreview1(''); setPreview2('');
    setPhoto1b(null); setPhoto2b(null);
    setPreview1b(''); setPreview2b('');
  };

  const handleBackFromUpload = () => {
    fullCleanup('back from upload');
    setIsGenerating(false);
    setCurrentView('home');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError(null);
  };

  const handleBackToUpload = () => {
    fullCleanup('back to upload');
    setIsGenerating(false);
    setCurrentView('upload');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError(null);
  };

  // ── Poll ────────────────────────────────────────────────────────────────────

  const pollPrediction = (
    predictionId: string,
    requestId: string,
    provider: 'openai' | 'replicate',
    signal: AbortSignal,
    generationStartTime: number,
  ) => {
    const POLL_INTERVAL_MS = 5000;
    const POLL_NETWORK_RETRY_DELAY_MS = 7000;
    const MAX_GENERATION_WAIT_MS = 10 * 60 * 1000; // 10 minutes

    const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
    const authHeader = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };
    const pollParam = provider === 'openai' ? 'jobId' : 'id';

    console.log('[POLL START]', { requestId, predictionId, provider, generationStartTime });

    const schedulePoll = (delayMs: number) => {
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      pollTimeoutRef.current = setTimeout(poll, delayMs);
    };

    const finishWithError = (ge: GenerationError) => {
      pollTimeoutRef.current = null;
      pollInFlightRef.current = false;
      setGenerationError(ge);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;
      console.log('[GENERATION READY] after poll failure phase=' + ge.phase);
    };

    const poll = async () => {
      if (activeRequestId.current !== requestId || signal.aborted) {
        console.log('[POLL CANCELLED]', { requestId, predictionId, provider });
        return;
      }

      if (pollInFlightRef.current) {
        console.log('[POLL SKIPPED] in flight', { requestId, predictionId });
        schedulePoll(POLL_INTERVAL_MS);
        return;
      }

      pollInFlightRef.current = true;

      try {
        const res = await fetch(
          `${apiBase}?${pollParam}=${predictionId}`,
          { headers: authHeader, signal }
        );

        pollInFlightRef.current = false;

        if (activeRequestId.current !== requestId) {
          console.log('[POLL IGNORED STALE] after fetch', { requestId });
          return;
        }

        const ct = res.headers.get('content-type') ?? '';
        if (!ct.includes('application/json')) {
          throw new Error(`Poll response unexpected content-type "${ct}"`);
        }

        const data = await res.json() as {
          provider?: string;
          status: string;
          output?: string;
          error?: string;
        };

        if (activeRequestId.current !== requestId) {
          console.log('[POLL IGNORED STALE] after json', { requestId, status: data.status });
          return;
        }

        console.log('[POLL]', { requestId, predictionId, provider: data.provider, status: data.status, elapsedMs: Date.now() - generationStartTime });

        if (data.status === 'succeeded') {
          console.log('[POLL SUCCESS]', { requestId, predictionId, provider, url: (data.output ?? '').substring(0, 100) });

          let validatedUrl: string;
          try {
            validatedUrl = validateOutputUrl(data.output);
          } catch (validateErr) {
            console.error('[POLL FAILURE]', {
              phase: 'polling_generation', requestId, predictionId, provider,
              ...errDetail(validateErr), ua: navigator.userAgent,
            });
            finishWithError(normalizeError(validateErr, 'polling_generation'));
            return;
          }

          const preloadT0 = Date.now();
          console.log('[PRELOAD RESULT START]', { requestId, url: validatedUrl.substring(0, 100) });
          try {
            await preloadImage(validatedUrl, signal);
            console.log('[PRELOAD RESULT SUCCESS]', { requestId, durationMs: Date.now() - preloadT0 });
          } catch (preloadErr) {
            if (preloadErr instanceof DOMException && preloadErr.name === 'AbortError') {
              console.log('[PRELOAD RESULT CANCELLED]', { requestId });
              return;
            }
            // Non-fatal: image may still render via the <img> tag
            console.warn('[PRELOAD RESULT FAILURE]', {
              phase: 'preloading_result', requestId, url: validatedUrl.substring(0, 100),
              durationMs: Date.now() - preloadT0,
              ...errDetail(preloadErr), ua: navigator.userAgent,
            });
          }

          if (activeRequestId.current !== requestId) {
            console.log('[POLL IGNORED STALE] after preload', { requestId });
            return;
          }

          pollTimeoutRef.current = null;
          pollInFlightRef.current = false;
          setGenerationError(null);
          setImgLoadFailed(false);
          setRawImageUrl(validatedUrl);
          setGeneratedImageUrl(validatedUrl);
          setIsGenerating(false);
          isGeneratingRef.current = false;
          cooldownUntilRef.current = Date.now() + 1000;
          console.log('[GENERATION READY] success');
          return;
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          console.error('[POLL FAILURE]', {
            phase: 'polling_generation', requestId, predictionId, provider,
            status: data.status, backendError: data.error, ua: navigator.userAgent,
          });
          finishWithError(normalizeError(data.error ?? 'Generation failed. Please try again.', 'polling_generation'));
          return;
        }

        schedulePoll(POLL_INTERVAL_MS);

      } catch (err) {
        pollInFlightRef.current = false;

        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('[POLL CANCELLED] fetch aborted', { requestId });
          return;
        }
        if (activeRequestId.current !== requestId) {
          console.log('[POLL IGNORED STALE] in catch', { requestId });
          return;
        }

        const elapsedMs = Date.now() - generationStartTime;
        console.warn('[POLL NETWORK ERROR] retrying — backend job continues independently', {
          phase: 'polling_generation', requestId, predictionId, provider,
          elapsedMs, ...errDetail(err), ua: navigator.userAgent,
        });

        // Only give up when the total generation wall-clock time exceeds the limit.
        // Temporary network errors (mobile going to background, brief connectivity
        // loss, edge function cold-start) must NOT terminate a job that is still
        // running server-side.
        if (elapsedMs >= MAX_GENERATION_WAIT_MS) {
          console.error('[POLL TIMEOUT]', {
            phase: 'polling_generation', requestId, predictionId, provider,
            elapsedMs, ua: navigator.userAgent,
          });
          finishWithError(makeError('polling_generation', 'Generation is taking longer than expected. Please try again.'));
          return;
        }

        schedulePoll(POLL_NETWORK_RETRY_DELAY_MS);
      }
    };

    poll();
  };

  // ── Generate ────────────────────────────────────────────────────────────────

  const handleGenerate = async (
    photo1: File,
    photo2: File,
    referenceFile: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => {
    if (isGeneratingRef.current) {
      console.log('[GENERATION LOCKED] already generating');
      return;
    }

    const now = Date.now();
    if (now < cooldownUntilRef.current) {
      console.log('[GENERATION LOCKED] cooldown', cooldownUntilRef.current - now, 'ms remaining');
      return;
    }

    abortActive('new generation starting');

    if (generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(generatedImageUrl);

    if (!photo1 || !photo2 || !referenceFile || !selectedRef) {
      setGenerationError(makeError('other', 'Missing required data. Please try again.'));
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const generationStartTime = Date.now();

    isGeneratingRef.current = true;
    activeRequestId.current = requestId;

    const ac = new AbortController();
    abortControllerRef.current = ac;
    const { signal } = ac;

    console.log('[GENERATION START]', { requestId, referenceId: selectedRef.id, ua: navigator.userAgent.substring(0, 80) });

    setIsGenerating(true);
    setGenerationPhase('uploading');
    setGenerationError(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    // ── Step 1: Normalize HEIC files ──────────────────────────────────────────

    let p1 = photo1, p2 = photo2;
    let p1b = photo1b ?? null, p2b = photo2b ?? null;

    try {
      [p1, p2] = await Promise.all([normalizeFile(photo1), normalizeFile(photo2)]);
      if (photo1b) p1b = await normalizeFile(photo1b);
      if (photo2b) p2b = await normalizeFile(photo2b);
    } catch (normalizeErr) {
      console.error('[HEIC CONVERT ERROR]', { requestId, ...errDetail(normalizeErr) });
      if (activeRequestId.current !== requestId) return;
      setGenerationError(makeError('other', 'Failed to convert image format. Please use JPEG or PNG.'));
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;
      return;
    }

    if (activeRequestId.current !== requestId || signal.aborted) return;

    // ── Step 2: Upload each image to Supabase Storage ─────────────────────────
    // Individual uploads via the JS client are far more reliable on mobile
    // than a single large multipart POST.

    const prefix = `inputs/${requestId}`;
    const uploadedPaths: string[] = [];

    const imagesToUpload: Array<{ key: string; file: File }> = [
      { key: 'person1', file: p1 },
      { key: 'person2', file: p2 },
      { key: 'reference', file: referenceFile },
    ];
    if (p1b) imagesToUpload.push({ key: 'person1b', file: p1b });
    if (p2b) imagesToUpload.push({ key: 'person2b', file: p2b });

    const imageUrls: Record<string, string> = {};

    for (const { key, file } of imagesToUpload) {
      if (signal.aborted || activeRequestId.current !== requestId) return;

      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${prefix}/${key}.${ext}`;

      try {
        const url = await uploadInputImage(file, path, key, requestId, signal);
        imageUrls[key] = url;
        uploadedPaths.push(path);
      } catch (uploadErr) {
        if (uploadErr instanceof DOMException && uploadErr.name === 'AbortError') return;
        if (activeRequestId.current !== requestId) return;

        // uploadInputImage already logged [UPLOAD INPUT FAILURE] — just finalize
        cleanupInputFiles(uploadedPaths);
        setGenerationError(normalizeError(uploadErr, 'uploading_inputs'));
        setIsGenerating(false);
        isGeneratingRef.current = false;
        cooldownUntilRef.current = Date.now() + 1000;
        console.log('[GENERATION READY] after upload failure');
        return;
      }
    }

    if (activeRequestId.current !== requestId || signal.aborted) {
      cleanupInputFiles(uploadedPaths);
      return;
    }

    console.log('[UPLOAD] all images uploaded', Object.keys(imageUrls));

    // ── Step 3: POST small JSON to /generate ──────────────────────────────────

    setGenerationPhase('starting');

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
    const POST_RETRY_DELAY_MS = 3000;

    const payload = {
      referenceId: selectedRef.id,
      style: selectedRef.style,
      ...(mode ? { mode } : {}),
      images: imageUrls,
    };
    const payloadJson = JSON.stringify(payload);

    const doPost = (sig: AbortSignal) => fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: payloadJson,
      signal: sig,
    });

    try {
      const postT0 = Date.now();
      console.log('[POST GENERATE START]', {
        requestId, referenceId: selectedRef.id, payloadBytes: payloadJson.length,
        imageKeys: Object.keys(imageUrls),
      });

      let response: Response;
      try {
        response = await doPost(signal);
      } catch (postErr) {
        if (postErr instanceof DOMException && postErr.name === 'AbortError') {
          cleanupInputFiles(uploadedPaths); return;
        }
        console.warn('[POST GENERATE FAILURE] first attempt, retrying', {
          phase: 'starting_generation', requestId, durationMs: Date.now() - postT0,
          ...errDetail(postErr), ua: navigator.userAgent,
        });
        await new Promise<void>(r => setTimeout(r, POST_RETRY_DELAY_MS));
        if (activeRequestId.current !== requestId || signal.aborted) {
          cleanupInputFiles(uploadedPaths); return;
        }
        console.log('[POST GENERATE START] retry', { requestId });
        try {
          response = await doPost(signal);
        } catch (retryErr) {
          if (retryErr instanceof DOMException && retryErr.name === 'AbortError') {
            cleanupInputFiles(uploadedPaths); return;
          }
          console.error('[POST GENERATE FAILURE] retry also failed', {
            phase: 'starting_generation', requestId, durationMs: Date.now() - postT0,
            ...errDetail(retryErr), ua: navigator.userAgent,
          });
          cleanupInputFiles(uploadedPaths);
          setGenerationError(normalizeError(retryErr, 'starting_generation'));
          setIsGenerating(false);
          isGeneratingRef.current = false;
          cooldownUntilRef.current = Date.now() + 1000;
          console.log('[GENERATION READY] after POST retry failure');
          return;
        }
      }

      if (activeRequestId.current !== requestId || signal.aborted) {
        cleanupInputFiles(uploadedPaths); return;
      }

      const postDuration = Date.now() - postT0;
      const ct = response.headers.get('content-type') ?? '';
      console.log('[POST GENERATE SUCCESS]', {
        requestId, status: response.status, contentType: ct, durationMs: postDuration,
      });

      if (!ct.includes('application/json')) {
        let body = '';
        try { body = await response.text(); } catch { /* ignore */ }
        const msg = `Server returned unexpected content-type "${ct}" (status ${response.status}). ` +
          (body ? `Body: ${body.substring(0, 200)}` : '');
        console.error('[POST GENERATE FAILURE]', {
          phase: 'starting_generation', requestId, status: response.status, contentType: ct, body: body.substring(0, 200), durationMs: postDuration,
        });
        cleanupInputFiles(uploadedPaths);
        setGenerationError(normalizeError(new Error(msg), 'starting_generation'));
        setIsGenerating(false);
        isGeneratingRef.current = false;
        cooldownUntilRef.current = Date.now() + 1000;
        return;
      }

      const jsonData = await response.json() as {
        provider?: 'openai' | 'replicate';
        status?: string;
        predictionId?: string;
        output?: string;
        error?: string;
        model?: string;
        referenceId?: string;
        functionVersion?: string;
      };

      console.log('[POST GENERATE RESPONSE]', {
        requestId,
        provider: jsonData.provider,
        status: jsonData.status,
        predictionId: jsonData.predictionId,
        output: jsonData.output?.substring(0, 80),
        functionVersion: jsonData.functionVersion,
        httpStatus: response.status,
        durationMs: postDuration,
      });

      if (activeRequestId.current !== requestId || signal.aborted) {
        cleanupInputFiles(uploadedPaths); return;
      }

      if (!response.ok) {
        const message = typeof jsonData?.error === 'string'
          ? jsonData.error : JSON.stringify(jsonData);
        console.error('[POST GENERATE FAILURE]', {
          phase: 'starting_generation', requestId, httpStatus: response.status,
          backendError: message, durationMs: postDuration, ua: navigator.userAgent,
        });
        cleanupInputFiles(uploadedPaths);
        setGenerationError(normalizeError(new Error(message || `Server error ${response.status}`), 'starting_generation'));
        setIsGenerating(false);
        isGeneratingRef.current = false;
        cooldownUntilRef.current = Date.now() + 1000;
        return;
      }

      if (
        jsonData.status === 'processing' &&
        jsonData.predictionId &&
        (jsonData.provider === 'openai' || jsonData.provider === 'replicate')
      ) {
        const provider = jsonData.provider;
        console.log('[POST GENERATE] job started, handing to poll', { requestId, provider, predictionId: jsonData.predictionId });
        cleanupInputFiles(uploadedPaths);
        setGenerationPhase('generating');
        pollPrediction(jsonData.predictionId, requestId, provider, signal, generationStartTime);
        return;
      }

      const unexpectedMsg = `Unexpected response: provider=${jsonData.provider} status=${jsonData.status} predictionId=${jsonData.predictionId ?? 'none'}`;
      console.error('[POST GENERATE FAILURE]', {
        phase: 'starting_generation', requestId, unexpectedMsg, durationMs: postDuration,
      });
      cleanupInputFiles(uploadedPaths);
      setGenerationError(normalizeError(new Error(unexpectedMsg), 'starting_generation'));
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        cleanupInputFiles(uploadedPaths); return;
      }
      if (activeRequestId.current !== requestId) {
        cleanupInputFiles(uploadedPaths); return;
      }
      cleanupInputFiles(uploadedPaths);
      console.error('[POST GENERATE FAILURE]', {
        phase: 'starting_generation', requestId, ...errDetail(err), ua: navigator.userAgent,
      });
      setGenerationError(normalizeError(err, 'starting_generation'));
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;
      console.log('[GENERATION READY] after error');
    }
  };

  return (
    <>
      <AnimatedBackground />

      {currentView === 'home' && (
        <Home
          onImageSelect={handleImageSelect}
          initialCategory={selectedCategory}
        />
      )}

      {currentView === 'upload' && selectedRef && (
        <Upload
          selectedRef={selectedRef}
          onBack={handleBackFromUpload}
          onGenerate={handleGenerate}
          isGeneratingFromParent={isGenerating}
          photo1={photo1}
          setPhoto1={setPhoto1}
          photo2={photo2}
          setPhoto2={setPhoto2}
          preview1={preview1}
          setPreview1={setPreview1}
          preview2={preview2}
          setPreview2={setPreview2}
          photo1b={photo1b}
          setPhoto1b={setPhoto1b}
          photo2b={photo2b}
          setPhoto2b={setPhoto2b}
          preview1b={preview1b}
          setPreview1b={setPreview1b}
          preview2b={preview2b}
          setPreview2b={setPreview2b}
        />
      )}

      {currentView === 'result' && (
        <Result
          onBack={handleBackToUpload}
          onStartOver={handleBackToHome}
          generatedImageUrl={generatedImageUrl}
          rawImageUrl={rawImageUrl}
          imgLoadFailed={imgLoadFailed}
          onImgError={(src) => {
            console.log('[IMG ERROR cb]', src?.substring(0, 80));
            setImgLoadFailed(true);
          }}
          onImgLoad={() => {
            console.log('[IMG LOADED cb]', generatedImageUrl?.substring(0, 80));
          }}
          isGenerating={isGenerating}
          generationPhase={generationPhase}
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;
