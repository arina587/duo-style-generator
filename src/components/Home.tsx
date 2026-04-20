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
    badgeBg: 'bg-emerald-50 text-emerald-700',
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
    badgeBg: 'bg-rose-50 text-rose-700',
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
    badgeBg: 'bg-sky-50 text-sky-700',
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
    badgeBg: 'bg-amber-50 text-amber-700',
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
    badgeBg: 'bg-red-50 text-red-700',
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
    badgeBg: 'bg-green-50 text-green-700',
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
  { q: 'What styles are available?', a: 'Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and Bridge to Terabithia — with more coming soon.' },
  { q: 'How long does generation take?', a: 'Most fusions complete in 30–90 seconds depending on server load.' },
  { q: 'Can I download my result?', a: 'Yes — once generated you can download the full resolution image directly.' },
];

const allCarouselImages = [
  { src: '/styles/titanic/ref1.jpg', alt: 'Titanic scene 1', offsetY: 0 },
  { src: '/styles/euphoria/ref1.jpg', alt: 'Euphoria scene 1', offsetY: 16 },
  { src: '/styles/zootopia/ref1.jpg', alt: 'Zootopia scene 1', offsetY: -8 },
  { src: '/styles/tangled/tangled1.jpg', alt: 'Tangled scene 1', offsetY: 12 },
  { src: '/styles/titanic/ref2.jpg', alt: 'Titanic scene 2', offsetY: 0 },
  { src: '/styles/euphoria/ref2.jpg', alt: 'Euphoria scene 2', offsetY: -16 },
  { src: '/styles/spiderman/spiderman1.jpg', alt: 'Spider-Man scene 1', offsetY: 8 },
  { src: '/styles/zootopia/ref2.jpg', alt: 'Zootopia scene 2', offsetY: 0 },
  { src: '/styles/terabithia/terabithia1.JPG', alt: 'Terabithia scene 1', offsetY: 20 },
  { src: '/styles/titanic/ref3.jpg', alt: 'Titanic scene 3', offsetY: -6 },
  { src: '/styles/euphoria/ref3.jpg', alt: 'Euphoria scene 3', offsetY: 10 },
  { src: '/styles/zootopia/ref3.jpg', alt: 'Zootopia scene 3', offsetY: 0 },
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
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#faf8f5' }}>

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        headerScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#ede8e0] shadow-sm'
          : 'bg-transparent'
      } ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-[#faf8f5]" />
            </div>
            <span className="text-base font-bold text-[#1a1a2e] tracking-tight font-body">DuoStyle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['How it works', 'Styles', 'Pricing'].map((label, i) => (
              <button
                key={label}
                onClick={() => scrollToSection(['how', 'styles', 'pricing'][i])}
                className="text-sm text-[#8a7f74] hover:text-[#1a1a2e] transition-colors duration-200 font-medium font-body tracking-wide"
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => scrollToSection('styles')}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-16" style={{
        background: 'linear-gradient(160deg, #faf8f5 0%, #f5ede0 45%, #faf8f5 100%)'
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(ellipse at 70% 30%, rgba(196,124,90,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, rgba(201,169,110,0.06) 0%, transparent 50%)`
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="max-w-lg animate-fade-up">
              <div className="inline-flex items-center gap-2 badge-pill mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c47c5a]" />
                AI-Powered Face Transfer
              </div>

              <h1 className="font-display text-[3.2rem] sm:text-[3.8rem] leading-[1.08] font-bold text-[#1a1a2e] mb-6">
                Step Inside<br />
                <em className="not-italic text-[#c47c5a]">Iconic</em> Movie<br />
                Moments
              </h1>

              <p className="text-base sm:text-lg text-[#8a7f74] leading-relaxed mb-9 font-light max-w-[400px]">
                Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene — in under 90 seconds.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => scrollToSection('styles')}
                  className="btn-accent flex items-center gap-2.5 px-7 py-3.5 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection('how')}
                  className="btn-secondary flex items-center gap-2.5 px-7 py-3.5 text-sm"
                >
                  See how it works
                </button>
              </div>

              <div className="flex items-center gap-6 mt-9 pt-8 border-t border-[#ede8e0]">
                {[
                  { value: '6', label: 'Cinematic styles' },
                  { value: '90s', label: 'Generation time' },
                  { value: 'HD', label: 'Output quality' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-xl font-bold text-[#1a1a2e] font-display">{value}</div>
                    <div className="text-xs text-[#8a7f74] font-body mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { src: '/styles/titanic/ref1.jpg', label: 'Titanic', delay: '0s' },
                  { src: '/styles/euphoria/ref1.jpg', label: 'Euphoria', delay: '0.1s' },
                  { src: '/styles/tangled/tangled1.jpg', label: 'Tangled', delay: '0.2s' },
                  { src: '/styles/spiderman/spiderman1.jpg', label: 'Spider-Man', delay: '0.3s' },
                ].map(({ src, label, delay }) => (
                  <div
                    key={label}
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] animate-scale-in group cursor-pointer"
                    style={{ animationDelay: delay }}
                    onClick={() => scrollToSection('styles')}
                  >
                    <img
                      src={src}
                      alt={label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-xs font-semibold font-body">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute -top-3 -right-3 w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white animate-float">
                <img src="/styles/zootopia/ref1.jpg" alt="Zootopia" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => scrollToSection('carousel')}
            className="flex flex-col items-center gap-1 text-[#8a7f74] hover:text-[#c47c5a] transition-colors duration-200 animate-float"
          >
            <span className="text-xs font-body tracking-widest uppercase font-semibold">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── CAROUSEL ── */}
      <section id="carousel" className="py-12 overflow-hidden" style={{ background: '#f2ede6' }}>
        <p className="text-center section-eyebrow mb-6">Sample outputs across all styles</p>
        <InfiniteCarousel images={allCarouselImages} />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24" style={{ background: '#ffffff' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <p className="section-eyebrow mb-3">Process</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a2e] leading-tight">
                Three steps<br />to magic
              </h2>
            </div>
            <p className="text-[#8a7f74] text-base max-w-xs leading-relaxed font-light md:text-right">
              No editing skills required. Just upload two photos and let our AI do the work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                step: '01',
                title: 'Upload Photos',
                desc: 'Upload one photo of the man and one of the woman. Clear face shots work best.',
                delay: '0s',
              },
              {
                icon: Film,
                step: '02',
                title: 'Choose a Scene',
                desc: 'Pick from Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and more. Select the exact reference frame you love.',
                delay: '0.1s',
              },
              {
                icon: Sparkles,
                step: '03',
                title: 'Generate & Download',
                desc: 'AI places both faces into the scene. Download your HD fusion in under 90 seconds.',
                delay: '0.2s',
              },
            ].map(({ icon: Icon, step, title, desc, delay }) => (
              <div
                key={step}
                className="step-card p-8 animate-slide-up relative group"
                style={{ animationDelay: delay }}
              >
                <div className="absolute top-6 right-6 font-display text-5xl font-bold text-[#f2ede6] leading-none select-none transition-colors duration-300 group-hover:text-[#ede8e0]">
                  {step}
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#1a1a2e] flex items-center justify-center mb-6">
                  <Icon className="w-4.5 h-4.5 text-[#faf8f5]" style={{ width: 18, height: 18 }} />
                </div>
                <h3 className="font-display font-bold text-[#1a1a2e] text-lg mb-3">{title}</h3>
                <p className="text-sm text-[#8a7f74] leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES GRID ── */}
      <section id="styles" className="py-24 relative" style={{ background: '#faf8f5' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-3">Cinematic Universes</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a2e] mb-5">
              Choose Your Scene
            </h2>
            <p className="text-[#8a7f74] text-lg max-w-sm mx-auto font-light">
              Six iconic worlds. One AI. Your faces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {styles.map((style, i) => (
              <div key={style.id} style={{ marginTop: i === 1 ? -16 : i === 4 ? -12 : 0 }}>
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

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-3">Pricing</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a2e] mb-4">
              Start for <span className="text-[#c47c5a]">$6/mo</span>
            </h2>
            <p className="text-[#8a7f74] text-lg font-light">No commitments. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-start">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.featured ? 'pricing-card-featured' : 'pricing-card'} p-8`}
                style={{ marginTop: plan.featured ? -12 : 0 }}
              >
                {plan.featured && (
                  <div className="badge-accent inline-flex items-center gap-1.5 mb-5">
                    <Star className="w-2.5 h-2.5" />
                    Most Popular
                  </div>
                )}
                <p className="text-xs font-bold text-[#8a7f74] uppercase tracking-widest mb-2 font-body">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-[#1a1a2e]">{plan.price}</span>
                  <span className="text-[#8a7f74] text-sm mb-1.5 font-body">{plan.period}</span>
                </div>
                <p className="text-sm text-[#8a7f74] mb-6 font-body">{plan.description}</p>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#4a4540]">
                      <div className="w-4 h-4 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#faf8f5]" strokeWidth={3} />
                      </div>
                      <span className="font-body">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 font-body ${
                    plan.featured ? 'btn-accent shadow-lg' : 'btn-primary'
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
      <section id="faq" className="py-24 relative" style={{ background: '#faf8f5' }}>
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">FAQ</p>
            <h2 className="font-display text-4xl font-bold text-[#1a1a2e] mb-3">
              Got questions?
            </h2>
            <p className="text-[#8a7f74] text-base font-light">Everything you need to know.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left py-5"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[#1a1a2e] text-sm font-body">{item.q}</span>
                  <div className="w-6 h-6 rounded-full border border-[#ede8e0] bg-[#faf8f5] flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-200" style={{
                    borderColor: openFaq === i ? '#c47c5a' : '#ede8e0',
                    background: openFaq === i ? '#f0d5c8' : '#faf8f5',
                  }}>
                    {openFaq === i
                      ? <Minus className="w-3 h-3 text-[#c47c5a]" />
                      : <Plus className="w-3 h-3 text-[#8a7f74]" />
                    }
                  </div>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p className="px-6 pb-5 text-sm text-[#8a7f74] leading-relaxed font-body">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a1a2e' }} className="py-14">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-xl bg-[#faf8f5]/10 flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5 text-[#faf8f5]" />
                </div>
                <span className="text-sm font-bold text-[#faf8f5] font-body">DuoStyle</span>
              </div>
              <p className="text-xs text-[#faf8f5]/40 font-body max-w-xs leading-relaxed">
                AI-powered cinematic face fusions. Step inside your favorite movie moments.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#faf8f5]/50 font-body">
                <Shield className="w-3 h-3 text-[#c47c5a]" />
                Your privacy is protected
              </div>
              <p className="text-xs text-[#faf8f5]/30 font-body">© 2025 DuoStyle. All rights reserved.</p>
              <div className="flex gap-5">
                <a href="#" className="text-xs text-[#faf8f5]/40 hover:text-[#c47c5a] transition-colors font-body">Privacy</a>
                <a href="#" className="text-xs text-[#faf8f5]/40 hover:text-[#c47c5a] transition-colors font-body">Terms</a>
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
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={style.referenceJobs[0].image}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badgeBg} font-body`}>
            {style.tag}
          </span>
        </div>

        {style.hasSubcategories && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-[#8a7f74] font-body">
            2 modes
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-xl leading-tight">{style.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
              <Icon className="w-2.5 h-2.5 text-[#faf8f5]" />
            </div>
            <p className="text-sm text-[#8a7f74] leading-snug font-body line-clamp-2 flex-1">{style.description}</p>
          </div>
          <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-[#c47c5a] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
            {style.hasSubcategories && (
              <ChevronDown className={`w-4 h-4 text-[#8a7f74] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>

        {style.hasSubcategories && expanded && (
          <div className="mt-4 grid grid-cols-2 gap-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-3 rounded-xl border border-[#ede8e0] bg-[#faf8f5] hover:border-[#c47c5a] hover:bg-[#fff9f6] transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-lg mb-1">👨‍🎨</div>
              <p className="text-xs font-bold text-[#1a1a2e] font-body">Human</p>
              <p className="text-xs text-[#8a7f74] mt-0.5 leading-snug font-body">Pixar-style characters</p>
            </button>
            <button
              className="p-3 rounded-xl border border-[#ede8e0] bg-[#faf8f5] hover:border-[#c47c5a] hover:bg-[#fff9f6] transition-all duration-200 text-left"
              onClick={() => onClick(style.id, style.referenceJobs)}
            >
              <div className="text-lg mb-1">🦊</div>
              <p className="text-xs font-bold text-[#1a1a2e] font-body">Animal</p>
              <p className="text-xs text-[#8a7f74] mt-0.5 leading-snug font-body">Hybrid animal-inspired</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
