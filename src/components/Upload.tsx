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
            {styleLabel}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">

        {/* Page title */}
        <div className="text-center mb-7">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d2642] mb-1.5">Upload Your Photos</h2>
          <p className="text-[#7a6f96] text-sm font-body">Upload two photos, pick a reference scene, then generate your fusion.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
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
              {i < 2 && <div className="w-6 h-0.5 rounded-full bg-[#d8ccea]" />}
            </div>
          ))}
        </div>

        {/* Photo uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { letter: 'A', label: 'Man Photo', preview: preview1, setPhoto: setPhoto1, setPreview: setPreview1, alt: 'Man photo' },
            { letter: 'B', label: 'Woman Photo', preview: preview2, setPhoto: setPhoto2, setPreview: setPreview2, alt: 'Woman photo' },
          ].map(({ letter, label, preview, setPhoto, setPreview, alt }) => (
            <div key={letter} className="card-premium p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}>
                  {letter}
                </div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest font-body text-[#9a93b0]">{label}</h3>
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

        {/* Reference selection */}
        {referenceJobs.length > 0 && (
          <div className="card-premium p-5 mb-4">
            <div className="mb-4">
              <h3 className="font-display font-bold text-[#2d2642] text-sm mb-1">Choose Reference Scene</h3>
              <p className="text-xs font-body text-[#7a6f96]">Select the composition you want to recreate</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {referenceJobs.map((job, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReferenceSelect(job)}
                  className={`rounded-xl overflow-hidden aspect-[3/4] transition-all duration-300 relative group border-2 ${
                    selectedReference === job.image
                      ? 'border-[#8b6cc1] scale-[1.02] shadow-lg'
                      : 'border-[#e2daf0] opacity-60 hover:opacity-95 hover:scale-[1.01] hover:border-[#b49cdb]'
                  }`}
                >
                  <img src={job.image} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" style={{ background: '#f3eefa' }} />
                  {selectedReference === job.image && (
                    <div className="absolute inset-0 flex items-end justify-center pb-2.5" style={{ background: 'rgba(139,108,193,0.15)' }}>
                      <div className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold font-body shadow-lg" style={{ background: '#8b6cc1' }}>
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
          <div className="card-premium p-5 mb-4">
            <div className="mb-4">
              <h3 className="font-display font-bold text-[#2d2642] text-sm mb-1">Transformation Type</h3>
              <p className="text-xs font-body text-[#7a6f96]">Select how you want the characters to be rendered</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_cartoon');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_cartoon'));
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedMode === 'zootopia_cartoon' ? 'mode-selected' : ''}`}
                style={selectedMode !== 'zootopia_cartoon' ? { borderColor: '#e2daf0', background: '#ffffff' } : {}}
              >
                <div className="text-2xl mb-2">&#x1F468;&#x200D;&#x1F3A8;</div>
                <h4 className="text-xs font-bold text-[#2d2642] mb-0.5 font-body">Cartoon Human</h4>
                <p className="text-[11px] leading-relaxed font-body text-[#7a6f96]">Stylized Pixar-style animated characters</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_animals');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_animals'));
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedMode === 'zootopia_animals' ? 'mode-selected' : ''}`}
                style={selectedMode !== 'zootopia_animals' ? { borderColor: '#e2daf0', background: '#ffffff' } : {}}
              >
                <div className="text-2xl mb-2">&#x1F98A;</div>
                <h4 className="text-xs font-bold text-[#2d2642] mb-0.5 font-body">Animal Hybrid</h4>
                <p className="text-[11px] leading-relaxed font-body text-[#7a6f96]">Cute animal-inspired traits</p>
              </button>
            </div>
          </div>
        )}

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
