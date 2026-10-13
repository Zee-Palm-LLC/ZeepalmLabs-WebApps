import { gsap } from '../lib/scroll'

const MOODS = {
  hero: [0.27, 0.45, 0.7, 1.1, 0.45, 0.58],
  process: [0.36, 0.58, 0.95, 1.12, 0.62, 0.32],
  board: [0.22, 0.35, 0.72, 1.02, 0.7, 0.42],
  timer: [0.18, 0.32, 0.72, 1.6, 1.0, 0.75],
  aha: [0.4, 0.55, 1.4, 1.35, 1.0, 0.12],
  scores: [0.3, 0.5, 1.0, 1.15, 0.8, 0.3],
  sketch: [0.45, 0.82, 0.9, 1.22, 0.95, 0.28],
  workshops: [0.62, 0.16, 0.5, 0.9, 0.55, 0.7],
  contact: [0.72, 0.45, 0.55, 0.92, 0.6, 0.55],
  footer: [0.4, 0.5, 1.0, 1.15, 0.78, 0.3],
}

export const live = { mood: [...MOODS.hero], target: [...MOODS.hero], intro: 0, mouse: [0.5, 0.5], tmouse: [0.5, 0.5] }

export function setMood(name) {
  const m = MOODS[name]
  if (m) live.target = [...m]
}

export function introTo(v, duration = 1.6) {
  gsap.to(live, { intro: v, duration, ease: 'power2.out' })
}
