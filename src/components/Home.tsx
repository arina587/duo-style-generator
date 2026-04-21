import {
  Sparkles, Star, Zap, Film, Heart, Wand2, ChevronDown, Check, ArrowRight,
  Upload, Shield, Plus, Minus, Camera
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import InfiniteCarousel from './InfiniteCarousel';

export type ReferenceJob = { image: string; prompt: string; humanPrompt?: string; animalPrompt?: string };

interface HomeProps {
  onStyleSelect: (style: string, referenceJobs: ReferenceJob[]) => void;
}

const styles = [
  {
    id: 'zootopia',
    name: 'Zootopia',
    description: 'Animated Disney/Pixar character style with playful energy',
    referenceJobs: [
      {
        image: '/styles/zootopia/zootopia1.jpg',
        prompt: 'Use image 1 as exact reference. Do not change composition, pose, camera angle, gaze or expressions.\nKeep characters as animals. Do NOT convert them into humans. Do NOT introduce realistic human skin or facial structure.\nApply only very subtle stylistic influence inspired by the uploaded images:\n- general mood\n- slight tone variation\n- personality feel\nPreserve original character design, proportions and expressions exactly.\nMaintain clean Pixar/Disney 3D style:\nsmooth shading, soft lighting, no realism.\nFinal result must look like the same animated frame with minimal stylistic variation.',
        humanPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and facial expressions.\nReplace the animal characters with the uploaded man and woman in the exact same positions:\n- man on the left\n- woman on the right\nSTRICTLY preserve identity of the uploaded people:\nsame facial features, proportions, skin tone, hairstyle and overall likeness. No distortion, no smoothing, no beauty filters.\nTransform the result into a stylized Pixar/Disney 3D animated look:\nclean CGI, soft shading, slightly stylized proportions, expressive eyes, polished animated finish.\nMatch expressions exactly:\n- left character relaxed with slightly narrowed eyes\n- right character smiling with wide bright eyes\nBackground must remain plain white exactly like the reference. No changes.\nFinal result must look like the real people recreated as Pixar-style characters in the exact same selfie pose.",
        animalPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and expressions.\nCreate stylized human characters based on the uploaded man and woman in the same positions (left/right), but with subtle, cute animal-inspired elements.\nPreserve identity clearly:\nrecognizable faces, proportions, hairstyle direction and overall likeness of the uploaded people.\nAdd soft animal-inspired features in a stylish, non-realistic way:\n- for the man (left): small soft fox ears, slightly warm fox-like color accents, subtle playful fox character vibe\n- for the woman (right): elegant soft bunny ears, gentle cute styling, slightly softer and sweeter expression energy\nIMPORTANT:\nkeep them clearly human — no fur, no animal faces, no realistic hybrid anatomy, no creepy results.\nRender in high-quality Pixar/Disney 3D style:\nsmooth shading, soft lighting, clean CGI, expressive eyes.\nBackground must remain plain white exactly like the reference. No scene changes.\nFinal result must look like a cute animated selfie of the real couple with subtle fox and bunny-inspired traits.\nGoal:\nHuman mode = clean Pixar-style people replacement.\nAnimal mode = same people + subtle cute animal-inspired elements, not full animals.",
      },
      {
        image: '/styles/zootopia/zootopia2.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nUse uploaded faces as exact identity references, preserve 100% likeness.\nPixar-style close shot, female pressed cheek-to-cheek with male, tight framing, slight distortion, expressive eyes, clean soft lighting.',
      },
      {
        image: '/styles/zootopia/zootopia3.jpg',
        prompt: 'use image 1 as exact reference, keep composition, pose, camera, gaze and expression unchanged.\nKeep characters as animals, no human features.\nZootopia nightclub selfie, neon lighting, lively mood, fox holding phone, rabbit leaning in, original animated style.',
      },
    ],
    tag: 'Animated',
    icon: Star,
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    hasSubcategories: true,
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Bold cinematic drama with vibrant neon aesthetics',
    referenceJobs: [
      {
        image: '/styles/euphoria/euphoria1.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground MUST come strictly from image 1. Do NOT use background, lighting or environment from uploaded people images.\n\nSTRICTLY preserve:\n- exact camera angle and perspective\n- framing and crop\n- head positions and spacing\n- gaze directions\n- depth of field (woman sharp, man blurred)\n- body alignment\n\nUltra-realistic cinematic close-up. Woman on the left in focus looking sideways at the man. Man on the right closer to camera and softly blurred.\n\nReplace with uploaded woman (left) and man (right).\n\nSTRICTLY preserve identity 1:1 — same face structure, proportions, skin texture. No smoothing, no filters, no distortion.\n\nLighting and color MUST match the reference exactly.\n\nFinal result must look like the original frame with only faces replaced, nothing else changed.',
      },
      {
        image: '/styles/euphoria/euphoria2.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\ndo NOT use any background, lighting or environment from uploaded images — only from the reference.\n\nSTRICTLY preserve:\n- exact camera angle (slightly above and from the side)\n- pose of the man leaning back\n- head tilt direction toward the woman\n- relative distance between characters\n- perspective and framing\n\nUltra-realistic cinematic scene. Man as main subject, woman closer to camera and partially blurred.\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — no smoothing, no distortion.\n\nLighting, shadows and color grading must match the reference exactly.\n\nBackground MUST remain identical — couch, wall, lighting, depth, all unchanged.\n\nFinal result must look identical to the original shot, only with replaced people.',
      },
      {
        image: '/styles/euphoria/euphoria3.JPG',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground and environment must come strictly from the reference. Do NOT transfer anything from uploaded images.\n\nSTRICTLY preserve:\n- exact top/side camera angle\n- body positions on the bed\n- distance between characters\n- head orientation and gaze\n- interaction between bodies\n\nUltra-realistic cinematic bedroom scene. Two people lying facing each other.\n\nReplace with uploaded people, keeping exact pose and proportions.\n\nSTRICTLY preserve identity 1:1 — same faces, proportions, skin texture.\n\nLighting and color must match the reference exactly.\n\nBackground MUST remain identical — bed, objects, clutter, lighting.\n\nFinal result must look like the same original frame with only identities replaced.\n\nGoal:\nForce model to keep background and pose strictly from reference, without pulling anything from uploaded images.',
      },
    ],
    tag: 'Cinematic',
    icon: Film,
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    hasSubcategories: false,
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Timeless cinematic romance with golden hour warmth',
    referenceJobs: [
      {
        image: '/styles/titanic/titanic1.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nstrictly preserve the exact pose — the woman standing in front with arms extended sideways, the man behind her holding her at the waist.\n\nPreserve:\n- arm positions (fully extended horizontally)\n- body alignment\n- distance between bodies\n- head tilt and direction\n- railing position and framing\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — same face, proportions, skin texture. No smoothing, no distortion.\n\nLighting:\nwarm sunset cinematic lighting. Preserve original color and glow exactly.\n\nBackground:\nSTRICTLY keep the ship deck, sky, horizon and lighting exactly as in the reference.\n\nDo NOT change composition or perspective.\n\nFinal result must look identical to the original scene with only identities replaced.',
      },
      {
        image: '/styles/titanic/titanic2.jpg',
        prompt: 'Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same water surface, same reflections, same composition, same crop, same body positions, same distance between the two characters, same head angles, same gaze directions.\n\nDo NOT redraw or reinterpret the scene. Do NOT restage anything.\n\nIntegrate the uploaded man and woman into the exact existing shot.\n\nThis is a difficult low-light close-contact scene. Preserve the original pose and limited visibility exactly:\n- the man\'s face remains partially visible and angled downward\n- do not rotate his head toward camera\n- do not reveal hidden parts of his face\n- do not reconstruct a more frontal face\n- keep the original proximity between faces\n- keep the original emotional tension\n\nPreserve identity of both people where visible:\nsame recognizable facial structure, eye area, nose shape, lips, proportions, and natural human skin character.\n\nIMPORTANT FOR SKIN:\nkeep natural human skin tones.\nDo NOT turn skin strongly blue.\nUse only a mild cold ambient tint from the scene.\nFace, neck and visible skin must stay naturally matched with no blue cast and no pasted look.\n\nIMPORTANT FOR GAZE AND ANGLES:\nkeep the exact original head angle\nkeep the exact original gaze direction\ndo not correct or stylize the eyes\ndo not change visibility of either face\n\nPreserve natural cinematic softness, darkness, reflections and slight blur from the original frame.\n\nFinal result must look like the same original Titanic frame, with the uploaded man and woman naturally integrated, correct head angles, correct gaze, and natural skin tone.',
      },
      {
        image: '/styles/titanic/titanic3.jpg',
        prompt: 'Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same ship, same sky, same sunset lighting, same composition, same crop, same body positions, same hand placement, same distance between the faces.\nDo NOT redraw or reinterpret the scene.\nPreserve the exact pose:\n- the man stands behind the woman, holding her at the waist\n- their bodies lean toward each other\n- the distance between their faces remains extremely close\nCRITICAL GAZE AND HEAD POSITION:\nthe woman\'s head must remain turned toward the man exactly like in the reference.\nher gaze must stay directed toward him.\ndo NOT turn her head away.\ndo NOT redirect her eyes.\ndo NOT reduce the intimacy of the pose.\nIMPORTANT:\nthis is a close emotional moment — preserve closeness without exaggeration or avoidance.\nFor the man:\nkeep his head angle, position and proximity exactly as in the reference.\nhis face must be recognizable but follow the original angle and lighting.\nIDENTITY:\npreserve both identities naturally — same facial structure, proportions, features.\nSKIN TONE:\nkeep natural human skin tones with warm sunset lighting.\nno mismatch between face, neck and body.\nLIGHTING:\npreserve original warm cinematic sunset tones exactly.\nDo NOT change:\n- pose\n- gaze\n- distance between faces\n- background\n- camera angle\nFinal result must look like the same original Titanic frame, with correct gaze direction, preserved intimacy, and natural identity integration.',
      },
    ],
    tag: 'Romance',
    icon: Heart,
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    hasSubcategories: false,
  },
  {
    id: 'tangled',
    name: 'Tangled',
    description: 'Magical fairy-tale adventure with warm lantern-lit warmth',
    referenceJobs: [
      {
        image: '/styles/tangled/tangled1.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/tangled/tangled2.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/tangled/tangled3.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
    ],
    tag: 'Fantasy',
    icon: Sparkles,
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    hasSubcategories: false,
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    description: 'Iconic superhero story full of action and heart',
    referenceJobs: [
      {
        image: '/styles/spiderman/spiderman1.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/spiderman/spiderman2.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/spiderman/spiderman3.jpg',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
    ],
    tag: 'Action',
    icon: Zap,
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    hasSubcategories: false,
  },
  {
    id: 'terabithia',
    name: 'Bridge to Terabithia',
    description: 'Tender coming-of-age tale set in an enchanted forest world',
    referenceJobs: [
      {
        image: '/styles/terabithia/terabithia1.JPG',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/terabithia/terabithia2.JPG',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
      {
        image: '/styles/terabithia/terabithia3.JPG',
        prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
      },
    ],
    tag: 'Adventure',
    icon: Heart,
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
    hasSubcategories: false,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$6',
    period: '/month',
    description: 'Perfect for trying out DuoStyle',
    features: ['5 AI fusions per month', '3 cinematic styles', 'HD downloads', 'Email support'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Creator',
    price: '$9',
    period: '/month',
    description: 'For creators who want more',
    features: ['20 AI fusions per month', 'All cinematic styles', 'Ultra HD downloads', 'Priority support', 'Early access to new styles'],
    cta: 'Start Creating',
    featured: true,
  },
];

const faqItems = [
  { q: 'How does DuoStyle work?', a: 'Upload two photos (man + woman), select a cinematic style and reference scene, then our AI places both faces into the iconic frame.' },
  { q: 'Are my photos private?', a: 'Your photos are processed securely and never used for AI training. All uploads are deleted after generation.' },
  { q: 'What styles are available?', a: 'Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and Bridge to Terabithia -- with more coming soon.' },
  { q: 'How long does generation take?', a: 'Most fusions complete in 30-90 seconds depending on server load.' },
  { q: 'Can I download my result?', a: 'Yes -- once generated you can download the full resolution image directly.' },
];

const allCarouselImages = [
  { src: '/styles/titanic/titanic1.jpg', alt: 'Titanic 1', offsetY: 0 },
  { src: '/styles/euphoria/euphoria1.jpg', alt: 'Euphoria 1', offsetY: 14 },
  { src: '/styles/zootopia/zootopia1.jpg', alt: 'Zootopia 1', offsetY: -6 },
  { src: '/styles/tangled/tangled1.jpg', alt: 'Tangled 1', offsetY: 10 },
  { src: '/styles/titanic/titanic2.jpg', alt: 'Titanic 2', offsetY: 0 },
  { src: '/styles/euphoria/euphoria2.jpg', alt: 'Euphoria 2', offsetY: -14 },
  { src: '/styles/spiderman/spiderman1.jpg', alt: 'Spider-Man 1', offsetY: 6 },
  { src: '/styles/zootopia/zootopia2.jpg', alt: 'Zootopia 2', offsetY: 0 },
  { src: '/styles/terabithia/terabithia1.JPG', alt: 'Terabithia 1', offsetY: 16 },
  { src: '/styles/titanic/titanic3.jpg', alt: 'Titanic 3', offsetY: -4 },
  { src: '/styles/euphoria/euphoria3.JPG', alt: 'Euphoria 3', offsetY: 8 },
  { src: '/styles/zootopia/zootopia3.jpg', alt: 'Zootopia 3', offsetY: 0 },
];

export default function Home({ onStyleSelect }: HomeProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderScrolled(currentY > 40);
      if (currentY < lastScrollY.current || currentY < 80) setHeaderVisible(true);
      else if (currentY > lastScrollY.current && currentY > 120) setHeaderVisible(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStyleClick = (styleId: string, referenceJobs: ReferenceJob[]) => {
    setSelectedStyle(styleId);
    onStyleSelect(styleId, referenceJobs);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden grid-bg">

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        headerScrolled
          ? 'bg-[#f0edf6]/92 backdrop-blur-xl border-b-2 border-[#d8ccea] shadow-sm'
          : 'bg-transparent'
      } ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)', boxShadow: '0 3px 10px rgba(155,125,212,0.3)' }}>
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-[#2d2642] tracking-tight font-display">DuoStyle</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {['How it works', 'Styles', 'Pricing'].map((label, i) => (
              <button
                key={label}
                onClick={() => scrollToSection(['how', 'styles', 'pricing'][i])}
                className="text-sm text-[#7a6f96] hover:text-[#2d2642] transition-colors duration-200 font-bold font-body"
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => scrollToSection('styles')}
            className="btn-accent px-5 py-2 text-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-10" style={{ background: 'linear-gradient(160deg, #ede6f6 0%, #e8dff4 35%, #f2e8f6 60%, #f0edf6 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute top-20 left-[7%] animate-wiggle opacity-60">
          <Camera className="w-6 h-6 text-[#b49cdb]" />
        </div>
        <div className="absolute top-28 right-[10%] animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="sticker text-xs" style={{ borderColor: '#d8ccea' }}>
            <Sparkles className="w-3 h-3 text-[#9b7dd4]" />
            AI Magic
          </div>
        </div>
        <div className="absolute top-36 left-[38%] w-2.5 h-2.5 rounded-full bg-[#b49cdb] opacity-40 animate-pulse-soft" />
        <div className="absolute bottom-20 right-[15%] w-3 h-3 rounded-full bg-[#deb8e6] opacity-35 animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* Left: text */}
            <div className="max-w-md animate-fade-up">
              <div className="badge-pill inline-flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#9b7dd4]" />
                AI-Powered Face Transfer
              </div>

              <h1 className="font-display text-[2.8rem] sm:text-[3.4rem] leading-[1.08] font-bold text-[#2d2642] mb-4">
                Step Inside<br />
                <span className="relative inline-block">
                  <span className="relative z-10">Iconic</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 rounded-full -z-0" style={{ background: 'rgba(155,125,212,0.25)' }} />
                </span>{' '}Movie<br />
                Moments
              </h1>

              <p className="text-[15px] sm:text-base text-[#7a6f96] leading-relaxed mb-6 max-w-[380px] font-body">
                Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene -- in under 90 seconds.
              </p>

              <div className="flex flex-wrap gap-3 items-center mb-6">
                <button
                  onClick={() => scrollToSection('styles')}
                  className="btn-accent flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection('how')}
                  className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm"
                >
                  See how it works
                </button>
              </div>

              <div className="flex items-center gap-7 pt-5 border-t-2 border-dashed border-[#d8ccea]">
                {[
                  { value: '6', label: 'Cinematic styles' },
                  { value: '90s', label: 'Generation time' },
                  { value: 'HD', label: 'Output quality' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-lg font-bold text-[#2d2642] font-display">{value}</div>
                    <div className="text-[11px] text-[#9a93b0] font-body mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image grid -- clean 3-column, no overlapping float */}
            <div className="animate-fade-up" style={{ animationDelay: '0.12s' }}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { src: '/styles/titanic/titanic1.jpg', label: 'Titanic' },
                  { src: '/styles/euphoria/euphoria1.jpg', label: 'Euphoria' },
                  { src: '/styles/zootopia/zootopia1.jpg', label: 'Zootopia' },
                  { src: '/styles/tangled/tangled1.jpg', label: 'Tangled' },
                  { src: '/styles/spiderman/spiderman1.jpg', label: 'Spider-Man' },
                  { src: '/styles/terabithia/terabithia1.JPG', label: 'Terabithia' },
                ].map(({ src, label }, idx) => (
                  <div
                    key={label}
                    className="relative rounded-2xl overflow-hidden aspect-[4/5] animate-scale-in group cursor-pointer border-2 border-[#ddd4ee] hover:border-[#b49cdb] transition-all duration-300"
                    style={{ animationDelay: `${idx * 0.06}s`, boxShadow: '0 4px 18px rgba(120,90,180,0.1)' }}
                    onClick={() => scrollToSection('styles')}
                  >
                    <img
                      src={src}
                      alt={label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d2642]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-[11px] font-bold font-body bg-[#2d2642]/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => scrollToSection('carousel')}
            className="flex flex-col items-center gap-0.5 text-[#9a93b0] hover:text-[#2d2642] transition-colors duration-200 animate-float"
          >
            <span className="text-[10px] font-body tracking-widest uppercase font-bold">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── CAROUSEL ── */}
      <section id="carousel" className="py-8 overflow-hidden" style={{ background: 'linear-gradient(180deg, #e8e0f4 0%, #f0edf6 100%)' }}>
        <p className="text-center section-eyebrow mb-4">Sample outputs across all styles</p>
        <InfiniteCarousel images={allCarouselImages} />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-16 relative overflow-hidden grid-bg-warm">
        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="section-eyebrow mb-2">Process</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d2642] leading-tight">
                Three steps to magic
              </h2>
            </div>
            <p className="text-[#7a6f96] text-sm max-w-xs leading-relaxed md:text-right font-body">
              No editing skills required. Just upload two photos and let our AI do the work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Upload, step: '01', title: 'Upload Photos', desc: 'Upload one photo of the man and one of the woman. Clear face shots work best.', delay: '0s', iconBg: '#9b7dd4' },
              { icon: Film, step: '02', title: 'Choose a Scene', desc: 'Pick from Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and more.', delay: '0.08s', iconBg: '#c490d1' },
              { icon: Sparkles, step: '03', title: 'Generate & Download', desc: 'AI places both faces into the scene. Download your HD fusion in under 90 seconds.', delay: '0.16s', iconBg: '#deb8e6' },
            ].map(({ icon: Icon, step, title, desc, delay, iconBg }) => (
              <div
                key={step}
                className="step-card p-6 animate-slide-up relative group"
                style={{ animationDelay: delay }}
              >
                <div className="absolute top-5 right-5 font-display text-4xl font-bold leading-none select-none" style={{ color: '#ece6f5' }}>
                  {step}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
                  <Icon style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
                <h3 className="font-display font-bold text-[#2d2642] text-base mb-2">{title}</h3>
                <p className="text-sm text-[#7a6f96] leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES GRID ── */}
      <section id="styles" className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ede6f6 0%, #f0edf6 100%)' }}>
        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">Cinematic Universes</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d2642] mb-3">
              Choose Your Scene
            </h2>
            <p className="text-[#7a6f96] text-base max-w-sm mx-auto font-body">
              Six iconic worlds. One AI. Your faces.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {styles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isSelected={selectedStyle === style.id}
                onClick={handleStyleClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 relative overflow-hidden grid-bg-warm">
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d2642] mb-3">
              Start for{' '}
              <span className="relative inline-block">
                <span className="relative z-10">$6/mo</span>
                <span className="absolute bottom-0.5 left-0 right-0 h-2.5 rounded-full -z-0" style={{ background: 'rgba(155,125,212,0.25)' }} />
              </span>
            </h2>
            <p className="text-[#7a6f96] text-base font-body">No commitments. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.featured ? 'pricing-card-featured' : 'pricing-card'} p-7`}
              >
                {plan.featured && (
                  <div className="badge-accent inline-flex items-center gap-1.5 mb-4">
                    <Star className="w-2.5 h-2.5" />
                    Most Popular
                  </div>
                )}
                <p className="text-xs font-extrabold text-[#9a93b0] uppercase tracking-widest mb-1.5 font-body">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1.5">
                  <span className="font-display text-3xl font-bold text-[#2d2642]">{plan.price}</span>
                  <span className="text-[#7a6f96] text-sm mb-1 font-body">{plan.period}</span>
                </div>
                <p className="text-sm text-[#7a6f96] mb-5 font-body">{plan.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#2d2642]">
                      <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)', width: 18, height: 18 }}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-body">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-full text-sm font-bold transition-all duration-200 font-body ${
                    plan.featured ? 'btn-accent' : 'btn-primary'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 relative overflow-hidden grid-bg">
        <div className="relative z-10 max-w-2xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-[#2d2642] mb-2">
              Got questions?
            </h2>
            <p className="text-[#7a6f96] text-sm font-body">Everything you need to know.</p>
          </div>

          <div className="space-y-2.5">
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-[#2d2642] text-sm font-body">{item.q}</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all duration-200"
                    style={{
                      border: `2px solid ${openFaq === i ? '#9b7dd4' : '#d8ccea'}`,
                      background: openFaq === i ? '#f3eefa' : '#faf8ff',
                    }}
                  >
                    {openFaq === i
                      ? <Minus className="w-3 h-3 text-[#9b7dd4]" />
                      : <Plus className="w-3 h-3 text-[#9a93b0]" />
                    }
                  </div>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p className="px-5 pb-4 text-sm text-[#7a6f96] leading-relaxed font-body">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10" style={{ background: 'linear-gradient(145deg, #2d2642 0%, #1e1832 100%)' }}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(180,156,219,0.2)' }}>
                  <Wand2 className="w-3.5 h-3.5 text-[#b49cdb]" />
                </div>
                <span className="text-sm font-bold text-white font-display">DuoStyle</span>
              </div>
              <p className="text-xs font-body max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                AI-powered cinematic face fusions. Step inside your favorite movie moments.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: 'rgba(255,255,255,0.48)' }}>
                <Shield className="w-3 h-3 text-[#b49cdb]" />
                Your privacy is protected
              </div>
              <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.28)' }}>2025 DuoStyle. All rights reserved.</p>
              <div className="flex gap-5">
                <a href="#" className="text-xs font-body transition-colors hover:text-[#b49cdb]" style={{ color: 'rgba(255,255,255,0.38)' }}>Privacy</a>
                <a href="#" className="text-xs font-body transition-colors hover:text-[#b49cdb]" style={{ color: 'rgba(255,255,255,0.38)' }}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface StyleCardProps {
  style: typeof styles[0];
  isSelected: boolean;
  onClick: (id: string, jobs: ReferenceJob[]) => void;
}

function StyleCard({ style, isSelected, onClick }: StyleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = style.icon;

  const handleCardClick = () => {
    if (style.hasSubcategories) setExpanded((v) => !v);
    else onClick(style.id, style.referenceJobs);
  };

  return (
    <div
      className={`relative cursor-pointer ${isSelected ? 'scene-card-selected' : 'scene-card'}`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <img
          src={style.referenceJobs[0].image}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d2642]/65 via-[#2d2642]/10 to-transparent" />

        <div className="absolute top-2.5 right-2.5">
          <span className={`badge-tag border ${style.badgeColor}`}>
            {style.tag}
          </span>
        </div>

        {style.hasSubcategories && (
          <span className="absolute top-2.5 left-2.5 badge-tag bg-white/90 text-[#7a6f96] border border-[#e2daf0]">
            2 modes
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display font-bold text-white text-lg leading-tight drop-shadow-md">{style.name}</h3>
        </div>
      </div>

      <div className="p-3 bg-white rounded-b-[20px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #9b7dd4, #b49cdb)' }}>
              <Icon className="w-2.5 h-2.5 text-white" />
            </div>
            <p className="text-xs text-[#7a6f96] leading-snug font-body line-clamp-2">{style.description}</p>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {isSelected && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#8b6cc1' }}>
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
            {style.hasSubcategories && (
              <ChevronDown className={`w-3.5 h-3.5 text-[#9a93b0] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>

        {style.hasSubcategories && expanded && (
          <div className="mt-3 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-2.5 rounded-xl border-2 border-[#e2daf0] bg-[#faf8ff] hover:border-[#b49cdb] hover:bg-[#f3eefa] transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-base mb-0.5">&#x1F468;&#x200D;&#x1F3A8;</div>
              <p className="text-[11px] font-bold text-[#2d2642] font-body">Human</p>
              <p className="text-[10px] text-[#7a6f96] leading-snug font-body">Pixar-style</p>
            </button>
            <button
              className="p-2.5 rounded-xl border-2 border-[#e2daf0] bg-[#faf8ff] hover:border-[#b49cdb] hover:bg-[#f3eefa] transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-base mb-0.5">&#x1F98A;</div>
              <p className="text-[11px] font-bold text-[#2d2642] font-body">Animal</p>
              <p className="text-[10px] text-[#7a6f96] leading-snug font-body">Hybrid</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
