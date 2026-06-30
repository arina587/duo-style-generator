import { useRef, useState, useMemo } from 'react';
import { references, type ReferenceItem } from '../data/references';

interface ScrollingGalleryProps {
  onImageSelect: (ref: ReferenceItem) => void;
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ScrollingGallery({ onImageSelect }: ScrollingGalleryProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Shuffle once per mount, then duplicate for seamless infinite loop
  const shuffled = useMemo(() => fisherYates(references), []);
  const allRefs = [...shuffled, ...shuffled];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
    >
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
                  onLoad={() => console.log('IMAGE PATH:', ref.image)}
                  onError={(e) => {
                    console.warn('IMAGE LOAD ERROR:', ref.image);
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
        /* ── Wrapper ── */
        .scroll-gallery-wrapper {
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
          padding: 12px 0;
        }
        .scroll-gallery-wrapper::-webkit-scrollbar { display: none; }
        .scroll-gallery-wrapper:active { cursor: grabbing; }

        @keyframes sg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .scroll-gallery-track {
          display: flex;
          gap: 10px;
          padding: 4px 0;
          width: max-content;
          animation: sg-scroll 60s linear infinite;
          will-change: transform;
          align-items: center;
        }
        .scroll-gallery-track.paused {
          animation-play-state: paused;
        }

        /* ── Floating card ── */
        .scroll-gallery-card {
          position: relative;
          flex-shrink: 0;
          width: 150px;
          height: 190px;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          background: #1a1030;
          border: none;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.22),
            0 1px 4px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.06);
          transition:
            transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.3s ease;
          outline: none;
        }
        .scroll-gallery-card:hover {
          transform: scale(1.05) translateY(-4px);
          box-shadow:
            0 16px 40px rgba(155, 125, 212, 0.24),
            0 6px 14px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(180, 156, 219, 0.35);
          z-index: 2;
        }
        .scroll-gallery-card:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px rgba(155, 125, 212, 0.75),
            0 10px 28px rgba(0, 0, 0, 0.28);
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

        /* ── Hover label overlay ── */
        .scroll-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.68) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 10px 8px;
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
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }

        @media (min-width: 640px) {
          .scroll-gallery-card {
            width: 174px;
            height: 216px;
          }
        }
      `}</style>
    </div>
  );
}
