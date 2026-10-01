import { useRef, useState } from "react";
import { S, getUi, useFrame } from "../store.js";
import { NODE_KINDS } from "../finance/holdings.js";
import { getSummary } from "../finance/portfolio.js";
import { money, pct, price } from "../finance/format.js";

function describe(node) {
  const summary = getSummary();
  const tap = getUi().compact;
  if (node.holding) {
    const row = summary.byId.get(node.holding);
    return {
      kind: `Holding · ${summary.sectorByKey.get(row.sector).short}`,
      title: `${row.ticker} · ${row.short}`,
      meta: `${price(row.price)} · ${pct(row.day)} today · ${pct(row.weight, 1, false)} of portfolio`,
      extra: row.shares > 0 ? `${money(row.value, { compact: true })} · ${pct(row.plPct, 0)} on cost` : "Not held, watchlist only",
      action: tap ? "Tap again to open this position" : "Click to open this position",
      tone: row.day >= 0 ? "up" : "down",
    };
  }
  if (node.sector) {
    const s = summary.sectorByKey.get(node.sector);
    return {
      kind: "Sector",
      title: s.name,
      meta: `${money(s.value, { compact: true })} · ${pct(s.weight, 1, false)} of portfolio`,
      extra: `Target ${pct(s.target, 0, false)} · ${pct(s.day)} today · ${s.holdings.length} holdings`,
      action: tap ? "Tap again to focus this sector" : "Click to focus this sector",
      tone: s.day >= 0 ? "up" : "down",
    };
  }
  if (node.kind === "constitution") {
    return {
      kind: "Portfolio",
      title: `Net worth ${money(summary.net, { compact: true })}`,
      meta: `${pct(summary.dayPct)} today · ${money(summary.dayPl, { compact: true })}`,
      extra: `${pct(summary.plPct, 1)} on cost · Cash ${money(summary.cash, { compact: true })}`,
      action: tap ? "Tap again to open the top holding" : "Click to open the top holding",
      tone: summary.dayPct >= 0 ? "up" : "down",
    };
  }
  const kind = NODE_KINDS[node.kind]?.tip ?? "Node";
  return {
    kind,
    title: `${kind} #${node.num ?? node.index}`,
    meta: `${node.edges.length} connections · since ${node.year}`,
    extra: node.kind === "service" ? "Recorded trade lot" : "Model signal from the AI analyst",
    action: null,
    tone: null,
  };
}

export default function NodeTooltip() {
  const ref = useRef(null);
  const [node, setNode] = useState(null);
  const [, setTick] = useState(0);
  const last = useRef(null);
  const stamp = useRef(0);

  useFrame((s) => {
    const hover = getUi().view === "universe" && s.u.show > 0.5 ? s.u.hover : null;
    if (hover !== last.current) {
      last.current = hover;
      setNode(hover);
    }
    const el = ref.current;
    if (!el || !hover) return;
    if (s.clock - stamp.current > 0.8) {
      stamp.current = s.clock;
      setTick((v) => v + 1);
    }
    const cam = s.u.cam;
    const g = s.stage.g;
    const x = (hover.x * cam.s + cam.x) * g.s + g.x;
    const y = (hover.y * cam.s + cam.y) * g.s + g.y;
    const r = hover.r * (hover.boostV || 1) * cam.s * g.s;
    const flip = x > s.stage.w - 300;
    el.style.transform = flip ? `translate(calc(${x - r - 14}px - 100%), ${y - 18}px)` : `translate(${x + r + 14}px, ${y - 18}px)`;
  });

  if (!node) return null;
  const info = describe(node);
  return (
    <div ref={ref} className="tooltip" role="tooltip">
      <p className="tooltip-kind">
        <span className={`tooltip-dot tooltip-${node.kind}`} />
        {info.kind}
      </p>
      <p className="tooltip-title">{info.title}</p>
      <p className={`tooltip-meta${info.tone ? ` is-${info.tone}` : ""}`}>{info.meta}</p>
      <p className="tooltip-meta">{info.extra}</p>
      {info.action && <p className="tooltip-action">{info.action}</p>}
    </div>
  );
}

export { S };
