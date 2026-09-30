import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";
import { features } from "../story.js";
import RevealText from "../components/RevealText.jsx";

const wave =
  "M0 60 L30 60 C40 60 44 14 54 14 S68 96 78 96 S92 60 104 60 L134 60 C144 60 148 18 158 18 S172 94 182 94 S196 60 208 60 L238 60 C248 60 252 22 262 22 S276 92 286 92 S300 60 312 60 L342 60 C352 60 356 28 366 28 S380 88 390 88 S404 60 416 60 L446 60 C456 60 460 36 470 36 S484 82 494 82 S508 60 520 60";
const wavePeaks = [54, 158, 262, 366, 470];
const wavePeakHeights = [14, 18, 22, 28, 36];

const waveTimes = ["0.61", "0.63", "0.66", "0.72", "0.84"];

function RepsArt() {
  return (
    <div className="feature-art art-reps" aria-hidden="true">
      <svg viewBox="0 0 520 110" className="art-wave">
        <path d={wave} className="wave-base" />
        <path d={wave} pathLength="1" className="wave-trace" />
        {wavePeaks.map((x, index) => (
          <circle key={x} cx={x} cy={wavePeakHeights[index]} r="5" className="wave-peak" style={{ "--i": index }} />
        ))}
      </svg>
      <ol className="wave-reps">
        {waveTimes.map((time, index) => (
          <li key={index} style={{ "--i": index }}>
            <span>Rep {index + 1}</span>
            <span>{time} s</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function VelocityArt() {
  return (
    <svg viewBox="0 0 220 130" className="feature-art art-gauge" aria-hidden="true">
      <path d="M20 118 A90 90 0 0 1 200 118" pathLength="1" className="gauge-base" />
      <path d="M20 118 A90 90 0 0 1 200 118" pathLength="1" className="gauge-value" />
      <g className="gauge-needle">
        <line x1="110" y1="118" x2="110" y2="42" />
        <circle cx="110" cy="118" r="7" />
      </g>
      <text x="0" y="24" className="gauge-figure">
        0.84
      </text>
      <text x="220" y="24" textAnchor="end" className="gauge-caption">
        m/s mean
      </text>
    </svg>
  );
}

const recordSteps = [38, 46, 46, 58, 66, 66, 82, 94];

function RecordsArt() {
  return (
    <div className="feature-art art-records" aria-hidden="true">
      {recordSteps.map((height, index) => (
        <span
          key={index}
          className={`record-step ${index === recordSteps.length - 1 ? "is-top" : ""}`}
          style={{ height: `${height}%`, "--i": index }}
        />
      ))}
    </div>
  );
}

const art = { reps: RepsArt, velocity: VelocityArt, records: RecordsArt };

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const { reduced } = useApp();
  const Art = art[feature.key];

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const card = ref.current;
    const tiltX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const tiltY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });

    const onMove = (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      tiltX((0.5 - y) * 7);
      tiltY((x - 0.5) * 9);
    };

    const onLeave = () => {
      tiltX(0);
      tiltY(0);
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <li ref={ref} className={`feature feature-${feature.key}`}>
      <span className="feature-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <Art />
      <h3>{feature.title}</h3>
      <p>{feature.body}</p>
    </li>
  );
}

export default function Features() {
  const rootRef = useRef(null);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray(".feature");
      cards.forEach((card) => card.classList.add("will-animate"));
      gsap.from(cards, {
        clipPath: "inset(100% 0% 0% 0% round 28px)",
        y: 90,
        duration: 1.3,
        ease: "power4.out",
        stagger: 0.14,
        scrollTrigger: { trigger: ".feature-grid", start: "top 82%" },
      });
      cards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 70%",
          onEnter: () => card.classList.add("is-in"),
        });
      });
    }, rootRef);
    return () => {
      context.revert();
    };
  }, [reduced]);

  return (
    <section ref={rootRef} className="features" id="features" aria-labelledby="features-heading">
      <div className="features-head">
        <RevealText text="Built for the bar" id="features-heading" className="display" />
        <p className="section-lede">A sensor the size of a matchbox clips to the sleeve. Your phone stays in your bag.</p>
      </div>
      <ul className="feature-grid">
        {features.map((feature, index) => (
          <FeatureCard key={feature.key} feature={feature} index={index} />
        ))}
      </ul>
    </section>
  );
}
