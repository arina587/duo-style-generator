import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface UploadProps {
  selectedStyle: string;
  referenceImages: string[];
  selectedReference: string;
  onReferenceSelect: (reference: string) => void;
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File, styleBoard: File, mode?: string) => void;
}

export default function Upload({ selectedStyle, referenceImages, selectedReference, onReferenceSelect, onBack, onGenerate }: UploadProps) {
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhoto: (file: File | null) => void,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  const handleReferenceSelect = async (reference: string) => {
    onReferenceSelect(reference);
    try {
      const response = await fetch(reference);
      const blob = await response.blob();
      const file = new File([blob], 'reference.jpg', { type: blob.type });
      setReferenceFile(file);
    } catch (error) {
      console.error('Failed to load reference image:', error);
      setError('Failed to load reference image');
    }
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('=== GENERATE BUTTON CLICKED ===');

    if (isGenerating) {
      console.log('BLOCKED: Already generating, ignoring click');
      return;
    }

    console.log('Validation check:', {
      photo1: !!photo1,
      photo2: !!photo2,
      selectedStyle: selectedStyle,
      referenceFile: !!referenceFile,
    });

    if (!photo1 || !photo2) {
      console.error('BLOCKED: Missing photo1 or photo2');
      setError('Please upload both photos before generating');
      return;
    }

    if (!selectedStyle) {
      console.error('BLOCKED: Missing selectedStyle');
      setError('Style selection is missing. Please go back and select a style.');
      return;
    }

    if (!referenceFile) {
      console.error('BLOCKED: Missing reference file');
      setError('Please select a reference image before generating');
      return;
    }

    if (selectedStyle === 'zootopia' && !selectedMode) {
      console.error('BLOCKED: Missing mode for zootopia');
      setError('Please select a transformation type before generating');
      return;
    }

    setIsGenerating(true);
    setError('');

    console.log('=== PASSING TO PARENT - NO REQUEST HERE ===');
    onGenerate(photo1, photo2, referenceFile, selectedMode);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">

        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to styles
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs text-sky-400 font-medium tracking-wide capitalize border border-sky-500/20">
            <Sparkles className="w-3 h-3" />
            {selectedStyle}
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Upload Your Photos</h2>
          <p className="text-slate-300 font-light text-sm sm:text-base">Upload two photos to create your styled fusion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6 glow-shadow">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-400 flex-shrink-0">A</div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">MAN photo</h3>
            </div>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto1, setPreview1)}
                className="hidden"
              />
              <div className="upload-zone rounded-xl p-5 group">
                {preview1 ? (
                  <div className="relative">
                    <img
                      src={preview1}
                      alt="MAN photo"
                      className="w-full h-56 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 gap-3">
                    <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/18 transition-colors duration-200">
                      <UploadIcon className="w-6 h-6 text-sky-500/50 group-hover:text-sky-400 transition-colors duration-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-300 font-medium">Click to upload</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="glass-card rounded-2xl p-6 glow-shadow">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xs font-bold text-rose-400 flex-shrink-0">B</div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">GIRL photo</h3>
            </div>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto2, setPreview2)}
                className="hidden"
              />
              <div className="upload-zone rounded-xl p-5 group">
                {preview2 ? (
                  <div className="relative">
                    <img
                      src={preview2}
                      alt="GIRL photo"
                      className="w-full h-56 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 gap-3">
                    <div className="w-14 h-14 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/18 transition-colors duration-200">
                      <Image className="w-6 h-6 text-rose-500/50 group-hover:text-rose-400 transition-colors duration-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-300 font-medium">Click to upload</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {referenceImages.length > 0 && (
          <div className="glass-card rounded-2xl p-6 glow-shadow mb-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-white mb-1">Select Reference Image</h3>
              <p className="text-sm text-slate-400">Choose one reference for your style composition</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {referenceImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReferenceSelect(img)}
                  className={`rounded-xl overflow-hidden aspect-[3/4] transition-all duration-200 relative ${
                    selectedReference === img
                      ? 'selected-ring scale-[1.02]'
                      : 'opacity-55 hover:opacity-85 hover:scale-[1.01]'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-contain bg-slate-50"
                  />
                  {selectedReference === img && (
                    <div className="absolute inset-0 bg-sky-500/15 flex items-end justify-center pb-2.5">
                      <div className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-semibold">
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
          <div className="glass-card rounded-2xl p-6 glow-shadow mb-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-white mb-1">Transformation Type</h3>
              <p className="text-sm text-slate-400">Select how you want the characters to be transformed</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedMode('cartoon_human')}
                className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                  selectedMode === 'cartoon_human'
                    ? 'mode-selected scale-[1.02]'
                    : 'border-white/8 bg-white/3 hover:border-sky-500/25 hover:bg-sky-500/4'
                }`}
              >
                <div className="text-3xl mb-3">👨‍🎨</div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Cartoon Human</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Stylized animated human characters with recognizable features</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('animal')}
                className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                  selectedMode === 'animal'
                    ? 'mode-selected scale-[1.02]'
                    : 'border-white/8 bg-white/3 hover:border-sky-500/25 hover:bg-sky-500/4'
                }`}
              >
                <div className="text-3xl mb-3">🦊</div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Animal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Transform into stylized animal characters preserving identity</p>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/25 bg-red-500/8">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !photo1 || !photo2 || !referenceFile || (selectedStyle === 'zootopia' && !selectedMode)}
            className="btn-generate flex items-center gap-3 px-12 py-5 rounded-2xl text-white font-semibold text-lg tracking-wide"
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
