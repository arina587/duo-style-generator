import { useRef, useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

// ─── Diagnostic helpers ──────────────────────────────────────────────────────

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return { ua, isMobile, platform: navigator.platform ?? 'unknown' };
}

type FailureType = 'network' | 'http' | 'timeout' | 'invalid_url' | 'unknown';

function classifyError(err: unknown): FailureType {
  if (!err) return 'unknown';
  const msg = err instanceof Error ? err.message : String(err);
  if (/Load failed|Failed to fetch|NetworkError|network/i.test(msg)) return 'network';
  if (/timeout/i.test(msg)) return 'timeout';
  if (/Invalid URL|not a valid URL/i.test(msg)) return 'invalid_url';
  return 'unknown';
}

async function probeUrl(label: string, url: string): Promise<void> {
  const tag = `[PROBE:${label}]`;
  console.log(`${tag} HEAD probe: ${url.substring(0, 80)}`);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    console.log(`${tag} status=${res.status} ok=${res.ok} content-type=${res.headers.get('content-type') ?? 'none'}`);
    if (!res.ok) console.warn(`${tag} HTTP error: ${res.status} ${res.statusText}`);
  } catch (e) {
    const ftype = classifyError(e);
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error(`${tag} threw failure-type=${ftype} error="${msg}"`);
  }
}

// ─── Image preloader ─────────────────────────────────────────────────────────

function loadImageWithRetry(url: string, retries = 2, timeout = 9000): Promise<boolean> {
  return new Promise((resolve) => {
    let attempt = 0;
    const { ua, isMobile } = getDeviceInfo();
    console.log(`[PRELOAD] start url=${url.substring(0, 80)} isMobile=${isMobile}`);

    function tryLoad() {
      attempt++;
      const tag = `[PRELOAD attempt=${attempt}/${retries + 1}]`;
      const img = new window.Image();
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;

      function succeed() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.log(`[PRELOAD] SUCCESS attempt=${attempt} url=${url.substring(0, 80)}`);
        resolve(true);
      }

      function fail(reason: string, ftype: FailureType = 'unknown') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.warn(`${tag} FAILED reason="${reason}" failure-type=${ftype} isMobile=${isMobile}`);
        if (attempt <= retries) {
          const delay = attempt * 1500;
          console.log(`${tag} retrying in ${delay}ms...`);
          setTimeout(tryLoad, delay);
        } else {
          console.error(`[PRELOAD] ALL ATTEMPTS EXHAUSTED url=${url.substring(0, 80)} ua="${ua.substring(0, 80)}"`);
          resolve(false);
        }
      }

      timer = setTimeout(() => fail(`timeout after ${timeout}ms`, 'timeout'), timeout);
      img.onload = () => succeed();
      img.onerror = (event) => {
        const detail = typeof event === 'string' ? event : (event as Event)?.type ?? 'onerror';
        console.error(`[PRELOAD] onerror attempt=${attempt} detail="${detail}" url=${url.substring(0, 80)}`);
        fail('onerror', 'network');
      };
      img.src = url;
    }

    tryLoad();
  });
}

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRef, setSelectedRef] = useState<ReferenceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // generationError: API/model failed, no image URL exists
  const [generationError, setGenerationError] = useState<string>('');
  const [, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  // Latest request ID — stale async results from older requests are ignored
  const activeRequestId = useRef<string>('');

  // Primary photos (required)
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');

  // Secondary photos (optional — improve identity accuracy)
  const [photo1b, setPhoto1b] = useState<File | null>(null);
  const [photo2b, setPhoto2b] = useState<File | null>(null);
  const [preview1b, setPreview1b] = useState<string>('');
  const [preview2b, setPreview2b] = useState<string>('');

  const handleImageSelect = (ref: ReferenceItem) => {
    setSelectedCategory(ref.style);
    setSelectedRef(ref);
    setCurrentView('upload');
  };

  const handleGenerate = async (
    photo1: File,
    photo2: File,
    referenceFile: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => {
    if (isGenerating) return;

    if (!photo1 || !photo2 || !referenceFile || !selectedRef) {
      setGenerationError('Missing required data. Please try again.');
      return;
    }

    // Assign a unique ID to this request; stale callbacks check against this
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    activeRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError('');
    setDebugInfo(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    const style = selectedRef.style;
    const device = getDeviceInfo();

    console.log(`[GENERATE] requestId=${requestId} referenceId=${selectedRef.id} isMobile=${device.isMobile}`);

    try {
      const formData = new FormData();
      formData.append('person1', photo1);
      if (photo1b) formData.append('person1b', photo1b);
      formData.append('person2', photo2);
      if (photo2b) formData.append('person2b', photo2b);
      formData.append('reference', referenceFile);
      formData.append('style', style);
      formData.append('referenceId', selectedRef.id);
      formData.append('prompt', selectedRef.prompt ?? '');
      if (mode) formData.append('mode', mode);

      console.log(`[GENERATE] requestId=${requestId} payload:`, {
        referenceId: selectedRef.id,
        style,
        promptLength: (selectedRef.prompt ?? '').length,
        images: {
          person1: { size: photo1.size, type: photo1.type },
          person1b: photo1b ? { size: photo1b.size } : null,
          person2: { size: photo2.size, type: photo2.type },
          person2b: photo2b ? { size: photo2b.size } : null,
          reference: { size: referenceFile.size, type: referenceFile.type },
        },
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: formData,
      });

      // Guard: ignore if a newer request was started
      if (activeRequestId.current !== requestId) {
        console.log(`[GENERATE] requestId=${requestId} — superseded, ignoring response`);
        return;
      }

      const data = await response.json();
      if (data.debug) setDebugInfo(data.debug);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      console.log(`[GENERATE] requestId=${requestId} raw response:`, JSON.stringify(data).substring(0, 500));

      let imageUrl: string | undefined;
      if (data.success && data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (Array.isArray(data.output) && data.output[0]) {
        imageUrl = data.output[0];
      } else if (typeof data.output === 'string') {
        imageUrl = data.output;
      }

      console.log(`[GENERATE] requestId=${requestId} rawImageUrl=${imageUrl}`);

      if (!imageUrl) {
        throw new Error('Generation succeeded but no image URL was returned. Please try again.');
      }

      // Store rawImageUrl immediately — this is set regardless of load outcome
      setRawImageUrl(imageUrl);

      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate?proxyUrl=${encodeURIComponent(imageUrl)}`;
      console.log(`[GENERATE] requestId=${requestId} proxyUrl=${proxyUrl.substring(0, 80)}`);

      // Fire diagnostic probes (non-blocking)
      probeUrl('raw', imageUrl);
      probeUrl('proxy', proxyUrl);

      // ── Image loading pipeline ────────────────────────────────────────────
      // We try proxy first, then raw. If both fail, we still keep rawImageUrl
      // and set imgLoadFailed so the UI shows a fallback link rather than
      // an error state. Generation was successful.

      const proxyPreloadOk = await loadImageWithRetry(proxyUrl, 2, 12000);

      if (activeRequestId.current !== requestId) {
        console.log(`[GENERATE] requestId=${requestId} — superseded after proxy preload, ignoring`);
        return;
      }

      console.log(`[GENERATE] requestId=${requestId} proxyPreloadOk=${proxyPreloadOk}`);

      if (proxyPreloadOk) {
        // Try to blob it for a stable local URL
        try {
          const imgRes = await fetch(proxyUrl);
          console.log(`[GENERATE] requestId=${requestId} proxy fetch status=${imgRes.status} ok=${imgRes.ok} content-type=${imgRes.headers.get('content-type')} content-length=${imgRes.headers.get('content-length')}`);

          if (activeRequestId.current !== requestId) return;

          if (imgRes.ok) {
            const blob = await imgRes.blob();
            console.log(`[GENERATE] requestId=${requestId} proxy blob size=${blob.size} type=${blob.type}`);
            if (blob.size > 0) {
              const localUrl = URL.createObjectURL(blob);
              console.log(`[GENERATE] requestId=${requestId} upgraded to local blob URL`);
              setGeneratedImageUrl(localUrl);
            } else {
              console.warn(`[GENERATE] requestId=${requestId} proxy blob empty — using proxy URL directly`);
              setGeneratedImageUrl(proxyUrl);
            }
          } else {
            console.warn(`[GENERATE] requestId=${requestId} proxy fetch not ok status=${imgRes.status} — using proxy URL directly`);
            setGeneratedImageUrl(proxyUrl);
          }
        } catch (fetchErr) {
          if (activeRequestId.current !== requestId) return;
          const ftype = classifyError(fetchErr);
          const msg = fetchErr instanceof Error ? `${fetchErr.name}: ${fetchErr.message}` : String(fetchErr);
          console.warn(`[GENERATE] requestId=${requestId} proxy fetch threw failure-type=${ftype} error="${msg}" — using proxy URL directly`);
          setGeneratedImageUrl(proxyUrl);
        }
      } else {
        // Proxy failed — try raw URL
        probeUrl('proxy-postfail', proxyUrl);
        console.warn(`[GENERATE] requestId=${requestId} proxy preload FAILED — trying raw URL`);

        const rawPreloadOk = await loadImageWithRetry(imageUrl, 1, 9000);

        if (activeRequestId.current !== requestId) return;

        console.log(`[GENERATE] requestId=${requestId} rawPreloadOk=${rawPreloadOk}`);

        if (rawPreloadOk) {
          console.log(`[GENERATE] requestId=${requestId} raw URL preload succeeded`);
          setGeneratedImageUrl(imageUrl);
        } else {
          // Both failed — image was generated, but cannot be loaded in this browser/network.
          // Keep rawImageUrl (already set) and mark imgLoadFailed so Result shows the fallback link.
          probeUrl('raw-postfail', imageUrl);
          console.error(`[GENERATE] requestId=${requestId} BOTH proxy and raw preload FAILED — imageLoadError (not generationError) ua="${device.ua.substring(0, 80)}"`);
          setGeneratedImageUrl(imageUrl); // keep URL so fallback "Open" link works
          setImgLoadFailed(true);
        }
      }
    } catch (err) {
      if (activeRequestId.current !== requestId) return;
      // This path = true generation failure (API error, network, no URL returned)
      const msg = err instanceof Error ? err.message : 'An error occurred during generation';
      console.error(`[GENERATE] requestId=${requestId} generationError:`, msg);
      setGenerationError(msg);
    } finally {
      if (activeRequestId.current === requestId) {
        setIsGenerating(false);
      }
    }
  };

  const handleBackToHome = () => {
    activeRequestId.current = '';
    setCurrentView('home');
    setSelectedRef(null);
    setSelectedCategory(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setGenerationError('');
    setDebugInfo(null);
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
        <Home onImageSelect={handleImageSelect} initialCategory={selectedCategory} />
      )}
      {currentView === 'upload' && selectedRef && (
        <Upload
          selectedRef={selectedRef}
          onBack={handleBackFromUpload}
          onGenerate={handleGenerate}
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
            console.error(`[IMG onError] native render failed src=${src?.substring(0, 80)} isMobile=${getDeviceInfo().isMobile} — imageLoadError (not generationError)`);
            setImgLoadFailed(true);
          }}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;
