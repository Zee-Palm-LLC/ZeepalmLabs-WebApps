import { HOLDINGS, HOLDING_BY_ID, SECTORS } from "./holdings.js";
import { money, pct, price, shortDate } from "./format.js";

export const AGENTS = [
  { key: "balanced", name: "Balanced Analyst", blurb: "Weighs growth against risk and keeps you near target." },
  { key: "income", name: "Income Strategist", blurb: "Favours dividends, bonds and steady cash flow." },
  { key: "growth", name: "Growth Hunter", blurb: "Leans into momentum and long-term compounding." },
  { key: "guardian", name: "Risk Guardian", blurb: "Flags concentration and volatility first." },
];

export const SOURCES = [
  { key: "prices", name: "Live prices", blurb: "Market ticks and day moves" },
  { key: "history", name: "Portfolio history", blurb: "Cost basis, lots and returns" },
  { key: "news", name: "Market headlines", blurb: "Sentiment from recent news" },
];

const TRIM = { balanced: 0.12, income: 0.1, growth: 0.18, guardian: 0.08 };

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const NEWS = [
  ["{T} beats quarterly earnings estimates", 0.82],
  ["Analysts raise {T} price target", 0.76],
  ["{T} unveils new product roadmap", 0.68],
  ["{S} sector sees record inflows", 0.7],
  ["Insider buying reported at {T}", 0.72],
  ["{T} guidance tops consensus", 0.8],
  ["Options volume spikes on {T}", 0.52],
  ["{T} added to a major index fund", 0.66],
  ["Regulators review {S} pricing", 0.34],
  ["{T} faces supply chain delays", 0.28],
  ["Short interest rises in {T}", 0.3],
  ["{T} downgraded to neutral", 0.36],
  ["Rate outlook weighs on {S}", 0.38],
  ["{T} announces share buyback", 0.74],
  ["{T} expands into new markets", 0.64],
  ["{S} valuations look stretched", 0.4],
  ["{T} CFO to speak at investor summit", 0.5],
  ["Dividend outlook steady for {T}", 0.58],
  ["Hedge funds trim {T} stakes", 0.33],
];

const FIRMS = [
  "Northbridge Capital",
  "Summit Research",
  "Harbor Securities",
  "Atlas Markets",
  "Meridian Equity",
  "Crescent Partners",
  "Granite Advisory",
  "Beacon Analytics",
  "Sterling Research",
  "Pinnacle Wealth",
  "Orion Securities",
  "Keystone Markets",
];

function statusOf(score) {
  if (score >= 0.6) return { status: "green", level: score >= 0.75 ? 3 : 2 };
  if (score >= 0.45) return { status: "orange", level: 2 };
  return { status: "red", level: 1 };
}

export function sentiment(row) {
  const r = rng(hash(row.ticker));
  const base = NEWS.reduce((sum, [, s]) => sum + s * (0.6 + r() * 0.8), 0) / NEWS.length;
  const trend = row.quote.history[row.quote.history.length - 1] / row.quote.history[0] - 1;
  const value = Math.round(Math.max(8, Math.min(94, base * 100 + trend * 220 + row.day * 300)));
  const delta = Math.round(row.week * 100 + trend * 40);
  const label = value >= 62 ? "Bullish" : value >= 42 ? "Moderate" : "Bearish";
  return { value, delta, label };
}

export function holdingAdvice(row, summary, agent = "balanced") {
  const sector = summary.sectorByKey.get(row.sector);
  const trim = TRIM[agent] ?? 0.12;
  const s = sentiment(row);
  if (row.shares <= 0) {
    return {
      stance: "Watch",
      title: "On your watchlist",
      body: `You hold no ${row.ticker}. Sentiment is ${s.label.toLowerCase()} at ${s.value}%, and ${sector.name} sits at ${pct(sector.weight, 1, false)} of the portfolio against a ${pct(sector.target, 0, false)} target.`,
    };
  }
  if (row.weight > trim) {
    return {
      stance: "Trim",
      title: "Trim position",
      body: `${row.ticker} is ${pct(row.weight, 1, false)} of your portfolio, above the ${pct(trim, 0, false)} single-position limit for the ${AGENTS.find((a) => a.key === agent)?.name ?? "current agent"}. Selling about ${Math.max(1, Math.round(((row.weight - trim) * summary.net) / row.price))} shares brings it back in line.`,
    };
  }
  if (agent === "guardian" && row.vol > 0.45) {
    return {
      stance: "Hedge",
      title: "Reduce volatility",
      body: `${row.ticker} moves about ${pct(row.vol, 0, false)} a year. Consider pairing it with bonds or core funds, which sit at ${pct(summary.sectorByKey.get("justice").weight, 1, false)} today.`,
    };
  }
  if (row.plPct > 0.8 && agent !== "growth") {
    return {
      stance: "Lock in",
      title: "Lock in gains",
      body: `You are up ${pct(row.plPct, 0)} on ${row.ticker} (${money(row.pl, { compact: true })}). Taking a partial profit would refill cash for underweight sectors.`,
    };
  }
  if (sector.weight < sector.target - 0.02 && s.value >= 50) {
    return {
      stance: "Accumulate",
      title: "Room to add",
      body: `${sector.name} is ${pct(sector.weight, 1, false)} of the portfolio against a ${pct(sector.target, 0, false)} target, and sentiment on ${row.ticker} is ${s.label.toLowerCase()}. Adding ${money(Math.min(summary.cash, (sector.target - sector.weight) * summary.net), { compact: true })} would close the gap.`,
    };
  }
  if (agent === "income" && row.yield >= 2.5) {
    return {
      stance: "Hold",
      title: "Reliable income",
      body: `${row.ticker} yields ${row.yield.toFixed(1)}%, about ${money((row.value * row.yield) / 100, { compact: true })} a year on your position. Keep holding and reinvest the dividends.`,
    };
  }
  return {
    stance: "Hold",
    title: "Hold, on target",
    body: `${row.ticker} is ${pct(row.weight, 1, false)} of the portfolio and ${row.plPct >= 0 ? "up" : "down"} ${pct(Math.abs(row.plPct), 0, false)} on cost. Sentiment is ${s.label.toLowerCase()}; no action needed right now.`,
  };
}

export function insights(summary, agent = "balanced") {
  const list = [];
  const trim = TRIM[agent] ?? 0.12;
  const heavy = [...summary.sectors].sort((a, b) => b.weight - b.target - (a.weight - a.target))[0];
  if (heavy && heavy.weight - heavy.target > 0.03) {
    const lead = [...heavy.holdings].sort((a, b) => b.value - a.value)[0];
    list.push({
      key: "concentration",
      severity: "critical",
      title: "Concentration Risk",
      target: lead?.id,
      targetLabel: lead ? `${lead.ticker} · ${heavy.short}` : heavy.short,
      body: `${heavy.name} is ${pct(heavy.weight, 1, false)} of your portfolio, ${pct(heavy.weight - heavy.target, 1, false)} above target. A pullback here would hit hardest.`,
    });
  }
  const oversized = summary.rows.filter((r) => r.weight > trim).sort((a, b) => b.weight - a.weight)[0];
  if (oversized) {
    list.push({
      key: "position",
      severity: list.length ? "normal" : "critical",
      title: "Oversized Position",
      target: oversized.id,
      targetLabel: `${oversized.ticker} ${pct(oversized.weight, 1, false)}`,
      body: `${oversized.short} has grown past the ${pct(trim, 0, false)} limit. Trimming would cut single-stock risk.`,
    });
  }
  const light = [...summary.sectors].sort((a, b) => a.weight - a.target - (b.weight - b.target))[0];
  if (light && light.target - light.weight > 0.02) {
    const pick = [...light.holdings].sort((a, b) => sentiment(b).value - sentiment(a).value)[0];
    list.push({
      key: "rebalance",
      severity: "normal",
      title: "Rebalance Opportunity",
      target: pick?.id,
      targetLabel: pick ? `${pick.ticker} · ${light.short}` : light.short,
      body: `${light.name} is ${pct(light.target - light.weight, 1, false)} under target. ${money(Math.min(summary.cash, (light.target - light.weight) * summary.net), { compact: true })} of cash would close the gap.`,
    });
  }
  const mover = [...summary.rows].sort((a, b) => Math.abs(b.day) - Math.abs(a.day))[0];
  if (mover) {
    list.push({
      key: "mover",
      severity: Math.abs(mover.day) > 0.03 ? "critical" : "normal",
      title: mover.day >= 0 ? "Top Mover Today" : "Biggest Drop Today",
      target: mover.id,
      targetLabel: `${mover.ticker} ${pct(mover.day, 1)}`,
      body: `${mover.short} is ${mover.day >= 0 ? "up" : "down"} ${pct(Math.abs(mover.day), 1, false)} today, ${mover.dayPl >= 0 ? "adding" : "taking"} ${money(Math.abs(mover.dayPl), { compact: true })} ${mover.dayPl >= 0 ? "to" : "from"} your portfolio.`,
    });
  }
  const cashShare = summary.cash / summary.net;
  if (cashShare > 0.06) {
    list.push({
      key: "cash",
      severity: "normal",
      title: "Idle Cash",
      target: light?.holdings[0]?.id,
      targetLabel: money(summary.cash, { compact: true }),
      body: `${pct(cashShare, 1, false)} of your portfolio is in cash. Putting part of it to work in underweight sectors would reduce cash drag.`,
    });
  }
  const winner = [...summary.rows].filter((r) => r.shares > 0).sort((a, b) => b.plPct - a.plPct)[0];
  if (winner) {
    list.push({
      key: "winner",
      severity: "normal",
      title: "Best Performer",
      target: winner.id,
      targetLabel: `${winner.ticker} ${pct(winner.plPct, 0)}`,
      body: `${winner.short} is up ${pct(winner.plPct, 0)} on cost (${money(winner.pl, { compact: true })}). ${agent === "growth" ? "Let it run." : "Consider locking in part of the gain."}`,
    });
  }
  return list;
}

const WORDS = new Set(["COST", "SPOT", "DIS", "ETH", "SOL"]);
const GENERIC = new Set(["first", "vanguard", "ishares", "schwab", "invesco", "spdr", "walt"]);

function findHolding(q) {
  const upper = q.toUpperCase();
  const lower = q.toLowerCase();
  const tickerHit = (h) => {
    if (h.ticker.length < 2) return false;
    const re = new RegExp(`(^|[^A-Za-z])${h.ticker}([^A-Za-z]|$)`);
    return re.test(q) || (!WORDS.has(h.ticker) && re.test(upper));
  };
  return (
    HOLDINGS.find(tickerHit) ||
    HOLDINGS.find((h) => lower.includes(h.short.toLowerCase())) ||
    HOLDINGS.find((h) => {
      const word = h.short.toLowerCase().split(/[ .&,]/)[0];
      return word.length > 3 && !GENERIC.has(word) && new RegExp(`\\b${word}\\b`).test(lower);
    })
  );
}

function findSector(q) {
  const lower = q.toLowerCase();
  return Object.entries(SECTORS).find(([, s]) => lower.includes(s.name.toLowerCase()) || lower.includes(s.short.toLowerCase()))?.[0];
}

export function answer(question, summary, { agent = "balanced", sources = {}, holdingId } = {}) {
  const q = question.toLowerCase();
  const used = SOURCES.filter((s) => sources[s.key] !== false).map((s) => s.name.toLowerCase());
  const note = used.length < SOURCES.length ? ` Answered from ${used.join(" and ") || "portfolio totals"} only.` : "";
  const holding = findHolding(question) || (holdingId && /\b(this|it|position|holding)\b/.test(q) ? HOLDING_BY_ID.get(holdingId) : null);
  const sectorKey = findSector(question);
  const rows = summary.rows.filter((r) => r.shares > 0);

  if (holding) {
    const row = summary.byId.get(holding.id);
    const advice = holdingAdvice(row, summary, agent);
    const s = sentiment(row);
    return {
      title: `${row.ticker}: ${advice.title}`,
      target: row.id,
      targetLabel: `${row.ticker} ${price(row.price)}`,
      body: `${row.short} trades at ${price(row.price)} (${pct(row.day)} today). You hold ${row.shares} worth ${money(row.value, { compact: true })}, ${row.plPct >= 0 ? "up" : "down"} ${pct(Math.abs(row.plPct), 0, false)} on cost. ${sources.news === false ? "" : `News sentiment is ${s.label.toLowerCase()} (${s.value}%). `}${advice.body}${note}`,
    };
  }
  if (/risk|volatil|danger|safe|exposure|concentrat/.test(q)) {
    const risky = [...rows].sort((a, b) => b.vol * b.weight - a.vol * a.weight).slice(0, 3);
    return {
      title: `Risk score ${summary.risk}/100`,
      target: risky[0]?.id,
      targetLabel: risky[0]?.ticker,
      body: `Most of your risk comes from ${risky.map((r) => `${r.ticker} (${pct(r.weight, 1, false)}, ${pct(r.vol, 0, false)} vol)`).join(", ")}. Bonds and core funds make up ${pct(summary.sectorByKey.get("justice").weight + summary.sectorByKey.get("core").weight, 0, false)} as ballast.${note}`,
    };
  }
  if (/worst|loser|losing|down|drop|lag/.test(q)) {
    const worst = [...rows].sort((a, b) => (/today|day/.test(q) ? a.day - b.day : a.plPct - b.plPct)).slice(0, 3);
    return {
      title: /today|day/.test(q) ? "Weakest today" : "Weakest positions",
      target: worst[0]?.id,
      targetLabel: worst[0]?.ticker,
      body: `${worst.map((r) => `${r.ticker} ${/today|day/.test(q) ? pct(r.day) : pct(r.plPct, 0)}`).join(", ")}. ${worst[0] ? holdingAdvice(worst[0], summary, agent).body : ""}${note}`,
    };
  }
  if (/best|top|winner|perform|gain|up\b|mover|today/.test(q)) {
    const today = /today|day|mover/.test(q);
    const best = [...rows].sort((a, b) => (today ? b.day - a.day : b.plPct - a.plPct)).slice(0, 3);
    return {
      title: today ? "Top movers today" : "Best performers",
      target: best[0]?.id,
      targetLabel: best[0]?.ticker,
      body: `${best.map((r) => `${r.ticker} ${today ? pct(r.day) : pct(r.plPct, 0)}`).join(", ")}. Your portfolio is ${pct(summary.dayPct)} today (${money(summary.dayPl, { compact: true })}).${note}`,
    };
  }
  if (/dividend|income|yield|passive/.test(q)) {
    const payers = [...rows].filter((r) => r.yield > 0).sort((a, b) => b.value * b.yield - a.value * a.yield);
    const annual = payers.reduce((sum, r) => sum + (r.value * r.yield) / 100, 0);
    return {
      title: `${money(annual, { compact: true })} a year in income`,
      target: payers[0]?.id,
      targetLabel: payers[0]?.ticker,
      body: `Your dividend and bond holdings yield about ${money(annual, { compact: true })} a year (${pct(annual / summary.net, 2, false)} of the portfolio). The biggest payers are ${payers.slice(0, 3).map((r) => `${r.ticker} ${r.yield.toFixed(1)}%`).join(", ")}.${note}`,
    };
  }
  if (/cash|buy|invest|deploy|add|where/.test(q)) {
    const light = [...summary.sectors].sort((a, b) => a.weight - a.target - (b.weight - b.target)).slice(0, 2);
    const pick = [...(light[0]?.holdings ?? [])].sort((a, b) => sentiment(b).value - sentiment(a).value)[0];
    return {
      title: `${money(summary.cash, { compact: true })} ready to invest`,
      target: pick?.id,
      targetLabel: pick?.ticker,
      body: `The most underweight sectors are ${light.map((s) => `${s.name} (${pct(s.weight, 1, false)} vs ${pct(s.target, 0, false)})`).join(" and ")}. ${pick ? `${pick.ticker} has the strongest sentiment there.` : ""}${note}`,
    };
  }
  if (/rebalanc|allocat|diversif|target|weight|sector/.test(q) || sectorKey) {
    if (sectorKey) {
      const sec = summary.sectorByKey.get(sectorKey);
      const lead = [...sec.holdings].sort((a, b) => b.value - a.value)[0];
      return {
        title: `${sec.name}: ${pct(sec.weight, 1, false)} of portfolio`,
        target: lead?.id,
        targetLabel: lead?.ticker,
        body: `${sec.holdings.length} holdings worth ${money(sec.value, { compact: true })}, ${pct(sec.plPct, 0)} on cost and ${pct(sec.day)} today. Target for your ${summary.riskProfile} profile is ${pct(sec.target, 0, false)}.${note}`,
      };
    }
    const drift = [...summary.sectors].sort((a, b) => Math.abs(b.weight - b.target) - Math.abs(a.weight - a.target)).slice(0, 3);
    return {
      title: "Rebalancing plan",
      target: drift[0]?.holdings[0]?.id,
      targetLabel: drift[0]?.short,
      body: drift.map((s) => `${s.weight > s.target ? "Trim" : "Add"} ${s.name} by ${money(Math.abs(s.weight - s.target) * summary.net, { compact: true })}`).join(". ") + `.${note}`,
    };
  }
  return {
    title: `Net worth ${money(summary.net, { compact: true })}`,
    target: [...rows].sort((a, b) => b.value - a.value)[0]?.id,
    targetLabel: "Portfolio",
    body: `You are ${pct(summary.plPct, 1)} on cost (${money(summary.pl, { compact: true })}) and ${pct(summary.dayPct)} today. Risk score ${summary.risk}/100, ${summary.alerts} alerts. Ask about a ticker, a sector, risk, income or where to put your cash.${note}`,
  };
}

export function holdingFeed(row, summary, category) {
  const r = rng(hash(row.ticker + category));
  if (category === "news") {
    return NEWS.map(([text, score], i) => {
      const s = Math.max(0.05, Math.min(0.95, score + (r() - 0.5) * 0.16));
      const name = text.replace("{T}", row.ticker).replace("{S}", SECTORS[row.sector].short);
      return { key: `n${i}`, name, chip: `SENT ${Math.round(s * 100)}`, ...statusOf(s), detail: { title: name, body: `Sentiment ${Math.round(s * 100)}%. ${s >= 0.6 ? "Supportive for the position." : s >= 0.45 ? "Neutral read for the position." : "A headwind worth watching."} Published ${1 + Math.floor(r() * 9)} hours ago.` } };
    });
  }
  if (category === "lots") {
    return summary.tx
      .filter((t) => t.holding === row.id)
      .slice(0, 19)
      .map((t) => {
        const ret = row.price / t.price - 1;
        return {
          key: t.id,
          name: `${t.side === "buy" ? "Buy" : "Sell"} ${Number(t.qty.toFixed(4))} @ ${price(t.price)}`,
          chip: pct(ret, 0),
          ...statusOf(t.side === "buy" ? 0.5 + ret : 0.5 - ret),
          detail: { title: `${t.side === "buy" ? "Bought" : "Sold"} on ${shortDate(t.t)}`, body: `${Number(t.qty.toFixed(4))} ${row.ticker} at ${price(t.price)} (${money(t.qty * t.price)}). Price is ${pct(ret, 1)} since then.` },
        };
      });
  }
  if (category === "peers") {
    const same = summary.rows.filter((p) => p.id !== row.id && p.sector === row.sector);
    const others = summary.rows.filter((p) => p.id !== row.id && p.sector !== row.sector).sort((a, b) => Math.abs(a.vol - row.vol) - Math.abs(b.vol - row.vol));
    return [...same, ...others].slice(0, 19).map((p) => ({ key: p.id, name: `${p.ticker} · ${p.short}`, chip: pct(p.day), ...statusOf(0.5 + p.day * 12), link: p.id }));
  }
  if (category === "analysts") {
    return FIRMS.slice(0, 10 + Math.floor(r() * 3)).map((firm, i) => {
      const s = Math.max(0.1, Math.min(0.92, 0.62 + (r() - 0.5) * 0.7));
      const rating = s >= 0.6 ? "Buy" : s >= 0.45 ? "Hold" : "Sell";
      const target = row.price * (0.85 + s * 0.45);
      return { key: `a${i}`, name: `${firm} · ${rating}`, chip: `PT ${target >= 1000 ? Math.round(target / 100) / 10 + "K" : Math.round(target)}`, ...statusOf(s), detail: { title: `${firm}: ${rating}`, body: `Price target ${price(target)}, ${pct(target / row.price - 1, 0)} from here.` } };
    });
  }
  const h = row.quote.history;
  const momentum = h[h.length - 1] / h[0] - 1;
  const sector = summary.sectorByKey.get(row.sector);
  const s = sentiment(row);
  const signals = [
    ["Momentum", momentum > 0.01 ? "strong" : momentum < -0.01 ? "weak" : "flat", 0.5 + momentum * 8],
    ["Day move", pct(row.day), 0.5 + row.day * 10],
    ["Weight vs limit", `${pct(row.weight, 1, false)}`, row.weight > 0.12 ? 0.3 : 0.7],
    ["Sector vs target", `${pct(sector.weight - sector.target, 1)}`, 0.5 - Math.abs(sector.weight - sector.target) * 4],
    ["Volatility", `${pct(row.vol, 0, false)} a year`, 1 - row.vol],
    ["Return on cost", pct(row.plPct, 0), 0.5 + row.plPct * 0.4],
    ["News sentiment", `${s.value}%`, s.value / 100],
    ["Dividend yield", `${row.yield.toFixed(1)}%`, 0.4 + row.yield / 10],
    ["Trend vs 30 ticks", momentum >= 0 ? "above" : "below", 0.5 + momentum * 6],
    ["Liquidity", row.type === "Crypto" ? "24/7 market" : "deep", 0.66],
    ["Drawdown risk", row.vol > 0.45 ? "elevated" : "contained", row.vol > 0.45 ? 0.3 : 0.7],
    ["AI stance", holdingAdvice(row, summary).stance, 0.6],
  ];
  return signals.map(([name, value, score], i) => {
    const c = Math.max(0.05, Math.min(0.95, score));
    return { key: `s${i}`, name: `${name}: ${value}`, chip: `CONF ${Math.round(c * 100)}`, ...statusOf(c), detail: { title: `${name}: ${value}`, body: `Signal confidence ${Math.round(c * 100)}%. ${c >= 0.6 ? "Supports holding or adding." : c >= 0.45 ? "Neutral." : "Argues for caution."}` } };
  });
}

export const CATEGORIES = [
  { key: "lots", label: "Trade Lots", icon: "briefcase" },
  { key: "peers", label: "Peer Holdings", icon: "grid" },
  { key: "news", label: "Market Headlines", icon: "gavel", main: true },
  { key: "signals", label: "AI Signals", icon: "shield" },
  { key: "analysts", label: "Analyst Ratings", icon: "half" },
];
