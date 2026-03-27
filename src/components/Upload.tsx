import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';

interface UploadProps {
  selectedStyle: string;
  referenceImages: string[];
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File, styleBoard: File) => void;
}

export default function Upload({ selectedStyle, referenceImages, onBack, onGenerate }: UploadProps) {
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>('');
  const [preview2, setPreview2] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const requestIdRef = useRef<number>(0);

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

  const getStyleImageAsFile = async (): Promise<File> => {
    const firstImageUrl = referenceImages[0];
    const response = await fetch(firstImageUrl);
    const blob = await response.blob();
    return new File([blob], 'style-reference.jpg', { type: blob.type });
  };

  const handleGenerate = async () => {
    console.log('=== GENERATE BUTTON CLICKED ===');

    if (isGenerating) {
      console.log('BLOCKED: Already generating, ignoring click');
      return;
    }

    console.log('Validation check:', {
      photo1: !!photo1,
      photo2: !!photo2,
      selectedStyle: selectedStyle,
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

    setIsGenerating(true);
    setError('');

    const currentRequestId = Date.now();
    requestIdRef.current = currentRequestId;
    console.log('=== REQUEST START ===', { requestId: currentRequestId });

    try {
      const styleBoard = await getStyleImageAsFile();

      if (!styleBoard) {
        console.error('BLOCKED: Failed to load style board');
        setError('Failed to load style reference. Please try again.');
        setIsGenerating(false);
        return;
      }

      if (requestIdRef.current !== currentRequestId) {
        console.log('BLOCKED: Request cancelled, newer request exists');
        return;
      }

      console.log('Building FormData with:', {
        person1: photo1.name,
        person2: photo2.name,
        styleBoard: styleBoard.name,
        selectedStyle: selectedStyle,
      });

      const formData = new FormData();
      formData.append('person1', photo1);
      formData.append('person2', photo2);
      formData.append('styleBoard', styleBoard);
      formData.append('selectedStyle', selectedStyle);

      console.log('FormData validation:', {
        person1: formData.has('person1'),
        person2: formData.has('person2'),
        styleBoard: formData.has('styleBoard'),
        selectedStyle: formData.has('selectedStyle'),
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
      console.log('Sending POST request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (requestIdRef.current !== currentRequestId) {
        console.log('BLOCKED: Response ignored, newer request exists');
        return;
      }

      console.log('=== REQUEST END ===', {
        requestId: currentRequestId,
        status: response.status,
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Request failed:', data);
        setError('Generation failed. Try again.');
        setIsGenerating(false);
        return;
      }

      if (data.success && data.imageUrl) {
        console.log('SUCCESS: Image generated:', data.imageUrl);
        onGenerate(photo1, photo2, styleBoard);
      } else {
        console.error('Response missing success or imageUrl');
        setError('Generation failed. Try again.');
        setIsGenerating(false);
      }
    } catch (error) {
      if (requestIdRef.current !== currentRequestId) {
        console.log('BLOCKED: Error ignored, newer request exists');
        return;
      }
      console.error('Request error:', error);
      setError('Generation failed. Try again.');
      setIsGenerating(false);
    }
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
            <h3 className="text-xl font-light text-[#8B6B4E] mb-8 text-center tracking-wide">Style Reference Images</h3>
            <div className="grid grid-cols-3 gap-6">
              {referenceImages.map((img, index) => (
                <div key={index} className="rounded-xl overflow-hidden soft-shadow aspect-[3/4]">
                  <img
                    src={img}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-contain bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="matte-card rounded-2xl soft-shadow p-8">
            <h3 className="text-xl font-light text-[#8B6B4E] mb-6 tracking-wide">Your Photo</h3>
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
                    alt="Preview 1"
                    className="w-full h-72 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                    <UploadIcon className="w-12 h-12 mb-4 text-[#6B8FA3]/40" />
                    <p className="text-sm font-light text-slate-500">Click to upload</p>
                    <p className="text-xs mt-2 font-light text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="matte-card rounded-2xl soft-shadow p-8">
            <h3 className="text-xl font-light text-[#8B6B4E] mb-6 tracking-wide">Second Person Photo</h3>
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
                    alt="Preview 2"
                    className="w-full h-72 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                    <Image className="w-12 h-12 mb-4 text-[#6B8FA3]/40" />
                    <p className="text-sm font-light text-slate-500">Click to upload</p>
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
            onClick={handleGenerate}
            disabled={isGenerating || !photo1 || !photo2}
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
