import { Download, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
}

export default function Result({ onBack, onStartOver }: ResultProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [resultImage, setResultImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setResultImage('https://images.pexels.com/photos/1145434/pexels-photo-1145434.jpeg?auto=compress&cs=tinysrgb&w=800');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    console.log('Download triggered');
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6B8FA3] hover:text-[#8B6B4E] mb-12 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-light">Back to upload</span>
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-[#6B8FA3]" />
            <h1 className="text-5xl font-light tracking-wide text-[#8B6B4E]">DuoStyle</h1>
          </div>
          <h2 className="text-3xl font-light text-slate-700 mb-4">
            {isLoading ? 'Creating Your Fusion' : 'Your Styled Fusion'}
          </h2>
          <p className="text-lg text-slate-600 font-light leading-relaxed">
            {isLoading ? 'AI is generating your styled photo...' : 'Your AI-generated fusion is ready!'}
          </p>
        </div>

        <div className="matte-card rounded-2xl soft-shadow-lg overflow-hidden mb-12">
          <div className="aspect-square bg-slate-100/50 flex items-center justify-center relative">
            {isLoading ? (
              <div className="relative text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center soft-shadow">
                  <Loader2 className="w-16 h-16 text-[#6B8FA3] animate-spin" />
                </div>
                <p className="text-[#8B6B4E] font-light text-xl tracking-wide">
                  Generating your fusion...
                </p>
                <p className="text-sm text-slate-500 mt-3 font-light">
                  This may take a few moments
                </p>
              </div>
            ) : resultImage ? (
              <img
                src={resultImage}
                alt="Generated fusion result"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center soft-shadow">
                  <Sparkles className="w-16 h-16 text-[#6B8FA3]" />
                </div>
                <p className="text-[#8B6B4E] font-light text-xl tracking-wide">
                  Generated result will appear here
                </p>
                <p className="text-sm text-slate-500 mt-3 font-light">
                  This is a placeholder for your styled photo
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-[#6B8FA3] text-white rounded-full font-light tracking-wide hover:bg-[#8B6B4E] transition-all duration-500 soft-shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Download className="w-5 h-5" />
            <span>Download Image</span>
          </button>
          <button
            onClick={onStartOver}
            disabled={isLoading}
            className="px-10 py-4 matte-card text-[#8B6B4E] rounded-full font-light tracking-wide hover:bg-white transition-all duration-500 soft-shadow hover:soft-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
