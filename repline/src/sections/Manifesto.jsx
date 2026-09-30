import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { manifesto, specs } from "../story.js";

const words = manifesto.split(" ");

export default function Manifesto() {
  const rootRef = useRef(null);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(
        ".manifesto-word",
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: ".manifesto-text", start: "top 78%", end: "bottom 45%", scrub: 0.4 },
        }
      );

      gsap.fromTo(
        ".manifesto-photo",
        { clipPath: "inset(18% 22% 18% 22% round 28px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 28px)",
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-photo", start: "top 95%", end: "top 30%", scrub: 0.5 },
        }
      );

      gsap.fromTo(
        ".manifesto-photo img",
        { yPercent: -12, scale: 1.25 },
        {
          yPercent: 12,
          scale: 1.05,
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-photo", start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      gsap.utils.toArray(".spec").forEach((spec, index) => {
        const number = spec.querySelector(".spec-number");
        const counter = { value: 0 };
        const timeline = gsap.timeline({ scrollTrigger: { trigger: spec, start: "top 88%" }, delay: index * 0.08 });
        timeline
          .from(spec.querySelector(".spec-rule"), { scaleX: 0, duration: 1, ease: "power3.inOut" })
          .to(
            counter,
            {
              value: specs[index].value,
              duration: 1.6,
              ease: "power3.out",
              onUpdate: () => {
                number.textContent = Math.round(counter.value).toLocaleString("en-US");
              },
            },
            0.1
          )
          .from(spec.querySelector(".spec-label"), { opacity: 0, y: 12, duration: 0.8, ease: "power2.out" }, 0.3);
      });
    }, rootRef);
    return () => context.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="manifesto" aria-label="Why Repline">
      <p className="manifesto-text">
        <span className="visually-hidden">{manifesto}</span>
        <span aria-hidden="true">
          {words.map((word, index) => (
            <span key={index} className="manifesto-word">
              {word}{" "}
            </span>
          ))}
        </span>
      </p>

      <figure className="manifesto-photo">
        <img src="./still-hang.jpg" alt="A lifter holding a barbell at the hip, with the bar path traced around it in light." />
        <figcaption>Rep 3 of 5, traced at a thousand samples a second.</figcaption>
      </figure>

      <dl className="specs">
        {specs.map((spec) => (
          <div key={spec.label} className="spec">
            <span className="spec-rule" aria-hidden="true" />
            <dt className="spec-figure">
              <span className="spec-number">{spec.value.toLocaleString("en-US")}</span>
              {spec.suffix}
            </dt>
            <dd className="spec-label">{spec.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
