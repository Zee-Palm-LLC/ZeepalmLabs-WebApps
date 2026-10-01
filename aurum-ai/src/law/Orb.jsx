import { useRef } from "react";
import { S, useFrame } from "../store.js";
import { backOut, clamp } from "../lib/math.js";
import { ORB } from "./lawData.js";

const SIZE = 150;

function hash(i) {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function zigzag(g, { count, base, inner, outer, swell, speed, seed }, time) {
  g.beginPath();
  for (let i = 0; i <= count; i += 1) {
    const k = i % count;
    const a = (k / count) * Math.PI * 2;
    const wave = 0.5 + 0.5 * Math.sin(a * 5 + time * speed + seed) * Math.sin(a * 3 - time * speed * 0.7 + seed * 2);
    const jitter = 0.55 + 0.45 * Math.sin(time * 2.4 * speed + hash(k + seed * 97) * 6.283);
    const r = k % 2 ? base + outer * (0.35 + swell * wave) * jitter : base - inner * (0.4 + 0.6 * hash(k + seed));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
}

export default function Orb() {
  const ref = useRef(null);

  useFrame((s) => {
    const canvas = ref.current;
    if (!canvas) return;
    const l = s.l;
    if (l.show <= 0.002) return;
    const camScale = 2.4 - 1.4 * l.cam;
    const res = Math.min(4, s.stage.scale * s.stage.dpr * camScale * s.stage.law.s * 1.1);
    const px = Math.round(SIZE * res);
    if (canvas.width !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    const g = canvas.getContext("2d");
    g.setTransform(res, 0, 0, res, 0, 0);
    g.clearRect(0, 0, SIZE, SIZE);
    const c = SIZE / 2;
    const t = clamp(l.orb);
    if (t <= 0) return;
    const pop = backOut(t);
    const time = s.clock;
    const R = ORB.r;
    g.save();
    g.translate(c, c);
    g.scale(pop, pop);

    const disc = g.createRadialGradient(-R * 0.7, -R * 0.7, R * 0.6, 0, 0, 58);
    disc.addColorStop(0, "rgba(70,78,86,0.75)");
    disc.addColorStop(0.45, "rgba(34,40,46,0.6)");
    disc.addColorStop(1, "rgba(10,14,20,0)");
    g.fillStyle = disc;
    g.beginPath();
    g.arc(0, 0, 58, 0, Math.PI * 2);
    g.fill();

    const outerStroke = g.createLinearGradient(0, -64, 0, 64);
    outerStroke.addColorStop(0, "rgba(222,220,236,0.78)");
    outerStroke.addColorStop(0.5, "rgba(150,138,206,0.5)");
    outerStroke.addColorStop(1, "rgba(112,90,196,0.55)");
    g.lineJoin = "miter";
    g.lineWidth = 0.75;
    g.strokeStyle = outerStroke;
    zigzag(g, { count: 210, base: 58.5, inner: 4.2, outer: 6.4, swell: 0.9, speed: 0.55, seed: 1.3 }, time);
    g.stroke();

    const tealGlow = g.createRadialGradient(0, 0, R, 0, 0, R + 11);
    tealGlow.addColorStop(0, "rgba(90,190,190,0.2)");
    tealGlow.addColorStop(1, "rgba(90,190,190,0)");
    g.fillStyle = tealGlow;
    g.beginPath();
    g.arc(0, 0, R + 11, 0, Math.PI * 2);
    g.fill();

    g.lineWidth = 0.8;
    g.strokeStyle = "rgba(104,200,196,0.82)";
    g.shadowColor = "rgba(98,210,200,0.55)";
    g.shadowBlur = 1.5;
    zigzag(g, { count: 104, base: 30.2, inner: 1.6, outer: 7.8, swell: 1.1, speed: -0.8, seed: 4.1 }, time);
    g.stroke();
    g.shadowBlur = 0;

    const body = g.createRadialGradient(-R * 0.42, -R * 0.46, R * 0.05, R * 0.08, R * 0.1, R * 1.04);
    body.addColorStop(0, "#d4c4fb");
    body.addColorStop(0.42, "#ad98e6");
    body.addColorStop(0.8, "#7d65bb");
    body.addColorStop(1, "#6a54a8");
    g.fillStyle = body;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();

    g.save();
    g.rotate(-Math.PI * 0.25);
    const gloss = g.createRadialGradient(0, -R * 0.68, 0, 0, -R * 0.68, R * 0.36);
    gloss.addColorStop(0, "rgba(255,250,255,0.9)");
    gloss.addColorStop(1, "rgba(255,250,255,0)");
    g.fillStyle = gloss;
    g.beginPath();
    g.ellipse(0, -R * 0.68, R * 0.42, R * 0.17, 0, 0, Math.PI * 2);
    g.fill();
    const low = g.createRadialGradient(0, R * 0.72, 0, 0, R * 0.72, R * 0.3);
    low.addColorStop(0, "rgba(220,206,255,0.32)");
    low.addColorStop(1, "rgba(220,206,255,0)");
    g.fillStyle = low;
    g.beginPath();
    g.ellipse(0, R * 0.72, R * 0.34, R * 0.12, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();

    g.restore();
  });

  return (
    <canvas
      ref={ref}
      className="law-orb"
      style={{ left: ORB.x - SIZE / 2, top: ORB.y - SIZE / 2, width: SIZE, height: SIZE }}
      aria-hidden="true"
    />
  );
}

export { S };
