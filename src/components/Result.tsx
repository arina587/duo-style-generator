import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">

        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to upload
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs text-sky-400 font-medium border border-sky-500/20">
            <Sparkles className="w-3 h-3" />
            DuoStyle
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            {isGenerating ? 'Creating Your Fusion' : error ? 'Generation Failed' : 'Your Styled Fusion'}
          </h2>
          <p className="text-slate-300 font-light text-sm sm:text-base">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        <div className="glass-card rounded-2xl glow-shadow-lg overflow-hidden mb-8">
          <div className="aspect-square flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating ? (
              <div className="text-center p-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-500/15" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-sky-400 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-sky-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                  </div>
                </div>
                <p className="text-white font-medium text-lg mb-2">Generating your fusion...</p>
                <p className="text-slate-400 text-sm">This may take a few moments</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-sky-500/60 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Generation Error</p>
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-sky-400/60" />
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
            className="btn-generate flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl text-white font-semibold text-base"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl glass-card-hover text-slate-300 hover:text-white font-semibold text-base border border-white/8 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
