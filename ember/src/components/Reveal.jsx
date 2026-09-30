import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";

export default function Reveal({ as: Tag = "h2", text, className = "", id }) {
  const ref = useRef(null);
  const { reduced } = useApp();
  const words = text.split(" ");

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(
        ref.current.querySelectorAll(".reveal-inner"),
        { yPercent: 110, skewY: 6 },
        {
          yPercent: 0,
          skewY: 0,
          duration: 1.15,
          ease: "power4.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        }
      );
    }, ref);
    return () => context.revert();
  }, [reduced]);

  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={index} className="reveal-word">
            <span className="reveal-inner">{word}</span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
