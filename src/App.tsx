import { useState } from 'react';
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

// Runs a HEAD probe against a URL and logs everything about the response.
// Never throws — designed purely for diagnostic side-effects.
async function probeUrl(label: string, url: string): Promise<void> {
  const tag = `[PROBE:${label}]`;
  console.log(`${tag} starting HEAD probe: ${url.substring(0, 80)}`);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    const type: FailureType = res.ok ? 'unknown' : 'http';
    console.log(`${tag} status=${res.status} ok=${res.ok} type=${type}`);
    console.log(`${tag} content-type=${res.headers.get('content-type') ?? 'none'} content-length=${res.headers.get('content-length') ?? 'none'} cache-control=${res.headers.get('cache-control') ?? 'none'}`);
    if (!res.ok) {
      console.warn(`${tag} HTTP error: ${res.status} ${res.statusText} → failure-type=http`);
    }
  } catch (e) {
    const ftype = classifyError(e);
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error(`${tag} probe threw → failure-type=${ftype} error="${msg}"`);
  }
}

// ─── Image preloader with full diagnostic logging ─────────────────────────────

function loadImageWithRetry(url: string, retries = 2, timeout = 9000): Promise<boolean> {
  return new Promise((resolve) => {
    let attempt = 0;
    const { ua, isMobile } = getDeviceInfo();

    console.log(`[PRELOAD] start url=${url.substring(0, 80)}`);
    console.log(`[PRELOAD] device isMobile=${isMobile} ua="${ua.substring(0, 120)}"`);

    function tryLoad() {
      attempt++;
      const tag = `[PRELOAD attempt=${attempt}/${retries + 1}]`;
      console.log(`${tag} creating Image element`);

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
          console.error(`[PRELOAD] ALL ATTEMPTS EXHAUSTED url=${url.substring(0, 80)} isMobile=${isMobile}`);
          resolve(false);
        }
      }

      timer = setTimeout(() => fail(`timeout after ${timeout}ms`, 'timeout'), timeout);
      img.onload = () => succeed();
      img.onerror = (event) => {
        const detail = typeof event === 'string' ? event : (event as Event)?.type ?? 'onerror';
        console.error(`[PRELOAD] img.onerror attempt=${attempt} detail="${detail}" url=${url.substring(0, 80)} ts=${Date.now()}`);
        fail('onerror — browser rejected image load', 'network');
      };
      img.src = url;
      console.log(`${tag} img.src set, waiting for load/error...`);
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
  const [error, setError] = useState<string>('');
  const [, setDebugInfo] = useState<Record<string, unknown> | null>(null);

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
      setError('Missing required data. Please try again.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDebugInfo(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    const style = selectedRef.style;

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

      if (mode) {
        formData.append('mode', mode);
      }

      console.log('[GENERATE] payload:', {
        referenceId: selectedRef.id,
        style: selectedRef.style,
        promptLength: (selectedRef.prompt ?? '').length,
        images: {
          person1: { size: photo1.size, type: photo1.type, name: photo1.name },
          person1b: photo1b ? { size: photo1b.size, type: photo1b.type } : null,
          person2: { size: photo2.size, type: photo2.type, name: photo2.name },
          person2b: photo2b ? { size: photo2b.size, type: photo2b.type } : null,
          reference: { size: referenceFile.size, type: referenceFile.type, name: referenceFile.name },
        },
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.debug) {
        setDebugInfo(data.debug);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      console.log('[API] raw response:', JSON.stringify(data).substring(0, 500));

      let imageUrl: string | undefined;
      if (data.success && data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (Array.isArray(data.output) && data.output[0]) {
        imageUrl = data.output[0];
      } else if (typeof data.output === 'string') {
        imageUrl = data.output;
      }

      console.log('[API] imageUrl:', imageUrl);
      console.log('[API] imageUrl prefix:', imageUrl?.substring(0, 60));

      if (!imageUrl) {
        throw new Error('Generation succeeded but no image URL was returned. Please try again.');
      }

      setRawImageUrl(imageUrl);

      // ── Diagnostics: log device context and probe both URLs before any render attempt ──
      const device = getDeviceInfo();
      console.log(`[DIAG] device isMobile=${device.isMobile} ua="${device.ua.substring(0, 120)}"`);
      console.log(`[DIAG] rawImageUrl=${imageUrl}`);

      // Run HEAD probes in parallel — do not await, pure side-effect logging
      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate?proxyUrl=${encodeURIComponent(imageUrl)}`;
      probeUrl('raw', imageUrl);
      probeUrl('proxy', proxyUrl);

      console.log('[IMAGE] proxy URL built:', proxyUrl.substring(0, 80));

      const proxyPreloadOk = await loadImageWithRetry(proxyUrl, 2, 12000);

      if (proxyPreloadOk) {
        console.log('[IMAGE] proxy preload succeeded — fetching blob via proxy');
        try {
          const imgRes = await fetch(proxyUrl);
          console.log('[IMAGE] proxy fetch status:', imgRes.status, 'ok:', imgRes.ok, 'content-type:', imgRes.headers.get('content-type'), 'content-length:', imgRes.headers.get('content-length'));

          if (imgRes.ok) {
            const blob = await imgRes.blob();
            console.log('[IMAGE] proxy blob size:', blob.size, 'type:', blob.type);
            if (blob.size > 0) {
              const localUrl = URL.createObjectURL(blob);
              console.log('[IMAGE] upgraded to local blob URL via proxy');
              setGeneratedImageUrl(localUrl);
            } else {
              console.warn('[IMAGE] proxy blob empty — failure-type=http using proxy URL directly');
              setGeneratedImageUrl(proxyUrl);
            }
          } else {
            console.warn(`[IMAGE] proxy fetch not ok: status=${imgRes.status} failure-type=http — using proxy URL directly`);
            setGeneratedImageUrl(proxyUrl);
          }
        } catch (fetchErr) {
          const ftype = classifyError(fetchErr);
          const msg = fetchErr instanceof Error ? `${fetchErr.name}: ${fetchErr.message}` : String(fetchErr);
          console.warn(`[IMAGE] proxy fetch threw failure-type=${ftype} error="${msg}" — using proxy URL directly`);
          setGeneratedImageUrl(proxyUrl);
        }
      } else {
        // Proxy preload failed — run a HEAD probe now to capture why, then fall back to raw
        console.warn(`[IMAGE] proxy preload FAILED isMobile=${device.isMobile} — running diagnostic probe and falling back to raw URL`);
        probeUrl('proxy-postfail', proxyUrl);

        const rawPreloadOk = await loadImageWithRetry(imageUrl, 1, 9000);
        if (rawPreloadOk) {
          console.log('[IMAGE] raw URL preload succeeded — using raw URL');
          setGeneratedImageUrl(imageUrl);
        } else {
          console.error(`[IMAGE] BOTH proxy and raw preload FAILED isMobile=${device.isMobile} ua="${device.ua.substring(0, 80)}" — marking imgLoadFailed`);
          probeUrl('raw-postfail', imageUrl);
          setGeneratedImageUrl(imageUrl);
          setImgLoadFailed(true);
        }
      }
    } catch (err) {
      console.error('[GENERATE] error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedRef(null);
    setSelectedCategory(null);
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setError('');
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
    setError('');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setError('');
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
            console.error('[IMG] onError — native render failed:', src?.substring(0, 80));
            setImgLoadFailed(true);
          }}
          isGenerating={isGenerating}
          error={error}
        />
      )}
    </>
  );
}

export default App;
