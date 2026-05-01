import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle, Wand2, ExternalLink } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  rawImageUrl: string;
  imgLoadFailed: boolean;
  onImgError: (src: string) => void;
  isGenerating: boolean;
  error: string;
}

export default function Result({
  onBack,
  onStartOver,
  generatedImageUrl,
  rawImageUrl,
  imgLoadFailed,
  onImgError,
  isGenerating,
  error,
}: ResultProps) {
  const hasUrl = !!generatedImageUrl && !isGenerating;

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
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b-2" style={{ background: 'rgba(240,237,246,0.92)', backdropFilter: 'blur(20px)', borderColor: '#d8ccea' }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8 flex items-center justify-between h-14">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold font-body transition-colors duration-200 text-[#7a6f96] hover:text-[#2d2642]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)', boxShadow: '0 3px 10px rgba(155,125,212,0.3)' }}>
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-extrabold text-[#2d2642] font-display">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#9b7dd4]" />
            Result
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8">

        {/* Page heading */}
        <div className="text-center mb-7">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">
            {isGenerating
              ? 'Creating Your Fusion'
              : error && !hasUrl
              ? 'Generation Failed'
              : 'Your Styled Fusion'}
          </h2>
          <p className="text-[#7a6f96] text-sm font-body">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error && !hasUrl
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        {/* Result card */}
        <div className="card-premium overflow-hidden mb-6">
          <div className="aspect-square flex items-center justify-center relative" style={{ background: 'linear-gradient(145deg, #f3eefa, #ede6f6)' }}>
            {isGenerating ? (
              <div className="text-center p-10 animate-fade-in">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d8ccea' }} />
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#9b7dd4] animate-spin" />
                  <div className="absolute inset-2.5 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#9b7dd4] animate-spin" />
                  </div>
                </div>
                <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generating your fusion...</p>
                <p className="text-[#7a6f96] text-sm font-body">Usually takes under a minute</p>
                <div className="mt-4 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                      style={{ background: '#9b7dd4', animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : generatedImageUrl && !imgLoadFailed ? (
              <img
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="w-full h-full object-contain animate-scale-in"
                onError={(e) => {
                  const src = (e.target as HTMLImageElement).src;
                  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                  console.error(`[IMG onError] ts=${Date.now()} isMobile=${isMobile} src=${src.substring(0, 100)}`);
                  console.error(`[IMG onError] ua="${navigator.userAgent.substring(0, 120)}"`);
                  onImgError(src);
                }}
              />
            ) : generatedImageUrl && imgLoadFailed ? (
              <div className="text-center p-10 animate-fade-in">
                <div className="mx-auto mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
                <p className="font-display font-bold text-[#2d2642] text-base mb-2">Image Generated</p>
                <p className="text-[#7a6f96] text-sm max-w-xs mx-auto leading-relaxed font-body mb-5">
                  Your image was created but could not be displayed due to network or device restrictions.
                </p>
                <a
                  href={rawImageUrl || generatedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white font-body transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Image in New Tab
                </a>
              </div>
            ) : error ? (
              <div className="text-center p-10 animate-fade-in">
                <div className="mx-auto mb-5 rounded-xl border-2 border-red-200 bg-red-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generation Error</p>
                <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">{error}</p>
              </div>
            ) : (
              <div className="text-center p-10 animate-fade-in">
                <div className="mx-auto mb-5 rounded-xl border-2 flex items-center justify-center" style={{ width: 64, height: 64, background: '#f3eefa', borderColor: '#d8ccea' }}>
                  <Sparkles className="w-8 h-8 text-[#b49cdb]" />
                </div>
                <p className="text-[#7a6f96] text-sm font-body">Generated result will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImageUrl}
            className="btn-generate flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="btn-secondary flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
