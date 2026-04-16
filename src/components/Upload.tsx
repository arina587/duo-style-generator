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

  return (
    <div className="min-h-screen bg-section-soft">
      <div className="sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-purple-100/50 shadow-sm shadow-purple-50/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">DuoStyle</span>
          </div>
          <div className="badge-pill flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {styleLabel}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Upload Your Photos</h2>
          <p className="text-slate-500 font-light text-sm sm:text-base">Upload two photos, pick a reference scene, then generate your fusion.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { n: 1, label: 'Upload Photos', done: !!(photo1 && photo2) },
            { n: 2, label: 'Pick Reference', done: !!selectedReference },
            { n: 3, label: 'Generate', done: false },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                step.done
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md shadow-purple-200/50'
                  : 'bg-white border border-purple-100 text-slate-400'
              }`}>
                {step.done
                  ? <Check className="w-3 h-3" strokeWidth={3} />
                  : <span className="font-bold">{step.n}</span>
                }
                {step.label}
              </div>
              {i < 2 && <div className="w-8 h-px bg-purple-100" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="card-premium p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">A</div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Man Photo</h3>
            </div>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhoto1, setPreview1)} className="hidden" />
              <div className="upload-zone p-4 group">
                {preview1 ? (
                  <div className="relative">
                    <img src={preview1} alt="Man photo" className="w-full h-52 object-contain rounded-xl" />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">Click to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <UploadIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-semibold">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">B</div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Woman Photo</h3>
            </div>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhoto2, setPreview2)} className="hidden" />
              <div className="upload-zone p-4 group">
                {preview2 ? (
                  <div className="relative">
                    <img src={preview2} alt="Woman photo" className="w-full h-52 object-contain rounded-xl" />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">Click to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Image className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-semibold">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {referenceJobs.length > 0 && (
          <div className="card-premium p-6 mb-5">
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Choose Reference Scene</h3>
              <p className="text-sm text-slate-400">Select the composition you want to recreate</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {referenceJobs.map((job, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReferenceSelect(job)}
                  className={`rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-200 relative group ${
                    selectedReference === job.image
                      ? 'selected-ring scale-[1.02]'
                      : 'opacity-60 hover:opacity-90 hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-100/70'
                  }`}
                >
                  <img src={job.image} alt={`Reference ${index + 1}`} className="w-full h-full object-contain bg-slate-50" />
                  {selectedReference === job.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/25 to-transparent flex items-end justify-center pb-3">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                        Selected
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedStyle === 'zootopia' && selectedReference && (
          <div className="card-premium p-6 mb-5">
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Transformation Type</h3>
              <p className="text-sm text-slate-400">Select how you want the characters to be rendered</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_cartoon');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_cartoon'));
                }}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedMode === 'zootopia_cartoon'
                    ? 'mode-selected scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40 hover:shadow-md hover:shadow-purple-100/40'
                }`}
              >
                <div className="text-3xl mb-3">👨‍🎨</div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Cartoon Human</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Stylized Pixar-style animated characters with recognizable features</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('zootopia_animals');
                  if (selectedJob) setSelectedPrompt(resolvePrompt(selectedJob, 'zootopia_animals'));
                }}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedMode === 'zootopia_animals'
                    ? 'mode-selected scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md hover:shadow-emerald-100/40'
                }`}
              >
                <div className="text-3xl mb-3">🦊</div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Animal Hybrid</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Subtle cute animal-inspired traits while preserving identity</p>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-2xl border border-red-200 bg-red-50">
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn-generate flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg tracking-wide shadow-2xl shadow-purple-200/50"
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
