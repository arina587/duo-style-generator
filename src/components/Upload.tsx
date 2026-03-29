import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface UploadProps {
  selectedStyle: string;
  referenceImages: string[];
  selectedReference: string;
  onReferenceSelect: (reference: string) => void;
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File, styleBoard: File) => void;
}

export default function Upload({ selectedStyle, referenceImages, selectedReference, onReferenceSelect, onBack, onGenerate }: UploadProps) {
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

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

    setIsGenerating(true);
    setError('');

    console.log('=== PASSING TO PARENT - NO REQUEST HERE ===');
    onGenerate(photo1, photo2, referenceFile);
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6B8FA3] hover:text-[#8B6B4E] mb-12 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-light">Back to styles</span>
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-[#6B8FA3]" />
            <h1 className="text-5xl font-light tracking-wide text-[#8B6B4E]">DuoStyle</h1>
          </div>
          <h2 className="text-3xl font-light text-slate-700 mb-4">Upload Your Photos</h2>
          <p className="text-lg text-slate-600 font-light leading-relaxed">
            Upload two photos to create your styled fusion
          </p>
          <div className="inline-block mt-6 px-6 py-3 matte-card rounded-full text-sm font-light text-[#6B8FA3] soft-shadow">
            Selected Style: <span className="font-medium">{selectedStyle}</span>
          </div>
        </div>

        {referenceImages.length > 0 && (
          <div className="mb-16 matte-card rounded-2xl soft-shadow p-8">
            <h3 className="text-xl font-light text-[#8B6B4E] mb-4 text-center tracking-wide">Select Reference Image</h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-light">Choose one reference image for your style</p>
            <div className="grid grid-cols-3 gap-6">
              {referenceImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReferenceSelect(img)}
                  className={`rounded-xl overflow-hidden soft-shadow aspect-[3/4] transition-all duration-300 relative ${
                    selectedReference === img
                      ? 'ring-4 ring-[#6B8FA3] scale-105'
                      : 'hover:ring-2 hover:ring-[#6B8FA3]/50 hover:scale-102'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-contain bg-slate-50"
                  />
                  {selectedReference === img && (
                    <div className="absolute inset-0 bg-[#6B8FA3]/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 soft-shadow">
                        <Sparkles className="w-6 h-6 text-[#6B8FA3]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="matte-card rounded-2xl soft-shadow p-8">
            <h3 className="text-xl font-light text-[#8B6B4E] mb-6 tracking-wide">MAN photo</h3>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto1, setPreview1)}
                className="hidden"
              />
              <div className="border-2 border-dashed border-[#6B8FA3]/20 rounded-xl p-8 hover:border-[#6B8FA3]/40 transition-all duration-500 bg-white/50">
                {preview1 ? (
                  <img
                    src={preview1}
                    alt="MAN photo"
                    className="w-full h-72 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                    <UploadIcon className="w-12 h-12 mb-4 text-[#6B8FA3]/40" />
                    <p className="text-sm font-light text-slate-500">Click to upload MAN photo</p>
                    <p className="text-xs mt-2 font-light text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="matte-card rounded-2xl soft-shadow p-8">
            <h3 className="text-xl font-light text-[#8B6B4E] mb-6 tracking-wide">GIRL photo</h3>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto2, setPreview2)}
                className="hidden"
              />
              <div className="border-2 border-dashed border-[#6B8FA3]/20 rounded-xl p-8 hover:border-[#6B8FA3]/40 transition-all duration-500 bg-white/50">
                {preview2 ? (
                  <img
                    src={preview2}
                    alt="GIRL photo"
                    className="w-full h-72 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                    <Image className="w-12 h-12 mb-4 text-[#6B8FA3]/40" />
                    <p className="text-sm font-light text-slate-500">Click to upload GIRL photo</p>
                    <p className="text-xs mt-2 font-light text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-center font-light">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !photo1 || !photo2 || !referenceFile}
            className="flex items-center gap-3 px-10 py-4 bg-[#6B8FA3] text-white rounded-full font-light tracking-wide hover:bg-[#8B6B4E] transition-all duration-500 soft-shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-[#6B8FA3]"
          >
            <span>{isGenerating ? 'Generating...' : 'Generate Fusion'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
