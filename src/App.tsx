import { useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

// Preloads a URL via a hidden Image element with retry + timeout.
// Returns true if the image loaded successfully, false otherwise.
function loadImageWithRetry(url: string, retries = 2, timeout = 9000): Promise<boolean> {
  return new Promise((resolve) => {
    let attempt = 0;

    function tryLoad() {
      attempt++;
      console.log(`[PRELOAD] attempt ${attempt}/${retries + 1} url=${url.substring(0, 60)}`);

      const img = new window.Image();
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;

      function succeed() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.log(`[PRELOAD] success on attempt ${attempt}`);
        resolve(true);
      }

      function fail(reason: string) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.warn(`[PRELOAD] attempt ${attempt} failed: ${reason}`);
        if (attempt <= retries) {
          const delay = attempt * 1500;
          console.log(`[PRELOAD] retrying in ${delay}ms...`);
          setTimeout(tryLoad, delay);
        } else {
          console.warn('[PRELOAD] all attempts exhausted — resolving false');
          resolve(false);
        }
      }

      timer = setTimeout(() => fail(`timeout after ${timeout}ms`), timeout);
      img.onload = () => succeed();
      img.onerror = () => fail('onerror');
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
  const [error, setError] = useState<string>('');
  const [, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');

  const handleImageSelect = (ref: ReferenceItem) => {
    setSelectedCategory(ref.style);
    setSelectedRef(ref);
    setCurrentView('upload');
  };

  const handleGenerate = async (photo1: File, photo2: File, referenceFile: File, mode?: string) => {
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
      formData.append('person2', photo2);
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
          person2: { size: photo2.size, type: photo2.type, name: photo2.name },
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

      // Stash the raw URL so the fallback "Open in new tab" link always works
      setRawImageUrl(imageUrl);

      // Step 1: Preload via Image element with retry + timeout.
      // This is the most reliable path on mobile Safari — the browser's own image
      // loader handles CORS + caching + redirects better than fetch().
      const preloadOk = await loadImageWithRetry(imageUrl, 2, 9000);

      if (preloadOk) {
        // Image is confirmed loadable — set it for rendering
        setGeneratedImageUrl(imageUrl);

        // Step 2: Try to upgrade to a local blob URL so downloads work reliably.
        // This is a best-effort operation — if it fails we keep the raw URL.
        console.log('[IMAGE] attempting fetch→blob upgrade for:', imageUrl);
        try {
          const imgRes = await fetch(imageUrl);
          console.log('[IMAGE] fetch status:', imgRes.status, imgRes.statusText);
          console.log('[IMAGE] content-type:', imgRes.headers.get('content-type'));
          console.log('[IMAGE] content-length:', imgRes.headers.get('content-length'));

          if (imgRes.ok) {
            const blob = await imgRes.blob();
            console.log('[IMAGE] blob size:', blob.size, 'type:', blob.type);
            if (blob.size > 0) {
              const localUrl = URL.createObjectURL(blob);
              console.log('[IMAGE] upgraded to blob URL');
              setGeneratedImageUrl(localUrl);
            } else {
              console.warn('[IMAGE] blob was empty — keeping raw URL');
            }
          } else {
            console.warn('[IMAGE] fetch not ok:', imgRes.status, '— keeping raw URL');
          }
        } catch (fetchErr) {
          console.warn('[IMAGE] fetch→blob failed — keeping raw URL:', fetchErr);
        }
      } else {
        // Preload failed after all retries.
        // Still set the URL so the <img> gets one last native browser attempt,
        // and mark imgLoadFailed so we can show the fallback if it also fails.
        console.warn('[IMAGE] preload failed — setting raw URL and marking imgLoadFailed');
        setGeneratedImageUrl(imageUrl);
        setImgLoadFailed(true);
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
