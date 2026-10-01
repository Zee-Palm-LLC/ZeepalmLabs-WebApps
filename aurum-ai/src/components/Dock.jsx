import { useRef } from "react";
import { S, getUi, useFrame, useUi } from "../store.js";
import { clamp, easeOut, lerp } from "../lib/math.js";
import {
  AgentIcon,
  CardListIcon,
  ChevronDown,
  ClockA,
  ComplianceIcon,
  HalfCircle,
  SendIcon,
  SparkTrend,
  Thumb,
} from "./Icons.jsx";
import AnalysisPanel from "./AnalysisPanel.jsx";
import { dockStats as liveStats } from "../finance/portfolio.js";

export const QUERY = "Analyze my Eli Lilly position in Healthcare";

const STATS = [
  { label: "Total Return", unit: "%", Icon: ComplianceIcon, digits: 1 },
  { label: "Net Worth", unit: "K", Icon: HalfCircle, digits: 0, money: true },
  { label: "Cash", unit: "K", Icon: CardListIcon, digits: 1, money: true },
  { label: "Portfolio Health", unit: "%", Icon: Thumb, thumb: true, digits: 0 },
];

function Controls({ onRi, onChip, riRef, typedRef, inputRef, onAsk, placeholder }) {
  const sources = useUi((ui) => ui.sources);
  const overlay = useUi((ui) => ui.overlay);
  const active = Object.values(sources).filter(Boolean).length;
  const submit = (event) => {
    event.preventDefault();
    const value = inputRef.current.value.trim();
    onAsk(value || QUERY);
  };
  return (
    <>
      <form className="dock-input" onSubmit={submit}>
        <input ref={inputRef} type="text" placeholder={placeholder} aria-label="Ask a question" />
        <span ref={typedRef} className="dock-typed" aria-hidden="true" />
        <button type="submit" className="dock-send" aria-label="Send question">
          <SendIcon size={21} />
        </button>
      </form>
      <div className="dock-row">
        <button type="button" className="dock-chip" aria-label="Choose AI agent" aria-expanded={overlay === "agent"} onClick={(e) => onChip("agent", e)}>
          <AgentIcon size={18} />
          My agent
          <ChevronDown size={14} color="#6f7d7c" />
        </button>
        <button
          type="button"
          className="dock-chip dock-chip-small"
          aria-label={`Data sources, ${active} active`}
          aria-expanded={overlay === "sources"}
          onClick={(e) => onChip("sources", e)}
        >
          <ClockA size={18} />+{active}
        </button>
        <button ref={riRef} type="button" className="dock-ri" onClick={onRi}>
          <SparkTrend size={22} />
          AI Analysis
        </button>
      </div>
    </>
  );
}

export function UniverseDock({ onAsk, onRi, onChip, onCloseAnalysis, onOpenHolding }) {
  const wrapRef = useRef(null);
  const dockRef = useRef(null);
  const numRefs = useRef([]);
  const riRef = useRef(null);
  const typedRef = useRef(null);
  const inputRef = useRef(null);
  const statsRef = useRef(null);
  const intro = useUi((ui) => ui.intro);

  useFrame((s) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const c = s.chrome;
    const t = clamp(c.dock);
    const z = clamp(c.dockZoom);
    const enter = (1 - easeOut(t)) * 40 + c.dockDrop * 260;
    const base = s.stage.dock;
    if (base) {
      wrap.style.transform = `translate(${base.x - 977}px, ${base.y - 998 + enter * base.s}px) scale(${base.s})`;
    } else {
      const scale = lerp(1, 1.443, z);
      const dx = lerp(0, 392 - 977, z) + lerp(s.stage.dx, s.stage.cx, z);
      const dy = lerp(0, 915 - 998, z) + lerp(s.stage.dy, s.stage.cy, z) + enter;
      wrap.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    }
    wrap.style.opacity = String(Math.min(1, t * 1.6) * (1 - c.dockDrop));
    wrap.style.visibility = t <= 0.001 || c.dockDrop >= 1 ? "hidden" : "visible";
    if (dockRef.current) {
      dockRef.current.style.setProperty("--flash", String(clamp(1 - c.dockInner)));
      dockRef.current.style.setProperty("--inner", String(clamp(c.dockInner)));
    }
    if (statsRef.current) statsRef.current.style.setProperty("--stats", String(clamp(c.dockInner)));
    const values = getUi().intro ? c.stats : liveStats();
    const hide = getUi().privacy;
    values.forEach((v, i) => {
      const el = numRefs.current[i];
      if (el) {
        const text = hide && STATS[i].money ? "•••" : v.toFixed(STATS[i].digits);
        if (el.textContent !== text) el.textContent = text;
      }
    });
    if (riRef.current) riRef.current.style.setProperty("--on", String(clamp(c.ri)));
    if (typedRef.current && inputRef.current) {
      if (getUi().intro) {
        const n = Math.round(c.typing);
        const text = QUERY.slice(0, n);
        if (typedRef.current.dataset.text !== text) {
          typedRef.current.dataset.text = text;
          typedRef.current.textContent = text;
        }
        typedRef.current.classList.toggle("is-typing", n > 0);
        typedRef.current.classList.toggle("is-done", n >= QUERY.length);
        inputRef.current.classList.toggle("is-masked", n > 0);
      }
    }
  });

  return (
    <div ref={wrapRef} className="udock-wrap">
      <AnalysisPanel onClose={onCloseAnalysis} onOpen={onOpenHolding} />
      <section ref={dockRef} className="dock udock" aria-label="Ask your AI analyst">
        <dl ref={statsRef} className="dock-stats">
          {STATS.map(({ label, unit, Icon, thumb }, i) => (
            <div key={label} className="dock-stat">
              <dt>{label}</dt>
              <dd>
                {thumb ? <Thumb size={18} color="#bfe9e4" /> : <Icon size={17} />}
                <span
                  ref={(node) => {
                    numRefs.current[i] = node;
                  }}
                  className="dock-num"
                >
                  0
                </span>
                <span className="dock-unit">{unit}</span>
              </dd>
            </div>
          ))}
        </dl>
        <Controls
          onRi={onRi}
          onChip={onChip}
          riRef={riRef}
          typedRef={typedRef}
          inputRef={inputRef}
          onAsk={(q) => {
            if (inputRef.current) inputRef.current.value = "";
            onAsk(q);
          }}
          placeholder={intro ? "Ask a question" : "Ask a question"}
        />
      </section>
    </div>
  );
}

export function LawDock({ onAsk, onRi, onChip }) {
  const wrapRef = useRef(null);
  const riRef = useRef(null);
  const typedRef = useRef(null);
  const inputRef = useRef(null);

  useFrame((s) => {
    const el = wrapRef.current;
    if (!el) return;
    const t = clamp(s.l.dock) * clamp(s.l.show);
    el.style.opacity = String(Math.min(1, t * 1.4));
    const enter = (1 - easeOut(clamp(s.l.dock))) * 70;
    const base = s.stage.ldock;
    el.style.transform = base
      ? `translate(${base.x - 1068}px, ${base.y - 1047 + enter * base.s}px) scale(${base.s})`
      : `translate(${s.stage.dx}px, ${enter}px)`;
    el.style.visibility = t <= 0.001 ? "hidden" : "visible";
  });

  return (
    <section ref={wrapRef} className="dock ldock" aria-label="Ask about this position">
      <Controls
        onRi={onRi}
        onChip={onChip}
        riRef={riRef}
        typedRef={typedRef}
        inputRef={inputRef}
        onAsk={(q) => {
          if (inputRef.current) inputRef.current.value = "";
          onAsk(q);
        }}
        placeholder="Ask about this position..."
      />
    </section>
  );
}

export { S };
