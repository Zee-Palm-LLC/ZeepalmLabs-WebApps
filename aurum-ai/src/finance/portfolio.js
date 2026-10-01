import { useSyncExternalStore } from "react";
import { HOLDINGS, HOLDING_BY_ID, SECTORS, SECTOR_ORDER, START_CASH } from "./holdings.js";
import { onMarket, quote } from "./market.js";

const KEY = "aurum.portfolio.v1";
const DAY = 86400000;

function defaults() {
  const positions = {};
  HOLDINGS.forEach((h) => {
    positions[h.id] = { shares: h.shares, cost: h.price * h.cost, touched: false };
  });
  const now = Date.now();
  const tx = HOLDINGS.flatMap((h, i) => {
    const first = Math.round(h.shares * 0.6 * 10000) / 10000;
    const second = Math.round((h.shares - first) * 10000) / 10000;
    return [
      { id: `seed-${h.id}-a`, t: now - (420 + i * 23) * DAY, side: "buy", holding: h.id, qty: first, price: h.price * h.cost * 0.92 },
      { id: `seed-${h.id}-b`, t: now - (90 + i * 7) * DAY, side: "buy", holding: h.id, qty: second, price: h.price * h.cost * 1.12 },
    ];
  }).sort((a, b) => b.t - a.t);
  return { cash: START_CASH, positions, tx, risk: "balanced" };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const saved = JSON.parse(raw);
    const base = defaults();
    return {
      cash: Number.isFinite(saved.cash) ? saved.cash : base.cash,
      positions: { ...base.positions, ...saved.positions },
      tx: Array.isArray(saved.tx) ? saved.tx : base.tx,
      risk: saved.risk || base.risk,
    };
  } catch {
    return defaults();
  }
}

const state = load();
const listeners = new Set();
let version = 0;
let summary = null;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

function emit() {
  version += 1;
  summary = null;
  listeners.forEach((fn) => fn());
}

onMarket((changed) => {
  if (changed.includes("rebase")) {
    const h = HOLDING_BY_ID.get(changed[0]);
    const p = state.positions[h.id];
    if (h && p && !p.touched) p.cost = quote(h.id).price * h.cost;
  }
  emit();
});

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useFinance() {
  useSyncExternalStore(subscribe, () => version);
  return getSummary();
}

export function getState() {
  return state;
}

export function position(id) {
  return state.positions[id] || { shares: 0, cost: 0 };
}

export function getSummary() {
  if (summary) return summary;
  const rows = HOLDINGS.map((h) => {
    const q = quote(h.id);
    const p = position(h.id);
    const value = p.shares * q.price;
    const basis = p.shares * p.cost;
    return {
      ...h,
      quote: q,
      price: q.price,
      shares: p.shares,
      cost: p.cost,
      value,
      basis,
      pl: value - basis,
      plPct: basis > 0 ? value / basis - 1 : 0,
      day: q.price / q.open - 1,
      dayPl: p.shares * (q.price - q.open),
      week: q.week + (q.price / q.open - 1),
    };
  });
  const invested = rows.reduce((sum, r) => sum + r.value, 0);
  const basis = rows.reduce((sum, r) => sum + r.basis, 0);
  const dayPl = rows.reduce((sum, r) => sum + r.dayPl, 0);
  const net = invested + state.cash;
  rows.forEach((r) => {
    r.weight = net > 0 ? r.value / net : 0;
  });
  const sectors = SECTOR_ORDER.map((key) => {
    const list = rows.filter((r) => r.sector === key);
    const value = list.reduce((sum, r) => sum + r.value, 0);
    const sBasis = list.reduce((sum, r) => sum + r.basis, 0);
    const day = list.reduce((sum, r) => sum + r.dayPl, 0);
    return {
      key,
      ...SECTORS[key],
      holdings: list,
      value,
      weight: net > 0 ? value / net : 0,
      target: SECTORS[key].target[state.risk],
      plPct: sBasis > 0 ? value / sBasis - 1 : 0,
      day: value - day > 0 ? day / (value - day) : 0,
    };
  });
  const vol = rows.reduce((sum, r) => sum + r.weight * r.vol, 0);
  const top = Math.max(...sectors.map((s) => s.weight));
  const risk = Math.round(Math.min(99, vol * 140 + Math.max(0, top - 0.25) * 60));
  const drift = sectors.filter((s) => Math.abs(s.weight - s.target) > 0.04).length;
  const alerts = drift + rows.filter((r) => Math.abs(r.day) > 0.025).length;
  const health = Math.round(Math.max(20, Math.min(99, 100 - drift * 6 - Math.max(0, risk - 45) * 0.8 - (state.cash / net > 0.12 ? 6 : 0))));
  summary = {
    rows,
    byId: new Map(rows.map((r) => [r.id, r])),
    sectors,
    sectorByKey: new Map(sectors.map((s) => [s.key, s])),
    cash: state.cash,
    invested,
    basis,
    net,
    pl: invested - basis,
    plPct: basis > 0 ? invested / basis - 1 : 0,
    dayPl,
    dayPct: net - dayPl > 0 ? dayPl / (net - dayPl) : 0,
    risk,
    alerts,
    health,
    riskProfile: state.risk,
    tx: state.tx,
  };
  return summary;
}

export function dockStats() {
  const s = getSummary();
  return [s.plPct * 100, s.net / 1000, s.cash / 1000, s.health];
}

export function trade(id, side, qty) {
  const h = HOLDING_BY_ID.get(id);
  const amount = Number(qty);
  if (!h || !Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a quantity above zero." };
  const q = quote(id);
  const p = { ...position(id) };
  const total = amount * q.price;
  if (side === "buy") {
    if (total > state.cash + 0.005) return { ok: false, message: `Not enough cash. You have $${state.cash.toFixed(2)} available.` };
    p.cost = (p.shares * p.cost + total) / (p.shares + amount);
    p.shares += amount;
    state.cash -= total;
  } else {
    if (amount > p.shares + 1e-9) return { ok: false, message: `You only hold ${p.shares} ${h.ticker}.` };
    p.shares = Math.max(0, p.shares - amount);
    if (p.shares < 1e-9) p.shares = 0;
    state.cash += total;
  }
  p.touched = true;
  state.positions[id] = p;
  state.tx = [{ id: `tx-${Date.now()}`, t: Date.now(), side, holding: id, qty: amount, price: q.price }, ...state.tx];
  save();
  emit();
  return { ok: true, message: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${h.ticker} at $${q.price.toFixed(2)}.`, total };
}

export function setRisk(risk) {
  state.risk = risk;
  save();
  emit();
}

export function resetPortfolio() {
  const base = defaults();
  Object.assign(state, base);
  save();
  emit();
}

export function transactionsCsv() {
  const lines = [["date", "side", "ticker", "quantity", "price", "total"].join(",")];
  state.tx.forEach((t) => {
    const h = HOLDING_BY_ID.get(t.holding);
    lines.push([new Date(t.t).toISOString().slice(0, 10), t.side, h ? h.ticker : t.holding, t.qty, t.price.toFixed(2), (t.qty * t.price).toFixed(2)].join(","));
  });
  return lines.join("\n");
}
