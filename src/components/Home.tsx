import {
  Sparkles, Star, Wand2, ChevronDown, Check, ArrowRight, ArrowLeft,
  Upload, Film, Shield, Plus, Minus
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { categories, getRefsForCategory, type ReferenceItem } from '../data/references';
import ScrollingGallery from './ScrollingGallery';

interface HomeProps {
  onImageSelect: (ref: ReferenceItem) => void;
  initialCategory?: string | null;
}

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
  { q: 'What styles are available?', a: 'Titanic, Euphoria, Zootopia, Tangled, Spider-Man, Bridge to Terabithia, Cinderella, Stranger Things, and The End of the F***ing World -- with more coming soon.' },
  { q: 'How long does generation take?', a: 'Most fusions complete in 60–80 seconds. Usually under a minute.' },
  { q: 'Can I download my result?', a: 'Yes -- once generated you can download the full resolution image directly.' },
];

export default function Home({ onImageSelect, initialCategory }: HomeProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(initialCategory ?? null);
  const lastScrollY = useRef(0);
  const categoryRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (initialCategory) {
      setTimeout(() => {
        document.getElementById('styles')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [initialCategory]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (catId: string) => {
    if (openCategory === catId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(catId);
      setTimeout(() => {
        categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const activeCat = openCategory ? categories.find((c) => c.id === openCategory) : null;
  const activeRefs = openCategory ? getRefsForCategory(openCategory) : [];

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
      <section className="relative overflow-hidden pt-24 pb-8 hero-grid-bg">
        <div className="absolute top-20 left-[6%] w-2 h-2 rounded-full bg-[#d4e157] opacity-50 animate-pulse-soft" />
        <div className="absolute top-28 right-[6%] w-2.5 h-2.5 rounded-full bg-[#b49cdb] opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-16 left-[14%] w-2 h-2 rounded-full bg-[#deb8e6] opacity-35 animate-pulse-soft" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-5 lg:px-8 text-center">
          <div className="flex justify-center mb-4 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#d8ccea] bg-white/70 backdrop-blur-sm" style={{ boxShadow: '0 2px 12px rgba(120,90,180,0.08)' }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: '#d4e157' }}>
                <Sparkles className="w-3 h-3 text-[#2d2642]" />
              </div>
              <span className="text-xs font-extrabold text-[#2d2642] font-body tracking-wide uppercase">AI-Powered Face Transfer</span>
            </div>
          </div>

          <div className="mb-4 animate-fade-up" style={{ animationDelay: '0.06s' }}>
            <h1 className="font-display text-[2.6rem] sm:text-[3.4rem] leading-[1.08] font-bold text-[#2d2642] mb-3">
              Step Inside{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Iconic</span>
                <span className="absolute bottom-0.5 left-0 right-0 h-3 rounded-full -z-0" style={{ background: '#d4e157', opacity: 0.45 }} />
              </span>{' '}Movie Moments
            </h1>
            <p className="text-sm sm:text-base text-[#7a6f96] leading-relaxed max-w-lg mx-auto font-body">
              Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene -- usually under a minute.
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => scrollToSection('styles')}
              className="btn-accent flex items-center gap-2 px-7 py-3 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how')}
              className="btn-secondary flex items-center gap-2 px-7 py-3 text-sm"
            >
              See how it works
            </button>
          </div>

          <div className="flex justify-center items-center gap-10 pt-4 border-t-2 border-dashed border-[#d8ccea]/60 animate-fade-up" style={{ animationDelay: '0.14s' }}>
            {[
              { value: '9', label: 'Cinematic styles' },
              { value: '~60s', label: 'Generation time' },
              { value: 'HD', label: 'Output quality' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-[#2d2642] font-display">{value}</div>
                <div className="text-[11px] text-[#9a93b0] font-body">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <button
            onClick={() => scrollToSection('styles')}
            className="flex flex-col items-center gap-0 text-[#9a93b0] hover:text-[#2d2642] transition-colors duration-200 animate-float"
          >
            <span className="text-[9px] font-body tracking-widest uppercase font-bold">Explore Styles</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ── SCROLLING GALLERY ── */}
      <ScrollingGallery onImageSelect={onImageSelect} />

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-14 relative overflow-hidden grid-bg-warm">
        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Upload, step: '01', title: 'Upload Photos', desc: 'Upload one photo of the man and one of the woman. Clear face shots work best.', delay: '0s', iconBg: '#9b7dd4' },
              { icon: Film, step: '02', title: 'Choose a Scene', desc: 'Pick from Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and more.', delay: '0.08s', iconBg: '#c490d1' },
              { icon: Sparkles, step: '03', title: 'Generate & Download', desc: 'AI places both faces into the scene. Download your HD result in 60–80 seconds.', delay: '0.16s', iconBg: '#deb8e6' },
            ].map(({ icon: Icon, step, title, desc, delay, iconBg }) => (
              <div
                key={step}
                className="step-card p-5 animate-slide-up relative group"
                style={{ animationDelay: delay }}
              >
                <div className="absolute top-4 right-4 font-display text-4xl font-bold leading-none select-none" style={{ color: '#ece6f5' }}>
                  {step}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg }}>
                  <Icon style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
                <h3 className="font-display font-bold text-[#2d2642] text-base mb-1.5">{title}</h3>
                <p className="text-sm text-[#7a6f96] leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES / CATEGORIES ── */}
      <section id="styles" className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ede6f6 0%, #f0edf6 100%)' }}>
        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-eyebrow mb-2">Cinematic Universes</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d2642] mb-2">
              Choose Your Style
            </h2>
            <p className="text-[#7a6f96] text-sm max-w-sm mx-auto font-body">
              Nine iconic worlds. Pick one, then choose a scene.
            </p>
          </div>

          {/* Category grid */}
          {!openCategory && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="ref-card group text-left animate-scale-in focus:outline-none"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={cat.cover}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => console.warn('[Home] IMAGE LOAD ERROR:', cat.cover, 'category:', cat.id, e)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d2642]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="absolute top-2 left-2">
                      <span className="category-tag">{cat.tag}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 backdrop-blur-sm text-[#2d2642] text-[11px] font-extrabold font-body px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#9b7dd4]" />
                        View Scenes
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-[11px] font-bold text-[#2d2642] font-body">{cat.name}</p>
                    <p className="text-[10px] text-[#9a93b0] font-body mt-0.5">3 scenes · {cat.tag}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Open category detail */}
          {openCategory && activeCat && (
            <div ref={categoryRef} className="animate-fade-up">
              <button
                onClick={() => setOpenCategory(null)}
                className="flex items-center gap-2 text-sm font-bold font-body text-[#7a6f96] hover:text-[#2d2642] transition-colors duration-200 mb-5"
              >
                <ArrowLeft className="w-4 h-4" />
                All styles
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-8 rounded-full" style={{ background: '#d4e157' }} />
                <div>
                  <h3 className="font-display font-bold text-[#2d2642] text-xl">{activeCat.name}</h3>
                  <p className="text-xs text-[#7a6f96] font-body">{activeCat.description}</p>
                </div>
                <span className="category-tag ml-auto">{activeCat.tag}</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {activeRefs.map((ref, idx) => (
                  <button
                    key={ref.id}
                    onClick={() => onImageSelect(ref)}
                    className="ref-card group text-left animate-scale-in focus:outline-none"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={ref.image}
                        alt={`${ref.label} scene ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => console.warn('[Home] IMAGE LOAD ERROR:', ref.image, 'ref id:', ref.id, e)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2d2642]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-[#2d2642]" style={{ background: '#d4e157' }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white/90 backdrop-blur-sm text-[#2d2642] text-[11px] font-extrabold font-body px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#9b7dd4]" />
                          Select Scene
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white">
                      <p className="text-[11px] font-bold text-[#2d2642] font-body">Scene {idx + 1}</p>
                      <p className="text-[10px] text-[#9a93b0] font-body mt-0.5">Click to start</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-14 relative overflow-hidden grid-bg-warm">
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-eyebrow mb-2">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d2642] mb-3">
              Start for{' '}
              <span className="relative inline-block">
                <span className="relative z-10">$6/mo</span>
                <span className="absolute bottom-0.5 left-0 right-0 h-2.5 rounded-full -z-0" style={{ background: 'rgba(212,225,87,0.35)' }} />
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
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#d4e157', width: 18, height: 18 }}>
                        <Check className="w-2.5 h-2.5 text-[#2d2642]" strokeWidth={3} />
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
      <section id="faq" className="py-14 relative overflow-hidden grid-bg">
        <div className="relative z-10 max-w-2xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8">
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
                      border: `2px solid ${openFaq === i ? '#d4e157' : '#d8ccea'}`,
                      background: openFaq === i ? '#fafce8' : '#faf8ff',
                    }}
                  >
                    {openFaq === i
                      ? <Minus className="w-3 h-3 text-[#8b8a00]" />
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
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,225,87,0.2)' }}>
                  <Wand2 className="w-3.5 h-3.5 text-[#d4e157]" />
                </div>
                <span className="text-sm font-bold text-white font-display">DuoStyle</span>
              </div>
              <p className="text-xs font-body max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                AI-powered cinematic face fusions. Step inside your favorite movie moments.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: 'rgba(255,255,255,0.48)' }}>
                <Shield className="w-3 h-3 text-[#d4e157]" />
                Your privacy is protected
              </div>
              <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.28)' }}>2025 DuoStyle. All rights reserved.</p>
              <div className="flex gap-5">
                <a href="#" className="text-xs font-body transition-colors hover:text-[#d4e157]" style={{ color: 'rgba(255,255,255,0.38)' }}>Privacy</a>
                <a href="#" className="text-xs font-body transition-colors hover:text-[#d4e157]" style={{ color: 'rgba(255,255,255,0.38)' }}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
