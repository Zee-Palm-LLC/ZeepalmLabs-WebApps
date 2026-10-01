import { HOLDINGS } from "./holdings.js";

const HISTORY = 31;
const TICK_MS = 1400;
const STREAM_URL = "wss://data-stream.binance.vision/stream?streams=";

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gauss(rand) {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const rand = seeded(Date.now() % 100000);

export const quotes = new Map();

HOLDINGS.forEach((h, index) => {
  const r = seeded(index * 977 + 13);
  const step = h.vol / Math.sqrt(252) / 3;
  const history = [h.price];
  for (let i = 1; i < HISTORY; i += 1) history.unshift(history[0] * Math.exp(-step * gauss(r) + step * 0.08));
  const open = history[0];
  quotes.set(h.id, {
    id: h.id,
    price: h.price,
    open,
    prev: h.price,
    history,
    week: (r() - 0.45) * 0.08,
    live: false,
    tickAt: 0,
    dir: 0,
  });
});

const listeners = new Set();
let version = 0;

export function onMarket(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function marketVersion() {
  return version;
}

function emit(changed) {
  version += 1;
  listeners.forEach((fn) => fn(changed));
}

function push(q, price) {
  q.prev = q.price;
  q.price = price;
  q.dir = price > q.prev ? 1 : price < q.prev ? -1 : 0;
  q.tickAt = performance.now();
  q.history.push(price);
  if (q.history.length > HISTORY) q.history.shift();
}

function tick() {
  const changed = [];
  HOLDINGS.forEach((h) => {
    const q = quotes.get(h.id);
    if (q.live || rand() > 0.42) return;
    const step = (h.vol / Math.sqrt(252)) * 0.12;
    const pull = (q.open - q.price) / q.open;
    push(q, q.price * Math.exp(step * gauss(rand) + pull * 0.02));
    changed.push(h.id);
  });
  if (changed.length) emit(changed);
}

let socket = null;
export const feed = { status: "simulated", liveCount: 0 };

function connect() {
  const streams = HOLDINGS.filter((h) => h.stream);
  if (!streams.length || typeof WebSocket === "undefined") return;
  const byStream = new Map(streams.map((h) => [h.stream, h]));
  try {
    socket = new WebSocket(STREAM_URL + streams.map((h) => `${h.stream}@miniTicker`).join("/"));
  } catch {
    return;
  }
  socket.onmessage = (event) => {
    try {
      const { data } = JSON.parse(event.data);
      const h = byStream.get(String(data.s).toLowerCase());
      if (!h) return;
      const q = quotes.get(h.id);
      const price = Number(data.c);
      const open = Number(data.o);
      if (!Number.isFinite(price) || price <= 0) return;
      if (!q.live) {
        q.live = true;
        const scale = price / q.price;
        q.history = q.history.map((v) => v * scale);
        q.price = price;
        feed.liveCount += 1;
        feed.status = "live";
        emit([h.id, "rebase"]);
      }
      if (Number.isFinite(open) && open > 0) q.open = open;
      if (price !== q.price) {
        push(q, price);
        emit([h.id]);
      }
    } catch {
      return;
    }
  };
  socket.onclose = () => {
    socket = null;
    HOLDINGS.forEach((h) => {
      if (h.stream) quotes.get(h.id).live = false;
    });
    feed.liveCount = 0;
    feed.status = "simulated";
    setTimeout(connect, 15000);
  };
}

let timer = null;
export function startMarket() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  connect();
}

export function quote(id) {
  return quotes.get(id);
}

export function dayChange(id) {
  const q = quotes.get(id);
  return q ? q.price / q.open - 1 : 0;
}
