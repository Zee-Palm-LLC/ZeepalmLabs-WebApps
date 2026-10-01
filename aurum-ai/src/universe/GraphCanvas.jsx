import { useEffect, useRef } from "react";
import gsap from "gsap";
import { S, getUi, useFrame } from "../store.js";
import { backOut, clamp, fract, lerp, mixRgb, rgba } from "../lib/math.js";
import { RADIUS, constitution, edges, nodes } from "./model.js";
import {
  PALETTE,
  constitutionHalo,
  entityHalo,
  glowSprite,
  infoHalo,
  legislationHalo,
  serviceHalo,
  sphere,
} from "./sprites.js";

const BLUE = [110, 200, 255];
const STYLE = {
  D: { color: [214, 238, 230], width: 0.95, alpha: 0.62 },
  T: { color: [170, 230, 220], width: 1.35, alpha: 0.9 },
  G: { color: [236, 212, 168], width: 1.3, alpha: 0.9 },
  B: { color: [244, 220, 178], width: 1.6, alpha: 1 },
  R: { color: [214, 196, 230], width: 1.6, alpha: 0.85 },
};

function buildAssets() {
  const spheres = {};
  for (const [kind, colors] of Object.entries(PALETTE)) {
    spheres[kind] = {
      constitution: sphere(colors, RADIUS.constitution),
      entity: sphere(colors, RADIUS.entity),
      legislation: sphere(colors, RADIUS.legislation),
      service: sphere(colors, RADIUS.service),
      regulation: sphere(colors, RADIUS.regulation),
      info: sphere(colors, RADIUS.info),
    };
  }
  const dust = Array.from({ length: 620 }, (_, i) => {
    const a = (i / 620) * Math.PI * 2 + Math.sin(i * 7.1) * 0.6;
    const r = fract(Math.sin(i * 12.9898) * 43758.5453);
    return { a, d: 14 + Math.pow(r, 0.7) * 78, s: 0.5 + fract(Math.sin(i * 78.233) * 9631.21) * 1.3 };
  });
  const sparks = Array.from({ length: 26 }, (_, i) => {
    const r = fract(Math.sin(i * 41.7) * 9283.1);
    return { a: (i / 26) * Math.PI * 2 + r * 0.4, v: 260 + r * 300, t0: 0.05 + fract(Math.sin(i * 7.7) * 311.3) * 0.35, len: 28 + r * 40 };
  });
  return {
    spheres,
    halos: {
      constitution: constitutionHalo(),
      entity: entityHalo(),
      legislation: legislationHalo(),
      service: serviceHalo(),
      info: infoHalo(),
    },
    glowWarm: glowSprite("255,244,206", 26),
    glowSpark: glowSprite("244,246,170", 34),
    glowBlue: glowSprite("120,205,255", 26),
    glowGold: glowSprite("244,206,140", 40),
    dust,
    sparks,
    glowCore: glowSprite("255,250,232", 40),
  };
}

function drawSprite(ctx, sprite, x, y, scale = 1, alpha = 1) {
  if (alpha <= 0.002) return;
  ctx.globalAlpha = alpha;
  const h = sprite.half * scale;
  ctx.drawImage(sprite.c, x - h, y - h, h * 2, h * 2);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pctBadge(ctx, x, y, value, size, alpha) {
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px "Roboto Condensed"`;
  const text = String(value);
  const tw = ctx.measureText(text).width;
  const w = tw + size * 0.75 + 6;
  const h = size - 0.2;
  const slant = 3.2;
  ctx.beginPath();
  ctx.moveTo(x + slant, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - slant * 0.4, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = "rgba(74,80,78,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = "#f4f4f2";
  ctx.fillText(text, x + 5, y + h - 2.4);
  ctx.font = `700 ${size * 0.58}px "Roboto Condensed"`;
  ctx.fillStyle = "#f6d9a8";
  ctx.fillText("%", x + 5.6 + tw, y + h * 0.5);
}

function numBadge(ctx, x, y, value, purple, alpha) {
  ctx.globalAlpha = alpha;
  ctx.font = '700 10.5px "Roboto Condensed"';
  const text = String(value);
  const tw = ctx.measureText(text).width;
  const w = tw + 6;
  const h = 12.5;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 3);
  ctx.fillStyle = purple ? "rgba(58,40,140,0.95)" : "rgba(3,6,6,0.94)";
  ctx.fill();
  ctx.fillStyle = purple ? "#e2dcff" : "#ffffff";
  ctx.fillText(text, x - tw / 2, y + 3.9);
}

const BADGE_OFFSET = { service: [4.5, -13], regulation: [9.5, -8.5], info: [6, -11] };

export default function GraphCanvas({ onActivate }) {
  const canvasRef = useRef(null);
  const assetsRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    assetsRef.current = buildAssets();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const toWorld = (clientX, clientY) => {
      const { scale, g } = S.stage;
      const sx = (clientX / scale - g.x) / g.s;
      const sy = (clientY / scale - g.y) / g.s;
      const wx = (sx - S.u.cam.x) / S.u.cam.s;
      const wy = (sy - S.u.cam.y) / S.u.cam.s;
      const sp = S.u.spread;
      return [constitution.x + (wx - constitution.x) / sp, constitution.y + (wy - constitution.y) / sp];
    };
    const pick = (clientX, clientY) => {
      const [wx, wy] = toWorld(clientX, clientY);
      let best = null;
      let bestD = Infinity;
      for (const node of nodes) {
        if (node.off || S.u.hidden[node.kind === "info" ? "regulation" : node.kind]) continue;
        const d = Math.hypot(node.x - wx, node.y - wy);
        const reach = node.r * (node.boostV || 1) + (S.stage.mode === "compact" ? 20 / (S.stage.scale * S.stage.g.s * S.u.cam.s) : 7 / S.u.cam.s);
        if (d < reach && d < bestD) {
          best = node;
          bestD = d;
        }
      }
      return best;
    };
    const interactive = () => !getUi().intro && getUi().view === "universe" && S.u.show > 0.9;

    const touches = new Map();
    let pinch = null;
    const toGraph = (clientX, clientY) => {
      const { scale, g } = S.stage;
      return [(clientX / scale - g.x) / g.s, (clientY / scale - g.y) / g.s];
    };
    const zoomAround = (sx, sy, next) => {
      const cam = S.u.cam;
      cam.x = sx - ((sx - cam.x) * next) / cam.s;
      cam.y = sy - ((sy - cam.y) * next) / cam.s;
      cam.s = next;
    };
    const startPinch = () => {
      const [a, b] = [...touches.values()];
      const [mx, my] = toGraph((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: S.u.cam.s, cx: S.u.cam.x, cy: S.u.cam.y, mx, my };
      if (drag.current) drag.current.moved = true;
    };

    const onMove = (event) => {
      if (touches.has(event.pointerId)) touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinch && touches.size >= 2) {
        const [a, b] = [...touches.values()];
        const ratio = Math.hypot(a.x - b.x, a.y - b.y) / pinch.d;
        const next = clamp(pinch.s * ratio, 0.55, 4);
        const [mx, my] = toGraph((a.x + b.x) / 2, (a.y + b.y) / 2);
        const cam = S.u.cam;
        cam.s = pinch.s;
        cam.x = pinch.cx;
        cam.y = pinch.cy;
        zoomAround(pinch.mx, pinch.my, next);
        cam.x += mx - pinch.mx;
        cam.y += my - pinch.my;
        return;
      }
      if (drag.current) {
        const dx = (event.clientX - drag.current.x) / (S.stage.scale * S.stage.g.s);
        const dy = (event.clientY - drag.current.y) / (S.stage.scale * S.stage.g.s);
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
        S.u.cam.x = drag.current.cx + dx;
        S.u.cam.y = drag.current.cy + dy;
        return;
      }
      if (event.pointerType === "touch") return;
      if (!interactive()) {
        S.u.hover = null;
        canvas.style.cursor = "";
        return;
      }
      const node = pick(event.clientX, event.clientY);
      S.u.hover = node;
      canvas.style.cursor = node ? "pointer" : "grab";
    };
    const onDown = (event) => {
      if (!interactive()) return;
      gsap.killTweensOf(S.u.cam);
      if (event.pointerType === "touch") {
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (touches.size === 2) startPinch();
      }
      canvas.setPointerCapture(event.pointerId);
      if (pinch) return;
      drag.current = { x: event.clientX, y: event.clientY, cx: S.u.cam.x, cy: S.u.cam.y, moved: false };
      canvas.style.cursor = "grabbing";
    };
    const onUp = (event) => {
      touches.delete(event.pointerId);
      if (pinch) {
        if (touches.size < 2) pinch = null;
        if (touches.size === 0) drag.current = null;
        return;
      }
      const state = drag.current;
      drag.current = null;
      if (!state) return;
      canvas.style.cursor = "grab";
      if (!state.moved) {
        const node = pick(event.clientX, event.clientY);
        if (node) {
          if (event.pointerType === "touch" && S.u.hover !== node) {
            S.u.hover = node;
            return;
          }
          S.u.hover = null;
          onActivate(node);
        } else if (event.pointerType === "touch") {
          S.u.hover = null;
        }
      }
    };
    const onWheel = (event) => {
      if (!interactive()) return;
      event.preventDefault();
      const [sx, sy] = toGraph(event.clientX, event.clientY);
      gsap.killTweensOf(S.u.cam);
      zoomAround(sx, sy, clamp(S.u.cam.s * Math.exp(-event.deltaY * 0.0014), 0.55, 4));
    };
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [onActivate]);

  useFrame((s) => {
    const canvas = canvasRef.current;
    const A = assetsRef.current;
    if (!canvas || !A) return;
    const { vw, vh, dpr, scale, g, labelBoost } = s.stage;
    const pw = Math.round(vw * dpr);
    const ph = Math.round(vh * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);
    const u = s.u;
    if (u.show <= 0.002) {
      canvas.style.visibility = "hidden";
      return;
    }
    canvas.style.visibility = "visible";
    const cam = u.cam;
    const k = cam.s * g.s * scale * dpr;
    ctx.setTransform(k, 0, 0, k, (cam.x * g.s + g.x) * scale * dpr, (cam.y * g.s + g.y) * scale * dpr);

    const build = u.build;
    const spread = u.spread;
    const show = u.show;
    const clock = s.clock;
    const Cx = constitution.x;
    const Cy = constitution.y;
    const pos = (n) => [Cx + (n.x - Cx) * spread, Cy + (n.y - Cy) * spread];
    const hidden = (n) => n.off || u.hidden[n.kind === "info" ? "regulation" : n.kind];
    for (const n of nodes) {
      n.dimV = lerp(n.dimV || 0, n.dim || 0, 0.14);
      n.boostV = lerp(n.boostV || 1, n.boost || 1, 0.1);
    }

    const hover = u.hover;
    const focusSet = hover ? new Set([hover, ...hover.edges.map((e) => (e.a === hover ? e.b : e.a))]) : null;
    const nodeDim = (n) => (focusSet && !focusSet.has(n) ? 0.28 : 1) * (1 - n.dimV * 0.84);
    const edgeDim = (e) => (focusSet ? (e.a === hover || e.b === hover ? 1.35 : 0.22) : 1) * (1 - Math.max(e.a.dimV, e.b.dimV) * 0.84);

    for (const e of edges) {
      if (hidden(e.a) || hidden(e.b)) continue;
      const f = clamp((build - e.start) / e.duration);
      if (f <= 0) continue;
      const [ax, ay] = pos(e.from);
      const [bx, by] = pos(e.to);
      const tx = lerp(ax, bx, f);
      const ty = lerp(ay, by, f);
      const st = STYLE[e.style];
      const blue = 1 - clamp((build - e.start - e.duration - 0.05) / 0.85);
      const color = mixRgb(st.color, BLUE, blue * 0.85);
      const alpha = show * st.alpha * Math.min(1, edgeDim(e)) * (1 - u.dim);
      ctx.lineCap = "round";
      if (e.style === "D") {
        ctx.setLineDash([1.1, 2.5]);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = rgba(color, 1);
        ctx.lineWidth = st.width;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (e.style === "B") {
        const dx = bx - ax;
        const dy = by - ay;
        const L = Math.hypot(dx, dy);
        const ux = dx / L;
        const uy = dy / L;
        const nx = -uy;
        const ny = ux;
        const widthAt = (t) => 0.8 + 12.5 * Math.pow(Math.sin(Math.PI * clamp(t * 1.05)), 0.8) * (1 - 0.5 * t);
        const steps = 22;
        for (const [scaleW, layerAlpha] of [
          [1, 0.07],
          [0.6, 0.1],
          [0.3, 0.14],
        ]) {
          ctx.globalAlpha = alpha * layerAlpha;
          ctx.fillStyle = rgba(color, 1);
          ctx.beginPath();
          for (let i = 0; i <= steps; i += 1) {
            const t = (i / steps) * f;
            const w = widthAt(t) * scaleW;
            ctx.lineTo(ax + dx * t + nx * w, ay + dy * t + ny * w);
          }
          for (let i = steps; i >= 0; i -= 1) {
            const t = (i / steps) * f;
            const w = widthAt(t) * scaleW;
            ctx.lineTo(ax + dx * t - nx * w, ay + dy * t - ny * w);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.lineWidth = 0.55;
        for (const kk of [-0.78, -0.42, 0.42, 0.78]) {
          ctx.globalAlpha = alpha * 0.42;
          ctx.strokeStyle = rgba(color, 1);
          ctx.beginPath();
          for (let i = 0; i <= steps; i += 1) {
            const t = (i / steps) * f;
            const w = widthAt(t) * kk * 0.85;
            ctx.lineTo(ax + dx * t + nx * w, ay + dy * t + ny * w);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = alpha * 0.28;
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = st.width;
        ctx.strokeStyle = rgba(mixRgb(color, [255, 250, 236], 0.4), 1);
        ctx.stroke();
      } else {
        if (e.style === "R") {
          const grad = ctx.createLinearGradient(ax, ay, bx, by);
          grad.addColorStop(0, "rgba(240,170,214,1)");
          grad.addColorStop(0.5, "rgba(150,226,236,1)");
          grad.addColorStop(1, "rgba(236,226,150,1)");
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = rgba(color, 1);
        }
        ctx.globalAlpha = alpha * 0.18;
        ctx.lineWidth = st.width * 3.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = st.width;
        ctx.stroke();
      }
      if (f >= 1) {
        const dx = bx - ax;
        const dy = by - ay;
        const L = Math.hypot(dx, dy);
        const ux = dx / L;
        const uy = dy / L;
        const ends = [
          [e.to, bx, by, 1],
          [e.from, ax, ay, -1],
        ];
        for (const [end, ex, ey, dir] of ends) {
          const wants = end.kind === "entity" || end.kind === "constitution" || (end.kind === "legislation" && e.style !== "D");
          if (!wants) continue;
          const big = e.style === "B";
          const ring = end.kind === "constitution" ? 33 : end.kind === "entity" ? 19 : 15.5;
          const tip = ring - 1.5;
          const base = ring + (big ? 30 : 23);
          const vx = ux * dir;
          const vy = uy * dir;
          const hx = ex - vx * tip;
          const hy = ey - vy * tip;
          const gx = ex - vx * base;
          const gy = ey - vy * base;
          const half = big ? 8 : 5.6;
          const warm = mixRgb(color, [246, 212, 160], 0.7);
          const grad = ctx.createLinearGradient(gx, gy, hx, hy);
          grad.addColorStop(0, rgba(warm, 0));
          grad.addColorStop(0.5, rgba(warm, 0.62));
          grad.addColorStop(1, rgba(warm, 0.95));
          ctx.globalAlpha = alpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(gx - vy * half, gy + vx * half);
          ctx.lineTo(gx + vy * half, gy - vx * half);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (blue > 0.02) {
        const hot = e.to.kind === "entity" ? [236, 128, 214] : [78, 186, 255];
        ctx.setLineDash([]);
        ctx.strokeStyle = rgba(hot, 1);
        ctx.globalAlpha = show * blue * 0.28;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.globalAlpha = show * blue * 0.95;
        ctx.lineWidth = 1.9;
        ctx.stroke();
      }
      if (f > 0 && f < 1) {
        drawSprite(ctx, A.glowBlue, tx, ty, 0.75, show);
        drawSprite(ctx, A.glowWarm, tx, ty, 0.16, show);
      }
    }

    if (u.glints > 0) {
      for (const e of edges) {
        if (e.style === "D" || hidden(e.a) || hidden(e.b)) continue;
        const cycle = fract(clock * (0.16 + e.seed * 0.1) + e.seed * 7.3);
        if (cycle > 0.5) continue;
        const t = cycle / 0.5;
        const [ax, ay] = pos(e.from);
        const [bx, by] = pos(e.to);
        const a = Math.sin(Math.PI * t) * u.glints * show * Math.min(1, edgeDim(e));
        drawSprite(ctx, A.glowSpark, lerp(ax, bx, t), lerp(ay, by, t), 0.42, a * 0.85);
        drawSprite(ctx, A.glowWarm, lerp(ax, bx, t), lerp(ay, by, t), 0.14, a);
      }
    }

    const burst = u.burst;
    if (burst > 0) {
      const life = clamp(1.6 - build * 0.95);
      if (life > 0) {
        for (let i = 0; i < 34; i += 1) {
          const p = A.dust[i * 17];
          const d = p.d * 0.55 * (0.5 + burst * 0.8 + build * 0.3);
          drawSprite(ctx, A.glowGold, Cx + Math.cos(p.a) * d, Cy + Math.sin(p.a) * d * 0.9, 0.35 + p.s * 0.22, show * life * 0.32);
        }
        for (const p of A.dust) {
          const d = p.d * (0.45 + burst * 1.25 + build * 0.4);
          const x = Cx + Math.cos(p.a) * d;
          const y = Cy + Math.sin(p.a) * d * 0.92;
          ctx.globalAlpha = show * life * 0.85;
          ctx.fillStyle = p.s > 1.1 ? "rgba(255,228,168,1)" : "rgba(214,164,92,1)";
          ctx.fillRect(x, y, p.s * 1.9, p.s * 1.9);
        }
      }
      ctx.lineCap = "round";
      for (const p of A.sparks) {
        const age = build - p.t0;
        if (age <= 0 || age > 0.75) continue;
        const r1 = 22 + age * p.v;
        const r0 = Math.max(22, r1 - p.len);
        const a = show * Math.sin(Math.PI * (age / 0.75));
        const x1 = Cx + Math.cos(p.a) * r1;
        const y1 = Cy + Math.sin(p.a) * r1;
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = "rgba(96,196,255,1)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(Cx + Math.cos(p.a) * r0, Cy + Math.sin(p.a) * r0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        drawSprite(ctx, A.glowBlue, x1, y1, 0.5, a);
      }
      const hot = clamp(1 - build / 2.2);
      if (hot > 0) drawSprite(ctx, A.glowGold, Cx, Cy, 3.2 * burst, show * hot * 0.8);
    }

    for (const n of nodes) {
      if (hidden(n)) continue;
      const appear = n.kind === "constitution" ? clamp(burst) : clamp((build - n.reveal) / 0.32);
      if (appear <= 0) continue;
      const [x, y] = pos(n);
      const blue = n.kind === "constitution" ? 0 : 1 - clamp((build - n.reveal - 0.2) / 0.85);
      const pop = n.kind === "constitution" ? backOut(appear) : backOut(appear);
      const alpha = show * nodeDim(n) * Math.min(1, appear * 2) * (1 - u.dim * 0.6);
      const isHover = hover === n;
      const grow = (isHover ? 1.18 : 1) * (n.holding ? n.boostV : 1);
      if (n.glow) {
        const pulse = 0.75 + 0.25 * Math.sin(clock * 2.4 + n.seed * 6);
        drawSprite(ctx, A.glowSpark, x, y, 0.85 * pulse, alpha);
        drawSprite(ctx, A.glowWarm, x, y, 0.3, alpha);
        drawSprite(ctx, A.spheres.glow.regulation, x, y, 1, alpha);
        continue;
      }
      if (n.kind === "constitution") {
        drawSprite(ctx, A.glowGold, x, y, 1.3, alpha * 0.55);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(clock * 0.06);
        drawSprite(ctx, A.halos.constitution, 0, 0, pop * grow, alpha);
        ctx.restore();
        drawSprite(ctx, A.spheres.constitution.constitution, x, y, pop * grow, alpha);
        continue;
      }
      if (blue > 0) drawSprite(ctx, A.glowBlue, x, y, (n.r / 7) * 1.25 * (0.6 + blue), alpha * blue);
      const halo = A.halos[n.kind];
      if (halo) drawSprite(ctx, halo, x, y, pop * grow, alpha * (1 - blue * 0.6));
      const tint = n.kind === "info" ? n.tint === "glow" ? "glow" : n.tint : n.kind;
      const body = A.spheres[tint][n.kind];
      drawSprite(ctx, body, x, y, pop * grow, alpha);
      if (blue > 0) drawSprite(ctx, A.spheres.blue[n.kind], x, y, pop * grow, alpha * blue * 0.85);
      if (n.tint === "glow") {
        const pulse = 0.7 + 0.3 * Math.sin(clock * 2.1 + n.seed * 9);
        drawSprite(ctx, A.glowSpark, x, y, 0.8 * pulse, alpha);
      }
    }

    for (const n of nodes) {
      if (!n.tick || hidden(n)) continue;
      const age = clock - n.tick.t;
      if (age < 0 || age > 1.1) continue;
      const [x, y] = pos(n);
      const k = 1 - age / 1.1;
      ctx.globalAlpha = show * k * 0.9 * nodeDim(n) * clamp((build - n.reveal) / 0.32);
      ctx.strokeStyle = n.tick.up ? "rgba(120,236,178,1)" : "rgba(255,120,128,1)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, n.r * n.boostV * (1.3 + age * 1.4), 0, Math.PI * 2);
      ctx.stroke();
    }

    const heat = clamp(1 - build / 1.9) * clamp(burst * 3);
    if (heat > 0) {
      drawSprite(ctx, A.glowCore, Cx, Cy, 1.0 + 1.6 * heat, show * heat);
      drawSprite(ctx, A.glowCore, Cx, Cy, 0.6 + 0.9 * heat, show * heat);
      drawSprite(ctx, A.glowGold, Cx, Cy, 1.6 + 2.4 * heat, show * heat * 0.55);
    }

    if (u.glints > 0) {
      for (const n of nodes) {
        if (hidden(n) || n.kind === "constitution") continue;
        const flash = Math.pow(Math.max(0, Math.sin(clock * 0.85 + n.seed * 40)), 30);
        if (flash < 0.02) continue;
        const [x, y] = pos(n);
        drawSprite(ctx, A.glowSpark, x, y, 0.95, flash * u.glints * show * nodeDim(n));
        drawSprite(ctx, A.glowWarm, x, y, 0.3, flash * u.glints * show);
      }
    }

    const labels = u.labels;
    if (labels > 0 || burst > 0) {
      ctx.textBaseline = "alphabetic";
      for (const n of nodes) {
        if (hidden(n)) continue;
        const appear = n.kind === "constitution" ? clamp(burst) : clamp((build - n.reveal - 0.15) / 0.4);
        const labelGate = n.kind === "constitution" ? clamp(burst * 1.4) : labels;
        const alpha = show * labelGate * appear * nodeDim(n) * (1 - u.dim);
        if (alpha <= 0.01) continue;
        const [x, y] = pos(n);
        if (n.kind === "entity" || n.kind === "constitution") {
          const big = n.kind === "constitution";
          const lead = ctx.createLinearGradient(x, y, x + (big ? 54 : 40), y);
          lead.addColorStop(0, "rgba(246,226,190,0.95)");
          lead.addColorStop(0.6, "rgba(232,204,160,0.55)");
          lead.addColorStop(1, "rgba(232,204,160,0)");
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = lead;
          ctx.lineWidth = big ? 2.8 : 2.5;
          ctx.beginPath();
          ctx.moveTo(x + n.r * 0.2, y);
          ctx.lineTo(x + (big ? 54 : 40), y);
          ctx.stroke();
          const size = (big ? 18.4 : 14.4) * labelBoost;
          ctx.font = `500 ${size}px "Roboto Condensed"`;
          ctx.letterSpacing = big ? "-0.27px" : "-0.2px";
          ctx.globalAlpha = alpha;
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = "#eef2ef";
          ctx.fillText(n.label, x + (big ? 56 : 28.4), y + (big ? -3.6 : -6.4));
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
          ctx.letterSpacing = "0px";
          pctBadge(ctx, x + (big ? 54 : 27.4), y + (big ? 2.5 : 4.6), n.pct, big ? 11.8 : 10.6, alpha);
        } else if (n.holding && n.row) {
          const row = n.row;
          const lx = x + n.r * n.boostV + 5;
          const ly = y - 2;
          const fs = 10.4 * labelBoost;
          ctx.font = `700 ${fs}px "Roboto Condensed"`;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = 4;
          ctx.fillStyle = "#efe9ff";
          ctx.fillText(n.label, lx, ly);
          ctx.font = `500 ${fs * 0.86}px "Roboto Condensed"`;
          ctx.fillStyle = row.day >= 0 ? "#86ebb5" : "#ff9aa0";
          ctx.fillText(`${row.day >= 0 ? "+" : ""}${(row.day * 100).toFixed(1)}%`, lx, ly + fs * 0.98);
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
        } else if (n.num !== undefined) {
          const [dx, dy] = BADGE_OFFSET[n.kind] || [5, -11];
          numBadge(ctx, x + dx, y + dy, n.num, n.kind === "info" && n.tint !== "cyan", alpha);
        }
      }
    }
    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} className="graph-canvas" aria-hidden="true" />;
}
