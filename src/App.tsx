import { useRef, useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

// heic2any is lazy-loaded only when needed (avoids eager Worker creation at app init)
async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  console.log('[HEIC] converting', file.name, file.type, '->', 'image/jpeg');
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 }) as Blob;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
}

const HEIC_TYPES = new Set(['image/heic', 'image/heif']);

async function normalizeFile(file: File): Promise<File> {
  const ltype = file.type.toLowerCase();
  // Check explicit MIME type
  if (HEIC_TYPES.has(ltype)) {
    return convertHeicToJpeg(file);
  }
  // Check file extension for cases where iOS gives empty or wrong type
  if (/\.(heic|heif)$/i.test(file.name)) {
    return convertHeicToJpeg(file);
  }
  return file;
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // crossOrigin needed for Supabase storage public URLs to avoid CORS taint
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('[PRELOAD] loaded:', url.substring(0, 80));
      resolve();
    };
    img.onerror = () => {
      // Try without crossOrigin as fallback (some CDNs don't allow credentialed requests)
      const img2 = new window.Image();
      img2.onload = () => {
        console.log('[PRELOAD] loaded (no-cors):', url.substring(0, 80));
        resolve();
      };
      img2.onerror = () => {
        reject(new Error(`Image failed to preload: ${url.substring(0, 80)}`));
      };
      img2.src = url;
    };
    img.src = url;
  });
}

function validateOutputUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('Generation succeeded but no output URL was returned');
  }
  if (!url.startsWith('https://')) {
    throw new Error(
      `Output URL is not a valid HTTPS URL: "${url.substring(0, 80)}"`
    );
  }
  // Guard against temporary OpenAI/Azure blob storage URLs leaking through
  if (url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
      url.includes('openai.com/files/')) {
    throw new Error(
      'Received temporary OpenAI URL — backend must upload to storage first'
    );
  }
  return url;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const [selectedRef, setSelectedRef] =
    useState<ReferenceItem | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [generatedImageUrl, setGeneratedImageUrl] =
    useState<string>('');

  const [rawImageUrl, setRawImageUrl] =
    useState<string>('');

  const [imgLoadFailed, setImgLoadFailed] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState<boolean>(false);

  const [generationError, setGenerationError] =
    useState<string>('');

  const activeRequestId = useRef<string>('');

  // Primary photos
  const [photo1, setPhoto1] =
    useState<File | null>(null);

  const [photo2, setPhoto2] =
    useState<File | null>(null);

  const [preview1, setPreview1] =
    useState<string>('');

  const [preview2, setPreview2] =
    useState<string>('');

  // Secondary photos
  const [photo1b, setPhoto1b] =
    useState<File | null>(null);

  const [photo2b, setPhoto2b] =
    useState<File | null>(null);

  const [preview1b, setPreview1b] =
    useState<string>('');

  const [preview2b, setPreview2b] =
    useState<string>('');

  const handleImageSelect = (ref: ReferenceItem) => {
    setSelectedCategory(ref.style);
    setSelectedRef(ref);
    setCurrentView('upload');
  };

  const pollPrediction = (
    predictionId: string,
    requestId: string,
    provider: 'openai' | 'replicate'
  ) => {
    const POLL_INTERVAL_MS = 2500;
    const POLL_NETWORK_RETRY_DELAY_MS = 3000;
    const MAX_CONSECUTIVE_POLL_FAILURES = 10;

    const apiBase =
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

    const authHeader = {
      Authorization:
        `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    // OpenAI jobs are tracked in generation_jobs table via ?jobId=
    // Replicate predictions are polled via Replicate API using ?id=
    const pollParam = provider === 'openai' ? 'jobId' : 'id';

    let consecutiveFailures = 0;

    const poll = async () => {
      if (activeRequestId.current !== requestId) {
        return;
      }

      try {
        const res = await fetch(
          `${apiBase}?${pollParam}=${predictionId}`,
          { headers: authHeader }
        );

        if (activeRequestId.current !== requestId) {
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

        // Any successful server response resets the failure counter
        consecutiveFailures = 0;

        console.log('[POLL] id=' + predictionId + ' provider=' + data.provider + ' status=' + data.status);

        if (data.status === 'succeeded') {
          const rawUrl = data.output ?? '';
          console.log('[POLL] succeeded url:', rawUrl.substring(0, 100));

          let validatedUrl: string;
          try {
            validatedUrl = validateOutputUrl(rawUrl);
          } catch (validateErr) {
            const msg = validateErr instanceof Error ? validateErr.message : String(validateErr);
            console.error('[POLL] URL validation failed:', msg);
            setGenerationError(msg);
            setIsGenerating(false);
            return;
          }

          // Preload before showing — swallow failures (image will still attempt to render)
          try {
            await preloadImage(validatedUrl);
          } catch (preloadErr) {
            console.warn('[PRELOAD] failed (will still attempt render):', preloadErr instanceof Error ? preloadErr.message : preloadErr);
          }

          setGenerationError('');
          setImgLoadFailed(false);
          setRawImageUrl(validatedUrl);
          setGeneratedImageUrl(validatedUrl);
          setIsGenerating(false);
          return;
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          console.error('[POLL] prediction', data.status, data.error);
          setGenerationError(data.error || 'Generation failed. Please try again.');
          setIsGenerating(false);
          return;
        }

        // processing — keep polling
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (activeRequestId.current !== requestId) {
          return;
        }

        consecutiveFailures += 1;
        const message = err instanceof Error ? err.message : String(err);

        console.warn('[POLL NETWORK ERROR]', {
          provider,
          predictionId,
          consecutiveFailures,
          message,
          userAgent: navigator.userAgent,
        });

        if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
          console.error('[POLL] max consecutive network failures (' + MAX_CONSECUTIVE_POLL_FAILURES + '), stopping');
          setGenerationError(
            'Network error while waiting for the result. Please try again.'
          );
          setIsGenerating(false);
          return;
        }

        // Temporary network hiccup — keep retrying with slightly longer delay
        setTimeout(poll, POLL_NETWORK_RETRY_DELAY_MS);
      }
    };

    poll();
  };

  const handleGenerate = async (
    photo1: File,
    photo2: File,
    referenceFile: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => {
    if (isGenerating) {
      return;
    }

    // cleanup old blob urls
    if (generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }

    if (
      !photo1 ||
      !photo2 ||
      !referenceFile ||
      !selectedRef
    ) {
      setGenerationError(
        'Missing required data. Please try again.'
      );
      return;
    }

    const requestId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

    activeRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    console.log('[DEVICE]', navigator.userAgent);
    console.log(
      '[GENERATE] requestId=' + requestId +
      ' referenceId=' + selectedRef.id
    );

    // Log file info — these are the already-resized files from Upload.tsx
    console.log('[UPLOAD FILE] photo1:', photo1.name, photo1.type, photo1.size);
    console.log('[UPLOAD FILE] photo2:', photo2.name, photo2.type, photo2.size);
    if (photo1b) {
      console.log('[UPLOAD FILE] photo1b:', photo1b.name, photo1b.type, photo1b.size);
    }
    if (photo2b) {
      console.log('[UPLOAD FILE] photo2b:', photo2b.name, photo2b.type, photo2b.size);
    }

    // Normalize HEIC/HEIF files to JPEG.
    // Note: Upload.tsx's resizeImage already converts to JPEG via canvas for photos the
    // user uploads. This normalizeFile pass is an extra safety net for any file that
    // bypassed resizeImage or arrived with wrong/empty type.
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
      const msg = normalizeErr instanceof Error ? normalizeErr.message : String(normalizeErr);
      console.error('[HEIC CONVERT ERROR]', msg);
      setGenerationError(
        'Failed to convert image format. Please use JPEG or PNG.'
      );
      setIsGenerating(false);
      return;
    }

    console.log('[NORMALIZED] photo1:', normalizedPhoto1.name, normalizedPhoto1.type, normalizedPhoto1.size);
    console.log('[NORMALIZED] photo2:', normalizedPhoto2.name, normalizedPhoto2.type, normalizedPhoto2.size);

    const formData = new FormData();
    formData.append('person1', normalizedPhoto1);
    if (normalizedPhoto1b) {
      formData.append('person1b', normalizedPhoto1b);
    }
    formData.append('person2', normalizedPhoto2);
    if (normalizedPhoto2b) {
      formData.append('person2b', normalizedPhoto2b);
    }
    formData.append('reference', referenceFile);
    formData.append('style', selectedRef.style);
    formData.append('referenceId', selectedRef.id);

    if (mode) {
      formData.append('mode', mode);
    }

    const apiUrl =
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

    if (activeRequestId.current !== requestId) {
      return;
    }

    const POST_NETWORK_RETRY_DELAY_MS = 2000;

    const doPost = () => fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    try {
      console.log('[GENERATE] POSTing to', apiUrl.substring(0, 60));

      let response: Response;
      try {
        response = await doPost();
      } catch (postErr) {
        const postErrMsg = postErr instanceof Error ? postErr.message : String(postErr);
        console.warn('[POST NETWORK ERROR] first attempt failed, retrying in ' + POST_NETWORK_RETRY_DELAY_MS + 'ms', {
          message: postErrMsg,
          userAgent: navigator.userAgent,
        });
        await new Promise<void>(r => setTimeout(r, POST_NETWORK_RETRY_DELAY_MS));
        if (activeRequestId.current !== requestId) {
          return;
        }
        console.log('[POST RETRY] retrying POST...');
        try {
          response = await doPost();
        } catch (retryErr) {
          const retryErrMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
          console.error('[POST NETWORK ERROR] retry also failed', { message: retryErrMsg, userAgent: navigator.userAgent });
          throw new Error('Network error starting generation. Please check your connection and try again.');
        }
      }

      if (activeRequestId.current !== requestId) {
        return;
      }

      // Validate content-type before parsing — non-JSON means edge function crashed
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
        provider: jsonData.provider,
        status: jsonData.status,
        predictionId: jsonData.predictionId,
        output: jsonData.output?.substring(0, 80),
        functionVersion: jsonData.functionVersion,
        httpStatus: response.status,
      });

      if (activeRequestId.current !== requestId) {
        return;
      }

      if (!response.ok) {
        const message =
          typeof jsonData?.error === 'string'
            ? jsonData.error
            : JSON.stringify(jsonData);
        throw new Error(message || `Server error ${response.status}`);
      }

      // Both providers now return status:"processing" + predictionId — poll until done.
      // OpenAI jobs use ?jobId= (generation_jobs table), Replicate uses ?id= (Replicate API).
      if (
        jsonData.status === 'processing' &&
        jsonData.predictionId &&
        (jsonData.provider === 'openai' || jsonData.provider === 'replicate')
      ) {
        const provider = jsonData.provider;
        console.log(`[GENERATE] ${provider} job started, polling predictionId=${jsonData.predictionId}`);
        pollPrediction(jsonData.predictionId, requestId, provider);
        return;
      }

      // Unknown shape — should not happen
      throw new Error(
        `Unexpected response: provider=${jsonData.provider} status=${jsonData.status} ` +
        `predictionId=${jsonData.predictionId ?? 'none'}`
      );

    } catch (err) {
      if (activeRequestId.current !== requestId) {
        return;
      }

      const msg =
        err instanceof Error
          ? err.message
          : String(err);

      console.error('[GENERATE ERROR] requestId=' + requestId, msg);

      setGenerationError(
        msg || 'Generation failed. Please try again.'
      );
      setIsGenerating(false);
    }
  };

  const handleBackToHome = () => {
    activeRequestId.current = '';

    if (generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }

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
    setCurrentView('home');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError('');
  };

  const handleBackToUpload = () => {
    // Cancel any in-flight request
    activeRequestId.current = '';
    setIsGenerating(false);
    setCurrentView('upload');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError('');
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

      {currentView === 'upload' &&
        selectedRef && (
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
            console.log(
              '[IMG LOADED cb]',
              generatedImageUrl?.substring(0, 80)
            );
          }}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;
