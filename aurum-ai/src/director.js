import gsap from "gsap";
import { S, getUi, renderNow, setUi } from "./store.js";
import { BUILD_END, nodeById } from "./universe/model.js";
import { QUERY } from "./components/Dock.jsx";
import { CARDS } from "./law/lawData.js";
import { dockStats as liveStats, getSummary } from "./finance/portfolio.js";
import { CATEGORIES, answer, holdingFeed } from "./finance/ai.js";
import { DEFAULT_HOLDING } from "./finance/holdings.js";
import { refreshInsights } from "./finance/live.js";

const FAN_END = 24 * 0.11 + 0.62;
const LINK_GAP = 0.42;
const ZOOM = { s: 1.78, x: -1137, y: -557 };
const STATS_END = [5.8, 5.5, 5.8, 6.1];
const GRID_FINAL = [1, 1, 1, 1];
const TITLE_END = 48;

function cardCounts() {
  const summary = getSummary();
  const row = summary.byId.get(getUi().holding) ?? summary.byId.get(DEFAULT_HOLDING);
  return CATEGORIES.map((c) => holdingFeed(row, summary, c.key).length);
}

function holdingNode(id) {
  return nodeById(id) ?? nodeById(DEFAULT_HOLDING);
}

function ask(query) {
  const ui = getUi();
  return answer(query, getSummary(), { agent: ui.agent, sources: ui.sources, holdingId: ui.holding });
}

let master = null;

function resetAll() {
  gsap.killTweensOf([S.u, S.u.cam, S.chrome, S.chrome.toolbar, S.chrome.stats, S.chrome.analysisCards, S.l, S.l.links, S.l.cards, S.l.cardGlow, S.l.cardCount, S.l.gridCount]);
  Object.assign(S.u, { show: 1, burst: 0, build: 0, labels: 0, spread: 1.22, glints: 0, dim: 0, hover: null });
  Object.assign(S.u.cam, { s: 1, x: 0, y: 0 });
  Object.assign(S.chrome, {
    hamburger: 0,
    logo: 0,
    right: 0,
    years: 0,
    pill: 0,
    legend: 0,
    legendRows: 0,
    dock: 0,
    dockInner: 0,
    dockZoom: 0,
    dockDrop: 0,
    ri: 0,
    analysis: 0,
    critical: 0,
    aside: 0,
    typing: 0,
  });
  S.chrome.toolbar.fill(0);
  S.chrome.stats.fill(0);
  S.chrome.analysisCards.fill(0);
  Object.assign(S.l, {
    show: 0,
    orb: 0,
    title: 0,
    gaps: 0,
    cam: 0,
    link: 0,
    halo: 0,
    fan: 0,
    panel: 0,
    kpi: 0,
    header: 0,
    status: 0,
    sentimentBox: 0,
    sentiment: 0,
    grid: 0,
    riBlock: 0,
    dock: 0,
  });
  S.l.links.fill(0);
  S.l.cards.fill(0);
  S.l.cardGlow.fill(0);
  S.l.cardCount.fill(0);
  S.l.gridCount.fill(0);
}

function addLaw(tl, at, pace = 1) {
  const l = S.l;
  const T = (v) => at + v * pace;
  tl.to(l, { show: 1, duration: 0.4 * pace }, T(0));
  tl.to(l, { orb: 1, duration: 0.6 * pace }, T(0.1));
  tl.to(l, { title: TITLE_END, duration: 0.7 * pace }, T(0.22));
  tl.to(l, { gaps: 1, duration: 0.4 * pace }, T(0.45));
  tl.to(l, { cam: 1, duration: 5.6 * pace, ease: "power3.out" }, T(1.15));
  const starts = [1.45, 1.75, 1.9, 2.25, 2.35];
  const counts = cardCounts();
  CARDS.forEach((card, i) => {
    tl.to(l.links, { [i]: 1, duration: LINK_GAP * pace, ease: "power1.inOut" }, T(starts[i] - LINK_GAP));
    tl.to(l.cards, { [i]: 1, duration: 0.45 * pace, ease: "power2.out" }, T(starts[i]));
    tl.set(l.cardGlow, { [i]: 1 }, T(starts[i]));
    tl.to(l.cardCount, { [i]: counts[i], duration: 1.0 * pace, ease: "power1.out" }, T(starts[i]));
    tl.to(l.cardGlow, { [i]: 0, duration: 1.1 * pace, ease: "power1.inOut" }, T(starts[i] + 0.95));
  });
  tl.to(l, { halo: 1, duration: 0.8 * pace }, T(2.85));
  tl.to(l, { fan: FAN_END, duration: 4.1 * pace, ease: "none" }, T(3.3));
  tl.to(l, { panel: 1, duration: 0.85 * pace, ease: "power2.out" }, T(6.65));
  tl.to(l, { header: 1, duration: 0.45 * pace }, T(7.2));
  tl.to(l, { kpi: 1, duration: 0.5 * pace, ease: "power2.out" }, T(7.4));
  tl.to(l, { status: 1, duration: 0.4 * pace }, T(7.4));
  tl.to(l, { sentimentBox: 1, duration: 0.35 * pace }, T(7.4));
  tl.to(l, { sentiment: 1, duration: 0.85 * pace }, T(7.5));
  tl.to(l, { grid: 1, duration: 0.6 * pace }, T(8.05));
  tl.to(l.gridCount, { 0: GRID_FINAL[0], 1: GRID_FINAL[1], 2: GRID_FINAL[2], 3: GRID_FINAL[3], duration: 1.1 * pace }, T(8.15));
  tl.to(l, { riBlock: 1, duration: 0.4 * pace }, T(8.8));
  tl.to(l, { dock: 1, duration: 0.55 * pace, ease: "power2.out" }, T(9.2));
  return T(9.8);
}

export function buildIntro() {
  resetAll();
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const u = S.u;
  const c = S.chrome;

  tl.to(u, { burst: 1, duration: 0.55, ease: "power2.out" }, 0);
  tl.to(u, { build: BUILD_END, duration: BUILD_END, ease: "none" }, 0.12);
  tl.to(u, { spread: 1, duration: 2.2, ease: "power2.out" }, 0.35);
  tl.to(u, { labels: 1, duration: 0.9 }, 1.0);
  tl.to(u, { glints: 1, duration: 1.0 }, 2.0);

  tl.to(c, { logo: 1, hamburger: 1, duration: 0.5, ease: "power2.out" }, 1.45);
  [1.6, 1.72, 1.84, 1.96, 2.08].forEach((at, i) => tl.to(c.toolbar, { [i]: 1, duration: 0.45, ease: "power2.out" }, at));
  tl.to(c, { right: 1, duration: 0.5, ease: "power2.out" }, 1.75);
  tl.to(c, { years: 1, duration: 0.8, ease: "power2.out" }, 1.5);
  tl.to(c, { pill: 1, duration: 0.5, ease: "power2.out" }, 2.4);
  tl.to(c, { legend: 1, duration: 0.55, ease: "power2.out" }, 2.0);
  tl.to(c, { legendRows: 1, duration: 0.6 }, 2.25);
  tl.to(c, { dock: 1, duration: 0.6, ease: "power2.out" }, 2.2);
  tl.to(c, { dockInner: 1, duration: 1.8, ease: "power1.in" }, 2.4);
  liveStats().forEach((value, i) => tl.to(c.stats, { [i]: value, duration: STATS_END[i] - 2.15 }, 2.15));

  tl.to(u.cam, { ...ZOOM, duration: 1.15, ease: "power2.inOut" }, 4.25);
  tl.to(c, { dockZoom: 1, duration: 1.0, ease: "power2.inOut" }, 4.3);
  tl.to(c, { aside: 1, duration: 0.6, ease: "power2.in" }, 4.3);

  tl.to(c, { typing: QUERY.length, duration: 1.95 }, 5.5);
  tl.to(c, { ri: 1, duration: 0.25 }, 5.75);
  tl.call(() => setUi({ query: QUERY, answer: ask(QUERY), insightPage: 0 }), [], 5.9);
  tl.to(c, { analysis: 1, duration: 0.45, ease: "power2.out" }, 5.95);
  tl.to(c.analysisCards, { 0: 1, duration: 0.3 }, 6.05);
  tl.to(c.analysisCards, { 1: 1, duration: 0.3 }, 6.3);
  tl.to(c, { critical: 1, duration: 1.3 }, 7.05);

  const target = nodeById(DEFAULT_HOLDING);
  const deep = ZOOM.s * 3.4;
  const { cx: gx, cy: gy } = S.stage.g;
  tl.to(u.cam, { s: deep, x: gx - deep * target.x, y: gy - deep * target.y, duration: 0.75, ease: "power2.in" }, 9.3);
  tl.to(c, { dockDrop: 1, analysis: 0, duration: 0.5, ease: "power2.in" }, 9.3);
  tl.to(u, { show: 0, duration: 0.45, ease: "power1.in" }, 9.6);
  tl.call(() => setUi({ view: "law" }), [], 9.8);
  const end = addLaw(tl, 9.75);
  tl.call(() => setUi({ intro: false }), [], end);
  return tl;
}

export function playIntro() {
  if (master) master.kill();
  setUi({ view: "universe", intro: true, query: "", analysisOpen: false, selectedCard: 2, holding: DEFAULT_HOLDING, answer: null, focusItem: null, lawAnswer: null, sheetOpen: false });
  refreshInsights();
  master = buildIntro();
  master.play(0);
  return master;
}

export function freezeAt(t) {
  if (master) master.kill();
  setUi({ view: "universe", intro: true, holding: DEFAULT_HOLDING });
  master = buildIntro();
  master.pause();
  S.frozen = true;
  S.clock = t;
  master.seek(t, false);
  renderNow();
}

export function skipIntro() {
  if (!master || !getUi().intro) return;
  master.progress(1);
}

export function introActive() {
  return Boolean(master && master.isActive());
}

export function toLaw(node) {
  if (node?.holding) setUi({ holding: node.holding });
  else if (node?.kind === "constitution") {
    const top = [...getSummary().rows].sort((a, b) => b.value - a.value)[0];
    if (top) setUi({ holding: top.id });
  }
  if (getUi().view === "law") return;
  setUi({ focusItem: null, lawAnswer: null, sheetOpen: false });
  const u = S.u;
  const c = S.chrome;
  setUi({ analysisOpen: false });
  u.hover = null;
  gsap.killTweensOf([u, u.cam, c, S.l]);
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  const deep = Math.max(u.cam.s * 3.2, 5);
  const target = node || holdingNode(getUi().holding);
  const { cx: gx, cy: gy } = S.stage.g;
  tl.to(u.cam, { s: deep, x: gx - deep * target.x, y: gy - deep * target.y, duration: 0.8, ease: "power2.in" }, 0);
  tl.to(c, { dockDrop: 1, analysis: 0, aside: 1, duration: 0.5, ease: "power2.in" }, 0);
  tl.to(u, { show: 0, duration: 0.45, ease: "power1.in" }, 0.3);
  tl.call(() => setUi({ view: "law" }), [], 0.55);
  resetLawValues();
  addLaw(tl, 0.5, 0.55);
}

function resetLawValues() {
  Object.assign(S.l, {
    orb: 0,
    title: 0,
    gaps: 0,
    cam: 0,
    link: 0,
    halo: 0,
    fan: 0,
    panel: 0,
    kpi: 0,
    header: 0,
    status: 0,
    sentimentBox: 0,
    sentiment: 0,
    grid: 0,
    riBlock: 0,
    dock: 0,
  });
  S.l.links.fill(0);
  S.l.cards.fill(0);
  S.l.cardGlow.fill(0);
  S.l.cardCount.fill(0);
  S.l.gridCount.fill(0);
}

export function toUniverse() {
  if (master && getUi().intro) master.kill();
  setUi({ view: "universe", intro: false, analysisOpen: false });
  const u = S.u;
  const c = S.chrome;
  gsap.killTweensOf([u, u.cam, c, S.l, c.analysisCards]);
  Object.assign(u, { burst: 1, build: BUILD_END, labels: 1, spread: 1, glints: 1 });
  c.toolbar.fill(1);
  Object.assign(c, { logo: 1, hamburger: 1, right: 1, pill: 1, legendRows: 1, dockInner: 1, typing: 0 });
  liveStats().forEach((v, i) => (c.stats[i] = v));
  const fromLaw = S.l.show > 0.01;
  if (fromLaw) {
    const target = holdingNode(getUi().holding);
    const deep = 1.6;
    u.cam.s = deep;
    u.cam.x = S.stage.g.cx - deep * target.x;
    u.cam.y = S.stage.g.cy - deep * target.y;
  }
  const tl = gsap.timeline();
  tl.to(S.l, { show: 0, panel: 0, kpi: 0, dock: 0, duration: 0.45, ease: "power2.in" }, 0);
  tl.to(u, { show: 1, duration: 0.6, ease: "power2.out" }, 0.2);
  tl.to(u.cam, { s: 1, x: 0, y: 0, duration: 1.1, ease: "power3.inOut" }, 0.2);
  tl.to(c, { dockZoom: 0, dockDrop: 0, aside: 0, analysis: 0, ri: 0, critical: 0, dock: 1, years: 1, legend: 1, duration: 0.9, ease: "power3.out" }, 0.4);
  tl.to(c.analysisCards, { 0: 0, 1: 0, duration: 0.3 }, 0);
}

export function resetCamera() {
  gsap.killTweensOf(S.u.cam);
  gsap.to(S.u.cam, { s: 1, x: 0, y: 0, duration: 0.9, ease: "power3.inOut" });
}

export function zoomBy(factor) {
  const cam = S.u.cam;
  const next = Math.min(3.2, Math.max(0.55, cam.s * factor));
  const cx = S.stage.g.cx;
  const cy = S.stage.g.cy;
  gsap.to(cam, {
    s: next,
    x: cx - ((cx - cam.x) * next) / cam.s,
    y: cy - ((cy - cam.y) * next) / cam.s,
    duration: 0.6,
    ease: "power3.out",
  });
}

export function openAnalysis(query) {
  const c = S.chrome;
  setUi({ analysisOpen: true, query });
  gsap.killTweensOf([c, c.analysisCards]);
  const tl = gsap.timeline();
  c.analysisCards.fill(0);
  c.critical = 0;
  tl.to(c, { ri: 1, analysis: 1, duration: 0.45, ease: "power2.out" }, 0);
  tl.to(c.analysisCards, { 0: 1, duration: 0.35 }, 0.2);
  tl.to(c.analysisCards, { 1: 1, duration: 0.35 }, 0.45);
  tl.to(c, { critical: 1, duration: 1.1, ease: "none" }, 0.9);
}

export function closeAnalysis() {
  const c = S.chrome;
  setUi({ analysisOpen: false });
  gsap.killTweensOf([c, c.analysisCards]);
  gsap.to(c, { analysis: 0, ri: 0, duration: 0.35, ease: "power2.in" });
}

export function toggleAnalysis() {
  if (S.chrome.analysis > 0.5) closeAnalysis();
  else openAnalysis(getUi().query || QUERY);
}

export function focusEntity(node) {
  const cam = S.u.cam;
  const s = 1.9;
  gsap.to(cam, { s, x: S.stage.g.cx - s * node.x, y: S.stage.g.cy - 60 - s * node.y, duration: 1.1, ease: "power3.inOut" });
}

export function openHolding(id) {
  if (!nodeById(id)) return;
  if (getUi().view !== "law") {
    toLaw(nodeById(id));
    return;
  }
  if (getUi().holding === id) return;
  setUi({ holding: id, focusItem: null, lawAnswer: null });
  const l = S.l;
  gsap.killTweensOf([l, l.cardCount, l.gridCount]);
  const counts = cardCounts();
  const tl = gsap.timeline();
  tl.fromTo(l, { title: 0 }, { title: TITLE_END, duration: 0.6, ease: "none" }, 0);
  tl.fromTo(l, { orb: 0.55 }, { orb: 1, duration: 0.5, ease: "power2.out" }, 0);
  tl.to(l.cardCount, { 0: counts[0], 1: counts[1], 2: counts[2], 3: counts[3], 4: counts[4], duration: 0.6 }, 0);
  tl.fromTo(l, { fan: 0 }, { fan: FAN_END, duration: 2.2, ease: "none" }, 0.1);
  tl.fromTo(l, { header: 0, status: 0 }, { header: 1, status: 1, duration: 0.4 }, 0.15);
  tl.fromTo(l, { sentiment: 0 }, { sentiment: 1, duration: 0.7 }, 0.25);
  tl.fromTo(l.gridCount, { 0: 0, 1: 0, 2: 0, 3: 0 }, { 0: 1, 1: 1, 2: 1, 3: 1, duration: 0.8 }, 0.3);
  tl.fromTo(l, { riBlock: 0.2 }, { riBlock: 1, duration: 0.6, ease: "power2.out" }, 0.5);
}

export function aiScan() {
  const u = S.u;
  const list = refreshInsights();
  setUi({ answer: null, insightPage: 0 });
  gsap.killTweensOf(u, "glints");
  gsap.fromTo(u, { glints: 3.2 }, { glints: 1, duration: 2.4, ease: "power2.out" });
  if (getUi().view === "universe") openAnalysis(getUi().query || "AI scan");
  else pulseRi();
  return list;
}

export function askAi(query) {
  const result = ask(query);
  if (getUi().view === "law") {
    setUi({ lawAnswer: result, focusItem: null, sheetOpen: getUi().compact ? true : getUi().sheetOpen });
    pulseRi();
  } else {
    setUi({ answer: result, insightPage: 0 });
    openAnalysis(query);
  }
  return result;
}

export function replayFan() {
  gsap.fromTo(S.l, { fan: 0 }, { fan: FAN_END, duration: 2.2, ease: "none" });
}

export function pulseRi() {
  gsap.fromTo(S.l, { riBlock: 0.2 }, { riBlock: 1, duration: 0.6, ease: "power2.out" });
}
