import graph from "../data/graph.json";
import { HOLDING_BY_ID, NODE_KINDS, SECTORS } from "../finance/holdings.js";

export const RADIUS = { constitution: 18, entity: 10.3, legislation: 10.6, service: 7.2, regulation: 3.2, info: 5.4 };

const byId = new Map();
export const nodes = graph.nodes.map((node, index) => {
  const base = { ...node, year: node.year + 2 };
  const holding = HOLDING_BY_ID.get(node.id);
  if (holding) {
    base.kind = "legislation";
    base.holding = holding.id;
    base.label = holding.ticker;
    delete base.num;
    delete base.tint;
    delete base.glow;
  } else if (node.kind === "entity") {
    base.sector = node.id;
    base.label = SECTORS[node.id].name;
  } else if (node.kind === "constitution") {
    base.label = "Portfolio";
  }
  const model = { ...base, index, r: RADIUS[base.kind], reveal: 0, edges: [], seed: (Math.sin(index * 91.7) + 1) * 0.5, dim: 0, off: false, boost: 1, tick: null };
  byId.set(node.id, model);
  return model;
});

export const constitution = byId.get("C");

export const edges = graph.edges.map((edge, index) => {
  const a = byId.get(edge.a);
  const b = byId.get(edge.b);
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const model = { ...edge, index, a, b, length, start: 0, duration: 0, from: a, to: b, seed: (Math.cos(index * 12.9) + 1) * 0.5 };
  a.edges.push(model);
  b.edges.push(model);
  return model;
});

export function nodeById(id) {
  return byId.get(id);
}

const speed = 640;
const dist = new Map([[constitution, 0]]);
const queue = [constitution];
while (queue.length) {
  queue.sort((p, q) => dist.get(p) - dist.get(q));
  const current = queue.shift();
  for (const edge of current.edges) {
    const other = edge.a === current ? edge.b : edge.a;
    const next = dist.get(current) + edge.length;
    if (!dist.has(other) || next < dist.get(other)) {
      dist.set(other, next);
      queue.push(other);
    }
  }
}

for (const node of nodes) {
  const d = dist.has(node) ? dist.get(node) : 900;
  node.reveal = node === constitution ? 0 : 0.26 + d / speed + node.seed * 0.06;
}

for (const edge of edges) {
  const forward = edge.a.reveal <= edge.b.reveal;
  edge.from = forward ? edge.a : edge.b;
  edge.to = forward ? edge.b : edge.a;
  edge.start = edge.from.reveal;
  edge.duration = Math.max(0.12, edge.length / speed);
}

export const BUILD_END = Math.max(...nodes.map((n) => n.reveal), ...edges.map((e) => e.start + e.duration)) + 1.4;

export const LEGEND = ["constitution", "entity", "legislation", "service", "regulation"].map((kind) => ({
  kind,
  label: NODE_KINDS[kind].label,
  count: nodes.filter((n) => n.kind === kind || (kind === "regulation" && n.kind === "info")).length,
}));

export const holdingNodes = nodes.filter((n) => n.holding);
export const sectorNodes = nodes.filter((n) => n.sector);
