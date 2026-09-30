import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SparkCursor() {
  const canvasRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const dot = dotRef.current;
    const sparks = [];
    let last = null;
    let width = 0;
    let height = 0;

    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onMove = (event) => {
      dot.classList.add("is-visible");
      moveX(event.clientX);
      moveY(event.clientY);
      if (last) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        const speed = Math.hypot(dx, dy);
        const count = Math.min(6, Math.floor(speed / 14));
        for (let index = 0; index < count; index += 1) {
          sparks.push({
            x: event.clientX,
            y: event.clientY,
            vx: -dx * 0.04 + (Math.random() - 0.5) * 1.6,
            vy: -dy * 0.04 - Math.random() * 1.8,
            life: 1,
            size: 0.8 + Math.random() * 1.8,
          });
        }
      }
      last = { x: event.clientX, y: event.clientY };
    };

    const onOver = (event) => {
      const target = event.target.closest("a, button, input, select, textarea, [data-hot]");
      dot.classList.toggle("is-hot", Boolean(target));
    };

    const onLeave = () => {
      dot.classList.remove("is-visible");
      last = null;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy -= 0.03;
        spark.vx *= 0.97;
        spark.life -= 0.022;
        if (spark.life <= 0) {
          sparks.splice(index, 1);
          continue;
        }
        const green = Math.round(90 + 150 * spark.life);
        context.fillStyle = `rgba(255,${green},40,${spark.life})`;
        context.beginPath();
        context.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2);
        context.fill();
      }
    };

    resize();
    gsap.ticker.add(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="spark-canvas" aria-hidden="true" />
      <span ref={dotRef} className="spark-dot" aria-hidden="true" />
    </>
  );
}
