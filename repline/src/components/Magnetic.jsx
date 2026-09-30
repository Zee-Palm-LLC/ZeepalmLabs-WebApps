import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";

export default function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const element = ref.current;
    const moveX = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (event) => {
      const box = element.getBoundingClientRect();
      moveX((event.clientX - box.left - box.width / 2) * strength);
      moveY((event.clientY - box.top - box.height / 2) * strength);
    };

    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, strength]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}
