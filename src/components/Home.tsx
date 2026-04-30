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

/* Tiny inline SVG decorative elements */
function CurvedArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="52" height="36" viewBox="0 0 52 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 28 C12 8, 36 2, 46 14"
        stroke="#c4a8e8"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="animate-draw-arrow"
      />
      <path
        d="M43 10 L46 14 L41 16"
        stroke="#c4a8e8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function DoodleStar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2 L12.4 8.6 L19 11 L12.4 13.4 L11 20 L9.6 13.4 L3 11 L9.6 8.6 Z" stroke="#d4bef0" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DoodleCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="16" stroke="#e8d8f8" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
    </svg>
  );
}

function DoodleDots({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true">
      <circle cx="3" cy="6" r="2.5" fill="#d4bef0" opacity="0.7" />
      <circle cx="15" cy="6" r="2.5" fill="#e2c8f5" opacity="0.55" />
      <circle cx="27" cy="6" r="2.5" fill="#d4bef0" opacity="0.4" />
    </svg>
  );
}

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
    <div className="min-h-screen overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        headerScrolled
          ? 'border-b'
          : 'bg-transparent'
      } ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={headerScrolled ? {
          background: 'rgba(247,242,253,0.94)',
          backdropFilter: 'blur(18px)',
          borderColor: '#ece5f6',
          boxShadow: '0 1px 20px rgba(140,105,200,0.07)',
        } : {}}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', boxShadow: '0 3px 12px rgba(180,156,219,0.30)' }}>
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-[#3a2f52] tracking-tight font-display">DuoStyle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['How it works', 'Styles', 'Pricing'].map((label, i) => (
              <button
                key={label}
                onClick={() => scrollToSection(['how', 'styles', 'pricing'][i])}
                className="text-sm text-[#9080b0] hover:text-[#3a2f52] transition-colors duration-200 font-semibold font-body"
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
      <section className="relative overflow-visible pt-28 pb-12 hero-grid-bg">

        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.80)', border: '1.5px solid #e4d9f5', boxShadow: '0 2px 14px rgba(180,156,219,0.10)', backdropFilter: 'blur(8px)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4bef0, #e8d0f8)' }}>
                <Sparkles className="w-2.5 h-2.5 text-[#7a5fa0]" />
              </div>
              <span className="text-xs font-bold text-[#7a5fa0] font-body tracking-wide">AI-Powered Face Transfer</span>
            </div>
          </div>

          <div className="mb-5 animate-fade-up" style={{ animationDelay: '0.06s' }}>
            <h1 className="font-display text-[2.8rem] sm:text-[3.6rem] leading-[1.06] font-bold text-[#3a2f52] mb-4">
              Step Inside{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Iconic</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6 Q50 1 98 6" stroke="#d4bef0" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>{' '}Movie Moments
            </h1>
            <p className="text-sm sm:text-base text-[#9080b0] leading-relaxed max-w-lg mx-auto font-body">
              Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene.
            </p>
            <p className="font-handwrite text-[#b49cdb] text-lg mt-2">usually under a minute ✦</p>
          </div>

          <div className="flex justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => scrollToSection('styles')}
              className="btn-accent flex items-center gap-2 px-8 py-3.5 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how')}
              className="btn-secondary flex items-center gap-2 px-7 py-3.5 text-sm"
            >
              See how it works
            </button>
          </div>

          <div className="flex justify-center items-center gap-12 pt-6 animate-fade-up" style={{ animationDelay: '0.14s', borderTop: '1px dashed #ddd5ee' }}>
            {[
              { value: '9', label: 'Cinematic styles' },
              { value: '~60s', label: 'Generation time' },
              { value: 'HD', label: 'Output quality' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[#3a2f52] font-display">{value}</div>
                <div className="font-handwrite text-base text-[#b49cdb] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => scrollToSection('styles')}
            className="flex flex-col items-center gap-1 text-[#b49cdb] hover:text-[#3a2f52] transition-colors duration-200 animate-float"
          >
            <span className="font-handwrite text-sm">explore styles</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── SCROLLING GALLERY ── */}
      <ScrollingGallery onImageSelect={onImageSelect} />

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 relative overflow-hidden" style={{ background: 'rgba(250,246,255,0.55)', position: 'relative', zIndex: 1 }}>
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
            <div>
              <p className="section-eyebrow mb-1">the process</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3a2f52] leading-tight">
                Three steps to magic
              </h2>
            </div>
            <p className="text-[#9080b0] text-sm max-w-xs leading-relaxed md:text-right font-body">
              No editing skills required. Just upload two photos and let our AI do the work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Upload, step: '01', title: 'Upload Photos', desc: 'Upload one photo of the man and one of the woman. Clear face shots work best.', delay: '0s', iconBg: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', accentColor: '#d4bef0' },
              { icon: Film, step: '02', title: 'Choose a Scene', desc: 'Pick from Titanic, Euphoria, Zootopia, Tangled, Spider-Man, and more.', delay: '0.08s', iconBg: 'linear-gradient(135deg, #e2b8d8, #f0c8e4)', accentColor: '#f0c8e4' },
              { icon: Sparkles, step: '03', title: 'Generate & Download', desc: 'AI places both faces into the scene. Download your HD result in 60–80 seconds.', delay: '0.16s', iconBg: 'linear-gradient(135deg, #b8d8e8, #c8eaf4)', accentColor: '#c8eaf4' },
            ].map(({ icon: Icon, step, title, desc, delay, iconBg, accentColor }) => (
              <div
                key={step}
                className="step-card p-7 animate-slide-up relative group"
                style={{ animationDelay: delay }}
              >
                <div className="absolute top-5 right-5 font-display text-5xl font-bold leading-none select-none" style={{ color: accentColor, opacity: 0.6 }}>
                  {step}
                </div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: iconBg, boxShadow: `0 4px 14px ${accentColor}60` }}>
                  <Icon style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <h3 className="font-display font-bold text-[#3a2f52] text-lg mb-2">{title}</h3>
                <p className="text-sm text-[#9080b0] leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES / CATEGORIES ── */}
      <section id="styles" className="py-20 relative overflow-hidden" style={{ background: 'rgba(244,236,252,0.50)', position: 'relative', zIndex: 1 }}>

        {/* Decorative bg doodles */}
        <DoodleCircle className="absolute top-10 right-10 opacity-50 animate-spin-slow" />
        <DoodleStar className="absolute bottom-16 left-10 opacity-40 animate-wiggle" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-1">cinematic universes</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3a2f52] mb-3">
              Choose Your Style
            </h2>
            <p className="text-[#9080b0] text-sm max-w-xs mx-auto font-body leading-relaxed">
              Nine iconic worlds. Pick one, then choose a scene.
            </p>
          </div>

          {/* Category grid */}
          {!openCategory && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
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
                      onLoad={() => console.log('IMAGE PATH:', cat.cover)}
                      onError={() => console.warn('IMAGE LOAD ERROR:', cat.cover)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f52]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="category-tag">{cat.tag}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[#3a2f52] text-[11px] font-bold font-body px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(140,105,200,0.15)' }}>
                        <Sparkles className="w-3 h-3 text-[#b49cdb]" />
                        View Scenes
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-[12px] font-bold text-[#3a2f52] font-body">{cat.name}</p>
                    <p className="font-handwrite text-[13px] text-[#b49cdb] mt-0.5">3 scenes · {cat.tag}</p>
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
                className="flex items-center gap-2 text-sm font-bold font-body text-[#9080b0] hover:text-[#3a2f52] transition-colors duration-200 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                All styles
              </button>

              <div className="flex items-center gap-3 mb-7">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #c4a8e8, #e2b8d8)' }} />
                <div>
                  <h3 className="font-display font-bold text-[#3a2f52] text-xl">{activeCat.name}</h3>
                  <p className="font-handwrite text-[#b49cdb] text-base">{activeCat.description}</p>
                </div>
                <span className="category-tag ml-auto">{activeCat.tag}</span>
              </div>

              <div className="grid grid-cols-3 gap-5">
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
                        onLoad={() => console.log('IMAGE PATH:', ref.image)}
                        onError={() => console.warn('IMAGE LOAD ERROR:', ref.image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f52]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)' }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[#3a2f52] text-[11px] font-bold font-body px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                          <Sparkles className="w-3 h-3 text-[#b49cdb]" />
                          Select Scene
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-[12px] font-bold text-[#3a2f52] font-body">Scene {idx + 1}</p>
                      <p className="font-handwrite text-[13px] text-[#b49cdb] mt-0.5">tap to select ↗</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 relative overflow-hidden" style={{ background: 'rgba(250,246,255,0.55)', position: 'relative', zIndex: 1 }}>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-1">pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3a2f52] mb-3">
              Start for{' '}
              <span className="relative inline-block">
                <span className="relative z-10">$6/mo</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6 Q50 1 98 6" stroke="#d4bef0" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="font-handwrite text-[#b49cdb] text-lg">no commitments · cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.featured ? 'pricing-card-featured' : 'pricing-card'} p-8`}
              >
                {plan.featured && (
                  <div className="badge-accent inline-flex items-center gap-1.5 mb-5">
                    <Star className="w-2.5 h-2.5" />
                    Most Popular
                  </div>
                )}
                <p className="text-xs font-extrabold text-[#b49cdb] uppercase tracking-widest mb-2 font-body">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1.5">
                  <span className="font-display text-4xl font-bold text-[#3a2f52]">{plan.price}</span>
                  <span className="text-[#9080b0] text-sm mb-1.5 font-body">{plan.period}</span>
                </div>
                <p className="font-handwrite text-[#b49cdb] text-base mb-5">{plan.description}</p>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#3a2f52]">
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', width: 20, height: 20 }}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-body">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-full text-sm font-bold transition-all duration-200 font-body ${
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
      <section id="faq" className="py-20 relative overflow-hidden" style={{ background: 'transparent', position: 'relative', zIndex: 1 }}>
        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-1">questions</p>
            <h2 className="font-display text-3xl font-bold text-[#3a2f52] mb-2">
              Got questions?
            </h2>
            <p className="font-handwrite text-[#b49cdb] text-lg">we've got answers ↓</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-[#3a2f52] text-sm font-body pr-3">{item.q}</span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      background: openFaq === i ? 'linear-gradient(135deg, #c4a8e8, #d4bef0)' : 'rgba(248,244,255,0.9)',
                      border: `1.5px solid ${openFaq === i ? '#c4a8e8' : '#e4d9f5'}`,
                    }}
                  >
                    {openFaq === i
                      ? <Minus className="w-3 h-3 text-white" />
                      : <Plus className="w-3 h-3 text-[#b49cdb]" />
                    }
                  </div>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p className="px-6 pb-5 text-sm text-[#9080b0] leading-relaxed font-body">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 relative overflow-hidden" style={{ background: 'linear-gradient(155deg, #2e2346 0%, #1e1830 100%)' }}>
        {/* Soft blobs */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4a8e8, transparent)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 right-0 w-56 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #e2b8d8, transparent)', filter: 'blur(30px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(196,168,232,0.18)' }}>
                  <Wand2 className="w-3.5 h-3.5 text-[#c4a8e8]" />
                </div>
                <span className="text-sm font-bold text-white font-display">DuoStyle</span>
              </div>
              <p className="text-xs font-body max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.36)' }}>
                AI-powered cinematic face fusions. Step inside your favorite movie moments.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Shield className="w-3 h-3 text-[#c4a8e8]" />
                Your privacy is protected
              </div>
              <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.26)' }}>2025 DuoStyle. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-xs font-body transition-colors hover:text-[#c4a8e8]" style={{ color: 'rgba(255,255,255,0.36)' }}>Privacy</a>
                <a href="#" className="text-xs font-body transition-colors hover:text-[#c4a8e8]" style={{ color: 'rgba(255,255,255,0.36)' }}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
