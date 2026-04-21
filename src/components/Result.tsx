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
    <div className="min-h-screen grid-bg">

      {/* Header */}
      <div className="sticky top-0 z-40 border-b-2" style={{ background: 'rgba(244,246,232,0.92)', backdropFilter: 'blur(20px)', borderColor: '#d4de8e' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 60 }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold font-body transition-colors duration-200 text-[#6a6a7a] hover:text-[#2a2a3d]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#c0cc60] flex items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(192,204,96,0.3)' }}>
              <Wand2 className="w-3.5 h-3.5 text-[#2a2a3d]" />
            </div>
            <span className="text-sm font-extrabold text-[#2a2a3d] font-display">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#8ba83c]" />
            Result
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12">

        {/* Page heading */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a2a3d] mb-2">
            {isGenerating ? 'Creating Your Fusion' : error ? 'Generation Failed' : 'Your Styled Fusion'}
          </h2>
          <p className="text-[#6a6a7a] text-sm sm:text-base font-body">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        {/* Result card */}
        <div className="card-premium overflow-hidden mb-8">
          <div className="aspect-square flex items-center justify-center relative" style={{ background: '#eef4c8' }}>
            {isGenerating ? (
              <div className="text-center p-12 animate-fade-in">
                <div className="relative w-20 h-20 mx-auto mb-7">
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d4de8e' }} />
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#8ba83c] animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-[#8ba83c] animate-spin" />
                  </div>
                </div>
                <p className="font-display font-bold text-[#2a2a3d] text-lg mb-2">Generating your fusion...</p>
                <p className="text-[#6a6a7a] text-sm font-body">This may take up to 90 seconds</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#c0cc60] animate-pulse-soft"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12 animate-fade-in">
                <div className="mx-auto mb-6 rounded-2xl border-2 border-red-200 bg-red-50 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                  <AlertCircle className="w-9 h-9 text-red-400" />
                </div>
                <p className="font-display font-bold text-[#2a2a3d] text-lg mb-2">Generation Error</p>
                <p className="text-[#6a6a7a] text-sm max-w-sm mx-auto leading-relaxed font-body">{error}</p>
              </div>
            ) : generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="w-full h-full object-contain animate-scale-in"
              />
            ) : (
              <div className="text-center p-12 animate-fade-in">
                <div className="mx-auto mb-6 rounded-2xl border-2 flex items-center justify-center" style={{ width: 72, height: 72, background: '#eef4c8', borderColor: '#d4de8e' }}>
                  <Sparkles className="w-9 h-9 text-[#c0cc60]" />
                </div>
                <p className="text-[#6a6a7a] text-base font-body">Generated result will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImageUrl || !!error}
            className="btn-generate flex items-center justify-center gap-2.5 px-10 py-4 text-base"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="btn-secondary flex items-center justify-center gap-2.5 px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
