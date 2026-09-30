import { useEffect, useRef } from "react";
import gsap from "gsap";

const steps = 24;
const spriteSize = 64;

function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function blend(a, b, amount) {
  return a.map((value, index) => mix(value, b[index], amount));
}

function parse(colors) {
  return colors.map((color) => color.split(",").map(Number));
}

function colorAt(colors, t) {
  if (t < 0.2) return blend(colors[0], colors[1], t / 0.2);
  if (t < 0.55) return blend(colors[1], colors[2], (t - 0.2) / 0.35);
  return blend(colors[2], colors[3], (t - 0.55) / 0.45);
}

function buildSprites(colors) {
  return Array.from({ length: steps }, (_, index) => {
    const sprite = document.createElement("canvas");
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    const context = sprite.getContext("2d");
    const rgb = colorAt(colors, index / (steps - 1)).map(Math.round).join(",");
    const half = spriteSize / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, `rgba(${rgb},1)`);
    gradient.addColorStop(0.45, `rgba(${rgb},0.45)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, spriteSize, spriteSize);
    return sprite;
  });
}

export default function Flame({ config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const particles = [];
    const embers = [];
    const initial = configRef.current.flame;
    const live = { ...initial, colors: parse(initial.colors) };
    let sprites = buildSprites(live.colors);
    let settled = true;
    let width = 0;
    let height = 0;
    let visible = false;
    let time = 0;

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

    const spawn = () => {
      const spread = width * 0.17 * live.width;
      const scale = Math.min(1.25, width / 640 + 0.35);
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * spread * (0.6 + Math.random()),
        y: height * 0.87 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(2.3 + Math.random() * 2.9) * live.speed * scale,
        life: 0,
        max: (38 + Math.random() * 42) * live.height,
        size: (20 + Math.random() * 30) * scale,
        seed: Math.random() * 100,
      });
      if (Math.random() < 0.08 * live.sparks) {
        embers.push({
          x: width / 2 + (Math.random() - 0.5) * spread,
          y: height * 0.82,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -(2.4 + Math.random() * 4.5) * live.speed,
          life: 1,
        });
      }
    };

    const draw = () => {
      if (!visible) return;
      const target = configRef.current.flame;
      const targetColors = parse(target.colors);
      live.height = mix(live.height, target.height, 0.05);
      live.width = mix(live.width, target.width, 0.05);
      live.sparks = mix(live.sparks, target.sparks, 0.05);
      live.speed = mix(live.speed, target.speed, 0.05);
      let drift = 0;
      live.colors = live.colors.map((color, index) => {
        const next = blend(color, targetColors[index], 0.08);
        drift += Math.abs(next[0] - targetColors[index][0]) + Math.abs(next[1] - targetColors[index][1]);
        return next;
      });
      if (drift > 1) {
        sprites = buildSprites(live.colors);
        settled = false;
      } else if (!settled) {
        live.colors = targetColors;
        sprites = buildSprites(live.colors);
        settled = true;
      }
      time += 0.016;

      for (let index = 0; index < 9; index += 1) spawn();

      context.clearRect(0, 0, width, height);
      const base = live.colors[2].map(Math.round).join(",");
      const glow = context.createRadialGradient(width / 2, height * 0.9, 0, width / 2, height * 0.9, width * 0.55);
      glow.addColorStop(0, `rgba(${base},0.32)`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life += 1;
        const t = particle.life / particle.max;
        if (t >= 1) {
          particles.splice(index, 1);
          continue;
        }
        const sway = Math.sin(time * 4 + particle.seed + particle.y * 0.022) * (0.4 + t * 1.4);
        particle.x += particle.vx + sway + (width / 2 - particle.x) * (0.012 + t * 0.03);
        particle.y += particle.vy * (1 + t * 0.6);
        const radius = particle.size * (1 - t * 0.92);
        const stretch = 1.5 + t * 1.2;
        context.globalAlpha = (t < 0.08 ? t / 0.08 : Math.pow(1 - t, 1.4)) * 0.2;
        context.drawImage(
          sprites[Math.min(steps - 1, Math.floor(t * steps))],
          particle.x - radius,
          particle.y - radius * stretch,
          radius * 2,
          radius * 2 * stretch
        );
      }

      const sparkColor = live.colors[1].map(Math.round).join(",");
      for (let index = embers.length - 1; index >= 0; index -= 1) {
        const ember = embers[index];
        ember.x += ember.vx + Math.sin(time * 5 + index) * 0.5;
        ember.y += ember.vy;
        ember.vy *= 0.99;
        ember.life -= 0.011;
        if (ember.life <= 0 || ember.y < 0) {
          embers.splice(index, 1);
          continue;
        }
        context.globalAlpha = ember.life;
        context.fillStyle = `rgb(${sparkColor})`;
        context.beginPath();
        context.arc(ember.x, ember.y, 1.7 * ember.life + 0.4, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="flame-canvas" aria-hidden="true" />;
}
