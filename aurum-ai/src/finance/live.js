import { S, getUi, setUi, subscribeUi } from "../store.js";
import { constitution, holdingNodes, sectorNodes } from "../universe/model.js";
import { onMarket, startMarket } from "./market.js";
import { getSummary, subscribe } from "./portfolio.js";
import { insights } from "./ai.js";

let toastId = 0;

export function closeOverlay() {
  setUi({ overlay: null, anchor: null });
}

export function toast(text, tone = "info") {
  toastId += 1;
  const id = toastId;
  setUi((ui) => ({ toasts: [...ui.toasts, { id, text, tone }].slice(-4) }));
  setTimeout(() => setUi((ui) => ({ toasts: ui.toasts.filter((t) => t.id !== id) })), 3800);
}

function boostFor(rank, row) {
  if (rank === "weight") return 0.72 + Math.min(1, row.weight / 0.1) * 0.78;
  if (rank === "day") return 0.78 + Math.min(1, Math.abs(row.day) / 0.03) * 0.72;
  if (rank === "return") return 0.75 + Math.max(0, Math.min(1, (row.plPct + 0.2) / 1.6)) * 0.75;
  if (rank === "risk") return 0.7 + Math.min(1, row.vol / 0.7) * 0.8;
  return 1;
}

export function syncGraph() {
  const ui = getUi();
  const summary = getSummary();
  const { filter, rank, year } = ui;
  constitution.pct = Math.round(summary.plPct * 100);
  for (const n of sectorNodes) {
    const sector = summary.sectorByKey.get(n.sector);
    n.pct = Math.round(sector.weight * 100);
    n.dim = filter.sectors.includes(n.sector) ? 1 : 0;
  }
  for (const n of holdingNodes) {
    const row = summary.byId.get(n.holding);
    n.row = row;
    n.off = n.year > year;
    let dim = 0;
    if (filter.move === "gainers" && row.day <= 0) dim = 1;
    if (filter.move === "losers" && row.day >= 0) dim = 1;
    if (filter.sectors.includes(row.sector)) dim = 1;
    if (row.weight < filter.minWeight) dim = 1;
    if (row.shares <= 0 && filter.minWeight > 0) dim = 1;
    n.dim = dim;
    n.boost = boostFor(rank, row);
  }
}

export function refreshInsights() {
  const list = insights(getSummary(), getUi().agent);
  setUi({ insights: list });
  return list;
}

let started = false;
export function startFinance() {
  if (started) return;
  started = true;
  syncGraph();
  refreshInsights();
  onMarket((changed) => {
    const set = new Set(changed);
    for (const n of holdingNodes) {
      if (set.has(n.holding)) {
        const q = n.row?.quote;
        n.tick = { t: S.clock, up: q ? q.dir >= 0 : true };
      }
    }
  });
  subscribe(syncGraph);
  let last = getUi();
  setInterval(() => {
    const ui = getUi();
    if (!ui.intro && !ui.answer) refreshInsights();
  }, 9000);
  const watch = () => {
    const ui = getUi();
    const prev = last;
    last = ui;
    if (ui.filter !== prev.filter || ui.rank !== prev.rank || ui.year !== prev.year) syncGraph();
    if (ui.agent !== prev.agent) refreshInsights();
  };
  subscribeUi(watch);
  startMarket();
}
