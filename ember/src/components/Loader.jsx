import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Loader({ progress, ready, onDone }) {
  const rootRef = useRef(null);
  const tempRef = useRef(null);
  const glowRef = useRef(null);
  const counter = useRef({ value: 20 });

  useEffect(() => {
    const target = ready ? 450 : 20 + Math.min(0.9, progress) * 430;
    const tween = gsap.to(counter.current, {
      value: target,
      duration: ready ? 0.9 : 1.2,
      ease: "power2.out",
      onUpdate: () => {
        const value = Math.round(counter.current.value);
        const heat = (value - 20) / 430;
        tempRef.current.textContent = String(value);
        glowRef.current.style.opacity = String(heat);
        glowRef.current.style.transform = `scale(${0.6 + heat * 0.6})`;
      },
      onComplete: () => {
        if (!ready) return;
        gsap
          .timeline({ onComplete: onDone })
          .to(rootRef.current.querySelector(".loader-inner"), { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" }, 0.15)
          .to(rootRef.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "power4.inOut" }, 0.35);
      },
    });
    return () => tween.kill();
  }, [progress, ready, onDone]);

  return (
    <div ref={rootRef} className="loader" role="status" aria-label="Loading">
      <span ref={glowRef} className="loader-glow" aria-hidden="true" />
      <div className="loader-inner">
        <p className="loader-label">Bringing the grill up to heat</p>
        <p className="loader-temp" aria-hidden="true">
          <span ref={tempRef}>20</span>
          <span className="loader-unit">°C</span>
        </p>
      </div>
    </div>
  );
}
