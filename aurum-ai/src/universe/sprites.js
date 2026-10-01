export const SPRITE_SCALE = 6;

export const PALETTE = {
  constitution: ["#fff3da", "#dcb987", "#94704a", "#4f3820"],
  entity: ["#ffe6f0", "#ee93b8", "#b0507a", "#5f2241"],
  legislation: ["#faf6ff", "#cdb9f6", "#8a6dd2", "#46328a"],
  service: ["#ecfff5", "#8ee0bb", "#2f8c69", "#123f31"],
  regulation: ["#fff3d6", "#ddb578", "#8d6633", "#4a3212"],
  cyan: ["#f7ffff", "#bfeef3", "#5e9fb2", "#24485a"],
  pink: ["#fff2f6", "#f2b9cf", "#a8667f", "#4c2638"],
  lilac: ["#f6f1ff", "#cbbcf5", "#7d6bb5", "#33285a"],
  glow: ["#ffffff", "#fffbe0", "#e8f6c2", "#9fc68a"],
  blue: ["#ffffff", "#9fe2ff", "#3a9be2", "#123e78"],
};

function canvas(size) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  return c;
}

export function sphere(colors, radius) {
  const scale = SPRITE_SCALE;
  const pad = 2;
  const size = Math.ceil((radius + pad) * 2 * scale);
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const R = radius * scale;
  const body = g.createRadialGradient(cx - R * 0.34, cx - R * 0.4, R * 0.05, cx, cx, R * 1.02);
  body.addColorStop(0, colors[0]);
  body.addColorStop(0.32, colors[1]);
  body.addColorStop(0.82, colors[2]);
  body.addColorStop(1, colors[3]);
  g.fillStyle = body;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();
  const rim = g.createRadialGradient(cx + R * 0.35, cx + R * 0.45, R * 0.2, cx + R * 0.2, cx + R * 0.25, R * 1.1);
  rim.addColorStop(0, "rgba(255,255,255,0)");
  rim.addColorStop(0.75, "rgba(255,255,255,0)");
  rim.addColorStop(1, "rgba(255,255,255,0.18)");
  g.fillStyle = rim;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();
  const spec = g.createRadialGradient(cx - R * 0.36, cx - R * 0.42, 0, cx - R * 0.36, cx - R * 0.42, R * 0.42);
  spec.addColorStop(0, "rgba(255,255,255,0.92)");
  spec.addColorStop(0.45, "rgba(255,255,255,0.35)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spec;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();
  return { c, half: size / 2 / scale };
}

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function entityHalo() {
  const scale = SPRITE_SCALE;
  const extent = 24;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const glow = g.createRadialGradient(cx, cx, 8 * scale, cx, cx, 22 * scale);
  glow.addColorStop(0, "rgba(240,150,190,0.28)");
  glow.addColorStop(1, "rgba(240,150,190,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  g.fillStyle = "rgba(44,36,42,0.94)";
  g.beginPath();
  g.arc(cx, cx, 20.6 * scale, 0, Math.PI * 2);
  g.fill();
  const rings = [
    [12.3, "rgba(255,255,255,0.92)", 1.25],
    [14.7, "rgba(246,182,208,0.85)", 1.15],
    [17.1, "rgba(255,240,246,0.72)", 1.05],
    [19.5, "rgba(236,168,198,0.6)", 0.95],
  ];
  for (const [r, color, w] of rings) {
    g.strokeStyle = color;
    g.lineWidth = w * scale;
    g.beginPath();
    g.arc(cx, cx, r * scale, 0, Math.PI * 2);
    g.stroke();
  }
  const random = rand(7);
  g.strokeStyle = "rgba(255,220,236,0.5)";
  g.lineWidth = 0.55 * scale;
  for (let i = 0; i < 96; i += 1) {
    const a = (i / 96) * Math.PI * 2;
    const r0 = 20.4;
    const r1 = r0 + 0.6 + random() * 1.1;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0 * scale, cx + Math.sin(a) * r0 * scale);
    g.lineTo(cx + Math.cos(a) * r1 * scale, cx + Math.sin(a) * r1 * scale);
    g.stroke();
  }
  return { c, half: extent };
}

export function legislationHalo() {
  const scale = SPRITE_SCALE;
  const extent = 22;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const glow = g.createRadialGradient(cx, cx, 9 * scale, cx, cx, 20 * scale);
  glow.addColorStop(0, "rgba(150,120,240,0.32)");
  glow.addColorStop(1, "rgba(150,120,240,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  g.fillStyle = "rgba(36,30,56,0.94)";
  g.beginPath();
  g.arc(cx, cx, 16.4 * scale, 0, Math.PI * 2);
  g.fill();
  const random = rand(13);
  for (let i = 0; i < 260; i += 1) {
    const a = (i / 260) * Math.PI * 2;
    const r0 = 16.6 + random() * 0.3;
    const r1 = r0 + 0.6 + random() * 1.8;
    g.strokeStyle = `rgba(${150 + random() * 60},${120 + random() * 40},${235},${0.35 + random() * 0.4})`;
    g.lineWidth = 0.5 * scale;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0 * scale, cx + Math.sin(a) * r0 * scale);
    g.lineTo(cx + Math.cos(a) * r1 * scale, cx + Math.sin(a) * r1 * scale);
    g.stroke();
  }
  const lrings = [
    [11.9, "rgba(60,40,120,0.9)", 1.3],
    [13.1, "rgba(255,255,255,0.9)", 1.0],
    [14.5, "rgba(206,190,250,0.8)", 0.95],
    [15.9, "rgba(246,240,255,0.75)", 0.9],
  ];
  for (const [r, color, w] of lrings) {
    g.strokeStyle = color;
    g.lineWidth = w * scale;
    g.beginPath();
    g.arc(cx, cx, r * scale, 0, Math.PI * 2);
    g.stroke();
  }
  return { c, half: extent };
}

export function serviceHalo() {
  const scale = SPRITE_SCALE;
  const extent = 13;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const glow = g.createRadialGradient(cx, cx, 6 * scale, cx, cx, 12.5 * scale);
  glow.addColorStop(0, "rgba(120,220,180,0.22)");
  glow.addColorStop(1, "rgba(120,220,180,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  g.fillStyle = "rgba(8,22,20,0.9)";
  g.beginPath();
  g.arc(cx, cx, 9.4 * scale, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(4,16,14,0.75)";
  g.lineWidth = 1.7 * scale;
  g.beginPath();
  g.arc(cx, cx, 8.4 * scale, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "rgba(150,230,200,0.35)";
  g.lineWidth = 0.6 * scale;
  g.beginPath();
  g.arc(cx, cx, 9.6 * scale, 0, Math.PI * 2);
  g.stroke();
  return { c, half: extent };
}

export function infoHalo() {
  const scale = SPRITE_SCALE;
  const extent = 10;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  g.strokeStyle = "rgba(10,20,24,0.7)";
  g.lineWidth = 1.3 * scale;
  g.beginPath();
  g.arc(cx, cx, 6.3 * scale, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "rgba(190,235,245,0.45)";
  g.lineWidth = 0.6 * scale;
  g.beginPath();
  g.arc(cx, cx, 7.4 * scale, 0, Math.PI * 2);
  g.stroke();
  return { c, half: extent };
}

export function glowSprite(rgb, extent = 30) {
  const scale = 3;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const grad = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.12, `rgba(${rgb},0.55)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.16)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return { c, half: extent };
}

export function constitutionHalo() {
  const scale = 5;
  const extent = 64;
  const size = extent * 2 * scale;
  const c = canvas(size);
  const g = c.getContext("2d");
  const cx = size / 2;
  const glow = g.createRadialGradient(cx, cx, 20 * scale, cx, cx, 56 * scale);
  glow.addColorStop(0, "rgba(240,200,140,0.4)");
  glow.addColorStop(0.45, "rgba(230,180,120,0.12)");
  glow.addColorStop(1, "rgba(230,180,120,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  const random = rand(31);
  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2 + random() * 0.04;
    const teal = i % 2 === 0;
    g.strokeStyle = teal ? "rgba(140,220,210,0.4)" : "rgba(240,215,170,0.38)";
    g.lineWidth = 0.65 * scale;
    g.setLineDash([1.1 * scale, 2.3 * scale]);
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 40 * scale, cx + Math.sin(a) * 40 * scale);
    g.lineTo(cx + Math.cos(a) * (50 + random() * 12) * scale, cx + Math.sin(a) * (50 + random() * 12) * scale);
    g.stroke();
  }
  g.setLineDash([]);
  const annulus = g.createRadialGradient(cx, cx, 18 * scale, cx, cx, 33.5 * scale);
  annulus.addColorStop(0, "rgba(70,72,62,0.96)");
  annulus.addColorStop(0.5, "rgba(150,146,124,0.96)");
  annulus.addColorStop(1, "rgba(176,160,128,0.96)");
  g.fillStyle = annulus;
  g.beginPath();
  g.arc(cx, cx, 33.5 * scale, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 700; i += 1) {
    const a = (i / 700) * Math.PI * 2;
    const r0 = 32.2;
    const n = Math.sin(a * 11 + 1.3) * 0.45 + Math.sin(a * 29) * 0.3 + random() * 0.8;
    const r1 = r0 + 1.2 + Math.max(0, n) * 4.6;
    g.strokeStyle = `rgba(${226 + random() * 22},${148 + random() * 36},${78 + random() * 30},${0.55 + random() * 0.4})`;
    g.lineWidth = 0.42 * scale;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0 * scale, cx + Math.sin(a) * r0 * scale);
    g.lineTo(cx + Math.cos(a) * r1 * scale, cx + Math.sin(a) * r1 * scale);
    g.stroke();
  }
  const rings = [
    [19.6, "rgba(40,40,34,0.9)", 1.4, null],
    [20.8, "rgba(255,248,232,1)", 1.2, null],
    [22.3, "rgba(150,226,216,0.95)", 1.1, [1.0, 1.1]],
    [23.7, "rgba(255,244,222,0.95)", 0.9, null],
    [25.1, "rgba(150,226,216,0.9)", 1.0, [1.0, 1.2]],
    [26.5, "rgba(255,240,214,0.9)", 0.9, null],
    [27.9, "rgba(150,226,216,0.8)", 0.95, [0.9, 1.3]],
    [29.3, "rgba(250,232,200,0.85)", 0.85, null],
    [30.8, "rgba(244,222,184,0.8)", 0.8, null],
  ];
  for (const [r, color, w, dash] of rings) {
    g.setLineDash(dash ? dash.map((v) => v * scale) : []);
    g.strokeStyle = color;
    g.lineWidth = w * scale;
    g.beginPath();
    g.arc(cx, cx, r * scale, 0, Math.PI * 2);
    g.stroke();
  }
  g.setLineDash([]);
  return { c, half: extent };
}
