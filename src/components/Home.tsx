import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface HomeProps {
  onStyleSelect: (style: string, referenceImages: string[]) => void;
}

const styles = [
  {
    id: 'zootopia',
    name: 'Zootopia',
    description: 'Animated animal character style',
    referenceImages: [
      '/styles/zootopia/ref1.jpg',
      '/styles/zootopia/ref2.jpg',
      '/styles/zootopia/ref3.jpg'
    ]
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Vibrant dramatic aesthetic',
    referenceImages: [
      '/styles/euphoria/ref1.jpg',
      '/styles/euphoria/ref2.jpg',
      '/styles/euphoria/ref3.jpg'
    ]
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Classic cinematic romance',
    referenceImages: [
      '/styles/titanic/ref1.jpg',
      '/styles/titanic/ref2.jpg',
      '/styles/titanic/ref3.jpg'
    ]
  }
];

export default function Home({ onStyleSelect }: HomeProps) {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleStyleClick = (styleId: string, referenceImages: string[]) => {
    setSelectedStyle(styleId);
    onStyleSelect(styleId, referenceImages);
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-[#6B8FA3]" />
            <h1 className="text-5xl font-light tracking-wide text-[#8B6B4E]">DuoStyle</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Transform your photos with AI-powered style transfer. Choose a style below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style.id, style.referenceImages)}
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
              className={`group relative flex flex-col matte-card rounded-2xl soft-shadow transition-all duration-500 overflow-hidden border-2 ${
                selectedStyle === style.id
                  ? 'border-[#6B8FA3] scale-105 soft-shadow-lg'
                  : 'border-transparent hover:border-[#6B8FA3]/30 hover:soft-shadow-lg'
              }`}
            >
              <div className="aspect-square w-full overflow-hidden bg-slate-100/50 relative">
                <img
                  src={style.referenceImages[0]}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-[#6B8FA3]/0 transition-all duration-500 flex items-center justify-center ${
                  hoveredStyle === style.id ? 'bg-[#6B8FA3]/10' : ''
                }`}>
                  <div className={`px-6 py-3 bg-white/95 rounded-full transition-all duration-500 ${
                    hoveredStyle === style.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}>
                    <span className="text-[#6B8FA3] font-medium text-base">
                      Select Style
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-[#8B6B4E] text-xl mb-2 tracking-wide">{style.name}</h3>
                <p className="text-sm text-slate-500 font-light leading-relaxed">{style.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
