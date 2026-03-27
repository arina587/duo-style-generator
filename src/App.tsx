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
    setIsGenerating(true);
    setError('');
    setCurrentView('result');

    try {
      const formData = new FormData();
      formData.append('person1', photo1);
      formData.append('person2', photo2);
      formData.append('styleBoard', combinedStyleBoard);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('App received response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.imageUrl) {
        if (typeof data.imageUrl !== 'string') {
          console.error('imageUrl is not a string:', data.imageUrl);
          throw new Error('Generation failed. Invalid image URL.');
        }

        console.log('Final imageUrl to render:', data.imageUrl);
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error('Generation failed. Invalid image URL.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
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
