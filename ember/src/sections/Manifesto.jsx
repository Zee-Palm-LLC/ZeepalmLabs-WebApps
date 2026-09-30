import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";
import { facts, manifesto } from "../data.js";
import { clamp } from "../lib/math.js";

const words = manifesto.split(" ");

export default function Manifesto() {
  const rootRef = useRef(null);
  const wordRefs = useRef([]);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) {
      wordRefs.current.forEach((node) => node.style.setProperty("--heat", "0"));
      wordRefs.current.forEach((node) => node.style.setProperty("--burnt", "1"));
      return undefined;
    }
    const nodes = wordRefs.current;
    const count = nodes.length;
    const trigger = ScrollTrigger.create({
      trigger: ".manifesto-text",
      start: "top 80%",
      end: "bottom 40%",
      scrub: 0.3,
      onUpdate: (self) => {
        const front = self.progress * (count + 4) - 2;
        nodes.forEach((node, index) => {
          const distance = front - index;
          const heat = clamp(1 - Math.abs(distance) / 2.4);
          const burnt = clamp(distance / 1.2);
          node.style.setProperty("--heat", heat.toFixed(3));
          node.style.setProperty("--burnt", burnt.toFixed(3));
        });
      },
    });

    const context = gsap.context(() => {
      gsap.fromTo(
        ".manifesto-photo",
        { clipPath: "inset(30% 12% 30% 12% round 999px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-photo", start: "top 95%", end: "top 35%", scrub: 0.5 },
        }
      );
      gsap.fromTo(
        ".manifesto-photo img",
        { scale: 1.35, yPercent: -8 },
        {
          scale: 1.05,
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-photo", start: "top bottom", end: "bottom top", scrub: true },
        }
      );
      gsap.utils.toArray(".fact").forEach((fact, index) => {
        const number = fact.querySelector(".fact-number");
        const counter = { value: 0 };
        gsap
          .timeline({ scrollTrigger: { trigger: fact, start: "top 88%" }, delay: index * 0.1 })
          .fromTo(fact.querySelector(".fact-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut" })
          .to(
            counter,
            {
              value: facts[index].value,
              duration: 1.8,
              ease: "power3.out",
              onUpdate: () => {
                number.textContent = String(Math.round(counter.value));
              },
            },
            0.1
          )
          .fromTo(fact.querySelector(".fact-label"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.35);
      });
    }, rootRef);

    return () => {
      trigger.kill();
      context.revert();
    };
  }, [reduced]);

  return (
    <section ref={rootRef} className="manifesto" aria-label="Why we cook over fire">
      <p className="manifesto-text">
        <span className="visually-hidden">{manifesto}</span>
        <span aria-hidden="true">
          {words.map((word, index) => (
            <Fragment key={index}>
              <span
                ref={(node) => {
                  wordRefs.current[index] = node;
                }}
                className="burn-word"
              >
                {word}
              </span>{" "}
            </Fragment>
          ))}
        </span>
      </p>

      <div className="manifesto-lower">
        <figure className="manifesto-photo">
          <img src="./still-fire.jpg" alt="Flames rising through the grill grate over a bed of glowing oak." />
          <figcaption>The grate at 16:10, two hours before the first cover.</figcaption>
        </figure>
        <dl className="facts">
          {facts.map((fact) => (
            <div key={fact.label} className="fact">
              <span className="fact-rule" aria-hidden="true" />
              <dt className="fact-figure">
                <span className="fact-number">{fact.value}</span>
                {fact.suffix}
              </dt>
              <dd className="fact-label">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
