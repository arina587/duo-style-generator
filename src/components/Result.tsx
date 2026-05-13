import { useEffect, useRef, useState } from 'react';
import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle, Wand2, ExternalLink, RefreshCw } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  rawImageUrl: string;
  imgLoadFailed: boolean;
  onImgError: (src: string) => void;
  onImgLoad: () => void;
  isGenerating: boolean;
  // Only set when the API/model call itself failed and no image URL was returned
  generationError: string;
}

interface DebugInfo {
  status?: number;
  type?: string;
  size?: number;
  error?: string;
}

export default function Result({
  onBack,
  onStartOver,
  generatedImageUrl,
  rawImageUrl,
  imgLoadFailed,
  onImgError,
  onImgLoad,
  isGenerating,
  generationError,
}: ResultProps) {
  const hasRetried = useRef(false);
  const [retryKey, setRetryKey] = useState(0);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugFetching, setDebugFetching] = useState(false);

  // Generation succeeded as long as a raw URL exists
  const generationSucceeded = !!rawImageUrl;
  const showImage = !!generatedImageUrl && !imgLoadFailed && !isGenerating;

  // The URL to diagnose — prefer generatedImageUrl (proxy), fall back to rawImageUrl
  const displaySrc = generatedImageUrl || rawImageUrl;

  // Reset retry + debug state when a new image URL arrives
  const prevUrl = useRef('');
  if (generatedImageUrl !== prevUrl.current) {
    prevUrl.current = generatedImageUrl;
    hasRetried.current = false;
    setRetryKey(0);
    setDebugInfo(null);
  }

  // When imgLoadFailed becomes true, auto-fetch the URL to gather diagnostics
  useEffect(() => {
    if (!imgLoadFailed || !displaySrc || displaySrc.startsWith('blob:')) return;

    setDebugFetching(true);
    setDebugInfo(null);

    fetch(displaySrc)
      .then(async (res) => {
        const blob = await res.blob();
        const info: DebugInfo = { status: res.status, type: blob.type, size: blob.size };
        console.log('[DEBUG FETCH]', info);
        setDebugInfo(info);
      })
      .catch((e: Error) => {
        console.log('[DEBUG FETCH ERROR]', e.message);
        setDebugInfo({ error: e.message });
      })
      .finally(() => setDebugFetching(false));
  }, [imgLoadFailed, displaySrc]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const src = (e.target as HTMLImageElement).src;
    console.log('[IMG ERROR]', src, Date.now());
    console.log('[DEBUG] Check DevTools → Network → filter replicate.delivery or supabase — check status code and response headers');

    if (!hasRetried.current) {
      hasRetried.current = true;
      console.log('[IMG RETRY]', generatedImageUrl.substring(0, 100));
      setTimeout(() => setRetryKey(k => k + 1), 1500);
    } else {
      console.log('[IMG RETRY EXHAUSTED] marking imgLoadFailed');
      onImgError(src);
    }
  };

  const handleRetry = () => {
    hasRetried.current = false;
    setDebugInfo(null);
    setRetryKey(k => k + 1);
  };

  const handleDownload = () => {
    const url = rawImageUrl || generatedImageUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'duo-style-fusion.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isNetworkTimeout = !isGenerating && !generationSucceeded && generationError.toLowerCase().includes('connection timed out');

  let heading = 'Your Styled Fusion';
  let subtitle = 'Your AI-generated fusion is ready to download';
  if (isGenerating) {
    heading = 'Creating Your Fusion';
    subtitle = 'AI is crafting your styled photo — this may take a minute';
  } else if (generationSucceeded && imgLoadFailed) {
    heading = 'Image Generated';
    subtitle = 'Your image was created — tap below to open it';
  } else if (isNetworkTimeout) {
    heading = 'Taking Longer Than Usual';
    subtitle = 'The connection dropped but generation may still be running';
  } else if (generationError) {
    heading = 'Generation Failed';
    subtitle = 'Something went wrong during generation';
  }

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
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">{heading}</h2>
          <p className="text-[#7a6f96] text-sm font-body">{subtitle}</p>
        </div>

        {/* Result card — unified image container.
            aspect-ratio:1/1 locks a square without the padding-bottom trick,
            avoiding the Mobile Safari bug where absolute children don't fill
            padding-generated height. All providers and URL types (base64, blob,
            CDN) render through the same single <img> path. */}
        <div className="card-premium overflow-hidden mb-6">
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1/1', background: 'linear-gradient(145deg, #f3eefa, #ede6f6)' }}>

            {/* All children are absolutely positioned to fill the fixed box */}

            {/* 1 — Generating */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative w-16 h-16 mb-5">
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
            )}

            {/* 2 — Image: absolute inset-0 + object-cover guarantees full fill
                for every provider (OpenAI, Nanobanana, Replicate), every URL
                type (base64, blob, CDN), and every device including Mobile Safari. */}
            {!isGenerating && showImage && (
              <img
                key={retryKey}
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="absolute inset-0 w-full h-full object-cover block animate-scale-in"
                onLoad={(e) => {
                  console.log('[IMG LOADED]', (e.target as HTMLImageElement).src);
                  onImgLoad();
                }}
                onError={handleImgError}
              />
            )}

            {/* 3 — Generation succeeded but browser failed to display after retry */}
            {!isGenerating && generationSucceeded && imgLoadFailed && (
              <div className="absolute inset-0 overflow-auto p-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44 }}>
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[#2d2642] text-sm">Image Generated — Display Failed</p>
                    <p className="text-[#7a6f96] text-xs font-body">Network or browser blocked the image. Use the links below.</p>
                  </div>
                </div>

                {/* Debug panel */}
                <div className="rounded-xl border border-gray-200 bg-gray-950 text-green-400 font-mono text-xs p-4 mb-4 space-y-1 overflow-x-auto">
                  <p className="text-gray-500 mb-2">// debug info</p>
                  <p><span className="text-gray-400">URL:</span> <a href={displaySrc} target="_blank" rel="noopener noreferrer" className="underline break-all text-green-300">{displaySrc}</a></p>
                  {rawImageUrl && rawImageUrl !== displaySrc && (
                    <p><span className="text-gray-400">RAW:</span> <a href={rawImageUrl} target="_blank" rel="noopener noreferrer" className="underline break-all text-green-300">{rawImageUrl}</a></p>
                  )}
                  {debugFetching && (
                    <p className="text-yellow-400">fetching diagnostics...</p>
                  )}
                  {debugInfo && (
                    <>
                      {debugInfo.status !== undefined && (
                        <p><span className="text-gray-400">STATUS:</span> <span className={debugInfo.status === 200 ? 'text-green-400' : 'text-red-400'}>{debugInfo.status}</span></p>
                      )}
                      {debugInfo.type !== undefined && (
                        <p><span className="text-gray-400">TYPE:</span> {debugInfo.type || '(empty)'}</p>
                      )}
                      {debugInfo.size !== undefined && (
                        <p><span className="text-gray-400">SIZE:</span> {debugInfo.size.toLocaleString()} bytes</p>
                      )}
                      {debugInfo.error !== undefined && (
                        <p><span className="text-gray-400">ERROR:</span> <span className="text-red-400">{debugInfo.error}</span></p>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-body border-2 border-[#d8ccea] text-[#7a6f96] hover:text-[#2d2642] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry display
                  </button>
                  <a
                    href={displaySrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white font-body transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open image directly
                  </a>
                  {rawImageUrl && rawImageUrl !== displaySrc && (
                    <a
                      href={rawImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-body border-2 border-[#d8ccea] text-[#7a6f96] hover:text-[#2d2642] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open raw URL
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 4 — API/generation error (no image URL was returned) */}
            {!isGenerating && !generationSucceeded && generationError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 animate-fade-in">
                {isNetworkTimeout ? (
                  <>
                    <div className="relative w-16 h-16 mb-5">
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d8ccea' }} />
                      <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
                      <div className="absolute inset-2.5 rounded-full bg-white flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                      </div>
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Still Working...</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      The connection dropped but the AI may still be generating. Please wait a moment, then try again if nothing appears.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-red-200 bg-red-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generation Error</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">{generationError}</p>
                  </>
                )}
              </div>
            )}

            {/* 5 — Empty idle state */}
            {!isGenerating && !generationSucceeded && !generationError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                <div className="mb-5 rounded-xl border-2 flex items-center justify-center" style={{ width: 64, height: 64, background: '#f3eefa', borderColor: '#d8ccea' }}>
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
            disabled={isGenerating || (!generatedImageUrl && !rawImageUrl)}
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
