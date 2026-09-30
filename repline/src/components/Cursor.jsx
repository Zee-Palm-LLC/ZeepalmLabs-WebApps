import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const ring = ringRef.current;
    const label = labelRef.current;
    gsap.set(ring, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const moveY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (event) => {
      ring.classList.add("is-visible");
      moveX(event.clientX);
      moveY(event.clientY);
    };

    const onOver = (event) => {
      const target = event.target.closest("a, button, input, [data-cursor]");
      const text = target ? target.dataset.cursor || "" : "";
      ring.classList.toggle("is-active", Boolean(target));
      ring.classList.toggle("has-label", Boolean(text));
      label.textContent = text;
    };

    const onLeave = () => ring.classList.remove("is-visible");

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ringRef} className="cursor" aria-hidden="true">
      <span ref={labelRef} className="cursor-label" />
    </div>
  );
}
