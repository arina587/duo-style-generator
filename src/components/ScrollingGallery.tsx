import { useRef, useEffect, useState } from 'react';
import { references, type ReferenceItem } from '../data/references';

interface ScrollingGalleryProps {
  onImageSelect: (ref: ReferenceItem) => void;
}

export default function ScrollingGallery({ onImageSelect }: ScrollingGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate references for seamless infinite loop
  const allReferences = [...references, ...references];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Calculate animation duration based on content width
    const trackWidth = track.scrollWidth / 2;
    const duration = trackWidth / 50;

    // Set CSS variable for animation duration
    track.style.setProperty('--duration', `${duration}s`);

    // Handle pause/resume
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-12 scroll-gallery-wrapper">
      {/* Top fade overlay */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#ede6f6] via-[#ede6f6]/50 to-transparent z-10 pointer-events-none" />

      {/* Bottom fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f0edf6] via-[#f0edf6]/50 to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className={`flex gap-4 transition-transform duration-300 ease-out ${
          isPaused ? 'scroll-gallery-paused' : 'scroll-gallery-animated'
        }`}
        style={{
          willChange: 'transform',
        } as React.CSSProperties & { '--duration'?: string }}
      >
        {allReferences.map((ref, idx) => (
          <button
            key={`${ref.id}-${idx}`}
            onClick={() => onImageSelect(ref)}
            className="scroll-gallery-card group relative flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9b7dd4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ede6f6]"
          >
            <img
              src={ref.image}
              alt={ref.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d2642]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover label */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] sm:text-xs font-bold text-white text-center px-2">
                {ref.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Scroll hint text */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[10px] text-[#9a93b0] font-body pointer-events-none">
        Hover to pause
      </div>

      <style>{`
        @keyframes scroll-gallery {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50%));
          }
        }

        .scroll-gallery-animated {
          animation: scroll-gallery var(--duration, 40s) linear infinite;
        }

        .scroll-gallery-paused {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
