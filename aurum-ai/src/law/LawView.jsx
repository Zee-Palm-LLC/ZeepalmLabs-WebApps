import { useMemo, useRef, useState } from "react";
import { getUi, setUi, useFrame, useUi } from "../store.js";
import { useFinance } from "../finance/portfolio.js";
import { CATEGORIES, holdingFeed } from "../finance/ai.js";
import { truncate } from "../finance/format.js";
import { backOut, clamp, easeOut, lerp } from "../lib/math.js";
import { Briefcase, Gavel, GridCalc, HalfCircle, ShieldStar, Thumb } from "../components/Icons.jsx";
import Orb from "./Orb.jsx";
import { CARDS, CARD_W, CARD_X, EXTRA_LINES, FAN_ORIGIN, LAWS, LINK_Y, ORB } from "./lawData.js";

const ICONS = {
  briefcase: <Briefcase size={16} />,
  grid: <GridCalc size={16} />,
  gavel: <Gavel size={19} />,
  shield: <ShieldStar size={17} />,
  half: <HalfCircle size={17} />,
};

function fanPath(x, y) {
  const x0 = FAN_ORIGIN.x;
  const y0 = FAN_ORIGIN.y;
  const ex = x - 7;
  const W = ex - x0;
  const H = y - y0;
  return `M${x0} ${y0} C${x0 + W * 0.5} ${y0 + H * 0.2}, ${ex - W * 0.55} ${y - H * 0.125}, ${ex} ${y}`;
}

function cardPath(card) {
  const cy = card.top + card.height / 2;
  const x0 = ORB.x + 63;
  return `M${x0} ${LINK_Y} C${x0 + 70} ${LINK_Y}, ${CARD_X - 95} ${cy}, ${CARD_X} ${cy}`;
}

function Segments({ status, level }) {
  return (
    <span className={`law-bar law-bar-${status}`} aria-label={`${level} of 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < level ? "is-on" : ""} />
      ))}
    </span>
  );
}

export default function LawView({ onSelect, onOpen }) {
  const worldRef = useRef(null);
  const titleRef = useRef(null);
  const gapsRef = useRef(null);
  const haloRef = useRef(null);
  const linkRefs = useRef([]);
  const cardRefs = useRef([]);
  const numRefs = useRef([]);
  const lineRefs = useRef([]);
  const headRefs = useRef([]);
  const labelRefs = useRef([]);
  const lengths = useRef([]);
  const linkHeadRefs = useRef([]);
  const linkLengths = useRef([]);
  const selected = useUi((ui) => ui.selectedCard);
  const holdingId = useUi((ui) => ui.holding);
  const summary = useFinance();
  const row = summary.byId.get(holdingId);
  const category = CATEGORIES[selected] ?? CATEGORIES[2];
  const feed = useMemo(() => holdingFeed(row, summary, category.key), [row, summary, category.key]);
  const counts = useMemo(
    () => CATEGORIES.map((c) => (c.key === category.key ? feed.length : holdingFeed(row, summary, c.key).length)),
    [row, summary, category.key, feed.length]
  );
  const TITLE_1 = row.short;
  const TITLE_2 = `${row.venue}: ${row.ticker}`;
  const tickerAt = TITLE_2.length - row.ticker.length;
  const [hoverLaw, setHoverLaw] = useState(-1);

  const lines = useMemo(() => {
    const all = [
      ...LAWS.map((law, i) => ({ ...law, law: i })),
      ...EXTRA_LINES.map((extra) => ({ ...extra, law: -1 })),
    ];
    all.sort((a, b) => a.y - b.y);
    return all.map((line, i) => ({ ...line, order: i, d: fanPath(line.x, line.y), teal: i % 3 === 1 }));
  }, []);

  useFrame((s) => {
    const l = s.l;
    const world = worldRef.current;
    if (!world) return;
    const show = clamp(l.show);
    world.style.opacity = String(show);
    world.style.visibility = show <= 0.001 ? "hidden" : "visible";
    if (show <= 0.001) return;
    const cam = clamp(l.cam);
    const sc = 2.4 - 1.4 * cam;
    const L = s.stage.law;
    const ox = lerp(L.sx, ORB.x, cam);
    const oy = lerp(L.sy, ORB.y, cam);
    world.style.transform = `translate(${L.x + L.s * (ox - ORB.x * sc)}px, ${L.y + L.s * (oy - ORB.y * sc)}px) scale(${L.s * sc})`;

    if (titleRef.current) {
      const n = Math.round(l.title);
      const spans = titleRef.current.querySelectorAll("[data-i]");
      spans.forEach((span) => {
        const i = Number(span.dataset.i);
        span.style.opacity = i < n ? "1" : "0";
      });
    }
    if (gapsRef.current) {
      const g = clamp(l.gaps);
      gapsRef.current.style.opacity = String(g);
      gapsRef.current.style.transform = `translateY(${(1 - easeOut(g)) * 8}px)`;
    }
    if (haloRef.current) haloRef.current.style.opacity = String(clamp(l.halo));

    CARDS.forEach((card, i) => {
      const a = clamp(l.cards[i]);
      const el = cardRefs.current[i];
      if (el) {
        el.style.opacity = String(Math.min(1, a * 1.6));
        el.style.transform = `translateX(${(1 - easeOut(a)) * -24}px) scale(${0.86 + 0.14 * backOut(a)})`;
        el.style.setProperty("--glow", String(clamp(l.cardGlow[i])));
      }
      const num = numRefs.current[i];
      if (num) {
        const text = String(Math.round(l.cardCount[i]));
        if (num.textContent !== text) num.textContent = text;
      }
      const link = linkRefs.current[i];
      const lp = clamp(l.links[i]);
      if (link) link.style.strokeDashoffset = String(1 - lp);
      const lh = linkHeadRefs.current[i];
      if (lh && link) {
        if (lp > 0 && lp < 1) {
          if (!linkLengths.current[i]) linkLengths.current[i] = link.getTotalLength();
          const pt = link.getPointAtLength(linkLengths.current[i] * lp);
          lh.setAttribute("cx", pt.x.toFixed(1));
          lh.setAttribute("cy", pt.y.toFixed(1));
          lh.style.opacity = "1";
        } else {
          lh.style.opacity = "0";
        }
      }
    });

    const fan = l.fan;
    lines.forEach((line, i) => {
      const p = clamp((fan - i * 0.11) / 0.62);
      const path = lineRefs.current[i];
      const head = headRefs.current[i];
      const label = labelRefs.current[i];
      if (path) {
        path.style.strokeDashoffset = String(1 - easeOut(p));
        if (!lengths.current[i]) lengths.current[i] = path.getTotalLength();
        if (head) {
          if (p > 0 && p < 1) {
            const pt = path.getPointAtLength(lengths.current[i] * easeOut(p));
            head.setAttribute("cx", pt.x.toFixed(1));
            head.setAttribute("cy", pt.y.toFixed(1));
            head.style.opacity = String(Math.sin(Math.PI * p) * 1.2);
          } else {
            head.style.opacity = "0";
          }
        }
      }
      if (label) {
        const v = clamp((p - 0.82) / 0.18);
        label.style.opacity = String(v * (line.fade ?? 1));
        label.style.transform = `translateX(${(1 - easeOut(v)) * -10}px)`;
      }
    });
  });

  const select = (i) => {
    setUi({ selectedCard: i, focusItem: null });
    onSelect(i);
  };

  const activate = (item) => {
    if (!item) return;
    if (item.link) {
      onOpen(item.link);
      return;
    }
    setUi({ focusItem: item.detail, lawAnswer: null, sheetOpen: getUi().compact ? true : getUi().sheetOpen });
  };

  const slotItem = (line) => (line.law >= 0 ? feed[line.law] : null);

  return (
    <div ref={worldRef} className="law-world" aria-label={`${row.name} position`}>
      <div ref={haloRef} className="law-halo" aria-hidden="true" />
      <svg className="law-svg" width="1600" height="1200" viewBox="0 0 1600 1200" aria-hidden="true">
        <defs>
          <linearGradient id="fanGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff2d6" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#d9c08f" stopOpacity="0.85" />
            <stop offset="1" stopColor="#e6cf9f" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="fanTeal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4fffd" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#8fe2d8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#bdeee6" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="headGlow">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.3" stopColor="#f6f1c6" stopOpacity="0.75" />
            <stop offset="1" stopColor="#f6f1c6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M 640 150 A 462 462 0 0 1 640 1058" className="law-arc" />
        {CARDS.map((card, i) => (
          <path
            key={card.key}
            ref={(node) => {
              linkRefs.current[i] = node;
            }}
            d={cardPath(card)}
            pathLength="1"
            className={`law-link ${i === 2 ? "is-main" : ""}`}
          />
        ))}
        {CARDS.map((card, i) => (
          <circle
            key={`h-${card.key}`}
            ref={(node) => {
              linkHeadRefs.current[i] = node;
            }}
            r="7"
            fill="url(#headGlow)"
            opacity="0"
          />
        ))}
        {lines.map((line, i) => (
          <g
            key={i}
            className={line.law === hoverLaw && hoverLaw >= 0 ? "law-line-hot" : ""}
            opacity={line.law < 0 ? line.fade : slotItem(line) ? line.fade ?? 1 : 0.16}
          >
            <path
              ref={(node) => {
                lineRefs.current[i] = node;
              }}
              d={line.d}
              pathLength="1"
              className="law-fan"
              stroke={line.teal ? "url(#fanTeal)" : "url(#fanGold)"}
            />
            <circle
              ref={(node) => {
                headRefs.current[i] = node;
              }}
              r="9"
              fill="url(#headGlow)"
              opacity="0"
            />
          </g>
        ))}
      </svg>

      <h2 ref={titleRef} className="law-title">
        <span className="visually-hidden">
          {TITLE_1} {TITLE_2}
        </span>
        <span aria-hidden="true" className="law-title-1">
          {TITLE_1.split("").map((ch, i) => (
            <span key={i} data-i={i}>
              {ch}
            </span>
          ))}
        </span>
        <span aria-hidden="true" className="law-title-2">
          {TITLE_2.split("").map((ch, i) => (
            <span key={i} data-i={TITLE_1.length + i} className={i >= tickerAt ? "is-gold" : ""}>
              {ch}
            </span>
          ))}
        </span>
      </h2>
      <Orb />
      <div ref={gapsRef} className="law-gaps">
        <span className="law-gaps-tag">
          VOL <b>{Math.round(row.vol * 100)}</b>
        </span>
        <span className="law-gaps-vote">
          <Thumb size={11} color="#c9d1d0" />
          <span className="law-gaps-bar">
            <span />
          </span>
        </span>
      </div>

      {CARDS.map((card, i) => (
        <button
          key={CATEGORIES[i].key}
          ref={(node) => {
            cardRefs.current[i] = node;
          }}
          type="button"
          className={`law-card ${selected === i ? "is-selected" : ""}`}
          style={{ left: CARD_X, top: card.top, width: CARD_W, height: card.height }}
          aria-pressed={selected === i}
          onClick={() => select(i)}
        >
          <span className="law-card-tick" aria-hidden="true" />
          <span className="law-card-top">
            <span className="law-card-icon">{ICONS[card.icon]}</span>
            <span
              ref={(node) => {
                numRefs.current[i] = node;
              }}
              className="law-card-num"
            >
              {counts[i]}
            </span>
          </span>
          <span className="law-card-label">{CATEGORIES[i].label}</span>
        </button>
      ))}

      <ul className="law-list" aria-label={category.label}>
        {lines.map((line, i) => {
          const item = slotItem(line);
          if (line.law < 0) return null;
          return (
            <li
              key={i}
              ref={(node) => {
                labelRefs.current[i] = node;
              }}
              className={`law-item${item ? "" : " is-empty"}`}
              style={{ left: line.x, top: line.y }}
              onPointerEnter={() => setHoverLaw(line.law)}
              onPointerLeave={() => setHoverLaw(-1)}
            >
              {item && (
                <button type="button" className="law-hit" title={item.name} onClick={() => activate(item)}>
                  <span className="law-node" aria-hidden="true" />
                  <span className="law-name">{truncate(item.name, 17)}</span>
                  <span className="law-meta">
                    <span className="law-chip">{item.chip}</span>
                    <Thumb size={12} color="#9aa5a4" />
                    <Segments status={item.status} level={item.level} />
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
