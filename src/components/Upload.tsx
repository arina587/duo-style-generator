import { Upload as UploadIcon, ArrowLeft, ArrowRight, Image } from 'lucide-react';
import { useState } from 'react';

interface UploadProps {
  selectedStyle: string;
  onBack: () => void;
  onGenerate: (photo1: File, photo2: File) => void;
}

export default function Upload({ selectedStyle, onBack, onGenerate }: UploadProps) {
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

  const handleGenerate = () => {
    if (photo1 && photo2) {
      onGenerate(photo1, photo2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to styles</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Upload Your Photos</h1>
          <p className="text-lg text-slate-600">
            Upload two photos to create your styled fusion
          </p>
          <div className="inline-block mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Selected Style: {selectedStyle}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Photo</h3>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto1, setPreview1)}
                className="hidden"
              />
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                {preview1 ? (
                  <img
                    src={preview1}
                    alt="Preview 1"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <UploadIcon className="w-12 h-12 mb-4" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Second Person Photo</h3>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPhoto2, setPreview2)}
                className="hidden"
              />
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                {preview2 ? (
                  <img
                    src={preview2}
                    alt="Preview 2"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Image className="w-12 h-12 mb-4" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!photo1 || !photo2}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <span>Generate Fusion</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
