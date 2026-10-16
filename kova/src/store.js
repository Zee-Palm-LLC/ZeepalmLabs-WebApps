import { HERO } from './data.js'

export const store = {
  hero: 0,
  dive: 0,
  smoke: 0,
  line: 0,
  lab: 0,
  mid: 0,
  faq: 0,
  join: 0,
  foot: 0,
  active: HERO,
  activeF: HERO,
  mouse: [0, 0],
  mobile: false,
  hoverCan: -1,
}

export const N = 8
export const mod = (i, n = N) => ((i % n) + n) % n
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const smooth = (a, b, x) => {
  const k = clamp((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}
export const lerp = (a, b, t) => a + (b - a) * t
