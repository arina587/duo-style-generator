import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles, Wand2, Check } from 'lucide-react';
import { useState } from 'react';
import type { ReferenceJob } from './Home';

interface UploadProps {
  selectedStyle: string;
  referenceJobs: ReferenceJob[];
  selectedReference: string;
  onReferenceSelect: (reference: string) => void;
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File, styleBoard: File, prompt: string, mode?: string) => void;
  photo1: File | null;
  setPhoto1: (file: File | null) => void;
  photo2: File | null;
  setPhoto2: (file: File | null) => void;
  preview1: string;
  setPreview1: (url: string) => void;
  preview2: string;
  setPreview2: (url: string) => void;
}

export default function Upload({ selectedStyle, referenceJobs, selectedReference, onReferenceSelect, onBack, onGenerate, photo1, setPhoto1, photo2, setPhoto2, preview1, setPreview1, preview2, setPreview2 }: UploadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<ReferenceJob | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhoto: (file: File | null) => void,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resolvePrompt = (job: ReferenceJob, mode: string): string => {
    if (mode === 'zootopia_cartoon' && job.humanPrompt) return job.humanPrompt;
    if (mode === 'zootopia_animals' && job.animalPrompt) return job.animalPrompt;
    return job.prompt;
  };

  const handleReferenceSelect = async (job: ReferenceJob) => {
    onReferenceSelect(job.image);
    setSelectedJob(job);
    setSelectedPrompt(resolvePrompt(job, selectedMode));
    try {
      const response = await fetch(job.image);
      const blob = await response.blob();
      const file = new File([blob], 'reference.jpg', { type: blob.type });
      setReferenceFile(file);
    } catch (err) {
      console.error('Failed to load reference image:', err);
      setError('Failed to load reference image');
    }
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;

    if (!photo1 || !photo2) { setError('Please upload both photos before generating'); return; }
    if (!selectedStyle) { setError('Style selection is missing. Please go back and select a style.'); return; }
    if (!referenceFile) { setError('Please select a reference image before generating'); return; }
    if (!selectedPrompt || selectedPrompt.trim() === '') { setError('No prompt selected. Please select a reference image before generating.'); return; }
    if (selectedStyle === 'zootopia' && !['zootopia_cartoon', 'zootopia_animals'].includes(selectedMode)) {
      setError('Please select a transformation type before generating');
      return;
    }

    setIsGenerating(true);
    setError('');
    onGenerate(photo1, photo2, referenceFile, selectedPrompt, selectedMode);
  };

  const styleLabel = selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1);
  const canGenerate = !isGenerating && !!photo1 && !!photo2 && !!referenceFile && (selectedStyle !== 'zootopia' || ['zootopia_cartoon', 'zootopia_animals'].includes(selectedMode));

  const steps = [
    { n: 1, label: 'Upload Photos', done: !!(photo1 && photo2) },
    { n: 2, label: 'Pick Reference', done: !!selectedReference },
    { n: 3, label: 'Generate', done: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f5f0ff' }}>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderColor: '#e0d4f7' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 60 }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold font-body transition-colors duration-200 text-[#7c6da0] hover:text-[#8b5cf6]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#2d1f5e] font-body">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#8b5cf6]" />
            {styleLabel}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">

        {/* Page title */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d1f5e] mb-2">Upload Your Photos</h2>
          <p className="text-[#7c6da0] font-light text-sm sm:text-base font-body">Upload two photos, pick a reference scene, then generate your fusion.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {steps.map((step, i) => (
            <div key={step.n} className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-body transition-all duration-300"
                style={{
                  background: step.done ? '#2d1f5e' : '#ffffff',
                  color: step.done ? '#f5f0ff' : '#7c6da0',
                  border: step.done ? 'none' : '1px solid #e0d4f7',
                }}
              >
                {step.done
                  ? <Check className="w-3 h-3" strokeWidth={3} />
                  : <span className="font-bold">{step.n}</span>
                }
                {step.label}
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: '#e0d4f7' }} />}
            </div>
          ))}
        </div>

        {/* Photo uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {[
            { letter: 'A', label: 'Man Photo', preview: preview1, setPhoto: setPhoto1, setPreview: setPreview1, alt: 'Man photo' },
            { letter: 'B', label: 'Woman Photo', preview: preview2, setPhoto: setPhoto2, setPreview: setPreview2, alt: 'Woman photo' },
          ].map(({ letter, label, preview, setPhoto, setPreview, alt }) => (
            <div key={letter} className="card-premium p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 font-body" style={{ background: '#2d1f5e', color: '#f5f0ff' }}>
                  {letter}
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest font-body text-[#a89ec0]">{label}</h3>
              </div>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setPhoto, setPreview)}
                  className="hidden"
                />
                <div className="upload-zone p-4 group">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt={alt} className="w-full h-52 object-contain rounded-xl" />
                      <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold font-body bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          Click to replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-52 gap-3">
                      <div className="w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{ background: '#ede6ff', borderColor: '#e0d4f7' }}>
                        {letter === 'A'
                          ? <UploadIcon className="w-6 h-6 text-[#8b5cf6]" />
                          : <Image className="w-6 h-6 text-[#8b5cf6]" />
                        }
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold font-body text-[#2d1f5e]">Click to upload</p>
                        <p className="text-xs mt-0.5 font-body text-[#a89ec0]">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Reference selection */}
        {referenceJobs.length > 0 && (
          <div className="card-premium p-6 mb-5">
            <div className="mb-5">
              <h3 className="font-display font-bold text-[#2d1f5e] text-base mb-1">Choose Reference Scene</h3>
              <p className="text-sm font-body text-[#7c6da0]">Select the composition you want to recreate</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {referenceJobs.map((job, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReferenceSelect(job)}
                  className={`rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 relative group ${
                    selectedReference === job.image
                      ? 'selected-ring scale-[1.02]'
                      : 'opacity-60 hover:opacity-95 hover:scale-[1.01]'
                  }`}
                >
                  <img src={job.image} alt={`Reference ${index + 1}`} className="w-full h-full object-contain" style={{ background: '#ede6ff' }} />
                  {selectedReference === job.image && (
                    <div className="absolute inset-0 flex items-end justify-center pb-3" style={{ background: 'rgba(139,92,246,0.18)' }}>
                      <div className="px-3 py-1 rounded-full text-white text-xs font-bold font-body shadow-lg" style={{ background: '#8b5cf6' }}>
                        Selected
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zootopia mode selector */}
        {selectedStyle === 'zootopia' && selectedReference && (
          <div className="card-premium p-6 mb-5">
            <div className="mb-5">
              <h3 className="font-display font-bold text-[#2d1f5e] text-base mb-1">Transformation Type</h3>
              <p className="text-sm font-body text-[#7c6da0]">Select how you want the characters to be rendered</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_cartoon');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_cartoon'));
                }}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selectedMode === 'zootopia_cartoon' ? 'mode-selected' : ''}`}
                style={selectedMode !== 'zootopia_cartoon' ? { borderColor: '#e0d4f7', background: '#ffffff' } : {}}
              >
                <div className="text-3xl mb-3">👨‍🎨</div>
                <h4 className="text-sm font-bold text-[#2d1f5e] mb-1 font-body">Cartoon Human</h4>
                <p className="text-xs leading-relaxed font-body text-[#7c6da0]">Stylized Pixar-style animated characters with recognizable features</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_animals');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_animals'));
                }}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selectedMode === 'zootopia_animals' ? 'mode-selected' : ''}`}
                style={selectedMode !== 'zootopia_animals' ? { borderColor: '#e0d4f7', background: '#ffffff' } : {}}
              >
                <div className="text-3xl mb-3">🦊</div>
                <h4 className="text-sm font-bold text-[#2d1f5e] mb-1 font-body">Animal Hybrid</h4>
                <p className="text-xs leading-relaxed font-body text-[#7c6da0]">Subtle cute animal-inspired traits while preserving identity</p>
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl border border-red-200 bg-red-50">
            <p className="text-red-600 text-sm text-center font-medium font-body">{error}</p>
          </div>
        )}

        {/* Generate button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn-generate flex items-center gap-3 px-12 py-4 rounded-2xl text-lg tracking-wide"
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
