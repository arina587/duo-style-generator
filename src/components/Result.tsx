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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to upload</span>
        </button>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              {isLoading ? 'Creating Your Fusion' : 'Your Styled Fusion'}
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            {isLoading ? 'AI is generating your styled photo...' : 'Your AI-generated fusion is ready!'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative">
            {isLoading ? (
              <div className="relative text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
                <p className="text-slate-700 font-medium text-lg">
                  Generating your fusion...
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : resultImage ? (
              <img
                src={resultImage}
                alt="Generated fusion result"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-slate-600" />
                </div>
                <p className="text-slate-600 font-medium">
                  Generated result will appear here
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  This is a placeholder for your styled photo
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Download className="w-5 h-5" />
            <span>Download Image</span>
          </button>
          <button
            onClick={onStartOver}
            disabled={isLoading}
            className="px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
