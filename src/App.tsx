import { useEffect, useRef, useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

// ─── HEIC conversion ────────────────────────────────────────────────────────

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

// ─── Image preload with decode() + timeout ───────────────────────────────────
// Uses Image.decode() when available (avoids "Load failed" on Safari by waiting
// for the full decode pipeline rather than just the load event).
// Falls back to onload if decode() is not supported.
// A 15s timeout prevents the preload from blocking forever on a slow connection.
// Preload failure is non-fatal — the image is still shown via the <img> tag.

function preloadImage(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const PRELOAD_TIMEOUT_MS = 15_000;

    if (signal.aborted) {
      reject(new DOMException('Preload aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('Preload timeout'));
    }, PRELOAD_TIMEOUT_MS);

    const cleanup = () => clearTimeout(timer);

    const tryDecode = (img: HTMLImageElement) => {
      if (typeof img.decode === 'function') {
        img.decode()
          .then(() => { cleanup(); resolve(); })
          .catch(() => {
            // decode() can fail on some browsers for valid images — treat as success
            cleanup();
            resolve();
          });
      } else {
        cleanup();
        resolve();
      }
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Preload aborted', 'AbortError'));
    };

    signal.addEventListener('abort', onAbort, { once: true });

    // Attempt 1: with crossOrigin (needed for Supabase storage CORS)
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      signal.removeEventListener('abort', onAbort);
      tryDecode(img);
    };
    img.onerror = () => {
      // Attempt 2: without crossOrigin (some CDNs reject credentialed requests)
      const img2 = new window.Image();
      img2.onload = () => {
        signal.removeEventListener('abort', onAbort);
        tryDecode(img2);
      };
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

// ─── Error normalization ─────────────────────────────────────────────────────

function normalizeGenerationError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const lo = raw.toLowerCase();

  // Aborted by our own cleanup — not a real error, caller should check requestId first
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Generation cancelled.';
  }

  // Moderation / content policy — wins over everything else
  if (
    lo.includes('moderation') ||
    lo.includes('policy') ||
    lo.includes('unsafe') ||
    lo.includes('blocked') ||
    lo.includes('content_violation') ||
    lo.includes('flagged')
  ) {
    return 'This image could not be generated because it did not pass moderation checks.';
  }

  // Timeout / aborted — specific message before generic network catch
  if (lo.includes('timeout') || lo.includes('timed out')) {
    return 'Generation is taking longer than expected. Please try again.';
  }

  // Browser-level fetch/network failures — never reached the server
  if (
    lo.includes('load failed') ||
    lo.includes('failed to fetch') ||
    lo.includes('networkerror') ||
    lo.includes('network error') ||
    lo.includes('fetch failed') ||
    lo.includes('econnreset') ||
    lo.includes('__post_network_failure__') ||
    (lo.includes('typeerror') && lo.includes('fetch'))
  ) {
    return 'Connection issue detected. Please try again.';
  }

  // Server / backend failures
  if (
    lo.includes('500') ||
    lo.includes('internal server error') ||
    lo.includes('edge function') ||
    lo.includes('storage upload') ||
    lo.includes('database')
  ) {
    return 'Server issue detected. Please try again in a moment.';
  }

  // Internal shape / validation errors — never show raw internals
  if (
    lo.includes('unexpected response') ||
    lo.includes('unexpected content-type') ||
    lo.includes('no output url') ||
    lo.includes('not a valid https') ||
    lo.includes('temporary openai url') ||
    lo.includes('generation succeeded but no output')
  ) {
    return 'Server issue detected. Please try again in a moment.';
  }

  // Short, readable backend string with no stack trace — pass through
  if (raw.length > 0 && raw.length < 200 && !raw.includes('\n') && !raw.includes(' at ')) {
    return raw;
  }

  return 'Generation failed. Please try again.';
}

// ─── URL validation ───────────────────────────────────────────────────────────

function validateOutputUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('Generation succeeded but no output URL was returned');
  }
  if (!url.startsWith('https://')) {
    throw new Error(
      `Output URL is not a valid HTTPS URL: "${url.substring(0, 80)}"`
    );
  }
  if (url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
      url.includes('openai.com/files/')) {
    throw new Error(
      'Received temporary OpenAI URL — backend must upload to storage first'
    );
  }
  return url;
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRef, setSelectedRef] = useState<ReferenceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>('');

  // Primary photos
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');

  // Secondary photos
  const [photo1b, setPhoto1b] = useState<File | null>(null);
  const [photo2b, setPhoto2b] = useState<File | null>(null);
  const [preview1b, setPreview1b] = useState<string>('');
  const [preview2b, setPreview2b] = useState<string>('');

  // ── Lifecycle refs ────────────────────────────────────────────────────────
  // activeRequestId: opaque token for the current generation; every async
  // callback checks this before touching state.
  const activeRequestId = useRef<string>('');

  // Single AbortController for the entire active generation lifecycle
  // (covers POST, poll fetches, and preloadImage). Replaced on every start.
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scheduled poll timer
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevents a second poll fetch from starting while one is already in flight
  const pollInFlightRef = useRef(false);

  // Ref mirror of isGenerating — readable synchronously inside async callbacks
  const isGeneratingRef = useRef(false);

  // Earliest timestamp at which the next generation may begin (cooldown)
  const cooldownUntilRef = useRef<number>(0);

  // ── Cleanup helpers ───────────────────────────────────────────────────────

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

  // Unmount cleanup
  useEffect(() => {
    return () => {
      fullCleanup('unmount');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation handlers ───────────────────────────────────────────────────

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
    setGenerationError('');
    setPhoto1(null);
    setPhoto2(null);
    setPreview1('');
    setPreview2('');
    setPhoto1b(null);
    setPhoto2b(null);
    setPreview1b('');
    setPreview2b('');
  };

  const handleBackFromUpload = () => {
    fullCleanup('back from upload');
    setIsGenerating(false);
    setCurrentView('home');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError('');
  };

  const handleBackToUpload = () => {
    fullCleanup('back to upload');
    setIsGenerating(false);
    setCurrentView('upload');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError('');
  };

  // ── Poll ──────────────────────────────────────────────────────────────────

  const pollPrediction = (
    predictionId: string,
    requestId: string,
    provider: 'openai' | 'replicate',
    signal: AbortSignal,
  ) => {
    const POLL_INTERVAL_MS = 5000;
    const POLL_NETWORK_RETRY_DELAY_MS = 5000;
    const MAX_CONSECUTIVE_POLL_FAILURES = 8;

    const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
    const authHeader = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };
    const pollParam = provider === 'openai' ? 'jobId' : 'id';

    let consecutiveFailures = 0;

    console.log('[POLL START]', { requestId, predictionId, provider });

    const schedulePoll = (delayMs: number) => {
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      pollTimeoutRef.current = setTimeout(poll, delayMs);
    };

    const finishWithError = (msg: string) => {
      pollTimeoutRef.current = null;
      pollInFlightRef.current = false;
      setGenerationError(msg);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;
      console.log('[GENERATION READY] after failure');
    };

    const poll = async () => {
      if (activeRequestId.current !== requestId) {
        console.log('[POLL CANCELLED]', { requestId, predictionId, provider });
        return;
      }

      if (signal.aborted) {
        console.log('[POLL CANCELLED] signal aborted', { requestId });
        return;
      }

      // Prevent a second poll from firing before the previous one completes
      if (pollInFlightRef.current) {
        console.log('[POLL SKIPPED] poll already in flight', { requestId, predictionId });
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
          console.log('[POLL IGNORED STALE] after fetch', { requestId, predictionId, provider });
          return;
        }

        const ct = res.headers.get('content-type') ?? '';
        if (!ct.includes('application/json')) {
          throw new Error(
            `Poll response has unexpected content-type "${ct}" — expected application/json`
          );
        }

        const data = await res.json() as {
          provider?: string;
          status: string;
          output?: string;
          error?: string;
        };

        if (activeRequestId.current !== requestId) {
          console.log('[POLL IGNORED STALE] after json', { requestId, predictionId, provider, status: data.status });
          return;
        }

        consecutiveFailures = 0;
        console.log('[POLL]', { requestId, predictionId, provider: data.provider, status: data.status });

        if (data.status === 'succeeded') {
          const rawUrl = data.output ?? '';
          console.log('[POLL SUCCESS]', { requestId, predictionId, provider, url: rawUrl.substring(0, 100) });

          let validatedUrl: string;
          try {
            validatedUrl = validateOutputUrl(rawUrl);
          } catch (validateErr) {
            console.error('[POLL FAILURE] URL validation failed:', { requestId, predictionId, provider, msg: validateErr instanceof Error ? validateErr.message : validateErr });
            finishWithError(normalizeGenerationError(validateErr));
            return;
          }

          // Preload — non-fatal; image still renders via <img> tag
          console.log('[PRELOAD START]', { requestId, url: validatedUrl.substring(0, 80) });
          try {
            await preloadImage(validatedUrl, signal);
            console.log('[PRELOAD SUCCESS]', { requestId });
          } catch (preloadErr) {
            // AbortError means a new generation started — bail silently
            if (preloadErr instanceof DOMException && preloadErr.name === 'AbortError') {
              console.log('[PRELOAD CANCELLED]', { requestId });
              return;
            }
            console.warn('[PRELOAD FAILURE] will still attempt render:', preloadErr instanceof Error ? preloadErr.message : preloadErr);
          }

          if (activeRequestId.current !== requestId) {
            console.log('[POLL IGNORED STALE] after preload', { requestId, predictionId, provider });
            return;
          }

          pollTimeoutRef.current = null;
          pollInFlightRef.current = false;
          setGenerationError('');
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
          console.error('[POLL FAILURE]', { requestId, predictionId, provider, status: data.status, error: data.error });
          finishWithError(normalizeGenerationError(data.error ?? 'Generation failed. Please try again.'));
          return;
        }

        // Still processing — schedule next poll
        schedulePoll(POLL_INTERVAL_MS);

      } catch (err) {
        pollInFlightRef.current = false;

        // AbortError = cleanup from our side, not a real network failure
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('[POLL CANCELLED] fetch aborted', { requestId, predictionId, provider });
          return;
        }

        if (activeRequestId.current !== requestId) {
          console.log('[POLL IGNORED STALE] in catch', { requestId, predictionId, provider });
          return;
        }

        consecutiveFailures += 1;
        console.warn('[POLL NETWORK ERROR]', {
          provider, predictionId, requestId, consecutiveFailures,
          message: err instanceof Error ? err.message : err,
          userAgent: navigator.userAgent,
        });

        if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
          console.error('[POLL FAILURE] max consecutive network failures', { requestId, predictionId, provider, consecutiveFailures });
          finishWithError('Connection issue detected. Please try again.');
          return;
        }

        schedulePoll(POLL_NETWORK_RETRY_DELAY_MS);
      }
    };

    poll();
  };

  // ── Generate ──────────────────────────────────────────────────────────────

  const handleGenerate = async (
    photo1: File,
    photo2: File,
    referenceFile: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => {
    // Single-flight guard — synchronous ref check prevents race on double-tap
    if (isGeneratingRef.current) {
      console.log('[GENERATION LOCKED] already generating');
      return;
    }

    // Cooldown between generations (1s after success/failure)
    const now = Date.now();
    if (now < cooldownUntilRef.current) {
      console.log('[GENERATION LOCKED] cooldown active, ms remaining:', cooldownUntilRef.current - now);
      return;
    }

    // Abort and cancel everything from the previous generation
    abortActive('new generation starting');

    if (generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(generatedImageUrl);

    if (!photo1 || !photo2 || !referenceFile || !selectedRef) {
      setGenerationError('Missing required data. Please try again.');
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Lock synchronously before any await
    isGeneratingRef.current = true;
    activeRequestId.current = requestId;

    // Fresh AbortController for this entire generation lifecycle
    const ac = new AbortController();
    abortControllerRef.current = ac;
    const { signal } = ac;

    console.log('[GENERATION START]', { requestId, referenceId: selectedRef.id, ua: navigator.userAgent.substring(0, 80) });

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    // Log file info
    console.log('[UPLOAD FILE] photo1:', photo1.name, photo1.type, photo1.size);
    console.log('[UPLOAD FILE] photo2:', photo2.name, photo2.type, photo2.size);
    if (photo1b) console.log('[UPLOAD FILE] photo1b:', photo1b.name, photo1b.type, photo1b.size);
    if (photo2b) console.log('[UPLOAD FILE] photo2b:', photo2b.name, photo2b.type, photo2b.size);

    // HEIC normalization
    let normalizedPhoto1 = photo1;
    let normalizedPhoto2 = photo2;
    let normalizedPhoto1b = photo1b ?? null;
    let normalizedPhoto2b = photo2b ?? null;

    try {
      [normalizedPhoto1, normalizedPhoto2] = await Promise.all([
        normalizeFile(photo1),
        normalizeFile(photo2),
      ]);
      if (photo1b) normalizedPhoto1b = await normalizeFile(photo1b);
      if (photo2b) normalizedPhoto2b = await normalizeFile(photo2b);
    } catch (normalizeErr) {
      console.error('[HEIC CONVERT ERROR]', normalizeErr instanceof Error ? normalizeErr.message : normalizeErr);
      if (activeRequestId.current !== requestId) return;
      setGenerationError('Failed to convert image format. Please use JPEG or PNG.');
      setIsGenerating(false);
      isGeneratingRef.current = false;
      cooldownUntilRef.current = Date.now() + 1000;
      return;
    }

    if (activeRequestId.current !== requestId) return;

    console.log('[NORMALIZED] photo1:', normalizedPhoto1.name, normalizedPhoto1.type, normalizedPhoto1.size);
    console.log('[NORMALIZED] photo2:', normalizedPhoto2.name, normalizedPhoto2.type, normalizedPhoto2.size);

    const formData = new FormData();
    formData.append('person1', normalizedPhoto1);
    if (normalizedPhoto1b) formData.append('person1b', normalizedPhoto1b);
    formData.append('person2', normalizedPhoto2);
    if (normalizedPhoto2b) formData.append('person2b', normalizedPhoto2b);
    formData.append('reference', referenceFile);
    formData.append('style', selectedRef.style);
    formData.append('referenceId', selectedRef.id);
    if (mode) formData.append('mode', mode);

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
    const POST_RETRY_DELAY_MS = 3000;

    const doPost = (sig: AbortSignal) => fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: formData,
      signal: sig,
    });

    try {
      console.log('[POST START]', { requestId, url: apiUrl.substring(0, 60) });

      let response: Response;
      try {
        response = await doPost(signal);
      } catch (postErr) {
        if (postErr instanceof DOMException && postErr.name === 'AbortError') return;
        console.warn('[POST FAILURE] first attempt, retrying in', POST_RETRY_DELAY_MS, 'ms', {
          message: postErr instanceof Error ? postErr.message : postErr,
          requestId,
          userAgent: navigator.userAgent,
        });
        await new Promise<void>(r => setTimeout(r, POST_RETRY_DELAY_MS));
        if (activeRequestId.current !== requestId || signal.aborted) return;
        console.log('[POST START] retry', { requestId });
        try {
          response = await doPost(signal);
        } catch (retryErr) {
          if (retryErr instanceof DOMException && retryErr.name === 'AbortError') return;
          console.error('[POST FAILURE] retry also failed', { message: retryErr instanceof Error ? retryErr.message : retryErr, requestId });
          throw new Error('__post_network_failure__');
        }
      }

      if (activeRequestId.current !== requestId || signal.aborted) return;

      console.log('[POST SUCCESS]', { requestId, status: response.status });

      const ct = response.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) {
        let body = '';
        try { body = await response.text(); } catch { /* ignore */ }
        throw new Error(
          `Server returned unexpected content-type "${ct}" (status ${response.status}). ` +
          (body ? `Body: ${body.substring(0, 200)}` : '')
        );
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

      console.log('[GENERATE RESPONSE]', {
        requestId,
        provider: jsonData.provider,
        status: jsonData.status,
        predictionId: jsonData.predictionId,
        output: jsonData.output?.substring(0, 80),
        functionVersion: jsonData.functionVersion,
        httpStatus: response.status,
      });

      if (activeRequestId.current !== requestId || signal.aborted) return;

      if (!response.ok) {
        const message = typeof jsonData?.error === 'string'
          ? jsonData.error
          : JSON.stringify(jsonData);
        throw new Error(message || `Server error ${response.status}`);
      }

      if (
        jsonData.status === 'processing' &&
        jsonData.predictionId &&
        (jsonData.provider === 'openai' || jsonData.provider === 'replicate')
      ) {
        const provider = jsonData.provider;
        console.log('[GENERATE] job started, handing off to poll', { requestId, provider, predictionId: jsonData.predictionId });
        pollPrediction(jsonData.predictionId, requestId, provider, signal);
        return;
      }

      throw new Error(
        `Unexpected response: provider=${jsonData.provider} status=${jsonData.status} ` +
        `predictionId=${jsonData.predictionId ?? 'none'}`
      );

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (activeRequestId.current !== requestId) return;

      console.error('[GENERATE ERROR]', { requestId, message: err instanceof Error ? err.message : err });

      setGenerationError(normalizeGenerationError(err));
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
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;
