import { Download, ArrowLeft, Sparkles } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
}

export default function Result({ onBack, onStartOver }: ResultProps) {
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
            <h1 className="text-4xl font-bold text-slate-900">Your Styled Fusion</h1>
          </div>
          <p className="text-lg text-slate-600">
            Your AI-generated fusion is ready!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Image</span>
          </button>
          <button
            onClick={onStartOver}
            className="px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm border-2 border-slate-200 hover:border-slate-300"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
