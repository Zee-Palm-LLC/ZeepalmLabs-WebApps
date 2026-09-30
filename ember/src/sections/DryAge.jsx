import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";
import { ageMilestones } from "../data.js";
import { lerp, smooth } from "../lib/math.js";

const days = 45;
const startWeight = 12.4;
const lossAtEnd = 0.27;

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixHex(a, b, t) {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  return `rgb(${from.map((channel, index) => Math.round(lerp(channel, to[index], t))).join(",")})`;
}

const slabOutline =
  "M60 150 C 50 86, 120 40, 212 44 C 300 48, 360 88, 356 150 C 352 214, 290 250, 204 250 C 118 250, 68 214, 60 150 Z";
const slabFat = "M118 70 C 150 52, 190 48, 222 50 C 200 64, 176 96, 172 128 C 150 110, 132 90, 118 70 Z";
const marbling = [
  "M110 150 C 140 136, 176 162, 212 146 S 270 130, 300 146",
  "M226 112 C 252 124, 284 108, 318 124",
  "M130 196 C 164 208, 204 188, 244 204 S 300 214, 330 196",
  "M246 168 C 268 180, 292 164, 322 176",
];

export default function DryAge() {
  const { reduced } = useApp();
  const [milestone, setMilestone] = useState(reduced ? ageMilestones.length - 1 : 0);
  const rootRef = useRef(null);
  const dayRef = useRef(null);
  const weightRef = useRef(null);
  const lossRef = useRef(null);
  const ringRef = useRef(null);
  const meatRef = useRef(null);
  const barkRef = useRef(null);
  const fatRef = useRef(null);
  const slabRef = useRef(null);
  const marbleRef = useRef(null);

  useEffect(() => {
    const apply = (progress) => {
      const day = Math.max(1, Math.round(1 + progress * (days - 1)));
      const aged = smooth(progress);
      dayRef.current.textContent = String(day).padStart(2, "0");
      const weight = startWeight * (1 - lossAtEnd * aged);
      weightRef.current.textContent = weight.toFixed(1);
      lossRef.current.textContent = String(Math.round(lossAtEnd * aged * 100));
      ringRef.current.style.strokeDashoffset = String(1 - progress);
      meatRef.current.setAttribute("fill", mixHex("#c52a3c", "#6e1a22", aged));
      barkRef.current.setAttribute("stroke", mixHex("#b33a3a", "#2e1510", aged));
      barkRef.current.setAttribute("stroke-width", String(lerp(4, 18, aged)));
      fatRef.current.setAttribute("fill", mixHex("#f6ede2", "#e3c89a", aged));
      marbleRef.current.setAttribute("stroke", mixHex("#f3e6da", "#e6cfae", aged));
      slabRef.current.style.transform = `scale(${lerp(1, 0.92, aged)})`;
      let reached = 0;
      ageMilestones.forEach((item, index) => {
        if (day >= item.day) reached = index;
      });
      setMilestone(reached);
    };

    if (reduced) {
      apply(1);
      return undefined;
    }

    apply(0);
    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => apply(self.progress),
    });
    return () => trigger.kill();
  }, [reduced]);

  return (
    <section ref={rootRef} className={`age ${reduced ? "is-static" : ""}`} aria-labelledby="age-heading">
      <div className="age-stage">
        <div className="age-head">
          <h2 id="age-heading" className="age-title">
            The chamber
          </h2>
          <p className="age-lede">Every steak hangs for weeks in a salt-lined room before it meets the fire. Scroll to age it.</p>
        </div>

        <div className="age-grid">
          <div className="age-counter">
            <svg viewBox="0 0 120 120" className="age-ring" aria-hidden="true">
              <circle cx="60" cy="60" r="54" className="age-ring-track" />
              <circle ref={ringRef} cx="60" cy="60" r="54" pathLength="1" className="age-ring-fill" />
            </svg>
            <p className="age-day">
              <span className="age-day-label">Day</span>
              <span ref={dayRef} className="age-day-number">
                01
              </span>
              <span className="age-day-of">of {days}</span>
            </p>
          </div>

          <div className="age-slab-wrap" aria-hidden="true">
            <svg viewBox="0 0 440 360" className="age-slab">
              <line x1="20" y1="10" x2="420" y2="10" className="age-rail" />
              <g ref={slabRef} className="age-slab-body">
                <path d="M220 10 V 58 C 220 80, 192 84, 188 64" className="age-hook" />
                <rect x="286" y="262" width="118" height="36" rx="18" transform="rotate(-10 345 280)" className="age-bone" />
                <g transform="translate(14 64)">
                  <path ref={barkRef} d={slabOutline} className="age-bark" />
                  <path ref={meatRef} d={slabOutline} />
                  <path ref={fatRef} d={slabFat} />
                  <g ref={marbleRef} className="age-marble">
                    {marbling.map((path) => (
                      <path key={path} d={path} />
                    ))}
                  </g>
                </g>
              </g>
            </svg>
            <dl className="age-readouts">
              <div>
                <dt>Chamber</dt>
                <dd>2°C, 85% humidity</dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd>
                  <span ref={weightRef}>{startWeight.toFixed(1)}</span> kg
                </dd>
              </div>
              <div>
                <dt>Moisture lost</dt>
                <dd>
                  <span ref={lossRef}>0</span>%
                </dd>
              </div>
            </dl>
          </div>

          <ol className="age-milestones">
            {ageMilestones.map((item, index) => (
              <li
                key={item.day}
                className={`age-milestone ${index <= milestone ? "is-reached" : ""} ${index === milestone ? "is-current" : ""}`}
              >
                <p className="age-milestone-day">Day {item.day}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
