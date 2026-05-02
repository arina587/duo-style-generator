import { useRef, useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import AnimatedBackground from './components/AnimatedBackground';
import type { ReferenceItem } from './data/references';

type View = 'home' | 'upload' | 'result';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRef, setSelectedRef] = useState<ReferenceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // generationError: only set when API call fails and no image URL was returned
  const [generationError, setGenerationError] = useState<string>('');

  // Stale-request guard: only the latest request may update state
  const activeRequestId = useRef<string>('');

  // Primary photos (required)
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');

  // Secondary photos (optional)
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

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    activeRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedImageUrl('');
    setRawImageUrl('');
    setImgLoadFailed(false);
    setCurrentView('result');

    console.log('[DEVICE]', navigator.userAgent);
    console.log('[GENERATE] requestId=' + requestId + ' referenceId=' + selectedRef.id);

    try {
      const formData = new FormData();
      formData.append('person1', photo1);
      if (photo1b) formData.append('person1b', photo1b);
      formData.append('person2', photo2);
      if (photo2b) formData.append('person2b', photo2b);
      formData.append('reference', referenceFile);
      formData.append('style', selectedRef.style);
      formData.append('referenceId', selectedRef.id);
      formData.append('prompt', selectedRef.prompt ?? '');
      if (mode) formData.append('mode', mode);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: formData,
      });

      if (activeRequestId.current !== requestId) return;

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to generate image');
      }

      // Edge function now returns image bytes directly (Content-Type: image/*).
      // The raw Replicate signed URL is passed back in X-Image-Url for the fallback link.
      const contentType = response.headers.get('content-type') || '';
      const rawImageUrl = response.headers.get('x-image-url') || '';

      console.log('[RESPONSE] content-type:', contentType, 'x-image-url:', rawImageUrl.substring(0, 80));

      if (activeRequestId.current !== requestId) return;

      if (!contentType.startsWith('image/')) {
        // Unexpected JSON response — fall back to URL extraction for resilience
        const data = await response.json();
        let imageUrl: string | undefined;
        if (data.success && data.imageUrl) imageUrl = data.imageUrl;
        else if (Array.isArray(data.output) && data.output[0]) imageUrl = data.output[0];
        else if (typeof data.output === 'string') imageUrl = data.output;
        if (!imageUrl) throw new Error('Generation succeeded but no image URL was returned. Please try again.');
        const fallbackProxy = imageUrl.startsWith('https://replicate.delivery/')
          ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate?proxyUrl=${encodeURIComponent(imageUrl)}`
          : imageUrl;
        console.log('[FALLBACK] using URL mode, proxy:', fallbackProxy.substring(0, 100));
        console.log('[IMG SRC]', fallbackProxy.substring(0, 100));
        setRawImageUrl(imageUrl);
        setGeneratedImageUrl(fallbackProxy);
        return;
      }

      // Convert the binary response to a local blob URL — zero TTL risk,
      // no second round-trip, works offline once loaded.
      const blob = await response.blob();

      if (activeRequestId.current !== requestId) return;

      const blobUrl = URL.createObjectURL(blob);
      console.log('[RENDER START] blob size:', blob.size, 'type:', blob.type);
      console.log('[IMG SRC]', blobUrl.substring(0, 80));

      setRawImageUrl(rawImageUrl || blobUrl);
      setGeneratedImageUrl(blobUrl);

    } catch (err) {
      if (activeRequestId.current !== requestId) return;
      const msg = err instanceof Error ? err.message : 'An error occurred during generation';
      console.error('[GENERATE ERROR] requestId=' + requestId, msg);

      // Network/connection errors (fetch abort, connection reset, gateway timeout)
      // are not generation failures — the model may still be running.
      // Only surface a hard error when the API explicitly returned one.
      const isNetworkError = err instanceof TypeError ||
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('aborted') ||
        msg.toLowerCase().includes('504') ||
        msg.toLowerCase().includes('502');

      if (isNetworkError) {
        console.warn('[GENERATE] network error — not treating as generation failure');
        setGenerationError('Connection timed out. The image may still be generating — please wait or try again.');
      } else {
        setGenerationError(msg);
      }
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
            // Image URL exists but browser failed to render it — imageLoadError, NOT generationError
            console.log('[IMG ERROR]', src);
            setImgLoadFailed(true);
          }}
          onImgLoad={() => {
            console.log('[IMG LOADED]', generatedImageUrl?.substring(0, 80));
          }}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      )}
    </>
  );
}

export default App;
