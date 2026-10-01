import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getUi, setUi, useUi } from "../store.js";
import { HOLDINGS, HOLDING_BY_ID, SECTORS, SECTOR_ORDER } from "../finance/holdings.js";
import { getSummary, resetPortfolio, setRisk, trade, transactionsCsv, useFinance } from "../finance/portfolio.js";
import { AGENTS, SOURCES, holdingAdvice } from "../finance/ai.js";
import { feed } from "../finance/market.js";
import { money, pct, price, qty, shortDate } from "../finance/format.js";
import { closeOverlay, toast } from "../finance/live.js";
import { CloseIcon, LogoMark, SearchIcon } from "./Icons.jsx";

function useDismiss(ref, active) {
  useEffect(() => {
    if (!active) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target) && !event.target.closest?.("[aria-expanded]")) closeOverlay();
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [ref, active]);
}

function Popover({ title, children, width = 300 }) {
  const ref = useRef(null);
  const anchor = useUi((ui) => ui.anchor);
  const [pos, setPos] = useState(null);
  useDismiss(ref, true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(width, vw - 24);
    const h = el.offsetHeight;
    const below = anchor.y + anchor.h + 10 + h < vh - 12 || anchor.y < vh / 2;
    const left = Math.max(12, Math.min(vw - w - 12, anchor.x + anchor.w / 2 - w / 2));
    const top = below ? anchor.y + anchor.h + 10 : Math.max(12, anchor.y - h - 10);
    setPos({ left, top: Math.min(top, vh - h - 12), width: w });
  }, [anchor, width]);
  return (
    <div ref={ref} className="ov-pop" role="dialog" aria-label={title} style={pos ?? { left: -9999, top: 0, width }}>
      <p className="ov-pop-title">{title}</p>
      {children}
    </div>
  );
}

function Segmented({ value, options, onChange, label }) {
  return (
    <div className="ov-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? "is-on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`ov-toggle${on ? " is-on" : ""}`} onClick={() => onChange(!on)}>
      <span className="ov-toggle-text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <span className="ov-switch" aria-hidden="true" />
    </button>
  );
}

function FilterPop() {
  const filter = useUi((ui) => ui.filter);
  const set = (patch) => setUi({ filter: { ...getUi().filter, ...patch } });
  const toggleSector = (key) => set({ sectors: filter.sectors.includes(key) ? filter.sectors.filter((s) => s !== key) : [...filter.sectors, key] });
  return (
    <Popover title="Filter holdings" width={330}>
      <p className="ov-label">Today</p>
      <Segmented
        label="Today's move"
        value={filter.move}
        onChange={(move) => set({ move })}
        options={[
          { value: "all", label: "All" },
          { value: "gainers", label: "Gainers" },
          { value: "losers", label: "Losers" },
        ]}
      />
      <p className="ov-label">Sectors</p>
      <div className="ov-chips">
        {SECTOR_ORDER.map((key) => (
          <button key={key} type="button" aria-pressed={!filter.sectors.includes(key)} className={filter.sectors.includes(key) ? "" : "is-on"} onClick={() => toggleSector(key)}>
            {SECTORS[key].short}
          </button>
        ))}
      </div>
      <Toggle on={filter.minWeight > 0} onChange={(on) => set({ minWeight: on ? 0.02 : 0 })} label="Only big positions" hint="2% of the portfolio or more" />
      <button type="button" className="ov-link" onClick={() => setUi({ filter: { move: "all", sectors: [], minWeight: 0 } })}>
        Clear filters
      </button>
    </Popover>
  );
}

const RANKS = [
  { value: "weight", label: "Portfolio weight", hint: "Bigger positions, bigger nodes" },
  { value: "day", label: "Today's move", hint: "Size by absolute daily change" },
  { value: "return", label: "Total return", hint: "Size by gain on cost" },
  { value: "risk", label: "Volatility", hint: "Size by yearly volatility" },
  { value: "none", label: "Equal size", hint: "Turn ranking off" },
];

function RankPop() {
  const rank = useUi((ui) => ui.rank);
  return (
    <Popover title="Rank holdings by" width={290}>
      <div className="ov-list" role="radiogroup" aria-label="Rank holdings by">
        {RANKS.map((r) => (
          <button key={r.value} type="button" role="radio" aria-checked={rank === r.value} className={`ov-option${rank === r.value ? " is-on" : ""}`} onClick={() => setUi({ rank: r.value })}>
            <span>{r.label}</span>
            <small>{r.hint}</small>
          </button>
        ))}
      </div>
    </Popover>
  );
}

function AgentPop() {
  const agent = useUi((ui) => ui.agent);
  return (
    <Popover title="AI agent" width={320}>
      <div className="ov-list" role="radiogroup" aria-label="AI agent">
        {AGENTS.map((a) => (
          <button
            key={a.key}
            type="button"
            role="radio"
            aria-checked={agent === a.key}
            className={`ov-option${agent === a.key ? " is-on" : ""}`}
            onClick={() => {
              setUi({ agent: a.key, focusItem: null, lawAnswer: null });
              toast(`${a.name} is now advising you`);
            }}
          >
            <span>{a.name}</span>
            <small>{a.blurb}</small>
          </button>
        ))}
      </div>
    </Popover>
  );
}

function SourcesPop() {
  const sources = useUi((ui) => ui.sources);
  return (
    <Popover title="Data the AI can use" width={300}>
      {SOURCES.map((s) => (
        <Toggle key={s.key} on={sources[s.key]} label={s.name} hint={s.blurb} onChange={(on) => setUi({ sources: { ...getUi().sources, [s.key]: on } })} />
      ))}
      <p className="ov-foot">
        Prices: {feed.status === "live" ? `crypto streaming live from Binance (${feed.liveCount}), stocks simulated` : "simulated demo market"}
      </p>
    </Popover>
  );
}

function downloadCsv() {
  const blob = new Blob([transactionsCsv()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aurum-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AccountPop({ onReplay }) {
  const summary = useFinance();
  const [confirm, setConfirm] = useState(false);
  return (
    <Popover title="Account" width={310}>
      <div className="ov-user">
        <img src="./assets/avatar.png" alt="" width="40" height="40" />
        <div>
          <p>Demo Investor</p>
          <small>
            Net worth {money(summary.net, { compact: true })} · {summary.tx.length} trades
          </small>
        </div>
      </div>
      <p className="ov-label">Risk profile</p>
      <Segmented
        label="Risk profile"
        value={summary.riskProfile}
        onChange={(risk) => {
          setRisk(risk);
          toast(`Targets updated for a ${risk} profile`);
        }}
        options={[
          { value: "conservative", label: "Careful" },
          { value: "balanced", label: "Balanced" },
          { value: "growth", label: "Growth" },
        ]}
      />
      <div className="ov-actions">
        <button
          type="button"
          onClick={() => {
            downloadCsv();
            toast("Transactions exported as CSV", "good");
          }}
        >
          Export transactions (CSV)
        </button>
        <button
          type="button"
          onClick={() => {
            closeOverlay();
            onReplay();
          }}
        >
          Replay intro
        </button>
        <button
          type="button"
          className={confirm ? "is-danger" : ""}
          onClick={() => {
            if (!confirm) {
              setConfirm(true);
              return;
            }
            resetPortfolio();
            closeOverlay();
            toast("Demo portfolio reset", "good");
          }}
        >
          {confirm ? "Click again to reset everything" : "Reset demo portfolio"}
        </button>
      </div>
    </Popover>
  );
}

function TradeModal() {
  const summary = useFinance();
  const tradeFor = useUi((ui) => ui.tradeFor);
  const agent = useUi((ui) => ui.agent);
  const [id, setId] = useState(tradeFor || getUi().holding);
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const ref = useRef(null);
  useDismiss(ref, true);
  useEffect(() => inputRef.current?.focus(), []);
  const row = summary.byId.get(id);
  const n = Number(amount);
  const total = Number.isFinite(n) && n > 0 ? n * row.price : 0;
  const maxQty = side === "buy" ? summary.cash / row.price : row.shares;
  const dp = row.decimals ?? (row.price > 50 ? 2 : 3);
  const advice = holdingAdvice(row, summary, agent);
  const fill = (f) => {
    const v = Math.floor(maxQty * f * 10 ** dp) / 10 ** dp;
    setAmount(v > 0 ? String(v) : "");
    setError("");
  };
  const submit = (event) => {
    event.preventDefault();
    const result = trade(id, side, n);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast(result.message, "good");
    closeOverlay();
  };
  return (
    <div className="ov-scrim">
      <form ref={ref} className="ov-modal" role="dialog" aria-modal="true" aria-labelledby="trade-title" onSubmit={submit}>
        <header className="ov-modal-head">
          <h2 id="trade-title">New trade</h2>
          <button type="button" className="ov-x" aria-label="Close" onClick={closeOverlay}>
            <CloseIcon size={14} />
          </button>
        </header>
        <label className="ov-field">
          <span>Asset</span>
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setError("");
            }}
          >
            {HOLDINGS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.ticker} · {h.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ov-quote">
          <span>
            <b>{price(row.price)}</b>
            <em className={row.day >= 0 ? "is-up" : "is-down"}>{pct(row.day, 2)} today</em>
          </span>
          <span>
            You hold {qty(row.shares, dp)} · {money(row.value, { compact: true })}
          </span>
        </div>
        <Segmented
          label="Order side"
          value={side}
          onChange={(v) => {
            setSide(v);
            setError("");
          }}
          options={[
            { value: "buy", label: "Buy" },
            { value: "sell", label: "Sell" },
          ]}
        />
        <label className="ov-field">
          <span>Quantity</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
          />
        </label>
        <div className="ov-quick">
          {[0.25, 0.5, 1].map((f) => (
            <button key={f} type="button" onClick={() => fill(f)}>
              {f === 1 ? "Max" : `${f * 100}%`}
            </button>
          ))}
        </div>
        <dl className="ov-summary">
          <div>
            <dt>Estimated {side === "buy" ? "cost" : "proceeds"}</dt>
            <dd>{money(total, { hide: false })}</dd>
          </div>
          <div>
            <dt>Cash after</dt>
            <dd>{money(summary.cash + (side === "buy" ? -total : total))}</dd>
          </div>
        </dl>
        <p className="ov-ai">
          <b>AI · {advice.stance}.</b> {advice.body}
        </p>
        {error && (
          <p className="ov-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={`ov-primary is-${side}`} disabled={!total}>
          {side === "buy" ? "Buy" : "Sell"} {row.ticker}
          {total ? ` · ${money(total, { hide: false })}` : ""}
        </button>
        <p className="ov-foot">Paper trading with demo money. Nothing is sent to a broker.</p>
      </form>
    </div>
  );
}

function Palette({ onRun }) {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);
  useDismiss(ref, true);
  useEffect(() => inputRef.current?.focus(), []);
  const summary = getSummary();
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const holdings = summary.rows.map((r) => ({ key: r.id, kind: "Holding", label: `${r.ticker} · ${r.name}`, meta: `${price(r.price)} ${pct(r.day)}`, run: { type: "holding", id: r.id } }));
    const sectors = summary.sectors.map((s) => ({ key: s.key, kind: "Sector", label: s.name, meta: `${pct(s.weight, 1, false)} of portfolio`, run: { type: "sector", key: s.key } }));
    const actions = [
      { key: "a-trade", kind: "Action", label: "New trade", meta: "Buy or sell", run: { type: "trade" } },
      { key: "a-scan", kind: "Action", label: "Run AI portfolio scan", meta: "Fresh insights", run: { type: "scan" } },
      { key: "a-privacy", kind: "Action", label: getUi().privacy ? "Show balances" : "Hide balances", meta: "Privacy", run: { type: "privacy" } },
      { key: "a-overview", kind: "Action", label: "Go to overview", meta: "Network view", run: { type: "network" } },
    ];
    const all = [...holdings, ...sectors, ...actions];
    if (!term) return [...actions, ...holdings.slice(0, 6)];
    return all.filter((r) => r.label.toLowerCase().includes(term)).slice(0, 9);
  }, [q, summary]);
  const pick = (r) => {
    if (!r) return;
    closeOverlay();
    onRun(r.run);
  };
  return (
    <div className="ov-scrim is-top">
      <div ref={ref} className="ov-palette" role="dialog" aria-modal="true" aria-label="Search">
        <div className="ov-search">
          <SearchIcon size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search holdings, sectors and actions"
            aria-label="Search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                pick(results[index]);
              }
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="ov-results" role="listbox" aria-label="Results">
          {results.map((r, i) => (
            <li key={r.key} role="option" aria-selected={i === index}>
              <button type="button" className={i === index ? "is-on" : ""} onPointerEnter={() => setIndex(i)} onClick={() => pick(r)}>
                <small>{r.kind}</small>
                <span>{r.label}</span>
                <em>{r.meta}</em>
              </button>
            </li>
          ))}
          {!results.length && <li className="ov-empty">No matches for “{q}”</li>}
        </ul>
      </div>
    </div>
  );
}

function Drawer({ onRun }) {
  const summary = useFinance();
  const ref = useRef(null);
  useDismiss(ref, true);
  const rows = [...summary.rows].sort((a, b) => b.value - a.value);
  const go = (run) => {
    closeOverlay();
    onRun(run);
  };
  return (
    <div className="ov-scrim is-left">
      <nav ref={ref} className="ov-drawer" aria-label="Main navigation">
        <header className="ov-drawer-head">
          <LogoMark size={36} />
          <div>
            <p>Aurum AI</p>
            <small>Wealth Platform</small>
          </div>
          <button type="button" className="ov-x" aria-label="Close navigation" onClick={closeOverlay}>
            <CloseIcon size={14} />
          </button>
        </header>
        <div className="ov-networth">
          <small>Net worth</small>
          <b>{money(summary.net)}</b>
          <span className={summary.dayPl >= 0 ? "is-up" : "is-down"}>
            {money(summary.dayPl, { compact: true })} ({pct(summary.dayPct, 2)}) today
          </span>
        </div>
        <div className="ov-nav">
          <button type="button" onClick={() => go({ type: "network" })}>
            Overview
          </button>
          <button type="button" onClick={() => go({ type: "holding", id: getUi().holding })}>
            Position view
          </button>
          <button type="button" onClick={() => go({ type: "scan" })}>
            AI insights
          </button>
          <button type="button" onClick={() => go({ type: "trade" })}>
            New trade
          </button>
        </div>
        <p className="ov-label">Holdings</p>
        <ul className="ov-holdings">
          {rows.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => go({ type: "holding", id: r.id })}>
                <b>{r.ticker}</b>
                <span>{r.short}</span>
                <em>{money(r.value, { compact: true })}</em>
                <i className={r.day >= 0 ? "is-up" : "is-down"}>{pct(r.day)}</i>
              </button>
            </li>
          ))}
        </ul>
        <p className="ov-label">Recent trades</p>
        <ul className="ov-tx">
          {summary.tx.slice(0, 8).map((t) => {
            const h = HOLDING_BY_ID.get(t.holding);
            return (
              <li key={t.id}>
                <span className={`ov-side is-${t.side}`}>{t.side}</span>
                <b>{h?.ticker}</b>
                <span>
                  {qty(t.qty, 4)} @ {price(t.price)}
                </span>
                <small>{shortDate(t.t)}</small>
              </li>
            );
          })}
        </ul>
        <p className="ov-foot">
          Demo portfolio. {feed.status === "live" ? "Crypto prices stream live from Binance; stocks are simulated." : "Market prices are simulated."}
        </p>
      </nav>
    </div>
  );
}

function Toasts() {
  const toasts = useUi((ui) => ui.toasts);
  return (
    <div className="ov-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <p key={t.id} className={`ov-toast is-${t.tone}`}>
          {t.text}
        </p>
      ))}
    </div>
  );
}

export default function Overlays({ onRun, onReplay }) {
  const overlay = useUi((ui) => ui.overlay);
  return (
    <div className="overlays">
      {overlay === "filter" && <FilterPop />}
      {overlay === "rank" && <RankPop />}
      {overlay === "agent" && <AgentPop />}
      {overlay === "sources" && <SourcesPop />}
      {overlay === "account" && <AccountPop onReplay={onReplay} />}
      {overlay === "trade" && <TradeModal key={getUi().tradeFor ?? "t"} />}
      {overlay === "search" && <Palette onRun={onRun} />}
      {overlay === "drawer" && <Drawer onRun={onRun} />}
      <Toasts />
    </div>
  );
}
