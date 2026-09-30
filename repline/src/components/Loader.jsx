import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Loader({ progress, ready, onDone }) {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const counter = useRef({ value: 0 });

  useEffect(() => {
    const target = ready ? 100 : Math.min(92, progress * 100);
    const tween = gsap.to(counter.current, {
      value: target,
      duration: ready ? 0.7 : 1.2,
      ease: "power2.out",
      onUpdate: () => {
        const value = Math.round(counter.current.value);
        countRef.current.textContent = String(value).padStart(3, "0");
        barRef.current.style.transform = `scaleX(${value / 100})`;
      },
      onComplete: () => {
        if (!ready) return;
        gsap.to(rootRef.current, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
          delay: 0.15,
          onComplete: onDone,
        });
      },
    });
    return () => tween.kill();
  }, [progress, ready, onDone]);

  return (
    <div ref={rootRef} className="loader" role="status" aria-label="Loading">
      <p className="loader-label">Loading the bar</p>
      <p className="loader-count" aria-hidden="true">
        <span ref={countRef}>000</span>
      </p>
      <span className="loader-track" aria-hidden="true">
        <span ref={barRef} className="loader-fill" />
      </span>
    </div>
  );
}
