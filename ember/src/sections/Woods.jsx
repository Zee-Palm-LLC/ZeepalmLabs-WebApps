import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { woods } from "../data.js";
import Flame from "../components/Flame.jsx";
import Reveal from "../components/Reveal.jsx";

export default function Woods() {
  const { reduced, tick } = useApp();
  const [index, setIndex] = useState(0);
  const tempRef = useRef(null);
  const copyRef = useRef(null);
  const shown = useRef({ value: woods[0].temp });
  const wood = woods[index];

  useEffect(() => {
    const tween = gsap.to(shown.current, {
      value: wood.temp,
      duration: reduced ? 0 : 1.2,
      ease: "power3.out",
      onUpdate: () => {
        tempRef.current.textContent = String(Math.round(shown.current.value));
      },
    });
    if (!reduced) {
      gsap.fromTo(
        copyRef.current.querySelectorAll("[data-swap]"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.05 }
      );
    }
    return () => tween.kill();
  }, [wood, reduced]);

  const choose = (next) => {
    if (next === index) return;
    setIndex(next);
    tick();
  };

  const onKey = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + step + woods.length) % woods.length;
    choose(next);
    document.getElementById(`wood-${woods[next].key}`)?.focus();
  };

  return (
    <section className="woods" id="fire" aria-labelledby="woods-heading">
      <div className="woods-head">
        <Reveal text="Three woods, one fire" id="woods-heading" className="display" />
        <p className="lede">
          The wood decides the flavour before the cook does. Pick one and watch how it burns.
        </p>
      </div>

      <div className="woods-grid">
        <div className="woods-stage" data-hot>
          {!reduced && <Flame config={wood} />}
          {reduced && <img className="woods-still" src="./still-fire.jpg" alt="" />}
          <p className="woods-temp" aria-live="polite">
            <span ref={tempRef}>{wood.temp}</span>
            <span className="woods-temp-unit">°C</span>
          </p>
          <span className="woods-grate" aria-hidden="true" />
        </div>

        <div className="woods-panel">
          <div className="woods-tabs" role="tablist" aria-label="Wood" onKeyDown={onKey}>
            {woods.map((item, itemIndex) => (
              <button
                key={item.key}
                id={`wood-${item.key}`}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-controls="wood-panel"
                tabIndex={itemIndex === index ? 0 : -1}
                className="woods-tab"
                onClick={() => choose(itemIndex)}
              >
                <span className="woods-tab-name">{item.name}</span>
                <span className="woods-tab-temp">{item.temp}°</span>
              </button>
            ))}
          </div>

          <div ref={copyRef} id="wood-panel" role="tabpanel" aria-labelledby={`wood-${wood.key}`} className="woods-copy">
            <p className="woods-body" data-swap>
              {wood.body}
            </p>
            <dl className="woods-specs">
              <div data-swap>
                <dt>Burns for</dt>
                <dd>{wood.burn}</dd>
              </div>
              <div data-swap>
                <dt>Tastes</dt>
                <dd>{wood.notes.join(", ")}</dd>
              </div>
              <div data-swap>
                <dt>We use it for</dt>
                <dd>{wood.pairs}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
