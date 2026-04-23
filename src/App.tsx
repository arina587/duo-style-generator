import { useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
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

  const resolveDomain = (style: string, mode?: string): string => {
    if (style === 'zootopia') {
      if (mode === 'zootopia_animals') return 'zootopia_animals';
      if (mode === 'zootopia_cartoon') return 'zootopia_cartoon';
      return 'zootopia_cartoon';
    }
    if (style === 'titanic') return 'titanic';
    if (style === 'euphoria') return 'euphoria';
    return 'titanic';
  };

  const handleGenerate = async (photo1: File, photo2: File, referenceFile: File, prompt: string, mode?: string) => {
    console.log('=== APP HANDLEGENERATE START ===');

    if (isGenerating) {
      console.log('BLOCKED: Already generating in App');
      return;
    }

    if (!photo1 || !photo2 || !referenceFile || !selectedRef) {
      console.error('BLOCKED: Missing required fields', {
        person1: !!photo1,
        person2: !!photo2,
        reference: !!referenceFile,
        selectedRef: !!selectedRef,
      });
      setError('Missing required data. Please try again.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDebugInfo(null);
    setCurrentView('result');

    console.log("PROMPT BEFORE SEND:", prompt);
    console.log("REFERENCE:", referenceFile);

    if (!prompt || prompt.trim() === "") {
      setIsGenerating(false);
      setError("No prompt selected. Please select a reference image before generating.");
      setCurrentView('upload');
      throw new Error("No prompt selected. Please select a reference image before generating.");
    }

    const style = selectedRef.style;
    console.log('=== REQUEST START ===');
    console.log('style:', style);
    console.log('mode:', mode);

    try {
      const formData = new FormData();
      formData.append('person1', photo1);
      formData.append('person2', photo2);
      formData.append('reference', referenceFile);
      formData.append('style', style);
      formData.append('referenceId', selectedRef.id);
      formData.append('domain', resolveDomain(style, mode));
      formData.append('prompt', prompt);

      if (mode) {
        formData.append('mode', mode);
      }

      console.log('FormData built with:', {
        person1: photo1.name,
        person2: photo2.name,
        reference: referenceFile.name,
        style,
        referenceId: selectedRef.id,
        mode: mode || 'not provided',
        prompt,
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
      console.log('=== REQUEST SENT ===');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      console.log('=== RESPONSE RECEIVED ===', { status: response.status });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.debug) {
        setDebugInfo(data.debug);
        console.log('DEBUG INFO:', JSON.stringify(data.debug, null, 2));
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.imageUrl) {
        console.log('SUCCESS: Setting imageUrl:', data.imageUrl);
        setGeneratedImageUrl(data.imageUrl);
        setError('');
      } else {
        throw new Error('Generation failed. Invalid response.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      if (!generatedImageUrl) {
        setError(err instanceof Error ? err.message : 'An error occurred during generation');
      }
    } finally {
      setIsGenerating(false);
      console.log('=== REQUEST COMPLETE ===');
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

  // Back from Upload: return to Home with the category still open, photos preserved
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
