import { useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';

type View = 'home' | 'upload' | 'result';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleStyleSelect = (style: string, refImages: string[]) => {
    setSelectedStyle(style);
    setReferenceImages(refImages);
    setCurrentView('upload');
  };

  const handleGenerate = async (photo1: File, photo2: File, combinedStyleBoard: File) => {
    console.log('=== APP HANDLEGENERATE START ===');

    if (isGenerating) {
      console.log('BLOCKED: Already generating in App');
      return;
    }

    if (!photo1 || !photo2 || !combinedStyleBoard || !selectedStyle) {
      console.error('BLOCKED: Missing required fields', {
        person1: !!photo1,
        person2: !!photo2,
        styleBoard: !!combinedStyleBoard,
        selectedStyle: !!selectedStyle,
      });
      setError('Missing required data. Please try again.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCurrentView('result');

    console.log('=== REQUEST START ===');
    console.log('selectedStyle:', selectedStyle);

    try {
      const formData = new FormData();
      formData.append('person1', photo1);
      formData.append('person2', photo2);
      formData.append('styleBoard', combinedStyleBoard);
      formData.append('selectedStyle', selectedStyle);

      console.log('FormData built with:', {
        person1: photo1.name,
        person2: photo2.name,
        styleBoard: combinedStyleBoard.name,
        selectedStyle: selectedStyle,
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
    setSelectedStyle('');
    setReferenceImages([]);
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
        <Home onStyleSelect={handleStyleSelect} />
      )}
      {currentView === 'upload' && (
        <Upload
          selectedStyle={selectedStyle}
          referenceImages={referenceImages}
          onBack={handleBackToHome}
          onGenerate={handleGenerate}
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
