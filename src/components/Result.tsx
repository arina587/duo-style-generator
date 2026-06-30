import { useEffect, useRef, useState } from 'react';
import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle, Wand2, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import type { GenerationPhase, GenerationError } from '../App';
import type { ReferenceItem } from '../data/references';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  rawImageUrl: string;
  imgLoadFailed: boolean;
  onImgError: (src: string) => void;
  onImgLoad: () => void;
  isGenerating: boolean;
  generationPhase: GenerationPhase;
  generationError: GenerationError | null;
  isPollingRecovering?: boolean;
  selectedRef?: ReferenceItem | null;
}

interface DebugInfo {
  status?: number;
  type?: string;
  size?: number;
  error?: string;
}

const STAGES = [
  'Photos uploaded',
  'Preparing scene',
  'Generating cinematic composition',
  'Matching lighting and colors',
  'Finalizing details',
];

const TIPS = [
  'Well-lit photos usually produce the best results.',
  'Higher quality photos improve facial accuracy.',
  'Your movie scene is recreated using AI while preserving the cinematic style.',
  'Some movie styles require more processing time than others.',
  'Front-facing photos give the most accurate results.',
  'Matching the reference angle closely improves the final result.',
];

export default function Result({
  onBack,
  onStartOver,
  generatedImageUrl,
  rawImageUrl,
  imgLoadFailed,
  onImgError,
  onImgLoad,
  isGenerating,
  generationPhase,
  generationError,
  isPollingRecovering = false,
  selectedRef,
}: ResultProps) {
  const retryCount = useRef(0);
  const [retryKey, setRetryKey] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugFetching, setDebugFetching] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // ── Generation stages ──
  const [stageIndex, setStageIndex] = useState(0);
  const stageTimer3Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimer4Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Rotating tips ──
  const [tipIndex, setTipIndex] = useState(0);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Tracks isGenerating transitions ──
  const prevIsGeneratingRef = useRef(false);

  const displaySrc = generatedImageUrl || rawImageUrl;

  const generationSucceeded =
    !!displaySrc &&
    !generationError;

  const errorMessage = generationError?.message ?? '';
  const errorPhase = generationError?.phase ?? 'other';

  const showImage =
    !!displaySrc &&
    !imgLoadFailed &&
    !isGenerating;

  // Show action bar only after the image has painted
  const showActions = showImage && imgLoaded;

  // Reset per-image state when a new URL arrives
  const prevUrl = useRef('');

  useEffect(() => {
    if (displaySrc !== prevUrl.current) {
      prevUrl.current = displaySrc;
      retryCount.current = 0;
      setRetryKey(0);
      setIsRetrying(false);
      setDebugInfo(null);
      setImgLoaded(false);
      console.log('[IMG] new url set:', displaySrc.substring(0, 100), 'ua:', navigator.userAgent.substring(0, 80));
    }
  }, [displaySrc]);

  useEffect(() => {
    if (!imgLoadFailed || !displaySrc || displaySrc.startsWith('blob:')) return;

    setDebugFetching(true);
    setDebugInfo(null);

    fetch(displaySrc, { cache: 'no-store' })
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

  // Track generation start / end transitions
  useEffect(() => {
    if (isGenerating && !prevIsGeneratingRef.current) {
      // New generation started — reset stages and tips
      setStageIndex(0);
      setTipIndex(0);
    }
    if (!isGenerating && prevIsGeneratingRef.current && !generationError) {
      // Generation completed successfully — mark all stages done
      setStageIndex(STAGES.length);
    }
    prevIsGeneratingRef.current = isGenerating;
  }, [isGenerating, generationError]);

  // Advance stage based on generationPhase
  useEffect(() => {
    if (!isGenerating) return;
    if (generationPhase === 'uploading') setStageIndex((s) => Math.min(s, 0));
    if (generationPhase === 'starting')  setStageIndex((s) => Math.max(s, 1));
    if (generationPhase === 'generating') setStageIndex((s) => Math.max(s, 2));
  }, [isGenerating, generationPhase]);

  // Time-based stage advancement during 'generating' phase
  useEffect(() => {
    if (stageTimer3Ref.current) clearTimeout(stageTimer3Ref.current);
    if (stageTimer4Ref.current) clearTimeout(stageTimer4Ref.current);

    if (!isGenerating || generationPhase !== 'generating') return;

    stageTimer3Ref.current = setTimeout(() => setStageIndex((s) => Math.max(s, 3)), 38_000);
    stageTimer4Ref.current = setTimeout(() => setStageIndex((s) => Math.max(s, 4)), 63_000);

    return () => {
      if (stageTimer3Ref.current) clearTimeout(stageTimer3Ref.current);
      if (stageTimer4Ref.current) clearTimeout(stageTimer4Ref.current);
    };
  }, [isGenerating, generationPhase]);

  // Rotate tips while generating
  useEffect(() => {
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);

    if (!isGenerating || isPollingRecovering) return;

    const cycle = () => {
      setTipIndex((i) => (i + 1) % TIPS.length);
      tipTimerRef.current = setTimeout(cycle, 6000 + Math.random() * 2000);
    };
    tipTimerRef.current = setTimeout(cycle, 6500 + Math.random() * 1500);

    return () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, [isGenerating, isPollingRecovering]);

  const MAX_AUTO_RETRIES = 2;
  const RETRY_DELAY_MS = 1000;

  const handleImgError = () => {
    console.log('[IMG ERROR] retry=' + retryCount.current + ' url=' + displaySrc.substring(0, 100) + ' ua=' + navigator.userAgent.substring(0, 60));

    if (retryCount.current < MAX_AUTO_RETRIES) {
      retryCount.current += 1;
      console.log('[IMG RETRY] attempt=' + retryCount.current + '/' + MAX_AUTO_RETRIES + ' delay=' + RETRY_DELAY_MS + 'ms url=' + displaySrc.substring(0, 100));
      setIsRetrying(true);
      setTimeout(() => {
        setIsRetrying(false);
        setRetryKey(k => k + 1);
      }, RETRY_DELAY_MS);
      return;
    }

    console.log('[IMG RETRY EXHAUSTED] attempts=' + retryCount.current + ' url=' + displaySrc.substring(0, 100));
    setIsRetrying(false);
    onImgError(displaySrc);
  };

  const handleRetry = () => {
    retryCount.current = 0;
    setIsRetrying(false);
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
      const link = document.createElement('a');
      link.href = rawImageUrl || generatedImageUrl;
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

  const errorType = generationError?.type ?? 'unknown';
  const isTimeoutError = !isGenerating && !!generationError && errorType === 'timeout';
  const isModerationError = !isGenerating && !!generationError && errorType === 'moderation';
  const isUploadError = !isGenerating && !!generationError && errorType === 'upload';
  const isPostError = !isGenerating && errorPhase === 'starting_generation' && errorType !== 'moderation';
  const isPollError = !isGenerating && errorPhase === 'polling_generation' && errorType === 'network';
  const isBackendJobFailed = !isGenerating && errorPhase === 'polling_generation' && errorType === 'server';
  const isValidationFailed = !isGenerating && errorPhase === 'validating_result';

  const phaseLabel: Record<GenerationPhase, { heading: string; subtitle: string }> = {
    uploading: {
      heading: 'Uploading Images',
      subtitle: 'Securely uploading your photos',
    },
    starting: {
      heading: 'Preparing Your Scene',
      subtitle: 'Setting up the cinematic generation',
    },
    generating: {
      heading: 'Creating Your Cinematic Scene',
      subtitle: 'This usually takes around a minute while the AI recreates your movie scene.',
    },
  };

  let heading = 'Your Styled Fusion';
  let subtitle = 'Your AI-generated fusion is ready to download';
  if (isGenerating && isPollingRecovering) {
    heading = 'Connection Interrupted';
    subtitle = 'Still trying to retrieve your result — please stay on this page';
  } else if (isGenerating) {
    heading = phaseLabel[generationPhase].heading;
    subtitle = phaseLabel[generationPhase].subtitle;
  } else if (generationSucceeded && imgLoadFailed) {
    heading = 'Image Generated';
    subtitle = 'Your image was created — tap below to open it';
  } else if (isTimeoutError) {
    heading = 'Taking Longer Than Expected';
    subtitle = 'Please try again in a moment';
  } else if (isModerationError) {
    heading = 'Generation Blocked';
    subtitle = 'The generated image was rejected by the AI safety system';
  } else if (isUploadError) {
    heading = 'Upload Failed';
    subtitle = 'Could not upload your photos — please check your connection';
  } else if (isPostError) {
    heading = 'Could Not Start Generation';
    subtitle = 'Please check your connection and try again';
  } else if (isPollError) {
    heading = 'Connection Lost';
    subtitle = 'Could not reach the server while waiting for your result';
  } else if (isBackendJobFailed) {
    heading = 'Generation Failed';
    subtitle = 'The image generation did not complete — please try again';
  } else if (isValidationFailed) {
    heading = 'Result Processing Failed';
    subtitle = 'The image was generated but the result could not be retrieved';
  } else if (generationError) {
    heading = 'Generation Failed';
    subtitle = 'Please try again';
  }

  const hideHeading = imgLoaded;

  console.log('[ERROR RENDER]', {
    generationError,
    errorType,
    errorPhase,
    isPollError,
    isModerationError,
    isBackendJobFailed,
    isValidationFailed,
    isGenerating,
    isTimeoutError,
    isUploadError,
    isPostError,
  });

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

        {/* Page heading — hidden once image is visible */}
        {!hideHeading && (
          <div className="text-center mb-7 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">{heading}</h2>
            <p className="text-[#7a6f96] text-sm font-body">{subtitle}</p>
          </div>
        )}

        <div className="card-premium overflow-hidden mb-6 mx-auto" style={{ transition: 'box-shadow 0.3s', maxWidth: '480px' }}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1 / 1', background: 'linear-gradient(145deg, #f3eefa, #ede6f6)' }}>

            {/* ── State 1: Generating ── */}
            {isGenerating && (
              <div className="absolute inset-0 overflow-hidden animate-fade-in">

                {/* Cinematic background: reference image with slow zoom */}
                {selectedRef && (
                  <img
                    src={selectedRef.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover animate-zoom-pulse"
                    style={{ filter: 'brightness(0.18) saturate(0.55)' }}
                  />
                )}

                {/* Multi-layer dark gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: selectedRef
                      ? 'linear-gradient(180deg, rgba(4,2,14,0.30) 0%, rgba(4,2,14,0.55) 38%, rgba(4,2,14,0.93) 100%)'
                      : 'linear-gradient(145deg, #070514 0%, #0e0825 100%)',
                  }}
                />

                {/* Soft radial glow from center */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(155,125,212,0.08) 0%, transparent 70%)',
                  }}
                />

                {/* Content layout */}
                <div className="absolute inset-0 flex flex-col items-center justify-between px-5 py-5">

                  {/* Top: reference thumbnail + scene label */}
                  {selectedRef ? (
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      <div
                        className="animate-glow-ring overflow-hidden"
                        style={{ width: 68, height: 68, borderRadius: 16 }}
                      >
                        <img
                          src={selectedRef.image}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover"
                          style={{ filter: 'saturate(0.75) brightness(0.88)' }}
                        />
                      </div>
                      <p
                        className="text-[9px] font-extrabold uppercase font-body"
                        style={{ color: 'rgba(195,170,245,0.42)', letterSpacing: '0.18em' }}
                      >
                        {selectedRef.label}
                      </p>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Bottom: glassmorphism panel */}
                  <div
                    className="w-full rounded-2xl px-4 py-4"
                    style={{
                      background: 'rgba(7,4,22,0.78)',
                      border: '1px solid rgba(180,156,219,0.18)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Connection recovery banner */}
                    {isPollingRecovering && (
                      <div
                        className="flex items-start gap-2 mb-3 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(251,191,36,0.09)', border: '1px solid rgba(251,191,36,0.28)' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0 mt-0.5" />
                        <p className="text-[10.5px] leading-snug font-bold font-body" style={{ color: '#fbbf24' }}>
                          Connection interrupted.<br />
                          Still trying to retrieve your result...
                        </p>
                      </div>
                    )}

                    {/* Title */}
                    <p
                      className="text-[9.5px] font-extrabold uppercase font-body mb-0.5"
                      style={{ color: 'rgba(190,165,240,0.42)', letterSpacing: '0.17em' }}
                    >
                      {isPollingRecovering ? 'Reconnecting' : 'AI Generation'}
                    </p>
                    <p
                      className="text-[13px] font-bold font-body mb-3.5"
                      style={{ color: 'rgba(232,218,255,0.96)', lineHeight: 1.35 }}
                    >
                      {isPollingRecovering
                        ? 'Reconnecting to your generation...'
                        : 'Creating your cinematic scene'}
                    </p>

                    {/* Generation stages */}
                    <div className="space-y-1.5 mb-3.5">
                      {STAGES.map((stage, i) => {
                        const isComplete = i < stageIndex;
                        const isActive   = i === stageIndex && stageIndex < STAGES.length;
                        return (
                          <div key={i} className="flex items-center gap-2.5">

                            {/* Stage icon */}
                            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                              {isComplete ? (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: 'rgba(155,125,212,0.22)', border: '1px solid rgba(155,125,212,0.55)' }}
                                >
                                  <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                                    <path d="M2 5l2 2 4-4" stroke="#b49cdb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ) : isActive ? (
                                <div
                                  className="w-3.5 h-3.5 rounded-full animate-spin"
                                  style={{
                                    border: '1.5px solid rgba(180,156,219,0.20)',
                                    borderTopColor: '#c4a8e8',
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-2 h-2 rounded-full mx-auto"
                                  style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)' }}
                                />
                              )}
                            </div>

                            {/* Stage label */}
                            <span
                              className="text-[11.5px] font-body transition-all duration-500"
                              style={{
                                color: isComplete
                                  ? 'rgba(180,156,219,0.82)'
                                  : isActive
                                  ? 'rgba(238,225,255,1.0)'
                                  : 'rgba(255,255,255,0.22)',
                                fontWeight: isActive ? 700 : 500,
                              }}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Infinite shimmer loading bar */}
                    <div
                      className="relative w-full rounded-full overflow-hidden mb-3"
                      style={{ height: 2.5, background: 'rgba(255,255,255,0.07)' }}
                    >
                      <div
                        className="absolute inset-y-0 animate-shimmer"
                        style={{
                          width: '28%',
                          borderRadius: '100px',
                          background: isPollingRecovering
                            ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.85), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(180,156,219,0.85), rgba(222,206,255,1), rgba(180,156,219,0.85), transparent)',
                        }}
                      />
                    </div>

                    {/* Rotating tip */}
                    {!isPollingRecovering && (
                      <p
                        key={tipIndex}
                        className="text-[10px] font-body text-center animate-fade-in"
                        style={{
                          color: 'rgba(158,138,200,0.52)',
                          fontStyle: 'italic',
                          lineHeight: 1.45,
                          minHeight: 14,
                        }}
                      >
                        {TIPS[tipIndex]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── State 2: Image ── */}
            {!isGenerating && showImage && (
              <img
                key={retryKey}
                src={displaySrc}
                alt="Generated fusion result"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 z-10 w-full h-full object-cover object-center block animate-scale-in"
                onLoad={() => {
                  console.log('[IMG LOADED] retry=' + retryCount.current + ' url=' + displaySrc.substring(0, 80));
                  setIsRetrying(false);
                  setImgLoaded(true);
                  onImgLoad();
                }}
                onError={handleImgError}
              />
            )}

            {/* ── Floating action bar — only shown after image has painted ── */}
            {showActions && (
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 animate-fade-in"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'auto',
                }}
              >
                <button
                  onClick={onStartOver}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-body text-white transition-opacity hover:opacity-80 active:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  New
                </button>

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

            {/* ── State 2b: Retrying image load ── */}
            {isRetrying && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-fade-in" style={{ background: 'linear-gradient(145deg, #f3eefa, #ede6f6)' }}>
                <div className="relative w-14 h-14 mb-4">
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d8ccea' }} />
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#9b7dd4] animate-spin" />
                  <div className="absolute inset-2.5 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#9b7dd4] animate-spin" />
                  </div>
                </div>
                <p className="font-display font-bold text-[#2d2642] text-sm mb-1">Retrying...</p>
                <p className="text-[#7a6f96] text-xs font-body">Attempt {retryCount.current} of {MAX_AUTO_RETRIES}</p>
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
                {isTimeoutError ? (
                  <>
                    <div className="relative w-16 h-16 mb-5">
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d8ccea' }} />
                      <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
                      <div className="absolute inset-2.5 rounded-full bg-white flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                      </div>
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Taking Longer Than Expected</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      Generation is still in progress. Tap "Create Another" to try again.
                    </p>
                  </>
                ) : isModerationError ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-orange-200 bg-orange-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generation Blocked</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      The generated image was rejected by the AI safety system. Please try a different photo or reference.
                    </p>
                  </>
                ) : isUploadError ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Upload Failed</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      {errorMessage}
                    </p>
                  </>
                ) : isPostError ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Could Not Start Generation</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      {errorMessage}
                    </p>
                  </>
                ) : isPollError ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Connection Lost</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      {errorMessage}
                    </p>
                  </>
                ) : isBackendJobFailed ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-red-200 bg-red-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generation Failed</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      {errorMessage}
                    </p>
                  </>
                ) : isValidationFailed ? (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Result Processing Failed</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">
                      {errorMessage}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-5 rounded-xl border-2 border-red-200 bg-red-50 flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="font-display font-bold text-[#2d2642] text-base mb-1.5">Generation Failed</p>
                    <p className="text-[#7a6f96] text-sm max-w-sm mx-auto leading-relaxed font-body">{errorMessage}</p>
                  </>
                )}
              </div>
            )}

            {/* ── State 5: Empty idle ── */}
            {!isGenerating &&
             !displaySrc &&
             !generationError && !errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                <div className="mb-5 rounded-xl border-2 flex items-center justify-center" style={{ width: 64, height: 64, background: '#f3eefa', borderColor: '#d8ccea' }}>
                  <Sparkles className="w-8 h-8 text-[#b49cdb]" />
                </div>
                <p className="text-[#7a6f96] text-sm font-body">Generated result will appear here</p>
              </div>
            )}

          </div>
        </div>

        {/* Below-card action row — visible when image is loaded */}
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
