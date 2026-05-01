import { useState } from 'react';
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

      // Extract the output URL — backend always returns data.imageUrl as a raw https:// URL
      let imageUrl: string | undefined;
      if (data.success && data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (Array.isArray(data.output) && data.output[0]) {
        imageUrl = data.output[0];
      } else if (typeof data.output === 'string') {
        imageUrl = data.output;
      }

      console.log('[API] imageUrl:', imageUrl);
      console.log('[API] imageUrl type:', typeof imageUrl);
      console.log('[API] imageUrl prefix:', imageUrl?.substring(0, 60));

      if (!imageUrl) {
        throw new Error('Generation succeeded but no image URL was returned. Please try again.');
      }

      // Generation succeeded — now fetch the output image into a local blob URL.
      // We do this client-side because the edge function cannot safely base64-encode
      // large images without exceeding response size limits.
      console.log('[IMAGE] fetching output from:', imageUrl);
      let imgRes: Response;
      try {
        imgRes = await fetch(imageUrl);
      } catch (fetchErr) {
        console.error('[IMAGE] fetch threw:', fetchErr);
        throw new Error(
          `Your image was generated successfully but could not be loaded from the output URL. ` +
          `Error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
        );
      }

      console.log('[IMAGE] fetch status:', imgRes.status, imgRes.statusText);
      console.log('[IMAGE] content-type:', imgRes.headers.get('content-type'));
      console.log('[IMAGE] content-length:', imgRes.headers.get('content-length'));

      if (!imgRes.ok) {
        console.error('[IMAGE] fetch not ok:', imgRes.status, imgRes.statusText);
        throw new Error(
          `Your image was generated successfully but the output URL returned status ${imgRes.status}. ` +
          `The link may have expired — please try generating again.`
        );
      }

      const blob = await imgRes.blob();
      console.log('[IMAGE] blob size:', blob.size, 'type:', blob.type);

      if (blob.size === 0) {
        throw new Error('Your image was generated successfully but the downloaded file is empty. Please try again.');
      }

      const localUrl = URL.createObjectURL(blob);
      console.log('[IMAGE] local blob URL created:', localUrl.substring(0, 40));
      setGeneratedImageUrl(localUrl);
      setError('');
    } catch (err) {
      console.error('Generation error:', err);
      if (!generatedImageUrl) {
        setError(err instanceof Error ? err.message : 'An error occurred during generation');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedRef(null);
    setSelectedCategory(null);
    setGeneratedImageUrl('');
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
    setError('');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setGeneratedImageUrl('');
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
          isGenerating={isGenerating}
          error={error}
        />
      )}
    </>
  );
}

export default App;
