import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";

export default function RevealText({ as: Tag = "h2", text, className = "", id }) {
  const ref = useRef(null);
  const { reduced } = useApp();
  const words = text.split(" ");

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.from(ref.current.querySelectorAll(".reveal-word-inner"), {
        yPercent: 115,
        rotate: 4,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ref.current, start: "top 86%" },
      });
    }, ref);
    return () => context.revert();
  }, [reduced]);

  return (
    <Tag ref={ref} id={id} className={`reveal-text ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <span key={index} className="reveal-word" aria-hidden="true">
          <span className="reveal-word-inner">{word}</span>
        </span>
      ))}
    </Tag>
  );
}
