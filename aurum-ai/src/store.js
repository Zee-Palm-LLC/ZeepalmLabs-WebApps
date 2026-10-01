import gsap from "gsap";
import { useEffect, useRef, useSyncExternalStore } from "react";

export const STAGE_W = 1600;
export const STAGE_H = 1200;

export const S = {
  clock: 0,
  frozen: false,
  stage: {
    mode: "wide",
    scale: 1,
    x: 0,
    y: 0,
    vw: STAGE_W,
    vh: STAGE_H,
    dpr: 1,
    w: STAGE_W,
    h: STAGE_H,
    cx: 0,
    cy: 0,
    dx: 0,
    dy: 0,
    labelBoost: 1,
    g: { s: 1, x: 0, y: 0, cx: 800, cy: 620 },
    law: { s: 1, x: 0, y: 0, sx: 800, sy: 620 },
    dock: null,
    ldock: null,
    sheet: null,
  },
  pointer: { x: -9999, y: -9999, inside: false },
  u: {
    show: 1,
    burst: 0,
    build: 0,
    settle: 0,
    labels: 0,
    spread: 1.22,
    glints: 0,
    cam: { s: 1, x: 0, y: 0 },
    dim: 0,
    hover: null,
    focus: null,
    hidden: { entity: false, legislation: false, service: false, regulation: false, constitution: false },
    year: 2026,
  },
  chrome: {
    hamburger: 0,
    logo: 0,
    toolbar: [0, 0, 0, 0, 0],
    right: 0,
    years: 0,
    pill: 0,
    legend: 0,
    legendRows: 0,
    dock: 0,
    dockInner: 0,
    dockZoom: 0,
    dockDrop: 0,
    typing: 0,
    stats: [0, 0, 0, 0],
    ri: 0,
    analysis: 0,
    analysisCards: [0, 0],
    critical: 0,
    aside: 0,
  },
  l: {
    show: 0,
    orb: 0,
    title: 0,
    gaps: 0,
    cam: 0,
    link: 0,
    links: [0, 0, 0, 0, 0],
    cards: [0, 0, 0, 0, 0],
    cardGlow: [0, 0, 0, 0, 0],
    cardCount: [0, 0, 0, 0, 0],
    halo: 0,
    fan: 0,
    panel: 0,
    kpi: 0,
    header: 0,
    status: 0,
    sentimentBox: 0,
    sentiment: 0,
    grid: 0,
    gridCount: [0, 0, 0, 0],
    riBlock: 0,
    dock: 0,
    hoverLaw: -1,
  },
};

const frameFns = new Set();
let lastTime = 0;

gsap.ticker.add((time) => {
  const delta = lastTime ? time - lastTime : 0;
  lastTime = time;
  if (!S.frozen) S.clock += Math.min(delta, 0.1);
  frameFns.forEach((fn) => fn(S));
});

export function renderNow() {
  frameFns.forEach((fn) => fn(S));
}

export function useFrame(fn) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const call = (state) => ref.current(state);
    frameFns.add(call);
    return () => frameFns.delete(call);
  }, []);
}

const listeners = new Set();
let ui = {
  view: "universe",
  intro: true,
  analysisOpen: false,
  query: "",
  typed: "",
  selectedCard: 2,
  activeTool: "network",
  legend: { constitution: true, entity: true, legislation: true, service: true, regulation: true },
  year: 2026,
  theme: "dark",
  holding: "L11",
  privacy: false,
  agent: "balanced",
  sources: { prices: true, history: true, news: true },
  filter: { move: "all", sectors: [], minWeight: 0 },
  rank: "weight",
  overlay: null,
  anchor: null,
  tradeFor: null,
  toasts: [],
  insightPage: 0,
  insights: [],
  answer: null,
  lawAnswer: null,
  focusItem: null,
  compact: false,
  side: false,
  sheetOpen: false,
};

export function getUi() {
  return ui;
}

export function setUi(patch) {
  const next = typeof patch === "function" ? patch(ui) : patch;
  ui = { ...ui, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUi(selector) {
  return useSyncExternalStore(subscribe, () => selector(ui));
}

export { subscribe as subscribeUi };
