import { Sparkles, Star, Zap, Film, Heart, Wand2, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

export default function Home({ onStyleSelect }: HomeProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderScrolled(currentY > 40);
      if (currentY < lastScrollY.current || currentY < 80) {
        setHeaderVisible(true);
      } else if (currentY > lastScrollY.current && currentY > 120) {
        setHeaderVisible(false);
      }
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
    <div className="min-h-screen bg-white">

      {/* STICKY HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? 'bg-white/92 backdrop-blur-xl border-b border-purple-100/60 shadow-sm'
            : 'bg-transparent'
        } ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md shadow-purple-200/60">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">DuoStyle</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            <button onClick={() => scrollToSection('styles')} className="text-sm text-slate-500 hover:text-purple-600 transition-colors duration-200 font-medium">Styles</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-500 hover:text-purple-600 transition-colors duration-200 font-medium">Pricing</button>
          </nav>
          <button
            onClick={() => scrollToSection('styles')}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient pt-16">
        <div className="orb w-[520px] h-[520px] top-[-120px] left-[-140px]" style={{ background: 'radial-gradient(circle, rgba(253,164,175,0.4) 0%, transparent 70%)' }} />
        <div className="orb w-[420px] h-[420px] top-[40px] right-[-100px]" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.38) 0%, transparent 70%)' }} />
        <div className="orb w-[340px] h-[340px] bottom-[-80px] left-[35%]" style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 badge-pill mb-8 animate-fade-in">
            <Sparkles className="w-3 h-3 text-purple-500" />
            AI-Powered Face Transfer
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6 animate-slide-up">
            Step Inside{' '}
            <span className="text-gradient-primary">Iconic</span>
            <br />
            Movie Moments
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed mb-10 font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene — animated or live-action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => scrollToSection('styles')}
              className="btn-primary flex items-center gap-2 px-8 py-4 text-base shadow-xl"
            >
              <Zap className="w-4 h-4" />
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('styles')}
              className="btn-secondary flex items-center gap-2 px-8 py-4 text-base"
            >
              Browse Styles
            </button>
          </div>

          <div className="mt-16 flex justify-center gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            {styles.map((s, i) => (
              <div
                key={s.id}
                className={`rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${i === 1 ? '-mt-6 scale-110 z-10 shadow-2xl' : 'scale-100 opacity-75'}`}
                style={{ width: 96, height: 128 }}
              >
                <img src={s.referenceJobs[0].image} alt={s.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollToSection('styles')}
            className="mt-10 flex items-center gap-1 text-slate-400 hover:text-purple-500 transition-colors duration-200 mx-auto text-sm animate-float"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* STYLE CATEGORIES */}
      <section id="styles" className="py-24 bg-section-soft relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] top-[-60px] right-[-60px] opacity-50" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%)' }} />
        <div className="orb w-[280px] h-[280px] bottom-[-40px] left-[-40px] opacity-40" style={{ background: 'radial-gradient(circle, rgba(253,164,175,0.26) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="badge-pill inline-flex items-center gap-1.5 mb-4">
              <Film className="w-3 h-3" />
              Cinematic Styles
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Choose Your <span className="text-gradient-primary">Scene</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto font-light">
              Three iconic cinematic universes. Pick one and step inside.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="orb w-[400px] h-[400px] top-0 left-1/2 -translate-x-1/2 opacity-25" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)' }} />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={plan.featured ? 'pricing-card-featured p-8' : 'pricing-card p-8'}>
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

      {/* FOOTER */}
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
            <a href="#" className="text-xs text-slate-400 hover:text-purple-500 transition-colors duration-200">Privacy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-purple-500 transition-colors duration-200">Terms</a>
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
    if (style.hasSubcategories) {
      setExpanded((v) => !v);
    } else {
      onClick(style.id, style.referenceJobs);
    }
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected ? 'card-selected rounded-[20px]' : 'card-premium'
      }`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-[19px] aspect-[4/3]">
        <img
          src={style.referenceJobs[0].image}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badgeBg}`}>
          {style.tag}
        </span>
        {style.hasSubcategories && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-purple-700 border border-purple-200/50">
            2 modes
          </span>
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
