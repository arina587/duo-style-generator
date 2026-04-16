import {
  Sparkles, Star, Zap, Film, Heart, Wand2, ChevronDown, Check, ArrowRight,
  Upload, Shield, Lock, Eye, Plus, Minus
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
        image: '/styles/zootopia/ref1.jpg',
        prompt: 'Use image 1 as exact reference. Do not change composition, pose, camera angle, gaze or expressions.\nKeep characters as animals. Do NOT convert them into humans. Do NOT introduce realistic human skin or facial structure.\nApply only very subtle stylistic influence inspired by the uploaded images:\n- general mood\n- slight tone variation\n- personality feel\nPreserve original character design, proportions and expressions exactly.\nMaintain clean Pixar/Disney 3D style:\nsmooth shading, soft lighting, no realism.\nFinal result must look like the same animated frame with minimal stylistic variation.',
        humanPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and facial expressions.\nReplace the animal characters with the uploaded man and woman in the exact same positions:\n- man on the left\n- woman on the right\nSTRICTLY preserve identity of the uploaded people:\nsame facial features, proportions, skin tone, hairstyle and overall likeness. No distortion, no smoothing, no beauty filters.\nTransform the result into a stylized Pixar/Disney 3D animated look:\nclean CGI, soft shading, slightly stylized proportions, expressive eyes, polished animated finish.\nMatch expressions exactly:\n- left character relaxed with slightly narrowed eyes\n- right character smiling with wide bright eyes\nBackground must remain plain white exactly like the reference. No changes.\nFinal result must look like the real people recreated as Pixar-style characters in the exact same selfie pose.",
        animalPrompt: "Use image 1 as the exact base reference. Strictly preserve the original selfie composition, camera angle, framing, pose, head positions, gaze direction and expressions.\nCreate stylized human characters based on the uploaded man and woman in the same positions (left/right), but with subtle, cute animal-inspired elements.\nPreserve identity clearly:\nrecognizable faces, proportions, hairstyle direction and overall likeness of the uploaded people.\nAdd soft animal-inspired features in a stylish, non-realistic way:\n- for the man (left): small soft fox ears, slightly warm fox-like color accents, subtle playful fox character vibe\n- for the woman (right): elegant soft bunny ears, gentle cute styling, slightly softer and sweeter expression energy\nIMPORTANT:\nkeep them clearly human — no fur, no animal faces, no realistic hybrid anatomy, no creepy results.\nRender in high-quality Pixar/Disney 3D style:\nsmooth shading, soft lighting, clean CGI, expressive eyes.\nBackground must remain plain white exactly like the reference. No scene changes.\nFinal result must look like a cute animated selfie of the real couple with subtle fox and bunny-inspired traits.\nGoal:\nHuman mode = clean Pixar-style people replacement.\nAnimal mode = same people + subtle cute animal-inspired elements, not full animals.",
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
    icon: Star,
    gradient: 'from-emerald-400 to-teal-400',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    hasSubcategories: true,
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Bold cinematic drama with vibrant neon aesthetics',
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
    icon: Film,
    gradient: 'from-pink-400 to-rose-400',
    badgeBg: 'bg-pink-100 text-pink-700',
    hasSubcategories: false,
  },
  {
    id: 'titanic',
    name: 'Titanic',
    description: 'Timeless cinematic romance with golden hour warmth',
    referenceJobs: [
      {
        image: '/styles/titanic/ref1.jpg',
        prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nstrictly preserve the exact pose — the woman standing in front with arms extended sideways, the man behind her holding her at the waist.\n\nPreserve:\n- arm positions (fully extended horizontally)\n- body alignment\n- distance between bodies\n- head tilt and direction\n- railing position and framing\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — same face, proportions, skin texture. No smoothing, no distortion.\n\nLighting:\nwarm sunset cinematic lighting. Preserve original color and glow exactly.\n\nBackground:\nSTRICTLY keep the ship deck, sky, horizon and lighting exactly as in the reference.\n\nDo NOT change composition or perspective.\n\nFinal result must look identical to the original scene with only identities replaced.',
      },
      {
        image: '/styles/titanic/ref2.jpg',
        prompt: 'Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same water surface, same reflections, same composition, same crop, same body positions, same distance between the two characters, same head angles, same gaze directions.\n\nDo NOT redraw or reinterpret the scene. Do NOT restage anything.\n\nIntegrate the uploaded man and woman into the exact existing shot.\n\nThis is a difficult low-light close-contact scene. Preserve the original pose and limited visibility exactly:\n- the man\'s face remains partially visible and angled downward\n- do not rotate his head toward camera\n- do not reveal hidden parts of his face\n- do not reconstruct a more frontal face\n- keep the original proximity between faces\n- keep the original emotional tension\n\nPreserve identity of both people where visible:\nsame recognizable facial structure, eye area, nose shape, lips, proportions, and natural human skin character.\n\nIMPORTANT FOR SKIN:\nkeep natural human skin tones.\nDo NOT turn skin strongly blue.\nUse only a mild cold ambient tint from the scene.\nFace, neck and visible skin must stay naturally matched with no blue cast and no pasted look.\n\nIMPORTANT FOR GAZE AND ANGLES:\nkeep the exact original head angle\nkeep the exact original gaze direction\ndo not correct or stylize the eyes\ndo not change visibility of either face\n\nPreserve natural cinematic softness, darkness, reflections and slight blur from the original frame.\n\nFinal result must look like the same original Titanic frame, with the uploaded man and woman naturally integrated, correct head angles, correct gaze, and natural skin tone.',
      },
      {
        image: '/styles/titanic/ref3.jpg',
        prompt: 'Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same ship, same sky, same sunset lighting, same composition, same crop, same body positions, same hand placement, same distance between the faces.\nDo NOT redraw or reinterpret the scene.\nPreserve the exact pose:\n- the man stands behind the woman, holding her at the waist\n- their bodies lean toward each other\n- the distance between their faces remains extremely close\nCRITICAL GAZE AND HEAD POSITION:\nthe woman\'s head must remain turned toward the man exactly like in the reference.\nher gaze must stay directed toward him.\ndo NOT turn her head away.\ndo NOT redirect her eyes.\ndo NOT reduce the intimacy of the pose.\nIMPORTANT:\nthis is a close emotional moment — preserve closeness without exaggeration or avoidance.\nFor the man:\nkeep his head angle, position and proximity exactly as in the reference.\nhis face must be recognizable but follow the original angle and lighting.\nIDENTITY:\npreserve both identities naturally — same facial structure, proportions, features.\nSKIN TONE:\nkeep natural human skin tones with warm sunset lighting.\nno mismatch between face, neck and body.\nLIGHTING:\npreserve original warm cinematic sunset tones exactly.\nDo NOT change:\n- pose\n- gaze\n- distance between faces\n- background\n- camera angle\nFinal result must look like the same original Titanic frame, with correct gaze direction, preserved intimacy, and natural identity integration.\nGoal:\nfix gaze deviation in referenceJobs[8] and stabilize hand placement in referenceJobs[0] without affecting anything else.',
      },
    ],
    tag: 'Romance',
    icon: Heart,
    gradient: 'from-sky-400 to-blue-400',
    badgeBg: 'bg-sky-100 text-sky-700',
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
  { q: 'What styles are available?', a: 'Currently: Titanic (romance), Euphoria (cinematic drama), and Zootopia (animated — human or animal mode).' },
  { q: 'How long does generation take?', a: 'Most fusions complete in 30–90 seconds depending on server load.' },
  { q: 'Can I download my result?', a: 'Yes — once generated you can download the full resolution image directly.' },
];

const allCarouselImages = [
  { src: '/styles/titanic/ref1.jpg', alt: 'Titanic scene 1', offsetY: 0 },
  { src: '/styles/euphoria/ref1.jpg', alt: 'Euphoria scene 1', offsetY: 16 },
  { src: '/styles/zootopia/ref1.jpg', alt: 'Zootopia scene 1', offsetY: -8 },
  { src: '/styles/titanic/ref2.jpg', alt: 'Titanic scene 2', offsetY: 12 },
  { src: '/styles/euphoria/ref2.jpg', alt: 'Euphoria scene 2', offsetY: 0 },
  { src: '/styles/zootopia/ref2.jpg', alt: 'Zootopia scene 2', offsetY: -16 },
  { src: '/styles/titanic/ref3.jpg', alt: 'Titanic scene 3', offsetY: 8 },
  { src: '/styles/euphoria/ref3.jpg', alt: 'Euphoria scene 3', offsetY: 0 },
  { src: '/styles/zootopia/ref3.jpg', alt: 'Zootopia scene 3', offsetY: 20 },
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
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── STICKY HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerScrolled ? 'bg-white/92 backdrop-blur-xl border-b border-purple-100/50 shadow-sm' : 'bg-transparent'} ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md shadow-purple-200/60">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">DuoStyle</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            <button onClick={() => scrollToSection('how')} className="text-sm text-slate-500 hover:text-purple-600 transition-colors font-medium">How it works</button>
            <button onClick={() => scrollToSection('styles')} className="text-sm text-slate-500 hover:text-purple-600 transition-colors font-medium">Styles</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-500 hover:text-purple-600 transition-colors font-medium">Pricing</button>
          </nav>
          <button onClick={() => scrollToSection('styles')} className="btn-primary px-5 py-2.5 text-sm">Get Started</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient pt-16">
        {/* Orb blobs */}
        <div className="orb w-[580px] h-[580px] top-[-150px] left-[-160px]" style={{ background: 'radial-gradient(circle, rgba(253,164,175,0.42) 0%, transparent 70%)' }} />
        <div className="orb w-[450px] h-[450px] top-[30px] right-[-120px]" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.4) 0%, transparent 70%)' }} />
        <div className="orb w-[380px] h-[380px] bottom-[-100px] left-[30%]" style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.34) 0%, transparent 70%)' }} />
        <div className="orb w-[220px] h-[220px] bottom-[80px] right-[8%]" style={{ background: 'radial-gradient(circle, rgba(253,186,116,0.28) 0%, transparent 70%)' }} />

        {/* Decorative stars */}
        <div className="deco-star animate-twinkle" style={{ top: '12%', left: '14%', width: 8, height: 8, background: '#a855f7', borderRadius: '50%', animationDelay: '0s' }} />
        <div className="deco-star animate-twinkle" style={{ top: '18%', right: '18%', width: 6, height: 6, background: '#ec4899', borderRadius: '50%', animationDelay: '0.8s' }} />
        <div className="deco-star animate-twinkle" style={{ top: '60%', left: '8%', width: 5, height: 5, background: '#7dd3fc', borderRadius: '50%', animationDelay: '1.5s' }} />
        <div className="deco-star animate-twinkle" style={{ bottom: '20%', right: '12%', width: 7, height: 7, background: '#c084fc', borderRadius: '50%', animationDelay: '2.1s' }} />
        <div className="deco-star animate-twinkle" style={{ top: '40%', right: '5%', width: 4, height: 4, background: '#f9a8d4', borderRadius: '50%', animationDelay: '0.4s' }} />

        {/* Ring decoration */}
        <div className="absolute top-[10%] right-[10%] w-32 h-32 rounded-full border border-purple-200/40 animate-spin-slow opacity-40" />
        <div className="absolute bottom-[15%] left-[6%] w-20 h-20 rounded-full border border-pink-200/50 animate-spin-slow opacity-30" style={{ animationDirection: 'reverse' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 badge-pill mb-8 animate-fade-in">
            <Sparkles className="w-3 h-3 text-purple-500" />
            AI-Powered Face Transfer
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.06] mb-6 animate-slide-up">
            Step Inside{' '}
            <span className="text-gradient-primary">Iconic</span>
            <br />
            Movie Moments
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed mb-10 font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => scrollToSection('styles')} className="btn-primary flex items-center gap-2 px-8 py-4 text-base shadow-xl">
              <Zap className="w-4 h-4" />
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => scrollToSection('how')} className="btn-secondary flex items-center gap-2 px-8 py-4 text-base">
              How it works
            </button>
          </div>

          <button onClick={() => scrollToSection('carousel')} className="mt-12 flex items-center gap-1 text-slate-400 hover:text-purple-500 transition-colors mx-auto text-sm animate-float">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── INFINITE CAROUSEL ── */}
      <section id="carousel" className="py-12 bg-section-soft relative overflow-hidden">
        <div className="orb w-[300px] h-[300px] top-[-40px] left-[20%] opacity-30" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.25) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Sample outputs across all styles</p>
          <InfiniteCarousel images={allCarouselImages} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 bg-white relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] top-0 right-[-60px] opacity-20" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)' }} />
        <div className="deco-star animate-twinkle" style={{ top: '15%', left: '5%', width: 6, height: 6, background: '#c084fc', borderRadius: '50%', animationDelay: '1s' }} />
        <div className="deco-star animate-twinkle" style={{ bottom: '15%', right: '8%', width: 5, height: 5, background: '#f9a8d4', borderRadius: '50%', animationDelay: '1.8s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="badge-pill inline-flex items-center gap-1.5 mb-4">
              <Sparkles className="w-3 h-3" />
              Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Three steps to <span className="text-gradient-primary">magic</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto font-light">No editing skills required. Just photos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                step: '01',
                title: 'Upload Photos',
                desc: 'Upload one photo of the man and one of the woman. Clear face shots work best.',
                color: 'from-purple-400 to-pink-400',
                bg: 'from-purple-50 to-pink-50',
                delay: '0s',
              },
              {
                icon: Film,
                step: '02',
                title: 'Choose a Scene',
                desc: 'Pick from Titanic, Euphoria, or Zootopia. Select the exact reference frame you love.',
                color: 'from-pink-400 to-rose-400',
                bg: 'from-pink-50 to-rose-50',
                delay: '0.1s',
              },
              {
                icon: Sparkles,
                step: '03',
                title: 'Generate & Download',
                desc: 'AI places both faces into the scene. Download your HD fusion in under 90 seconds.',
                color: 'from-sky-400 to-blue-400',
                bg: 'from-sky-50 to-blue-50',
                delay: '0.2s',
              },
            ].map(({ icon: Icon, step, title, desc, color, bg, delay }) => (
              <div key={step} className="step-card p-7 animate-slide-up relative" style={{ animationDelay: delay }}>
                <div className="absolute top-5 right-5 text-xs font-black text-slate-200 text-4xl leading-none">{step}</div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bg} border border-white flex items-center justify-center mb-5 shadow-sm`}>
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLE CATEGORIES ── */}
      <section id="styles" className="py-24 bg-section-soft relative overflow-hidden">
        <div className="orb w-[380px] h-[380px] top-[-70px] right-[-70px] opacity-45" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%)' }} />
        <div className="orb w-[300px] h-[300px] bottom-[-50px] left-[-50px] opacity-35" style={{ background: 'radial-gradient(circle, rgba(253,164,175,0.26) 0%, transparent 70%)' }} />
        <div className="absolute top-[8%] right-[15%] w-40 h-40 rounded-full border border-purple-100/50 animate-spin-slow opacity-30" />

        <div className="deco-star animate-twinkle" style={{ top: '10%', left: '3%', width: 7, height: 7, background: '#a855f7', borderRadius: '50%', animationDelay: '0.3s' }} />
        <div className="deco-star animate-twinkle" style={{ bottom: '12%', right: '4%', width: 5, height: 5, background: '#ec4899', borderRadius: '50%', animationDelay: '1.2s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="badge-pill inline-flex items-center gap-1.5 mb-4">
              <Film className="w-3 h-3" />
              Cinematic Styles
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Choose Your <span className="text-gradient-primary">Scene</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto font-light">Three iconic cinematic universes. Pick one and step inside.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {styles.map((style, i) => (
              <div key={style.id} style={{ marginTop: i === 1 ? -16 : 0 }}>
                <StyleCard
                  style={style}
                  isSelected={selectedStyle === style.id}
                  onClick={handleStyleClick}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="orb w-[260px] h-[260px] top-0 left-1/2 -translate-x-1/2 opacity-20" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Your privacy is protected</h2>
            <p className="text-slate-400 text-sm">We treat your photos with care — always.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Private by default', desc: 'Your photos are never shared, sold, or stored beyond the generation session.' },
              { icon: Lock, title: 'Secure processing', desc: 'All data is encrypted in transit and at rest using industry-standard protocols.' },
              { icon: Eye, title: 'No AI training', desc: 'We never use your uploaded photos to train or fine-tune any AI model.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="trust-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-section-soft relative overflow-hidden">
        <div className="orb w-[420px] h-[420px] top-[-30px] left-1/2 -translate-x-1/2 opacity-22" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.28) 0%, transparent 70%)' }} />
        <div className="deco-star animate-twinkle" style={{ top: '8%', left: '8%', width: 6, height: 6, background: '#c084fc', borderRadius: '50%', animationDelay: '0.6s' }} />
        <div className="deco-star animate-twinkle" style={{ bottom: '10%', right: '10%', width: 5, height: 5, background: '#f9a8d4', borderRadius: '50%', animationDelay: '1.4s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="badge-pill inline-flex items-center gap-1.5 mb-4">
              <Star className="w-3 h-3" />
              Simple Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Start for <span className="text-gradient-primary">$6/mo</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto font-light">No commitments. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <div key={plan.name} className={`${plan.featured ? 'pricing-card-featured' : 'pricing-card'} p-8`} style={{ marginTop: plan.featured ? -12 : 0 }}>
                {plan.featured && (
                  <div className="badge-pill inline-flex items-center gap-1.5 mb-5 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200/70 text-purple-700">
                    <Star className="w-2.5 h-2.5" />
                    Most Popular
                  </div>
                )}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${plan.featured ? 'btn-primary shadow-lg' : 'btn-secondary'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white relative overflow-hidden">
        <div className="orb w-[280px] h-[280px] bottom-0 left-[-40px] opacity-18" style={{ background: 'radial-gradient(circle, rgba(253,164,175,0.25) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="badge-pill inline-flex items-center gap-1.5 mb-4">
              <Sparkles className="w-3 h-3" />
              FAQ
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Got questions?
            </h2>
            <p className="text-slate-400 text-base font-light">Everything you need to know.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-800 text-sm">{item.q}</span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 ml-4">
                    {openFaq === i
                      ? <Minus className="w-3 h-3 text-purple-500" />
                      : <Plus className="w-3 h-3 text-purple-500" />
                    }
                  </div>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-purple-100/50 py-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">DuoStyle</span>
          </div>
          <p className="text-xs text-slate-400">© 2025 DuoStyle. AI-powered cinematic fusions.</p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-slate-400 hover:text-purple-500 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-purple-500 transition-colors">Terms</a>
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
      className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? 'card-selected rounded-[20px]' : 'card-premium'}`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-[19px] aspect-[4/3]">
        <img
          src={style.referenceJobs[0].image}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badgeBg}`}>{style.tag}</span>
        {style.hasSubcategories && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-purple-700 border border-purple-200/50">2 modes</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{style.name}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
            {style.hasSubcategories && (
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{style.description}</p>

        {style.hasSubcategories && expanded && (
          <div className="mt-4 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-3.5 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/50 transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-xl mb-1.5">👨‍🎨</div>
              <p className="text-xs font-bold text-slate-800">Human</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">Pixar-style characters</p>
            </button>
            <button
              className="p-3.5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50 transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-xl mb-1.5">🦊</div>
              <p className="text-xs font-bold text-slate-800">Animal</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">Hybrid animal-inspired</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
