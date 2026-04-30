import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'star' | 'arrow' | 'sparkle' | 'dot' | 'circle' | 'cross';
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  phase: number;
  phaseSpeed: number;
}

const COLORS = [
  'rgba(196,168,232,',  // lilac
  'rgba(212,190,240,',  // soft lavender
  'rgba(226,184,216,',  // blush
  'rgba(192,232,216,',  // mint
  'rgba(200,218,244,',  // sky
  'rgba(240,200,220,',  // rose
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createParticle(w: number, h: number): Particle {
  const types: Particle['type'][] = ['star', 'arrow', 'sparkle', 'dot', 'circle', 'cross'];
  const weights =                    [  4,       3,       4,        6,     3,        2   ];
  const total = weights.reduce((s, n) => s + n, 0);
  let r = Math.random() * total;
  let type: Particle['type'] = 'dot';
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = types[i]; break; }
  }

  return {
    x: randomBetween(0, w),
    y: randomBetween(0, h),
    vx: randomBetween(-0.12, 0.12),
    vy: randomBetween(-0.18, -0.06),
    type,
    size: type === 'dot'
      ? randomBetween(2.5, 5.5)
      : type === 'circle'
      ? randomBetween(10, 22)
      : randomBetween(8, 18),
    opacity: randomBetween(0.22, 0.52),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.004, 0.004),
    color: pickColor(),
    phase: randomBetween(0, Math.PI * 2),
    phaseSpeed: randomBetween(0.004, 0.012),
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `${color}${opacity})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const len = i % 2 === 0 ? r : r * 0.45;
    const px = Math.cos(angle) * len;
    const py = Math.sin(angle) * len;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `${color}${opacity})`;
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.restore();
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `${color}${opacity})`;
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // curved body
  ctx.beginPath();
  ctx.moveTo(-len * 0.5, len * 0.2);
  ctx.quadraticCurveTo(0, -len * 0.4, len * 0.5, 0);
  ctx.stroke();
  // arrowhead
  ctx.beginPath();
  ctx.moveTo(len * 0.5, 0);
  ctx.lineTo(len * 0.28, -len * 0.18);
  ctx.moveTo(len * 0.5, 0);
  ctx.lineTo(len * 0.22, len * 0.12);
  ctx.stroke();
  ctx.restore();
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, opacity: number) {
  ctx.save();
  ctx.strokeStyle = `${color}${opacity})`;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number, color: string, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `${color}${opacity})`;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
  ctx.moveTo(0, -r); ctx.lineTo(0, r);
  ctx.stroke();
  ctx.restore();
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, opacity: number) {
  ctx.save();
  ctx.fillStyle = `${color}${opacity})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const PARTICLE_COUNT = 72;

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      // repopulate if empty
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
          createParticle(canvas.width, canvas.height)
        );
      }
    };

    resize();

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    );

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        // soft parallax nudge toward mouse
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 280 && dist > 1) {
          const force = (280 - dist) / 280 * 0.00012;
          p.vx += dx / dist * force * dt;
          p.vy += dy / dist * force * dt;
        }

        // drift
        p.vx += randomBetween(-0.0015, 0.0015);
        p.vy += randomBetween(-0.001, 0.0008);

        // dampen
        p.vx *= 0.992;
        p.vy *= 0.992;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.phase += p.phaseSpeed * dt;

        // breathe opacity
        const breathe = p.opacity * (0.75 + 0.25 * Math.sin(p.phase));

        // wrap
        if (p.x < -50) p.x = w + 40;
        if (p.x > w + 50) p.x = -40;
        if (p.y < -50) p.y = h + 40;
        if (p.y > h + 50) p.y = -40;

        switch (p.type) {
          case 'star':    drawStar(ctx, p.x, p.y, p.size, p.rotation, p.color, breathe); break;
          case 'sparkle': drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.color, breathe); break;
          case 'arrow':   drawArrow(ctx, p.x, p.y, p.size * 1.6, p.rotation, p.color, breathe); break;
          case 'circle':  drawCircle(ctx, p.x, p.y, p.size, p.color, breathe); break;
          case 'cross':   drawCross(ctx, p.x, p.y, p.size * 0.6, p.rotation, p.color, breathe); break;
          case 'dot':     drawDot(ctx, p.x, p.y, p.size * 0.5, p.color, breathe); break;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
