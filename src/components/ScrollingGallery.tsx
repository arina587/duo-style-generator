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

// Repeating SVG sprocket holes for top/bottom edges
function SprocketRow() {
  // One hole unit: 28px wide, centred in a 36px cell
  const holeW = 18;
  const holeH = 14;
  const cellW = 36;
  const rowH = 20;
  const count = 120; // enough to cover any viewport at any scroll position
  const totalW = cellW * count;

  return (
    <svg
      width={totalW}
      height={rowH}
      viewBox={`0 0 ${totalW} ${rowH}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', minWidth: '100%' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={i * cellW + (cellW - holeW) / 2}
          y={(rowH - holeH) / 2}
          width={holeW}
          height={holeH}
          rx={3}
          ry={3}
          fill="#1a1a1a"
        />
      ))}
    </svg>
  );
}

export default function ScrollingGallery({ onImageSelect }: ScrollingGalleryProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Shuffle once per mount, then duplicate for seamless infinite loop
  const shuffled = useMemo(() => fisherYates(references), []);
  const allRefs = [...shuffled, ...shuffled];

  return (
    <div className="relative w-full film-strip-section">
      {/* ── Film strip body ── */}
      <div className="film-strip-body">

        {/* Top sprocket row */}
        <div className="film-sprocket film-sprocket-top">
          <SprocketRow />
        </div>

        {/* Left/right edge fades — sit above the track, below sprockets */}
        <div className="film-edge-fade film-edge-fade-left" />
        <div className="film-edge-fade film-edge-fade-right" />

        {/* Scrollable wrapper */}
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

        {/* Bottom sprocket row */}
        <div className="film-sprocket film-sprocket-bottom">
          <SprocketRow />
        </div>
      </div>

      <style>{`
        /* ── Film strip container ── */
        .film-strip-section {
          padding: 0;
          overflow: hidden;
        }
        .film-strip-body {
          position: relative;
          background: #111;
          border-top: 3px solid #000;
          border-bottom: 3px solid #000;
        }

        /* ── Sprocket rows ── */
        .film-sprocket {
          background: #2a2a2a;
          overflow: hidden;
          line-height: 0;
          height: 22px;
        }
        .film-sprocket svg rect {
          fill: #111;
        }

        /* ── Edge fades ── */
        .film-edge-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 10;
          pointer-events: none;
        }
        .film-edge-fade-left  { left: 0;  background: linear-gradient(90deg,  #111 0%, transparent 100%); }
        .film-edge-fade-right { right: 0; background: linear-gradient(270deg, #111 0%, transparent 100%); }

        /* ── Scrollable strip ── */
        .scroll-gallery-wrapper {
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
          background: #111;
        }
        .scroll-gallery-wrapper::-webkit-scrollbar { display: none; }
        .scroll-gallery-wrapper:active { cursor: grabbing; }

        @keyframes sg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .scroll-gallery-track {
          display: flex;
          gap: 6px;
          padding: 8px 8px;
          width: max-content;
          animation: sg-scroll 60s linear infinite;
          will-change: transform;
          background: #111;
          align-items: center;
        }
        .scroll-gallery-track.paused {
          animation-play-state: paused;
        }

        /* ── Film frame card ── */
        .scroll-gallery-card {
          position: relative;
          flex-shrink: 0;
          width: 150px;
          height: 190px;
          border-radius: 0;
          overflow: hidden;
          cursor: pointer;
          border: 4px solid #222;
          box-shadow: inset 0 0 0 1px #444;
          background: #1a1a1a;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.3s ease;
          outline: none;
        }
        .scroll-gallery-card:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 22px rgba(0,0,0,0.6), inset 0 0 0 1px #888;
          z-index: 2;
        }
        .scroll-gallery-card:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(155, 125, 212, 0.75), 0 6px 18px rgba(0,0,0,0.5);
        }
        .scroll-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
          filter: contrast(1.05) saturate(0.92);
        }
        .scroll-gallery-card:hover img {
          transform: scale(1.06);
          filter: contrast(1.08) saturate(1.05);
        }
        .scroll-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          padding: 8px 6px;
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
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
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
