import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { place } from "../data.js";

const letters = "EMBER".split("");

export default function Footer() {
  const { reduced } = useApp();
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const letterRefs = useRef([]);

  useEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    const nodes = letterRefs.current;
    const heat = nodes.map(() => ({ value: 0 }));
    const setters = nodes.map((node, index) =>
      gsap.quickTo(heat[index], "value", {
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => node.style.setProperty("--heat", heat[index].value.toFixed(3)),
      })
    );

    const onMove = (event) => {
      nodes.forEach((node, index) => {
        const box = node.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / box.width;
        const dy = (event.clientY - (box.top + box.height / 2)) / box.height;
        setters[index](Math.exp(-(dx * dx * 1.2 + dy * dy * 0.8)));
      });
    };
    const onLeave = () => setters.forEach((set) => set(0));

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const embers = [];
    let width = 0;
    let height = 0;
    let visible = false;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    const draw = () => {
      if (!visible) return;
      if (embers.length < 90 && Math.random() < 0.6) {
        embers.push({ x: Math.random() * width, y: height + 6, vx: (Math.random() - 0.5) * 0.4, vy: -(0.5 + Math.random() * 1.4), life: 1, size: 0.6 + Math.random() * 2 });
      }
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      for (let index = embers.length - 1; index >= 0; index -= 1) {
        const ember = embers[index];
        ember.x += ember.vx + Math.sin((ember.y + index) * 0.03) * 0.3;
        ember.y += ember.vy;
        ember.life -= 0.004;
        if (ember.life <= 0 || ember.y < -10) {
          embers.splice(index, 1);
          continue;
        }
        const g = Math.round(90 + 130 * ember.life);
        context.fillStyle = `rgba(255,${g},40,${ember.life * 0.9})`;
        context.beginPath();
        context.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
    };

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    gsap.ticker.add(draw);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(draw);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <footer ref={rootRef} className="footer">
      <canvas ref={canvasRef} className="footer-embers" aria-hidden="true" />
      <div className="footer-top">
        <p className="footer-line">Everything we cook touches the fire.</p>
        <ul className="footer-links">
          <li>
            <a href="#cook">The cook</a>
          </li>
          <li>
            <a href="#cuts">Cuts</a>
          </li>
          <li>
            <a href="#menu">Menu</a>
          </li>
          <li>
            <a href="#book">Book</a>
          </li>
          <li>
            <a href={place.phoneHref}>{place.phone}</a>
          </li>
        </ul>
      </div>
      <p className="footer-mark" data-hot>
        <span className="visually-hidden">Ember</span>
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
        <p>
          © 2026 Ember, {place.street}, {place.city}
        </p>
        <p className="footer-hint">Hold your cursor over the name to warm it up.</p>
      </div>
    </footer>
  );
}
