import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  isGenerating: boolean;
  error: string;
}

export default function Result({ onBack, onStartOver, generatedImageUrl, isGenerating, error }: ResultProps) {
  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = 'duo-style-fusion.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-section-soft">
      <div className="sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-purple-100/50 shadow-sm shadow-purple-50/60">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Result
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            {isGenerating ? 'Creating Your Fusion' : error ? 'Generation Failed' : 'Your Styled Fusion'}
          </h2>
          <p className="text-slate-500 font-light text-sm sm:text-base">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        <div className="card-premium overflow-hidden mb-8">
          <div className="aspect-square flex items-center justify-center relative bg-gradient-to-br from-purple-50/50 to-pink-50/30">
            {isGenerating ? (
              <div className="text-center p-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-200/50" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-purple-400 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                </div>
                <p className="text-slate-800 font-bold text-lg mb-2">Generating your fusion...</p>
                <p className="text-slate-400 text-sm">This may take a few moments</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200/50 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-slate-800 font-bold text-lg mb-2">Generation Error</p>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{error}</p>
              </div>
            ) : generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-400/60" />
                </div>
                <p className="text-slate-400 text-base">Generated result will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImageUrl || !!error}
            className="btn-generate flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-base shadow-xl shadow-purple-200/50"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="btn-secondary flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
