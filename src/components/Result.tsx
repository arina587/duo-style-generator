import { useEffect, useRef, useState } from 'react';
import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle, Wand2, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  rawImageUrl: string;
  imgLoadFailed: boolean;
  onImgError: (src: string) => void;
  onImgLoad: () => void;
  isGenerating: boolean;
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
  const [copyDone, setCopyDone] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const displaySrc = generatedImageUrl || rawImageUrl;

  const generationSucceeded =
    !!displaySrc &&
    !generationError;

  const showImage =
    !!displaySrc &&
    !imgLoadFailed;

  // Show action bar only after the image has painted
  const showActions = showImage && imgLoaded;

  // Reset per-image state when a new URL arrives
  const prevUrl = useRef('');

  useEffect(() => {
    if (displaySrc !== prevUrl.current) {
      prevUrl.current = displaySrc;

      hasRetried.current = false;
      setRetryKey(0);
      setDebugInfo(null);
      setImgLoaded(false);
    }
  }, [displaySrc]);

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

    if (!hasRetried.current) {
      hasRetried.current = true;
      console.log('[IMG RETRY]', displaySrc.substring(0, 100));
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

  // Resolve any URL type (base64, blob, CDN) to a blob for saving
  const resolveBlob = async (url: string): Promise<Blob> => {
    if (url.startsWith('data:')) {
      const [header, b64] = url.split(',');
      const mime = header.replace('data:', '').replace(';base64', '');
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    const res = await fetch(url);
    return res.blob();
  };

  const handleSave = async () => {
    const url = rawImageUrl || generatedImageUrl;
    if (!url) return;

    try {
      // Preferred: fetch as blob and use object URL so the browser always
      // treats it as a download rather than navigation (works for data: too)
      const blob = await resolveBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      link.download = `duo-style-fusion.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch {
      // Fallback for cross-origin CDN URLs where fetch may be blocked
      const link = document.createElement('a');
      link.href = url;
      link.download = 'duo-style-fusion.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = async () => {
    const url = rawImageUrl || generatedImageUrl;
    if (!url) return;

    try {
      const blob = await resolveBlob(url);
      // Clipboard API requires image/png; convert if needed
      let pngBlob = blob;
      if (blob.type !== 'image/png') {
        pngBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new window.Image();
          const objUrl = URL.createObjectURL(blob);
          img.onload = () => {
            URL.revokeObjectURL(objUrl);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
          };
          img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('img load failed')); };
          img.src = objUrl;
        });
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch (err) {
      console.warn('[COPY] clipboard image write failed, falling back to URL copy:', err);
      try {
        await navigator.clipboard.writeText(url.startsWith('data:') ? 'Image copied as file — use Save instead' : url);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      } catch {
        console.warn('[COPY] clipboard text write also failed');
      }
    }
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

  // Hide heading section once the image is successfully showing — let the image speak
  const hideHeading =
    imgLoaded;

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

        {/* Page heading — hidden once image is visible so nothing competes with it */}
        {!hideHeading && (
          <div className="text-center mb-7 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">{heading}</h2>
            <p className="text-[#7a6f96] text-sm font-body">{subtitle}</p>
          </div>
        )}

        {/* Result card.
            aspect-ratio:1/1 gives the container a fixed, predictable size that
            does not depend on the image's intrinsic dimensions. All states
            (loading, image, error, idle) are absolutely positioned inside it so
            nothing can push or pull the container size. The single <img> path
            with absolute inset-0 + object-cover is used for every provider and
            URL type (base64, blob, CDN) — there is no provider-specific branch. */}
        <div className="card-premium overflow-hidden mb-6" style={{ transition: 'box-shadow 0.3s' }}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2 / 3', background: 'linear-gradient(145deg, #f3eefa, #ede6f6)' }}>

            {/* ── State 1: Generating ── */}
            {isGenerating && !displaySrc && (
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

            {/* ── State 2: Image ──
                One rendering path for all providers + URL types.
                absolute inset-0 + w-full h-full + object-cover fills the
                container edge-to-edge, centered, on every device. */}
            {!isGenerating && showImage && (
              <img
                key={retryKey}
                src={displaySrc}
                alt="Generated fusion result"
                loading="eager"
                style={{
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                }}
                className="absolute inset-0 z-10 w-full h-full object-contain object-center block animate-scale-in"
                onLoad={(e) => {
                  console.log('[IMG LOADED]', (e.target as HTMLImageElement).src.substring(0, 80));
                  setImgLoaded(true);
                  onImgLoad();
                }}
                onError={handleImgError}
              />
            )}

            {/* ── Floating action bar — only shown after image has painted ──
                Sits at the bottom of the image, never over non-image states. */}
            {showActions && (
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 animate-fade-in"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'auto',
                }}
              >
                {/* Left: Create Another */}
                <button
                  onClick={onStartOver}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-body text-white transition-opacity hover:opacity-80 active:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  New
                </button>

                {/* Right: Copy + Save */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-body text-white transition-all hover:opacity-80 active:opacity-70"
                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                  >
                    {copyDone ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copyDone ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-body text-white transition-all hover:opacity-80 active:opacity-70"
                    style={{ background: 'rgba(155,125,212,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* ── State 3: Generation succeeded but browser failed to display ── */}
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

                <div className="rounded-xl border border-gray-200 bg-gray-950 text-green-400 font-mono text-xs p-4 mb-4 space-y-1 overflow-x-auto">
                  <p className="text-gray-500 mb-2">// debug info</p>
                  <p><span className="text-gray-400">URL:</span> <a href={displaySrc} target="_blank" rel="noopener noreferrer" className="underline break-all text-green-300">{displaySrc.substring(0, 120)}</a></p>
                  {rawImageUrl && rawImageUrl !== displaySrc && (
                    <p><span className="text-gray-400">RAW:</span> <a href={rawImageUrl} target="_blank" rel="noopener noreferrer" className="underline break-all text-green-300">{rawImageUrl.substring(0, 120)}</a></p>
                  )}
                  {debugFetching && <p className="text-yellow-400">fetching diagnostics...</p>}
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

            {/* ── State 4: API/generation error ── */}
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

            {/* ── State 5: Empty idle ──
                Only shown when there is truly nothing — no image, no error,
                not generating. Once any image URL is set this state disappears. */}
            {!isGenerating &&
             !displaySrc &&
             !generationError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                <div className="mb-5 rounded-xl border-2 flex items-center justify-center" style={{ width: 64, height: 64, background: '#f3eefa', borderColor: '#d8ccea' }}>
                  <Sparkles className="w-8 h-8 text-[#b49cdb]" />
                </div>
                <p className="text-[#7a6f96] text-sm font-body">Generated result will appear here</p>
              </div>
            )}

          </div>
        </div>

        {/* Below-card action row — visible when image is loaded, supplements the in-image bar */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
            <button
              onClick={handleSave}
              className="btn-generate flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
            >
              <Download className="w-4 h-4" />
              Save Image
            </button>
            <button
              onClick={onStartOver}
              className="btn-secondary flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
            >
              Create Another
            </button>
          </div>
        )}

        {/* Below-card action row — non-image states (generating / error) */}
        {!showActions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSave}
              disabled={isGenerating || (!generatedImageUrl && !rawImageUrl)}
              className="btn-generate flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Save Image
            </button>
            <button
              onClick={onStartOver}
              disabled={isGenerating}
              className="btn-secondary flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Another
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
