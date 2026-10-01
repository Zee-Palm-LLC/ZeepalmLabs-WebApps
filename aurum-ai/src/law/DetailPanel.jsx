import { useRef } from "react";
import { getUi, setUi, useFrame, useUi } from "../store.js";
import { clamp, easeOut } from "../lib/math.js";
import { BankIcon, Caduceus, CheckCircle, ChevronRight, CloudDots, DocIcon, GridCalc, ShieldStar, SparkTrend, TrendDown } from "../components/Icons.jsx";
import { getSummary, useFinance } from "../finance/portfolio.js";
import { holdingAdvice, sentiment } from "../finance/ai.js";
import { SECTORS } from "../finance/holdings.js";
import { money, pct, price, qty, shortDate } from "../finance/format.js";

const PANEL_STATS = [
  { key: "value", label: ["Market Value"], icon: "check" },
  { key: "shares", label: ["Shares Held"], icon: "doc" },
  { key: "cost", label: ["Average Cost"], icon: "cloud" },
  { key: "return", label: ["Total Return"], icon: "check" },
];

const SECTOR_ICON = {
  health: <Caduceus size={44} />,
  gov: <BankIcon size={34} />,
  justice: <BankIcon size={34} />,
  eco: <GridCalc size={30} />,
  security: <ShieldStar size={32} />,
};

function statText(i, row, p) {
  if (i === 0) return money(row.value * p, { compact: true });
  if (i === 1) return qty(row.shares * p, row.decimals ?? 2);
  if (i === 2) return price(row.cost * p);
  return pct(row.plPct * p, 0);
}

function columns(history) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  return history.map((v) => (max > min ? 1 + Math.round(((v - min) / (max - min)) * 7) : 4));
}

const STAT_ICON = {
  check: <CheckCircle size={36} />,
  doc: <DocIcon size={36} />,
  cloud: <CloudDots size={38} />,
};

function reveal(el, v, y = 12) {
  if (!el) return;
  const t = clamp(v);
  el.style.opacity = String(t);
  el.style.transform = `translateY(${(1 - easeOut(t)) * y}px)`;
}

export function KpiPill() {
  const ref = useRef(null);
  const holdingId = useUi((ui) => ui.holding);
  const ticker = getSummary().byId.get(holdingId)?.ticker ?? "";
  useFrame((s) => {
    const el = ref.current;
    if (!el) return;
    const t = clamp(s.l.kpi) * clamp(s.l.show);
    el.style.opacity = String(t);
    el.style.transform = `translateX(${(1 - easeOut(clamp(s.l.kpi))) * 30}px)`;
    el.style.visibility = t <= 0.001 ? "hidden" : "visible";
  });
  return (
    <p ref={ref} className="kpi-pill">
      KPI overview {ticker} position, market sentiment and AI analysis
    </p>
  );
}

export default function DetailPanel({ onTrade, onResetAi }) {
  const rootRef = useRef(null);
  const headRef = useRef(null);
  const statusRef = useRef(null);
  const sentRef = useRef(null);
  const sentNumRef = useRef(null);
  const dotsRef = useRef(null);
  const gridRef = useRef(null);
  const gridNums = useRef([]);
  const riRef = useRef(null);
  const sheetTop = useRef(null);
  const sheetOpen = useUi((ui) => ui.sheetOpen);
  const holdingId = useUi((ui) => ui.holding);
  const agent = useUi((ui) => ui.agent);
  const focusItem = useUi((ui) => ui.focusItem);
  const lawAnswer = useUi((ui) => ui.lawAnswer);
  useUi((ui) => ui.privacy);
  const summary = useFinance();
  const row = summary.byId.get(holdingId);
  const advice = holdingAdvice(row, summary, agent);
  const mood = sentiment(row);
  const cols = columns(row.quote.history);
  const lastTx = summary.tx.find((tx) => tx.holding === row.id);
  const ai = focusItem || lawAnswer || advice;
  const sectorIcon = SECTOR_ICON[row.sector] ?? <SparkTrend size={30} />;
  const title = row.name.length > 30 ? row.short : row.name;

  useFrame((s) => {
    const l = s.l;
    const el = rootRef.current;
    if (!el) return;
    const p = clamp(l.panel) * (l.show > 0.001 ? 1 : 0);
    const flip = easeOut(p);
    el.style.opacity = String(Math.min(1, p * 2.2) * clamp(l.show));
    const sheet = s.stage.sheet;
    if (sheet) {
      const target = getUi().sheetOpen ? sheet.open : sheet.peek;
      const top = sheetTop.current === null ? target : sheetTop.current + (target - sheetTop.current) * 0.2;
      sheetTop.current = Math.abs(top - target) < 0.3 ? target : top;
      el.style.transform = `translate(${sheet.x - 1069}px, ${sheetTop.current - 163 + (1 - flip) * 260}px) scale(${sheet.s})`;
      const visible = (sheet.floor - sheetTop.current) / sheet.s;
      el.style.clipPath = `inset(0 0 ${Math.max(0, 862 - visible)}px 0 round 34px 34px 30px 30px)`;
    } else {
      sheetTop.current = null;
      el.style.clipPath = "";
      el.style.transform = `translateX(${s.stage.dx}px) perspective(1500px) translateX(${(1 - flip) * 110}px) rotateY(${(1 - flip) * -34}deg)`;
    }
    el.style.visibility = p <= 0.001 ? "hidden" : "visible";
    if (p <= 0.001) return;
    reveal(headRef.current, l.header);
    reveal(statusRef.current, l.status);
    reveal(sentRef.current, l.sentimentBox);
    const live = getSummary().byId.get(getUi().holding);
    if (sentNumRef.current) {
      const text = `${Math.round(clamp(l.sentiment) * sentiment(live).value)}%`;
      if (sentNumRef.current.textContent !== text) sentNumRef.current.textContent = text;
    }
    if (dotsRef.current) {
      const level = clamp(l.sentiment);
      [...dotsRef.current.children].forEach((col, i) => {
        const v = clamp(level * 1.4 - (i / dotsRef.current.children.length) * 0.4);
        col.style.transform = `scaleY(${v})`;
        col.style.opacity = String(Math.min(1, v * 1.5));
      });
    }
    if (gridRef.current) {
      [...gridRef.current.children].forEach((cell, i) => reveal(cell, clamp(l.grid * 4 - i * 0.6), 10));
    }
    l.gridCount.forEach((v, i) => {
      const n = gridNums.current[i];
      if (n) {
        const text = statText(i, live, clamp(v));
        if (n.textContent !== text) n.textContent = text;
      }
    });
    reveal(riRef.current, l.riBlock);
  });

  return (
    <article ref={rootRef} className={`detail${sheetOpen ? " is-open" : ""}`} aria-labelledby="detail-title">
      <button
        type="button"
        className="detail-handle"
        aria-label={sheetOpen ? "Collapse position details" : "Expand position details"}
        aria-expanded={sheetOpen}
        onClick={() => setUi({ sheetOpen: !getUi().sheetOpen })}
      />
      <header ref={headRef} className="detail-head">
        <p className="detail-sector">
          <span className="detail-sector-icon">{sectorIcon}</span>
          {SECTORS[row.sector].name}
        </p>
        <h2 id="detail-title" className="detail-title">
          {title}
          <br />
          {row.type} · {row.venue}: {row.ticker}
        </h2>
      </header>

      <div ref={statusRef} className="detail-status">
        <div>
          <span className={`detail-active${row.shares > 0 ? "" : " is-watch"}`}>{row.shares > 0 ? "Holding" : "Watchlist"}</span>
          <p className="detail-updated">
            {price(row.price)} · <span className={row.day >= 0 ? "is-up" : "is-down"}>{pct(row.day, 2)} today</span>
            <br />
            Last trade on <b>{lastTx ? shortDate(lastTx.t) : "none yet"}</b>
          </p>
        </div>
        <button type="button" className="detail-explore" onClick={() => onTrade(row.id)}>
          Trade now
          <ChevronRight size={17} />
        </button>
      </div>

      <section ref={sentRef} className={`detail-sentiment is-${mood.label.toLowerCase()}`} aria-label="AI sentiment">
        <p className="detail-sent-label">AI Sentiment</p>
        <span className="detail-moderate">{mood.label}</span>
        <p className="detail-sent-value">
          <span ref={sentNumRef}>{mood.value}%</span>
          <span className={`detail-sent-delta${mood.delta >= 0 ? " is-up" : ""}`}>
            <span>
              {mood.delta >= 0 ? "+" : ""}
              {mood.delta}% <TrendDown size={22} />
            </span>
            <span className="detail-sent-month">Last week</span>
          </span>
        </p>
        <div ref={dotsRef} className="detail-dots" aria-label={`Recent ${row.ticker} price ticks`} role="img">
          {cols.map((h, i) => (
            <span key={i} className={i >= cols.length - 2 ? "is-hot" : ""} style={{ "--h": h }} />
          ))}
        </div>
      </section>

      <div ref={gridRef} className="detail-grid">
        {PANEL_STATS.map((stat, i) => (
          <div key={stat.key} className={`detail-stat detail-stat-${i}`}>
            <p className="detail-stat-top">
              <span className="detail-stat-icon">{STAT_ICON[stat.icon]}</span>
              <span
                ref={(node) => {
                  gridNums.current[i] = node;
                }}
                className="detail-stat-num"
              >
                {statText(i, row, 1)}
              </span>
            </p>
            <p className="detail-stat-label">
              {stat.label.map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <section ref={riRef} className="detail-ri" aria-label="AI analysis" aria-live="polite">
        <h3>
          <SparkTrend size={22} />
          AI Analysis
          {(focusItem || lawAnswer) && (
            <button type="button" className="detail-ri-back" onClick={onResetAi}>
              Back to advice
            </button>
          )}
        </h3>
        <div className="detail-ri-card">
          <p className="detail-ri-title">
            {ai.title}
            {ai === advice && <span className={`detail-stance is-${advice.stance.toLowerCase().replace(/\s/g, "")}`}>{advice.stance}</span>}
          </p>
          <p className="detail-ri-body" title={ai.body}>
            {ai.body}
          </p>
        </div>
      </section>
    </article>
  );
}
