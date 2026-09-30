import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { clamp } from "../lib/math.js";

const phrase = "One rep at a time";
const copies = 6;

function Row({ reverse, rowRef }) {
  return (
    <div className={`marquee-row ${reverse ? "marquee-row-outline" : ""}`}>
      <div ref={rowRef} className="marquee-track">
        {Array.from({ length: copies * 2 }, (_, index) => (
          <span key={index} className="marquee-item">
            {phrase}
            <span className="marquee-mark" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const rootRef = useRef(null);
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) return undefined;
    const rows = [
      { element: firstRef.current, direction: -1, offset: 0 },
      { element: secondRef.current, direction: 1, offset: 0 },
    ];
    let lastScroll = window.scrollY;
    let velocity = 0;
    let visible = false;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(rootRef.current);

    const tick = () => {
      const scroll = window.scrollY;
      velocity += (scroll - lastScroll - velocity) * 0.12;
      lastScroll = scroll;
      if (!visible) return;
      const skew = clamp(velocity * 0.35, -14, 14);
      for (const row of rows) {
        const half = row.element.scrollWidth / 2;
        row.offset += row.direction * (1.1 + Math.abs(velocity) * 0.9) * (velocity < -0.5 ? -1 : 1);
        if (row.offset <= -half) row.offset += half;
        if (row.offset > 0) row.offset -= half;
        row.element.style.transform = `translate3d(${row.offset}px, 0, 0) skewX(${-skew * row.direction}deg)`;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="marquee" aria-hidden="true">
      <Row rowRef={firstRef} />
      <Row rowRef={secondRef} reverse />
    </div>
  );
}
