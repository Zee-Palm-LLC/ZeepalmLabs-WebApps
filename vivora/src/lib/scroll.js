import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
export const getLenis = () => lenis;

// Smooth scroll (Lenis) driving GSAP ScrollTrigger, matching the weighted feel of the reference.
export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    // lerp-based smoothing gives a continuous, silky glide (no per-gesture easing restarts)
    lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1.4, syncTouch: true, syncTouchLerp: 0.08 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenis = null; };
  }, [enabled]);
}

// Progress 0→1 of a tall sticky section. Returned as a mutable ref so WebGL scenes can read it every frame
// without re-rendering React; `state` mirrors it at low frequency for DOM-driven pieces.
export function useSectionProgress(sectionRef, { onUpdate } = {}) {
  const raw = useRef(0);
  const progress = useRef(0); // damped — what WebGL scenes read
  const velocity = useRef(0);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const st = ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { raw.current = self.progress; velocity.current = self.getVelocity(); onUpdate && onUpdate(self.progress); },
    });
    raw.current = st.progress; progress.current = st.progress;
    const tick = (_t, dt) => { progress.current += (raw.current - progress.current) * (1 - Math.exp(-7 * Math.min(dt, 50) / 1000)); };
    gsap.ticker.add(tick);
    return () => { st.kill(); gsap.ticker.remove(tick); };
  }, [sectionRef]);
  return { progress, raw, velocity };
}

// Whether the section is near the viewport — used to pause off-screen canvases.
export function useNearViewport(ref, margin = '12%') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: `${margin} 0px ${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

// Section canvases mount lazily; nudge R3F to re-measure once layout has settled.
export const remeasure = () => { requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); setTimeout(() => window.dispatchEvent(new Event('resize')), 120); };

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
// Map p from [a,b] to [0,1]
export const range = (p, a, b) => clamp01((p - a) / (b - a));
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a, b, t) => a + (b - a) * t;
