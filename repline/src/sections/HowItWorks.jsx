import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { steps } from "../story.js";
import HowArt from "../components/HowArt.jsx";
import RevealText from "../components/RevealText.jsx";

function repLine(count) {
  const span = 1000;
  let path = "M0 84";
  for (let index = 0; index < count; index += 1) {
    const center = index * span + span * 0.62;
    const peak = 70 - index * 16;
    path += ` L${center - 150} 84`;
    path += ` C${center - 70} 84, ${center - 60} ${peak}, ${center} ${peak}`;
    path += ` S${center + 70} 84, ${center + 150} 84`;
  }
  return `${path} L${count * span} 84`;
}

export default function HowItWorks() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const countRef = useRef(null);
  const { reduced } = useApp();
  const line = useMemo(() => repLine(steps.length), []);

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      const track = trackRef.current;
      const panels = gsap.utils.toArray(".how-panel");
      const scrollTrigger = {
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      };

      const move = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          ...scrollTrigger,
          onUpdate: (self) => {
            const step = Math.min(steps.length, Math.floor(self.progress * steps.length) + 1);
            countRef.current.textContent = String(step).padStart(2, "0");
          },
        },
      });

      gsap.fromTo(".how-line-trace", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger });

      panels.forEach((panel, index) => {
        const reveal = panel.querySelectorAll("[data-reveal]");
        const trigger =
          index === 0
            ? { trigger: rootRef.current, start: "top 55%" }
            : { trigger: panel, containerAnimation: move, start: "left 72%", toggleActions: "play none none reverse" };
        gsap.from(reveal, {
          y: 56,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: trigger,
        });
        gsap.fromTo(
          panel.querySelector(".how-numeral"),
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: move, start: "left right", end: "right left", scrub: true },
          }
        );
      });
    }, rootRef);
    return () => context.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className={`how ${reduced ? "is-static" : ""}`}
      style={{ "--steps": steps.length }}
      aria-labelledby="how-heading"
    >
      <div className="how-stage">
        <div className="how-head">
          <RevealText text="How it works" id="how-heading" className="how-title" />
          <p className="how-count" aria-hidden="true">
            <span ref={countRef}>01</span> / {String(steps.length).padStart(2, "0")}
          </p>
        </div>
        <ol ref={trackRef} className="how-track">
          <li className="how-line" role="presentation" aria-hidden="true">
            <svg viewBox={`0 0 ${steps.length * 1000} 100`} preserveAspectRatio="none">
              <path d={line} className="how-line-base" />
              <path d={line} pathLength="1" className="how-line-trace" />
            </svg>
          </li>
          {steps.map((step, index) => (
            <li key={step.key} className="how-panel">
              <span className="how-numeral" aria-hidden="true">
                {index + 1}
              </span>
              <div className="how-copy">
                <h3 data-reveal>{step.title}</h3>
                <p data-reveal>{step.body}</p>
              </div>
              <div className="how-art" data-reveal>
                <HowArt kind={step.key} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
