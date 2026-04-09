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
    ],
    tag: 'Animated',
    accentFrom: 'rgba(16,185,129,0.18)',
    accentTo: 'rgba(20,184,166,0.08)',
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Vibrant dramatic aesthetic',
    referenceImages: [
      '/styles/euphoria/ref1.jpg',
      '/styles/euphoria/ref2.jpg',
      '/styles/euphoria/ref3.jpg'
    ],
    tag: 'Cinematic',
    accentFrom: 'rgba(244,63,94,0.18)',
    accentTo: 'rgba(249,115,22,0.08)',
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Classic cinematic romance',
    referenceImages: [
      '/styles/titanic/ref1.jpg',
      '/styles/titanic/ref2.jpg',
      '/styles/titanic/ref3.jpg'
    ],
    tag: 'Romance',
    accentFrom: 'rgba(14,165,233,0.18)',
    accentTo: 'rgba(59,130,246,0.08)',
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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5 text-xs tracking-widest uppercase text-sky-400 font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Style Transfer
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Duo<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Style</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto leading-relaxed font-light">
            Merge two faces into iconic cinematic scenes using AI. Pick a style to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style.id, style.referenceImages)}
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
              className={`group relative flex flex-col rounded-2xl overflow-hidden glow-shadow transition-all duration-200 text-left ${
                selectedStyle === style.id
                  ? 'scenario-selected scale-[1.02]'
                  : 'glass-card-hover hover:scale-[1.02]'
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={style.referenceImages[0]}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/20 to-transparent" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${style.accentFrom}, ${style.accentTo})` }}
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                    {style.tag}
                  </span>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${hoveredStyle === style.id ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="px-5 py-2.5 rounded-full bg-sky-500/90 backdrop-blur-sm text-white text-sm font-semibold shadow-lg">
                    Select Style
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white text-lg">{style.name}</h3>
                  {selectedStyle === style.id && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{style.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-700 text-sm mt-10">Select a style above to continue</p>
      </div>
    </div>
  );
}
