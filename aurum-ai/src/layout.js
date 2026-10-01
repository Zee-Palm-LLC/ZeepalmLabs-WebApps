import { STAGE_H, STAGE_W } from "./store.js";
import { nodes } from "./universe/model.js";

const GRAPH = (() => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const n of nodes) {
    const right = n.kind === "entity" || n.kind === "constitution" ? 120 : 12;
    x0 = Math.min(x0, n.x - n.r - 12);
    y0 = Math.min(y0, n.y - n.r - 18);
    x1 = Math.max(x1, n.x + n.r + right);
    y1 = Math.max(y1, n.y + n.r + 18);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
})();

const LAW = { x: 70, y: 138, w: 990, h: 940 };
const PAD = 12;
const TOOLBAR_BOTTOM = 128;
const LEGEND_TOP = 136;
const LEGEND_H = 40;
const PANEL = { w: 508, h: 862, peek: 236 };
const UDOCK = { w: 607, h: 170 };
const LDOCK = { w: 508, h: 106 };

export const COMPACT_LEGEND = { top: LEGEND_TOP, height: LEGEND_H };

function wide(vw, vh, dpr) {
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
  const w = vw / scale;
  const h = vh / scale;
  const cx = (w - STAGE_W) / 2;
  const cy = (h - STAGE_H) / 2;
  return {
    mode: "wide",
    side: false,
    scale,
    vw,
    vh,
    dpr,
    w,
    h,
    cx,
    cy,
    dx: w - STAGE_W,
    dy: h - STAGE_H,
    x: cx * scale,
    y: cy * scale,
    labelBoost: 1,
    g: { s: 1, x: cx, y: cy, cx: 800, cy: 620 },
    law: { s: 1, x: cx, y: cy, sx: 800, sy: 620 },
    dock: null,
    ldock: null,
    sheet: null,
  };
}

function compact(vw, vh, dpr) {
  const scale = Math.min(1.25, vw / 520, vh / 640);
  const w = vw / scale;
  const h = vh / scale;
  const cx = (w - STAGE_W) / 2;
  const cy = (h - STAGE_H) / 2;

  const side = w >= 1100;
  const fit = (box, left, top, width, height, stretch) => {
    const s = Math.min((width / box.w) * stretch, height / box.h);
    const midX = left + width / 2;
    const midY = top + height / 2;
    const out = { s, x: midX - (box.x + box.w / 2) * s, y: midY - (box.y + box.h / 2) * s };
    return { ...out, cx: (midX - out.x) / s, cy: (midY - out.y) / s };
  };

  const ds = Math.min(1, (w - PAD * 2) / UDOCK.w);
  const dock = { x: side ? w - PAD - UDOCK.w * ds : (w - UDOCK.w * ds) / 2, y: h - PAD - UDOCK.h * ds, s: ds };
  const graphTop = LEGEND_TOP + LEGEND_H + 10;
  const g = side
    ? fit(GRAPH, PAD, graphTop, dock.x - PAD * 2, Math.max(120, h - PAD - graphTop), 1)
    : fit(GRAPH, PAD, graphTop, w - PAD * 2, Math.max(120, dock.y - 14 - graphTop), 1.35);

  let ps = Math.min(1, (w - PAD * 2) / PANEL.w);
  const room = (s) => h - PAD - LDOCK.h * s - 12 - (side ? TOOLBAR_BOTTOM : 16);
  ps = Math.max(0.4, Math.min(ps, room(ps) / PANEL.h));
  const ldock = { x: side ? w - PAD - LDOCK.w * ps : (w - LDOCK.w * ps) / 2, y: h - PAD - LDOCK.h * ps, s: ps };
  const open = ldock.y - 12 - PANEL.h * ps;
  const sheet = {
    x: ldock.x,
    s: ps,
    open,
    peek: side ? open : ldock.y - 12 - PANEL.peek * ps,
    floor: ldock.y - 6,
    side,
  };

  const lawTop = TOOLBAR_BOTTOM - 6;
  const law = side
    ? fit(LAW, PAD, lawTop, sheet.x - PAD * 2, h - PAD - lawTop, 1)
    : fit(LAW, PAD, lawTop, w - PAD * 2, Math.max(120, sheet.peek - 10 - lawTop), 1);
  law.sx = law.cx;
  law.sy = law.cy;

  return {
    mode: "compact",
    side,
    scale,
    vw,
    vh,
    dpr,
    w,
    h,
    cx,
    cy,
    dx: w - STAGE_W,
    dy: h - STAGE_H,
    x: cx * scale,
    y: cy * scale,
    labelBoost: Math.min(2.2, Math.max(1, 0.8 / g.s)),
    g,
    law,
    dock,
    ldock,
    sheet,
  };
}

export function computeLayout(vw, vh, dpr) {
  const isCompact = vw < 900 || vw / vh < 1;
  return isCompact ? compact(vw, vh, dpr) : wide(vw, vh, dpr);
}
