import { useRef } from "react";
import { setUi, useFrame, useUi } from "../store.js";
import { clamp, easeOut } from "../lib/math.js";
import { ArrowUpRight, ChevronUp, CloseIcon } from "./Icons.jsx";

const SLOT = ["critical", "dereg"];

export default function AnalysisPanel({ onClose, onOpen }) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const sweepRef = useRef(null);
  const insights = useUi((ui) => ui.insights);
  const answer = useUi((ui) => ui.answer);
  const page = useUi((ui) => ui.insightPage);

  useFrame((s) => {
    const el = rootRef.current;
    if (!el) return;
    const t = clamp(s.chrome.analysis);
    el.style.opacity = String(t);
    el.style.transform = `translateY(${(1 - easeOut(t)) * 30}px) scale(${0.97 + 0.03 * easeOut(t)})`;
    el.style.visibility = t <= 0.001 ? "hidden" : "visible";
    el.style.pointerEvents = t > 0.9 ? "auto" : "none";
    s.chrome.analysisCards.forEach((v, i) => {
      const card = cardRefs.current[i];
      if (!card) return;
      const c = clamp(v);
      card.style.opacity = String(c);
      card.style.filter = c < 1 ? `blur(${(1 - c) * 6}px)` : "none";
      card.style.transform = `translateY(${(1 - easeOut(c)) * 10}px)`;
    });
    if (sweepRef.current) {
      const g = s.chrome.critical;
      sweepRef.current.style.opacity = String(clamp(g * 4) * (1 - clamp((g - 0.85) / 0.15) * 0.55));
      sweepRef.current.style.setProperty("--sweep", `${clamp(g) * 540}deg`);
    }
  });

  const pool = answer ? [answer, ...insights] : insights;
  const pages = Math.max(1, Math.ceil(pool.length / 2));
  const start = (page % pages) * 2;
  const cards = [pool[start], pool[start + 1]].filter(Boolean);
  const more = Math.max(0, pool.length - 2);

  return (
    <section ref={rootRef} className="analysis" aria-label="AI analysis" aria-live="polite">
      <header className="analysis-head">
        <h2>
          <strong>AI</strong> {answer && page % pages === 0 ? "ANSWER" : "ANALYSIS"}
        </h2>
        <div className="analysis-tools">
          {more > 0 && (
            <button
              type="button"
              className="analysis-more"
              aria-label={`Show more insights, page ${(page % pages) + 1} of ${pages}`}
              onClick={() => setUi({ insightPage: (page + 1) % pages })}
            >
              <span className="analysis-more-up">
                <ChevronUp size={13} />
              </span>
              +{more}
            </button>
          )}
          <button type="button" className="analysis-close" aria-label="Close analysis" onClick={onClose}>
            <CloseIcon size={13} />
          </button>
        </div>
      </header>
      <ul className="analysis-cards">
        {SLOT.map((slot, i) => {
          const card = cards[i];
          return (
            <li
              key={slot}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              className={`analysis-card analysis-${slot}${card && i === 0 && card.severity !== "critical" && card !== answer ? " is-calm" : ""}`}
              hidden={!card}
            >
              {i === 0 && <span ref={sweepRef} className="analysis-sweep" aria-hidden="true" />}
              {card && (
                <>
                  <p className="analysis-line">
                    <span className="analysis-bracket" aria-hidden="true" />
                    <span className="analysis-title">{card.title}</span>
                    {card.target ? (
                      <button type="button" className="analysis-law" onClick={() => onOpen(card.target)}>
                        {card.targetLabel}
                        <ArrowUpRight size={15} />
                      </button>
                    ) : (
                      <span className="analysis-law">{card.targetLabel}</span>
                    )}
                  </p>
                  <p className="analysis-body">{card.body}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
