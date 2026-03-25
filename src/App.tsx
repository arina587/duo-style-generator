import { useState } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';

type View = 'home' | 'upload' | 'result';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    setCurrentView('upload');
  };

  const handleGenerate = (_photo1: File, _photo2: File) => {
    setCurrentView('result');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedStyle('');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
  };

  return (
    <>
      {currentView === 'home' && (
        <Home onStyleSelect={handleStyleSelect} />
      )}
      {currentView === 'upload' && (
        <Upload
          selectedStyle={selectedStyle}
          onBack={handleBackToHome}
          onGenerate={handleGenerate}
        />
      )}
      {currentView === 'result' && (
        <Result
          onBack={handleBackToUpload}
          onStartOver={handleBackToHome}
        />
      )}
    </>
  );
}

export default App;
