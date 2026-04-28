import { useRef, useState } from 'react';
import { references, type ReferenceItem } from '../data/references';

interface ScrollingGalleryProps {
  onImageSelect: (ref: ReferenceItem) => void;
}

export default function ScrollingGallery({ onImageSelect }: ScrollingGalleryProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate for seamless infinite loop — translateX(-50%) resets seamlessly
  const allRefs = [...references, ...references];

  return (
    <div className="relative w-full py-10 scroll-gallery-section">
      {/* Left/right edge fades */}
      <div className="absolute top-0 bottom-0 left-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #ede6f6 0%, transparent 100%)' }} />
      <div className="absolute top-0 bottom-0 right-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, #f0edf6 0%, transparent 100%)' }} />

      {/* Scrollable wrapper — overflow-x:auto enables manual scroll */}
      <div
        ref={wrapperRef}
        className="scroll-gallery-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`scroll-gallery-track${isPaused ? ' paused' : ''}`}>
          {allRefs.map((ref, idx) => {
            const key = `${ref.id}-${idx < references.length ? 'a' : 'b'}`;
            return (
              <button
                key={key}
                onClick={() => onImageSelect(ref)}
                className="scroll-gallery-card group"
                aria-label={`Select ${ref.label} scene`}
              >
                <img
                  src={ref.image}
                  alt={ref.label}
                  loading="lazy"
                  onError={(e) => {
                    console.warn('[Gallery] Missing image:', ref.image, '| ref id:', ref.id);
                    (e.target as HTMLImageElement).style.opacity = '0.15';
                  }}
                />
                <div className="scroll-gallery-overlay">
                  <span>{ref.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .scroll-gallery-wrapper {
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
        }
        .scroll-gallery-wrapper::-webkit-scrollbar { display: none; }
        .scroll-gallery-wrapper:active { cursor: grabbing; }

        @keyframes sg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .scroll-gallery-track {
          display: flex;
          gap: 14px;
          padding: 8px 8px;
          width: max-content;
          animation: sg-scroll 12s linear infinite;
          will-change: transform;
        }
        .scroll-gallery-track.paused {
          animation-play-state: paused;
        }

        .scroll-gallery-card {
          position: relative;
          flex-shrink: 0;
          width: 136px;
          height: 136px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(216, 202, 234, 0.5);
          box-shadow: 0 4px 12px rgba(120, 90, 180, 0.08);
          background: #e2daf0;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .scroll-gallery-card:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 24px rgba(120, 90, 180, 0.2);
          border-color: rgba(180, 156, 219, 0.75);
        }
        .scroll-gallery-card:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(155, 125, 212, 0.55), 0 8px 22px rgba(120, 90, 180, 0.15);
        }
        .scroll-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .scroll-gallery-card:hover img {
          transform: scale(1.07);
        }
        .scroll-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(45, 38, 66, 0.68) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .scroll-gallery-card:hover .scroll-gallery-overlay {
          opacity: 1;
        }
        .scroll-gallery-overlay span {
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .scroll-gallery-card {
            width: 156px;
            height: 156px;
          }
        }
      `}</style>
    </div>
  );
}
