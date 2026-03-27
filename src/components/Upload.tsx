import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image, Sparkles } from 'lucide-react';
import { useState } from 'react';

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

  const combineStyleImages = async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const images: HTMLImageElement[] = [];
      let loadedCount = 0;

      const checkAllLoaded = () => {
        if (loadedCount === referenceImages.length) {
          const imgWidth = images[0].width;
          const imgHeight = images[0].height;

          canvas.width = imgWidth * 3;
          canvas.height = imgHeight;

          images.forEach((img, index) => {
            ctx.drawImage(img, imgWidth * index, 0, imgWidth, imgHeight);
          });

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'style-board.jpg', { type: 'image/jpeg' });
              resolve(file);
            } else {
              reject(new Error('Could not create blob from canvas'));
            }
          }, 'image/jpeg', 0.95);
        }
      };

      referenceImages.forEach((src) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          images.push(img);
          loadedCount++;
          checkAllLoaded();
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    });
  };

  const handleGenerate = async () => {
    console.log('clicked');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

      console.log('Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'simple test',
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
    } catch (error) {
      console.error('Error:', error);
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

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-3 px-10 py-4 bg-[#6B8FA3] text-white rounded-full font-light tracking-wide hover:bg-[#8B6B4E] transition-all duration-500 soft-shadow-lg hover:scale-105"
          >
            <span>Generate Fusion</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
