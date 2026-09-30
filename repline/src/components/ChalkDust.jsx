import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const paper = "#F2F1EC";
const lime = "#C6FF3D";

function drifting(width, height, anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : height + Math.random() * 40,
    radius: 0.4 + Math.random() * 1.8,
    alpha: 0.06 + Math.random() * 0.34,
    rise: 0.08 + Math.random() * 0.32,
    sway: 0.2 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  };
}

function bursting(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const force = 2 + Math.random() * 9;
  return {
    x,
    y,
    vx: Math.cos(angle) * force,
    vy: Math.sin(angle) * force - 3,
    radius: 1 + Math.random() * 3.2,
    life: 1,
    fade: 0.008 + Math.random() * 0.014,
    color: Math.random() < 0.45 ? lime : paper,
  };
}

const ChalkDust = forwardRef(function ChalkDust(_, ref) {
  const canvasRef = useRef(null);
  const sparks = useRef([]);

  useImperativeHandle(ref, () => ({
    burst(clientX, clientY, count = 110) {
      const box = canvasRef.current.getBoundingClientRect();
      for (let index = 0; index < count; index += 1) {
        sparks.current.push(bursting(clientX - box.left, clientY - box.top));
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const live = sparks.current;
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let visible = true;
    let time = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(140, (width * height) / 11000));
      particles = Array.from({ length: count }, () => drifting(width, height, true));
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      time += 0.01;
      context.clearRect(0, 0, width, height);

      context.fillStyle = paper;
      for (const particle of particles) {
        particle.y -= particle.rise;
        particle.x += Math.sin(time + particle.phase) * particle.sway * 0.3;
        if (particle.y < -10) Object.assign(particle, drifting(width, height, false));
        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = live.length - 1; index >= 0; index -= 1) {
        const spark = live[index];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.96;
        spark.vy = spark.vy * 0.96 + 0.12;
        spark.life -= spark.fade;
        if (spark.life <= 0) {
          live.splice(index, 1);
          continue;
        }
        context.globalAlpha = spark.life;
        context.fillStyle = spark.color;
        context.beginPath();
        context.arc(spark.x, spark.y, spark.radius * spark.life, 0, Math.PI * 2);
        context.fill();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="chalk" aria-hidden="true" />;
});

export default ChalkDust;
