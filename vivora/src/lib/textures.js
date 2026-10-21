import * as THREE from 'three';

// Deterministic PRNG so textures look the same on every load
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function toTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load('700 200px Unbounded'), document.fonts.load('400 200px Anton'), document.fonts.load('600 200px "Inter Tight"'),
      document.fonts.load('400 200px "Inter Tight"'), document.fonts.load('300 200px "Inter Tight"'),
      document.fonts.load('900 200px Nunito'), document.fonts.load('500 20px "IBM Plex Mono"'),
    ]);
  } catch { /* fall back to system fonts */ }
}

// Hero wordmark with a dry-brush finish. noiseScale controls how torn the strokes are.
export function wordmarkCanvas(text = 'VIVORA', noiseScale = 9, canvas) {
  const W = 4096, H = 1024;
  const c = canvas || document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#fff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '400 900px Anton, Impact, sans-serif';
  if ('letterSpacing' in g) g.letterSpacing = '30px';
  const m = g.measureText(text);
  const scale = Math.min(1, (W * 0.97) / m.width);
  g.save(); g.translate(W / 2, H / 2 + 30); g.scale(scale, scale); g.fillText(text, 0, 0); g.restore();

  // dry brush finish: mostly solid white, fine broken streaks and ragged edges (reference look)
  const r = rng(11);
  const amt = noiseScale / 10;
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 520 * amt; i++) {
    const y = r() * H; const x = r() * W; const len = 20 + r() * 160 * amt; const th = 0.5 + r() * 1.6;
    g.globalAlpha = 0.15 + r() * 0.55;
    g.fillRect(x, y, len, th);
  }
  for (let i = 0; i < 2600 * amt; i++) { g.globalAlpha = 0.3 + r() * 0.7; g.fillRect(r() * W, r() * H, 1 + r() * 5, 1 + r() * 1.5); }
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.12;
  for (let i = 0; i < 700; i++) { g.fillStyle = r() > 0.5 ? '#c9d0dc' : '#ffffff'; g.fillRect(r() * W, r() * H, 60 + r() * 380, 1 + r() * 3); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  return c;
}
export const wordmarkTexture = (text, noise) => toTexture(wordmarkCanvas(text, noise));

// Faint outline lettering for the background wall
export function outlineTexture(text = 'VIVORA') {
  const W = 2048, H = 2048; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.font = '400 520px Anton, sans-serif'; g.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) g.strokeText(text, -200 + i * 140, 260 + i * 380);
  return toTexture(c);
}

// Card textures are shared by the shatter shards and the carousel — create each once.
const cardCache = new Map();
export function cardTexture(work, i) {
  if (!cardCache.has(i)) cardCache.set(i, buildCardTexture(work, i));
  return cardCache.get(i);
}

// Key art for a project card: layered gradients, a big title and geometric motifs.
function buildCardTexture(work, i) {
  const W = 1600, H = 1000; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const r = rng(100 + i * 17);
  const [h1, h2] = work.hues;
  const paint = (photo) => {
    // base: photo cover-fit (or a soft gradient while it loads)
    if (photo) {
      const s = Math.max(W / photo.width, H / photo.height); const pw = photo.width * s, ph = photo.height * s;
      g.drawImage(photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
    } else {
      const bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, `hsl(${h1} 45% 16%)`); bg.addColorStop(1, `hsl(${h2} 55% 34%)`); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    }
    // legibility + brand tint: teal from the left, warm glow on the right
    const lg = g.createLinearGradient(0, 0, W * 0.75, 0);
    lg.addColorStop(0, `hsla(${h1} 30% 6% / .6)`); lg.addColorStop(0.5, `hsla(${h1} 30% 8% / .12)`); lg.addColorStop(1, 'hsla(0 0% 0% / 0)');
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * 0.85, H * 0.2, 0, W * 0.85, H * 0.2, W * 0.5);
    glow.addColorStop(0, `hsla(${h2} 90% 65% / .28)`); glow.addColorStop(1, 'hsla(0 0% 0% / 0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    const bt = g.createLinearGradient(0, H * 0.6, 0, H); bt.addColorStop(0, 'rgba(0,0,0,0)'); bt.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = bt; g.fillRect(0, 0, W, H);
    // title
    g.fillStyle = '#fff'; g.shadowColor = `hsla(${h1} 100% 60% / .9)`; g.shadowBlur = 36;
    g.font = '400 190px Anton, Impact, sans-serif'; g.textBaseline = 'alphabetic';
    work.title.toUpperCase().split(' ').forEach((w, k) => g.fillText(w, 90, 330 + k * 190));
    g.shadowBlur = 0; g.font = '500 28px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.88)';
    g.fillText(`VIVORA — ${work.tags.join(' / ').toUpperCase()}`, 92, H - 66);
    // fine grain
    const img = g.getImageData(0, 0, W, H); const d = img.data; const rr = rng(7 + i);
    for (let p = 0; p < d.length; p += 4) { const n = (rr() - 0.5) * 14; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
    g.putImageData(img, 0, 0);
  };
  paint(null);
  const tex = toTexture(c);
  if (work.img) { const im = new Image(); im.onload = () => { paint(im); tex.needsUpdate = true; }; im.src = work.img; }
  r();
  return tex;
}

// Big title rendered for the warped "SERVICE" panel
export function serviceTextTexture(text = 'SERVICE') {
  const W = 2048, H = 1024; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#111214'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(212,255,58,.28)'; g.lineWidth = 2;
  for (let x = 0; x <= W; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#fff'; g.font = '400 430px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, W / 2, H / 2 + 20);
  return toTexture(c);
}

// Visual for a service card: motion-blurred radial "fly-through" streaks.
export function serviceVisualTexture(hue, seed) {
  const W = 1280, H = 720; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = rng(seed);
  const bg = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, `hsl(${hue + 40} 40% 85%)`); bg.addColorStop(0.35, `hsl(${hue} 45% 40%)`); bg.addColorStop(1, `hsl(${hue - 20} 50% 10%)`);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 900; k++) {
    const a = r() * Math.PI * 2, d0 = 40 + r() * 200, d1 = d0 + 120 + r() * 600;
    g.strokeStyle = `hsla(${hue + (r() - 0.5) * 60} ${50 + r() * 40}% ${40 + r() * 40}% / ${0.05 + r() * 0.12})`; g.lineWidth = 1 + r() * 6;
    g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * d0, H / 2 + Math.sin(a) * d0 * 0.7); g.lineTo(W / 2 + Math.cos(a) * d1, H / 2 + Math.sin(a) * d1 * 0.7); g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  return toTexture(c);
}

// Photo texture (cached) for service cards
const photoCache = new Map();
export function photoTexture(url) {
  if (!photoCache.has(url)) {
    const t = new THREE.TextureLoader().load(url);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    photoCache.set(url, t);
  }
  return photoCache.get(url);
}
