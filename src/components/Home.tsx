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
        humanPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and facial expressions.\n\nCRITICAL pose detail:\nthe woman on the right places her arm around the man's shoulder exactly like in the reference. Preserve hand placement, finger structure and contact naturally.\n\nReplace the animal characters with the uploaded man and woman in the exact same positions:\n- man on the left\n- woman on the right\n\nSTRICTLY preserve identity of BOTH people equally:\nsame facial structure, proportions, eye shape, nose, lips, skin tone and hairstyle direction.\nDo NOT stylize one person more than the other. Both must remain equally human and recognizable.\n\nIMPORTANT for hands:\nhands must be fully human — correct anatomy, five fingers, natural proportions. No animal traits, no paw-like shapes.\n\nRender in clean Pixar/Disney-style 3D:\nsoft shading, smooth CGI, slightly stylized but still realistic faces, no exaggeration.\n\nMatch expressions exactly:\n- left character relaxed with slightly narrowed eyes\n- right character smiling with wide bright eyes\n\nBackground must remain plain white exactly like the reference. No changes.\n\nFinal result must look like the uploaded couple as Pixar-style humans in the exact same pose, with correct hands and balanced identity preservation.",
        animalPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and facial expressions.\n\nCRITICAL pose detail:\nthe woman on the right places her arm around the man's shoulder exactly like in the reference. Preserve hand placement, finger structure and contact naturally.\n\nReplace the original characters with the uploaded man and woman in the exact same positions:\n- man on the left\n- woman on the right\n\nSTRICTLY preserve identity of BOTH people:\nsame facial structure, proportions, eye shape, nose, lips, skin tone and hairstyle direction. No distortion, no smoothing, no beauty filters.\n\nRender in stylized Pixar/Disney 3D:\nclean CGI, soft shading, expressive eyes, polished animated look.\n\nAdd subtle cute character elements inspired by the reference:\n- for the man: small soft fox-like ears, slightly warmer color accents, playful confident vibe\n- for the woman: small soft bunny-like ears, slightly softer facial styling, gentle cute vibe\n\nIMPORTANT:\nkeep them clearly human — no fur, no animal skin, no snout, no hybrid anatomy.\nhands must remain fully human with correct anatomy.\n\nMatch expressions exactly:\n- left character relaxed with slightly narrowed eyes\n- right character smiling with wide bright eyes\n\nBackground must remain plain white exactly like the reference. No changes.\n\nFinal result must look like a Pixar-style animated version of the real couple in the exact same pose, with small cute character-inspired details.\n\nGoal:\nSame behavior as human mode, but with subtle cute character elements, without triggering content filters.",
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
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground MUST come strictly from image 1. Do NOT use background, lighting or environment from uploaded people images.\n\nSTRICTLY preserve:\n- exact camera angle and perspective\n- framing and crop\n- head positions and spacing\n- gaze directions\n- depth of field (woman sharp, man blurred)\n- body alignment\n\nUltra-realistic cinematic close-up. Woman on the left in focus looking sideways at the man. Man on the right closer to camera and softly blurred.\n\nReplace with uploaded woman (left) and man (right).\n\nSTRICTLY preserve identity 1:1 — same face structure, proportions, skin texture. No smoothing, no filters, no distortion.\n\nLighting and color MUST match the reference exactly.\n\nFinal result must look like the original frame with only faces replaced, nothing else changed.',
      },
      {
        image: '/styles/euphoria/ref2.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\ndo NOT use any background, lighting or environment from uploaded images — only from the reference.\n\nSTRICTLY preserve:\n- exact camera angle (slightly above and from the side)\n- pose of the man leaning back\n- head tilt direction toward the woman\n- relative distance between characters\n- perspective and framing\n\nUltra-realistic cinematic scene. Man as main subject, woman closer to camera and partially blurred.\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — no smoothing, no distortion.\n\nLighting, shadows and color grading must match the reference exactly.\n\nBackground MUST remain identical — couch, wall, lighting, depth, all unchanged.\n\nFinal result must look identical to the original shot, only with replaced people.',
      },
      {
        image: '/styles/euphoria/ref3.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground and environment must come strictly from the reference. Do NOT transfer anything from uploaded images.\n\nSTRICTLY preserve:\n- exact top/side camera angle\n- body positions on the bed\n- distance between characters\n- head orientation and gaze\n- interaction between bodies\n\nUltra-realistic cinematic bedroom scene. Two people lying facing each other.\n\nReplace with uploaded people, keeping exact pose and proportions.\n\nSTRICTLY preserve identity 1:1 — same faces, proportions, skin texture.\n\nLighting and color must match the reference exactly.\n\nBackground MUST remain identical — bed, objects, clutter, lighting.\n\nFinal result must look like the same original frame with only identities replaced.\n\nGoal:\nForce model to keep background and pose strictly from reference, without pulling anything from uploaded images.',
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
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nstrictly preserve the exact pose — the woman standing in front with arms extended sideways, the man behind her holding her at the waist.\n\nPreserve:\n- arm positions (fully extended horizontally)\n- body alignment\n- distance between bodies\n- head tilt and direction\n- railing position and framing\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — same face, proportions, skin texture. No smoothing, no distortion.\n\nLighting:\nwarm sunset cinematic lighting. Preserve original color and glow exactly.\n\nBackground:\nSTRICTLY keep the ship deck, sky, horizon and lighting exactly as in the reference.\n\nDo NOT change composition or perspective.\n\nFinal result must look identical to the original scene with only identities replaced.',
      },
      {
        image: '/styles/titanic/ref2.jpg',
        prompt: 'Use image 1 as the exact base reference. Strictly preserve the original scene, background, composition, camera angle, framing, pose, body positions, head positions, gaze direction and distance between faces.\n\nUltra-realistic cinematic night water scene. Two people are very close together above the dark water surface, leaning toward each other with the same emotional tension and the same exact posture as in the reference.\n\nReplace the characters with the uploaded man and woman while keeping the exact original scene unchanged.\n\nSTRICTLY preserve identity 1:1 — same facial features, proportions, skin texture, eye shape, nose, lips and natural appearance. No smoothing, no beauty filters, no distortion.\n\nIMPORTANT:\nkeep the original head angles exactly as in the reference.\nkeep the original gaze direction exactly as in the reference.\ndo not re-stage the scene.\ndo not redraw the environment.\n\nLighting must match the original reference exactly:\ncold blue night lighting, dark reflections, wet skin highlights, natural shadow falloff.\n\nSkin tone must be blended naturally into the scene lighting so there is no visible difference between face, neck and body.\n\nPreserve water reflections, darkness, blur and cinematic softness exactly.\n\nDo NOT change:\nbackground\nwater surface\ncamera perspective\nbody pose\ndistance between faces\n\nFinal result must look like the same original Titanic frame, with the uploaded people naturally integrated and no face/neck color mismatch.',
      },
      {
        image: '/styles/titanic/ref3.jpg',
        prompt: 'Use image 1 as the exact base reference. Strictly preserve the original scene, background, composition, camera angle, framing, pose, body positions, head angles, gaze direction and distance between faces.\n\nUltra-realistic cinematic sunset scene. A man stands behind a woman, holding her at the waist, while both lean toward each other with the same exact posture and emotional tension as in the reference.\n\nReplace the characters with the uploaded man and woman while keeping the original scene unchanged.\n\nSTRICTLY preserve identity 1:1 — same facial features, proportions, skin texture, eye shape, nose, lips and natural appearance. No smoothing, no beauty filters, no distortion.\n\nIMPORTANT:\nthe gaze direction must remain exactly the same as in the reference.\nthe head tilt and distance between faces must remain exactly the same as in the reference.\ndo not alter pose or body alignment.\n\nLighting must match the original reference exactly:\nwarm sunset tones, golden highlights, soft cinematic shadows.\n\nSkin tone must blend naturally into the sunset light so the face, neck and body match perfectly with no color mismatch.\n\nPreserve ship background, sky, color grading, softness and cinematic grain exactly.\n\nDo NOT change:\nbackground\ncamera perspective\nhands on waist\nbody pose\nscene layout\n\nFinal result must look like the same original Titanic frame, with the uploaded people seamlessly integrated and the exact original gaze and pose preserved.\n\nGoal:\nMatch the stability and scene accuracy of referenceJobs[6], while improving identity transfer, gaze accuracy and skin-tone blending for referenceJobs[7] and referenceJobs[8].',
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
