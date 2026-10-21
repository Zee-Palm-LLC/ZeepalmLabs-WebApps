// Shared, mutable scroll state read by WebGL every frame (no React re-renders).
export const P = {
  hero: 0,
  worksIntro: 0,
  works: 0,
  velocity: 0,
  intro: 0, // 0→1 after the loader: hero entrance
  stageActive: true,
  mouse: { x: 0, y: 0 },
};

// Damped copies of P that the WebGL stage reads — eases every scene instead of following raw scroll.
export const S = { hero: 0, worksIntro: 0, works: 0, mouse: { x: 0, y: 0 } };
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
export function stepSmooth(dt) {
  const d = Math.min(dt, 0.05);
  S.hero = damp(S.hero, P.hero, 7, d);
  S.worksIntro = damp(S.worksIntro, P.worksIntro, 7, d);
  S.works = damp(S.works, P.works, 6, d);
  S.mouse.x = damp(S.mouse.x, P.mouse.x, 3.5, d);
  S.mouse.y = damp(S.mouse.y, P.mouse.y, 3.5, d);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    P.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    P.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });
}
