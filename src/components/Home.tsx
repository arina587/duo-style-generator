import { Sparkles } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">StyleFusion</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform your photos with AI-powered style transfer. Choose a style below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style.id, style.referenceImages)}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="h-64 w-full overflow-hidden bg-slate-200">
                <img
                  src={style.referenceImages[0]}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Select
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-slate-900 text-xl mb-2">{style.name}</h3>
                <p className="text-sm text-slate-600">{style.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
