// confetti.js - a tiny, dependency-free confetti burst (v1.4). Draws onto a single
// full-screen <canvas> overlay with requestAnimationFrame, then removes itself when the
// pieces have fallen. Fully offline (no images), cheap (one canvas, a few dozen rects), and
// reduced-motion-safe (burst() is a no-op when the user prefers reduced motion).
//
// Usage:
//   import * as confetti from './confetti.js';
//   confetti.burst({ x, y });            // small burst from a point (e.g. the runner)
//   confetti.burst({ x, y, count: 90, spread: 360, power: 9 }); // bigger celebration

const PALETTE = ['#ff8fab', '#ffb703', '#6d5efc', '#22c55e', '#22d3ee', '#ec4899', '#f59e0b'];

let canvas = null;
let ctx = null;
let pieces = [];
let rafId = null;

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Pull a few theme colours so confetti matches the active skin; fall back to the palette.
function themeColours() {
  const cs = getComputedStyle(document.documentElement);
  const pick = (name) => cs.getPropertyValue(name).trim();
  const themed = [pick('--brand'), pick('--brand-2'), pick('--accent')].filter(Boolean);
  // Mix the themed accents with a couple of bright constants so it always looks festive.
  return themed.length ? [...themed, '#ffb703', '#22c55e', '#ec4899'] : PALETTE;
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  // Inline the critical positioning so it works even if the stylesheet hasn't loaded it.
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '60',
  });
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Add a burst of pieces. opts: { x, y, count, spread (deg), power, gravity }.
export function burst(opts = {}) {
  if (prefersReducedMotion()) return; // respect reduced motion entirely
  ensureCanvas();
  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    count = 28,
    spread = 150,   // cone width in degrees (centred straight up)
    power = 7,      // initial speed
    gravity = 0.22,
  } = opts;
  const cols = themeColours();
  const baseAngle = -90; // straight up, in degrees
  for (let i = 0; i < count; i++) {
    const a = (baseAngle + (Math.random() - 0.5) * spread) * (Math.PI / 180);
    const speed = power * (0.5 + Math.random() * 0.8);
    pieces.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      g: gravity,
      size: 5 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: cols[Math.floor(Math.random() * cols.length)],
      life: 0,
      ttl: 70 + Math.random() * 40, // frames
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    });
  }
  if (!rafId) rafId = requestAnimationFrame(tick);
}

function tick() {
  if (!ctx) { rafId = null; return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of pieces) {
    p.life++;
    p.vy += p.g;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    const fade = Math.max(0, 1 - p.life / p.ttl);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // Keep only live pieces still on screen.
  pieces = pieces.filter((p) => p.life < p.ttl && p.y < window.innerHeight + 40);
  if (pieces.length) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
    teardown();
  }
}

// Remove the canvas once everything has settled so nothing lingers in the DOM.
function teardown() {
  if (rafId) return; // a new burst started; keep the canvas
  if (canvas) {
    window.removeEventListener('resize', resize);
    canvas.remove();
    canvas = null;
    ctx = null;
  }
}

// Burst centred on a DOM element (handy for firing from the runner sprite).
export function burstFromElement(el, opts = {}) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...opts });
}
