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
    <div className="min-h-screen" style={{ background: '#faf8f5' }}>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#ede8e0]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 60 }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8a7f74] hover:text-[#1a1a2e] transition-colors duration-200 text-sm font-medium font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-[#faf8f5]" />
            </div>
            <span className="text-sm font-bold text-[#1a1a2e] font-body">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#c47c5a]" />
            Result
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12">

        {/* Page heading */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-2">
            {isGenerating ? 'Creating Your Fusion' : error ? 'Generation Failed' : 'Your Styled Fusion'}
          </h2>
          <p className="text-[#8a7f74] font-light text-sm sm:text-base font-body">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        {/* Result card */}
        <div className="card-premium overflow-hidden mb-8">
          <div className="aspect-square flex items-center justify-center relative" style={{ background: '#f2ede6' }}>
            {isGenerating ? (
              <div className="text-center p-12 animate-fade-in">
                <div className="relative w-20 h-20 mx-auto mb-7">
                  <div className="absolute inset-0 rounded-full border border-[#ede8e0]" />
                  <div className="absolute inset-0 rounded-full border-t border-[#c47c5a] animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-[#c47c5a] animate-spin" />
                  </div>
                </div>
                <p className="font-display font-bold text-[#1a1a2e] text-lg mb-2">Generating your fusion...</p>
                <p className="text-[#8a7f74] text-sm font-body font-light">This may take up to 90 seconds</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#c47c5a] animate-pulse-soft"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12 animate-fade-in">
                <div className="w-18 h-18 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                  <AlertCircle className="w-9 h-9 text-red-400" />
                </div>
                <p className="font-display font-bold text-[#1a1a2e] text-lg mb-2">Generation Error</p>
                <p className="text-[#8a7f74] text-sm max-w-sm mx-auto leading-relaxed font-body">{error}</p>
              </div>
            ) : generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="w-full h-full object-contain animate-scale-in"
              />
            ) : (
              <div className="text-center p-12 animate-fade-in">
                <div className="w-18 h-18 mx-auto mb-6 rounded-2xl bg-[#f2ede6] border border-[#ede8e0] flex items-center justify-center" style={{ width: 72, height: 72 }}>
                  <Sparkles className="w-9 h-9 text-[#c47c5a]/50" />
                </div>
                <p className="text-[#8a7f74] text-base font-body">Generated result will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImageUrl || !!error}
            className="btn-generate flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="btn-secondary flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
