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
      '/src/assets/styles/zootopia/ref1.jpg',
      '/src/assets/styles/zootopia/ref2.jpg',
      '/src/assets/styles/zootopia/ref3.jpg'
    ]
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Vibrant dramatic aesthetic',
    referenceImages: [
      '/src/assets/styles/euphoria/ref1.jpg',
      '/src/assets/styles/euphoria/ref2.jpg',
      '/src/assets/styles/euphoria/ref3.jpg'
    ]
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Classic cinematic romance',
    referenceImages: [
      '/src/assets/styles/titanic/ref1.jpg',
      '/src/assets/styles/titanic/ref2.jpg',
      '/src/assets/styles/titanic/ref3.jpg'
    ]
  }
];

export default function Home({ onStyleSelect }: HomeProps) {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style.id, style.referenceImages)}
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
              className="group relative matte-card rounded-2xl soft-shadow hover:soft-shadow-lg transition-all duration-500 overflow-hidden"
            >
              <div className="h-80 w-full overflow-hidden bg-slate-100/50 rounded-t-2xl">
                <img
                  src={style.referenceImages[0]}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              <div className="p-8">
                <h3 className="font-medium text-[#8B6B4E] text-2xl mb-3 tracking-wide">{style.name}</h3>
                <p className="text-sm text-slate-500 font-light leading-relaxed">{style.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
