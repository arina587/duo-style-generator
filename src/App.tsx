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
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const [person1Base64, person2Base64, styleBoardBase64] = await Promise.all([
        fileToBase64(photo1),
        fileToBase64(photo2),
        fileToBase64(combinedStyleBoard),
      ]);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person1: person1Base64,
          person2: person2Base64,
          styleBoard: styleBoardBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
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
