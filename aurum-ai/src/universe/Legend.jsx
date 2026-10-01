import { useRef } from "react";
import { S, setUi, useFrame, useUi } from "../store.js";
import { clamp, easeOut } from "../lib/math.js";
import { LEGEND } from "./model.js";
import { BankIcon, RefreshIcon } from "../components/Icons.jsx";
import { useFinance } from "../finance/portfolio.js";

const DOT = {
  constitution: "radial-gradient(circle at 35% 30%, #fff3da, #dcb987 40%, #8f6b45)",
  entity: "radial-gradient(circle at 35% 30%, #ffe6f0, #ee93b8 40%, #a64c74)",
  legislation: "radial-gradient(circle at 35% 30%, #f6f0ff, #b8a2f2 40%, #6a4fbe)",
  service: "radial-gradient(circle at 35% 30%, #ecfff5, #8ee0bb 40%, #2f8c69)",
  regulation: "radial-gradient(circle at 35% 30%, #fff3d6, #ddb578 40%, #8d6633)",
};

export default function Legend() {
  const rootRef = useRef(null);
  const rowsRef = useRef(null);
  const legend = useUi((ui) => ui.legend);
  const summary = useFinance();

  useFrame((s) => {
    const el = rootRef.current;
    if (!el) return;
    const t = clamp(s.chrome.legend);
    const out = clamp(s.chrome.aside);
    el.style.opacity = String(Math.min(1, t * 2) * (1 - out));
    el.style.clipPath = `inset(${(1 - easeOut(t)) * 100}% 0 0 0 round 14px)`;
    el.style.transform = `translateX(${-out * 90}px)`;
    el.style.visibility = t * (1 - out) <= 0.001 ? "hidden" : "visible";
    if (rowsRef.current) {
      const r = clamp(s.chrome.legendRows);
      [...rowsRef.current.children].forEach((row, i) => {
        const v = clamp(r * 7 - i);
        row.style.opacity = String(v);
        row.style.transform = `translateX(${(1 - v) * -8}px)`;
      });
    }
  });

  const toggle = (kind) => {
    const next = { ...legend, [kind]: !legend[kind] };
    setUi({ legend: next });
    S.u.hidden[kind] = !next[kind];
  };

  return (
    <aside ref={rootRef} className="legend" aria-label="Legend">
      <p className="legend-title">LEGEND</p>
      <ul ref={rowsRef} className="legend-rows">
        {LEGEND.map((item) => (
          <li key={item.kind}>
            <button
              type="button"
              className={`legend-row ${legend[item.kind] ? "" : "is-off"}`}
              aria-pressed={legend[item.kind]}
              onClick={() => toggle(item.kind)}
            >
              <span className="legend-pill">
                <span className="legend-dot" style={{ background: DOT[item.kind] }} />
                <span className="legend-count">{item.count}</span>
              </span>
              {item.label}
            </button>
          </li>
        ))}
        <li className="legend-stat">
          <BankIcon size={15} />
          <span>Risk</span>
          <span className="legend-value" title="Portfolio risk score">
            {summary.risk}
          </span>
        </li>
        <li className="legend-stat">
          <RefreshIcon size={14} />
          <span>Alerts</span>
          <span className="legend-value" title="Open alerts">
            {summary.alerts}
          </span>
        </li>
      </ul>
    </aside>
  );
}
