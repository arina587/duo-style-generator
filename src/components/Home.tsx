import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export type ReferenceJob = { image: string; prompt: string; humanPrompt?: string; animalPrompt?: string };

interface HomeProps {
  onStyleSelect: (style: string, referenceJobs: ReferenceJob[]) => void;
}

const styles = [
  {
    id: 'zootopia',
    name: 'Zootopia',
    description: 'Animated animal character style',
    referenceJobs: [
      {
        image: '/styles/zootopia/ref1.jpg',
        prompt: 'Use image 1 as exact reference. Do not change composition, pose, camera angle, gaze or expressions.\nKeep characters as animals. Do NOT convert them into humans. Do NOT introduce realistic human skin or facial structure.\nApply only very subtle stylistic influence inspired by the uploaded images:\n- general mood\n- slight tone variation\n- personality feel\nPreserve original character design, proportions and expressions exactly.\nMaintain clean Pixar/Disney 3D style:\nsmooth shading, soft lighting, no realism.\nFinal result must look like the same animated frame with minimal stylistic variation.',
        humanPrompt: "Use image 1 as the exact base reference. STRICTLY preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and facial expressions.\n\nIMPORTANT pose detail:\nthe woman on the right must have her arm placed around the man's shoulder exactly like in the reference. Preserve physical interaction and spacing precisely.\n\nReplace the animal characters with the uploaded man and woman in the exact same positions:\n- man on the left\n- woman on the right\n\nSTRICTLY preserve identity of the uploaded people:\nsame facial structure, proportions, skin tone, facial details, eye shape, nose, lips, and hairstyle direction. No distortion, no smoothing, no beauty filters, no generic faces.\n\nTransform into stylized Pixar/Disney 3D:\nclean premium CGI, soft shading, slightly stylized but still highly recognizable, expressive eyes, polished animated look.\n\nMatch expressions exactly:\n- left character relaxed with slightly narrowed eyes\n- right character smiling with wide bright eyes\n\nBackground must remain plain white exactly like the reference. No changes.\n\nFinal result must look like the real people recreated in Pixar-style, in the exact same pose, with maximum preservation of appearance.",
        animalPrompt: "Use image 1 as the exact base reference. STRICTLY preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and expressions.\n\nIMPORTANT pose detail:\nthe woman on the right must have her arm placed around the man's shoulder exactly like in the reference.\n\nCreate stylized human characters based on the uploaded man and woman in the same positions (left/right), while keeping identity clearly recognizable:\nsame face structure, proportions, hairstyle direction and overall likeness.\n\nAdd stronger but still tasteful animal-inspired elements:\n\n- for the man (left): soft fox ears, slight fox-like eye sharpness, warm orange-toned accents, subtle fox-like eyebrow shape, confident playful fox vibe\n- for the woman (right): soft bunny ears, slightly larger rounded eyes, softer cheeks, gentle cute bunny vibe\n\nOPTIONAL subtle details:\nlight stylized tail silhouette hint (very soft, not realistic), small color accents inspired by animals\n\nIMPORTANT:\nkeep them clearly human — no fur skin, no animal snouts, no realistic hybrid anatomy, no creepy results.\n\nRender in high-quality Pixar/Disney 3D style:\nsmooth shading, soft lighting, clean CGI, expressive eyes.\n\nBackground must remain plain white exactly like the reference. No scene changes.\n\nFinal result must look like a cute Pixar-style animated selfie of the real couple, with stronger but still elegant fox and bunny-inspired traits.\n\nGoal:\nImprove pose accuracy, maximize identity preservation, and slightly increase animal-inspired styling while keeping the result clean and appealing.",
      },
      {
        image: '/styles/zootopia/ref2.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve 100% likeness.\nPixar-style close shot, female pressed cheek-to-cheek with male, tight framing, slight distortion, expressive eyes, clean soft lighting.',
      },
      {
        image: '/styles/zootopia/ref3.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nKeep characters as animals, no human features.\nZootopia nightclub selfie, neon lighting, lively mood, fox holding phone, rabbit leaning in, original animated style.',
      },
    ],
    tag: 'Animated',
    accentFrom: 'rgba(16,185,129,0.18)',
    accentTo: 'rgba(20,184,166,0.08)',
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Vibrant dramatic aesthetic',
    referenceJobs: [
      {
        image: '/styles/euphoria/ref1.jpg',
        prompt: 'Use image 1 as exact reference. Do not change composition, pose, camera angle, gaze or facial expressions.\nAdapt the appearance of the characters to resemble the uploaded people while keeping natural proportions and realism.\nMaintain consistent facial structure and natural skin texture without exaggeration or distortion.\nKeep head position, angle and eye direction exactly as in the reference.\nMatch original lighting: soft, even, studio-like light with no harsh shadows.\nMaintain close-up selfie framing with slight wide-angle perspective.\nFinal result must look like a natural photo of people in the same pose and framing.',
      },
      {
        image: '/styles/euphoria/ref2.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve 100% likeness.\nStrict side profile shot, male in foreground, do not rotate face, female blurred background, warm cinematic lighting.',
      },
      {
        image: '/styles/euphoria/ref3.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve full likeness.\nIntimate bedroom scene, two girls close together, soft expressions, warm cozy lighting, cinematic realism.',
      },
    ],
    tag: 'Cinematic',
    accentFrom: 'rgba(244,63,94,0.18)',
    accentTo: 'rgba(249,115,22,0.08)',
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Classic cinematic romance',
    referenceJobs: [
      {
        image: '/styles/titanic/ref1.jpg',
        prompt: 'Use image 1 as exact reference. Do not change composition, pose, camera angle, gaze or facial expressions.\nAdapt the appearance of the characters to resemble the uploaded people while keeping natural proportions and realism.\nMaintain consistent facial structure and natural skin texture without exaggeration or distortion.\nKeep head position, angle and eye direction exactly as in the reference.\nMatch original lighting: soft, even, studio-like light with no harsh shadows.\nMaintain close-up selfie framing with slight wide-angle perspective.\nFinal result must look like a natural photo of people in the same pose and framing.',
      },
      {
        image: '/styles/titanic/ref2.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve visible identity only.\nDark freezing water scene, cold blue tones, low light, wet reflections, emotional close distance.',
      },
      {
        image: '/styles/titanic/ref3.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve full likeness.\nExtreme close-up, couple about to kiss, warm sunset glow, shallow depth, cinematic grain.',
      },
    ],
    tag: 'Romance',
    accentFrom: 'rgba(14,165,233,0.18)',
    accentTo: 'rgba(59,130,246,0.08)',
  },
];

export default function Home({ onStyleSelect }: HomeProps) {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleStyleClick = (styleId: string, referenceJobs: ReferenceJob[]) => {
    setSelectedStyle(styleId);
    onStyleSelect(styleId, referenceJobs);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-6 text-xs tracking-widest uppercase text-sky-400 font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Style Transfer
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
            Duo<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Style</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-lg mx-auto leading-relaxed font-light">
            Merge two faces into iconic cinematic scenes using AI. Pick a style to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style.id, style.referenceJobs)}
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
                  src={style.referenceJobs[0].image}
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

              <div className="p-6">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-semibold text-white text-xl">{style.name}</h3>
                  {selectedStyle === style.id && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{style.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-600 text-sm mt-10">Select a style above to continue</p>
      </div>
    </div>
  );
}
