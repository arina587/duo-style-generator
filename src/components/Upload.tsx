import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles, Wand2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReferenceItem } from '../data/references';

interface UploadProps {
  selectedRef: ReferenceItem;
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File, styleBoard: File, mode?: string) => void;
  photo1: File | null;
  setPhoto1: (file: File | null) => void;
  photo2: File | null;
  setPhoto2: (file: File | null) => void;
  preview1: string;
  setPreview1: (url: string) => void;
  preview2: string;
  setPreview2: (url: string) => void;
}

export default function Upload({ selectedRef, onBack, onGenerate, photo1, setPhoto1, photo2, setPhoto2, preview1, setPreview1, preview2, setPreview2 }: UploadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(selectedRef.image);
        const blob = await response.blob();
        setReferenceFile(new File([blob], 'reference.jpg', { type: blob.type }));
      } catch (err) {
        console.error('Failed to load reference image:', err);
        setError('Failed to load reference image');
      }
    })();
  }, [selectedRef.image]);

  const resizeImage = (file: File): Promise<{ file: File; dataUrl: string }> => {
    return new Promise((resolve) => {
      const MAX = 1024;
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = w > h ? MAX / w : MAX / h;
        const targetW = scale < 1 ? Math.round(w * scale) : w;
        const targetH = scale < 1 ? Math.round(h * scale) : h;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        canvas.toBlob((blob) => {
          if (!blob) { resolve({ file, dataUrl: canvas.toDataURL('image/jpeg', 0.9) }); return; }
          const resized = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file: resized, dataUrl: reader.result as string });
          reader.readAsDataURL(resized);
        }, 'image/jpeg', 0.9);
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
    resizeImage(file).then(({ file: resized, dataUrl }) => {
      setPhoto(resized);
      setPreview(dataUrl);
    });
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;

    if (!photo1 || !photo2) { setError('Please upload both photos before generating'); return; }
    if (!referenceFile) { setError('Reference image still loading. Please wait.'); return; }

    setIsGenerating(true);
    setError('');
    onGenerate(photo1, photo2, referenceFile);
  };

  const canGenerate = !isGenerating && !!photo1 && !!photo2 && !!referenceFile;

  const steps = [
    { n: 1, label: 'Upload Photos', done: !!(photo1 && photo2) },
    { n: 2, label: 'Generate', done: false },
  ];

  return (
    <div className="min-h-screen grid-bg">

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
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white" style={{ background: '#d4e157' }}>
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
          {[
            { letter: 'A', label: 'Man Photo', hint: 'If the man in the reference image is shown in profile or at a 3/4 angle, upload a photo of the man with a similar face angle (profile or 3/4) for best results.', preview: preview1, setPhoto: setPhoto1, setPreview: setPreview1, alt: 'Man photo' },
            { letter: 'B', label: 'Woman Photo', hint: 'If the woman in the reference image is shown in profile or at a 3/4 angle, upload a photo of the woman with a similar face angle (profile or 3/4) for best results.', preview: preview2, setPhoto: setPhoto2, setPreview: setPreview2, alt: 'Woman photo' },
          ].map(({ letter, label, hint, preview, setPhoto, setPreview, alt }) => (
            <div key={letter} className="card-premium p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}>
                  {letter}
                </div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest font-body text-[#9a93b0]">{label}</h3>
              </div>
              <div className="flex items-start gap-1.5 mb-3 px-0.5">
                <svg className="w-3.5 h-3.5 text-[#b49cdb] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <p className="text-[11px] leading-relaxed font-body text-[#9a93b0]">{hint}</p>
              </div>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setPhoto, setPreview)}
                  className="hidden"
                />
                <div className="upload-zone p-3 group">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt={alt} className="w-full h-48 object-contain rounded-xl" />
                      <div className="absolute inset-0 rounded-xl bg-[#2d2642]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-white text-sm font-bold font-body bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          Click to replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-2.5">
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
