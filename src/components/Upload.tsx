import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles, Wand2, Check, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReferenceItem } from '../data/references';

interface UploadProps {
  selectedRef: ReferenceItem;
  onBack: () => void;
  onGenerate: (
    photo1: File,
    photo2: File,
    styleBoard: File,
    mode?: string,
    photo1b?: File | null,
    photo2b?: File | null,
  ) => void;
  photo1: File | null;
  setPhoto1: (file: File | null) => void;
  photo2: File | null;
  setPhoto2: (file: File | null) => void;
  preview1: string;
  setPreview1: (url: string) => void;
  preview2: string;
  setPreview2: (url: string) => void;
  photo1b: File | null;
  setPhoto1b: (file: File | null) => void;
  photo2b: File | null;
  setPhoto2b: (file: File | null) => void;
  preview1b: string;
  setPreview1b: (url: string) => void;
  preview2b: string;
  setPreview2b: (url: string) => void;
}

export default function Upload({
  selectedRef, onBack, onGenerate,
  photo1, setPhoto1, photo2, setPhoto2,
  preview1, setPreview1, preview2, setPreview2,
  photo1b, setPhoto1b, photo2b, setPhoto2b,
  preview1b, setPreview1b, preview2b, setPreview2b,
}: UploadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [showSecondary1, setShowSecondary1] = useState(!!photo1b);
  const [showSecondary2, setShowSecondary2] = useState(!!photo2b);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(selectedRef.image);
        const blob = await response.blob();
        const rawFile = new File([blob], 'reference.jpg', { type: blob.type || 'image/jpeg' });
        const { file: resizedRef } = await resizeImage(rawFile, 900, 0.75);
        console.log(`[UPLOAD] reference ready: size=${resizedRef.size} type=${resizedRef.type}`);
        setReferenceFile(resizedRef);
      } catch (err) {
        console.error('Failed to load reference image:', err);
        setError('Failed to load reference image');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRef.image]);

  const resizeImage = (file: File, maxPx = 900, quality = 0.75): Promise<{ file: File; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const MAX = maxPx;
      console.log(`[UPLOAD] input: name=${file.name} size=${file.size} type=${file.type}`);

      const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
        || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
      if (isHeic) {
        console.warn('[UPLOAD] HEIC/HEIF detected — will attempt canvas decode and force JPEG output');
      }

      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error('[UPLOAD] img.onerror — browser cannot decode this file format:', file.type);
        reject(new Error(`Cannot decode image format: ${file.type || 'unknown'}. Please use a JPEG or PNG photo.`));
      };

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { naturalWidth: w, naturalHeight: h } = img;
        console.log(`[UPLOAD] decoded: ${w}x${h}`);

        const scale = (w > MAX || h > MAX) ? Math.min(MAX / w, MAX / h) : 1;
        const targetW = Math.round(w * scale);
        const targetH = Math.round(h * scale);
        console.log(`[UPLOAD] resize: ${w}x${h} → ${targetW}x${targetH} (scale=${scale.toFixed(3)})`);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, targetW, targetH);

        canvas.toBlob((blob) => {
          if (!blob) {
            console.warn('[UPLOAD] canvas.toBlob returned null — falling back to toDataURL');
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const byteString = atob(dataUrl.split(',')[1]);
            const arr = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
            const fallbackBlob = new Blob([arr], { type: 'image/jpeg' });
            const fallbackFile = new File([fallbackBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            console.log(`[UPLOAD] fallback file: size=${fallbackFile.size} type=${fallbackFile.type}`);
            resolve({ file: fallbackFile, dataUrl });
            return;
          }

          const resized = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
          console.log(`[UPLOAD] output: name=${resized.name} size=${resized.size} type=${resized.type}`);

          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Failed to read resized image'));
          reader.onloadend = () => resolve({ file: resized, dataUrl: reader.result as string });
          reader.readAsDataURL(resized);
        }, 'image/jpeg', quality);
      };

      img.src = objectUrl;
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhoto: (file: File | null) => void,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    resizeImage(file).then(({ file: resized, dataUrl }) => {
      setPhoto(resized);
      setPreview(dataUrl);
    }).catch((err: unknown) => {
      console.error('[UPLOAD] resizeImage error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try a different photo.');
    });
  };

  const removeSecondary = (
    person: 1 | 2,
    setPhoto: (f: File | null) => void,
    setPreview: (u: string) => void,
    setShow: (v: boolean) => void
  ) => {
    setPhoto(null);
    setPreview('');
    setShow(false);
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;

    if (!photo1 || !photo2) { setError('Please upload both photos before generating'); return; }
    if (!referenceFile) { setError('Reference image still loading. Please wait.'); return; }

    setIsGenerating(true);
    setError('');
    onGenerate(photo1, photo2, referenceFile, undefined, photo1b, photo2b);
  };

  const canGenerate = !isGenerating && !!photo1 && !!photo2 && !!referenceFile;

  const steps = [
    { n: 1, label: 'Upload Photos', done: !!(photo1 && photo2) },
    { n: 2, label: 'Generate', done: false },
  ];

  const persons = [
    {
      id: 1 as const,
      letter: 'A',
      label: 'Man Photo',
      hint: 'If the man in the reference is shown in profile or at a 3/4 angle, upload a matching angle for best results.',
      secondaryHint: [
        'For best results, upload a similar photo:',
        'Same person, similar hairstyle and appearance',
        'Different angle (e.g. 3/4 or profile)',
        'Similar lighting and age',
        'Avoid: large differences in hairstyle or age',
      ],
      primaryPhoto: photo1,
      primaryPreview: preview1,
      setPrimaryPhoto: setPhoto1,
      setPrimaryPreview: setPreview1,
      secondaryPhoto: photo1b,
      secondaryPreview: preview1b,
      setSecondaryPhoto: setPhoto1b,
      setSecondaryPreview: setPreview1b,
      showSecondary: showSecondary1,
      setShowSecondary: setShowSecondary1,
    },
    {
      id: 2 as const,
      letter: 'B',
      label: 'Woman Photo',
      hint: 'If the woman in the reference is shown in profile or at a 3/4 angle, upload a matching angle for best results.',
      secondaryHint: [
        'For best results, upload a similar photo:',
        'Same person, similar appearance and hairstyle',
        'Different angle (e.g. 3/4 or profile)',
        'Similar lighting, age, and makeup/style',
        'Avoid: heavy filters or large style differences',
      ],
      primaryPhoto: photo2,
      primaryPreview: preview2,
      setPrimaryPhoto: setPhoto2,
      setPrimaryPreview: setPreview2,
      secondaryPhoto: photo2b,
      secondaryPreview: preview2b,
      setSecondaryPhoto: setPhoto2b,
      setSecondaryPreview: setPreview2b,
      showSecondary: showSecondary2,
      setShowSecondary: setShowSecondary2,
    },
  ];

  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b-2" style={{ background: 'rgba(240,237,246,0.92)', backdropFilter: 'blur(20px)', borderColor: '#d8ccea' }}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8 flex items-center justify-between h-14">
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
            {selectedRef.label}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">

        {/* Page title */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">Upload Your Photos</h2>
          <p className="text-[#7a6f96] text-sm font-body">Upload two photos, then generate your fusion.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2.5 mb-7">
          {steps.map((step, i) => (
            <div key={step.n} className="flex items-center gap-2.5">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-body transition-all duration-300"
                style={{
                  background: step.done ? 'linear-gradient(135deg, #9b7dd4, #b49cdb)' : '#ffffff',
                  color: step.done ? '#ffffff' : '#7a6f96',
                  border: step.done ? 'none' : '2px solid #e2daf0',
                }}
              >
                {step.done
                  ? <Check className="w-3 h-3" strokeWidth={3} />
                  : <span className="font-extrabold">{step.n}</span>
                }
                {step.label}
              </div>
              {i < steps.length - 1 && <div className="w-6 h-0.5 rounded-full bg-[#d8ccea]" />}
            </div>
          ))}
        </div>

        {/* Reference preview */}
        <div className="card-premium p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#d4e157' }}>
              <Sparkles className="w-3 h-3 text-[#2d2642]" />
            </div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest font-body text-[#9a93b0]">Selected Scene</h3>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={selectedRef.image}
              alt={selectedRef.label}
              className="w-24 h-24 object-cover rounded-xl border-2 border-[#e2daf0]"
            />
            <div>
              <p className="text-sm font-bold text-[#2d2642] font-body">{selectedRef.label}</p>
              <p className="text-xs text-[#7a6f96] font-body mt-1">Scene {selectedRef.id}</p>
              <button
                onClick={onBack}
                className="text-xs text-[#9b7dd4] hover:text-[#8b6cc1] font-bold font-body mt-2 transition-colors"
              >
                Change scene
              </button>
            </div>
          </div>
        </div>

        {/* Photo uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {persons.map(({
            letter, label, hint, secondaryHint,
            primaryPhoto, primaryPreview, setPrimaryPhoto, setPrimaryPreview,
            secondaryPhoto, secondaryPreview, setSecondaryPhoto, setSecondaryPreview,
            showSecondary, setShowSecondary,
          }) => (
            <div key={letter} className="card-premium p-4 flex flex-col gap-3">

              {/* Section label */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}>
                  {letter}
                </div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest font-body text-[#9a93b0]">{label}</h3>
              </div>

              {/* Angle hint */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border font-body" style={{ background: 'rgba(155,125,212,0.08)', borderColor: 'rgba(155,125,212,0.35)' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#9b7dd4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <p className="text-[12px] leading-relaxed text-[#4a3f6b]">
                  {hint.split(/(profile|3\/4 angle|best results)/g).map((part, i) =>
                    ['profile', '3/4 angle', 'best results'].includes(part)
                      ? <strong key={i} className="font-extrabold text-[#2d2642]">{part}</strong>
                      : part
                  )}
                </p>
              </div>

              {/* Primary upload */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#9a93b0] font-body mb-1.5">
                  Your photo <span className="text-red-400">*</span>
                </p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPrimaryPhoto, setPrimaryPreview)}
                    className="hidden"
                  />
                  <div className="upload-zone p-3 group">
                    {primaryPreview ? (
                      <div className="relative">
                        <img src={primaryPreview} alt={`${label} primary`} className="w-full h-44 object-contain rounded-xl" />
                        <div className="absolute inset-0 rounded-xl bg-[#2d2642]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white text-sm font-bold font-body bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            Click to replace
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-44 gap-2.5">
                        <div className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{ background: '#f3eefa', borderColor: '#d8ccea' }}>
                          {letter === 'A'
                            ? <UploadIcon className="w-5 h-5 text-[#9b7dd4]" />
                            : <Image className="w-5 h-5 text-[#9b7dd4]" />
                          }
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold font-body text-[#2d2642]">Click to upload</p>
                          <p className="text-[11px] mt-0.5 font-body text-[#9a93b0]">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Secondary upload */}
              {!showSecondary ? (
                <button
                  type="button"
                  onClick={() => setShowSecondary(true)}
                  className="flex items-center gap-1.5 text-[12px] font-bold font-body text-[#9b7dd4] hover:text-[#7a5cb8] transition-colors self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add a second photo for better accuracy
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#9a93b0] font-body">
                      Second photo <span className="text-[#b49cdb] text-[10px] font-bold normal-case tracking-normal">optional</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => removeSecondary(
                        letter === 'A' ? 1 : 2,
                        setSecondaryPhoto,
                        setSecondaryPreview,
                        setShowSecondary
                      )}
                      className="text-[#9a93b0] hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Guidance box */}
                  <div className="mb-2 px-3 py-2.5 rounded-xl border font-body" style={{ background: 'rgba(100,180,100,0.06)', borderColor: 'rgba(100,180,100,0.3)' }}>
                    <p className="text-[11px] font-extrabold text-[#3a7a4a] mb-1">{secondaryHint[0]}</p>
                    <ul className="space-y-0.5">
                      {secondaryHint.slice(1).map((line, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#4a6a54] leading-relaxed">
                          <span className="mt-1 w-1 h-1 rounded-full bg-[#5a9a6a] flex-shrink-0" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setSecondaryPhoto, setSecondaryPreview)}
                      className="hidden"
                    />
                    <div className="upload-zone p-3 group">
                      {secondaryPreview ? (
                        <div className="relative">
                          <img src={secondaryPreview} alt={`${label} secondary`} className="w-full h-36 object-contain rounded-xl" />
                          <div className="absolute inset-0 rounded-xl bg-[#2d2642]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-white text-sm font-bold font-body bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              Click to replace
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-36 gap-2">
                          <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{ background: '#f3eefa', borderColor: '#d8ccea' }}>
                            <Plus className="w-4 h-4 text-[#9b7dd4]" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold font-body text-[#2d2642]">Add second photo</p>
                            <p className="text-[11px] mt-0.5 font-body text-[#9a93b0]">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border-2 border-red-200 bg-red-50">
            <p className="text-red-600 text-sm text-center font-bold font-body">{error}</p>
          </div>
        )}

        {/* Generate button */}
        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn-generate flex items-center gap-2.5 px-10 py-3.5 text-base tracking-wide"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Fusion
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
