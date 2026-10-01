import { useMemo, useRef } from "react";
import { S, setUi, useFrame, useUi } from "../store.js";
import { clamp, easeOut } from "../lib/math.js";
import { holdingNodes } from "./model.js";
import { toast } from "../finance/live.js";

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const TOP = 132;
const STEP = 79.4;

function wave() {
  const bars = [];
  for (let y = 98; y <= 1196; y += 3) {
    const bulge = 30 * Math.exp(-Math.pow((y - 420) / 70, 2)) + 22 * Math.exp(-Math.pow((y - 175) / 45, 2)) + 10 * Math.exp(-Math.pow((y - 640) / 90, 2));
    const noise = Math.sin(y * 0.21) * 4 + Math.sin(y * 0.83) * 3 + Math.sin(y * 2.3) * 2.2 + Math.sin(y * 0.05) * 5;
    bars.push({ y, w: Math.max(2, 11 + bulge + noise) });
  }
  return bars;
}

export default function YearRail() {
  const rootRef = useRef(null);
  const pillRef = useRef(null);
  const year = useUi((ui) => ui.year);
  const bars = useMemo(wave, []);
  const index = YEARS.indexOf(year);

  useFrame((s) => {
    const t = clamp(s.chrome.years);
    const out = clamp(s.chrome.aside);
    const el = rootRef.current;
    if (!el) return;
    el.style.opacity = String(t * (1 - out));
    el.style.transform = `translateX(${(1 - easeOut(t)) * -30 - out * 70}px)`;
    el.style.visibility = t * (1 - out) <= 0.001 ? "hidden" : "visible";
    if (pillRef.current) {
      const p = clamp(s.chrome.pill);
      pillRef.current.style.opacity = String(p);
      pillRef.current.style.transform = `translateY(-50%) scale(${0.8 + 0.2 * easeOut(p)})`;
    }
  });

  const choose = (y) => {
    setUi({ year: y });
    S.u.year = y;
    const count = holdingNodes.filter((n) => n.year <= y).length;
    toast(y === YEARS[YEARS.length - 1] ? `Showing today's portfolio · ${count} holdings` : `Showing holdings owned by ${y} · ${count} of ${holdingNodes.length}`);
  };

  return (
    <div ref={rootRef} className="years" role="group" aria-label="Timeline">
      <svg className="years-wave" width="70" height="1200" viewBox="0 0 70 1200" aria-hidden="true">
        <defs>
          <linearGradient id="waveFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5d6161" stopOpacity="0.85" />
            <stop offset="1" stopColor="#8a8f8f" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {bars.map((bar) => (
          <rect key={bar.y} x="0" y={bar.y} width={bar.w} height="1.6" rx="0.8" fill="url(#waveFill)" />
        ))}
      </svg>
      <span className="years-line" style={{ top: TOP + index * STEP }} aria-hidden="true" />
      {YEARS.map((y, i) =>
        y === year ? (
          <button
            key={y}
            ref={pillRef}
            type="button"
            className="years-pill"
            style={{ top: TOP + i * STEP }}
            aria-pressed="true"
            onClick={() => choose(y)}
          >
            {y}
          </button>
        ) : (
          <button key={y} type="button" className="years-item" style={{ top: TOP + i * STEP }} onClick={() => choose(y)}>
            {y}
          </button>
        )
      )}
    </div>
  );
}
