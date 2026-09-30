import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";

const letters = "REPLINE".split("");
const reach = 0.16;

export default function Footer() {
  const rootRef = useRef(null);
  const letterRefs = useRef([]);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    const nodes = letterRefs.current;
    const stretch = nodes.map((node) => gsap.quickTo(node, "scaleY", { duration: 0.7, ease: "power3.out" }));

    const onMove = (event) => {
      const width = window.innerWidth;
      nodes.forEach((node, index) => {
        const box = node.getBoundingClientRect();
        const distance = (event.clientX - (box.left + box.width / 2)) / (width * reach);
        stretch[index](1 + 0.85 * Math.exp(-distance * distance));
      });
    };

    const onLeave = () => stretch.forEach((set) => set(1));

    const wave = () => {
      gsap.fromTo(
        nodes,
        { scaleY: 1 },
        { scaleY: 1.55, duration: 0.4, ease: "power3.out", stagger: 0.05, yoyo: true, repeat: 1 }
      );
    };

    const trigger = ScrollTrigger.create({
      trigger: "#waitlist",
      start: "bottom 80%",
      onEnter: wave,
    });

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      trigger.kill();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <footer ref={rootRef} className="footer">
      <div className="footer-top">
        <p className="footer-tagline">One rep at a time.</p>
        <ul className="footer-links">
          <li>
            <a href="#story">The lift</a>
          </li>
          <li>
            <a href="#try">Try a set</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#waitlist">Waitlist</a>
          </li>
          <li>
            <a href="mailto:hello@repline.example">Contact</a>
          </li>
        </ul>
      </div>
      <p className="footer-mark" data-cursor="Pull">
        <span className="visually-hidden">Repline</span>
        {letters.map((letter, index) => (
          <span
            key={index}
            ref={(node) => {
              letterRefs.current[index] = node;
            }}
            className="footer-letter"
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </p>
      <div className="footer-bottom">
        <p>© 2026 Repline</p>
        <p>Move the pointer across the name.</p>
      </div>
    </footer>
  );
}
