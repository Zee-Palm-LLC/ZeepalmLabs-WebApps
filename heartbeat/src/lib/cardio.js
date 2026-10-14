export const MODES = [
  { id: 'rest', name: 'Rest', bpm: 62, sv: 70, note: 'Sitting, calm breathing' },
  { id: 'cardio', name: 'Cardio', bpm: 132, sv: 96, note: 'Steady run or cycle' },
  { id: 'sprint', name: 'Sprint', bpm: 176, sv: 108, note: 'All-out interval' },
]

export const MAX_HR = 190

export function strokeVolume(bpm) {
  const t = Math.min(1, Math.max(0, (bpm - 55) / 110))
  return Math.round(68 + 42 * Math.sqrt(t))
}

export function zoneOf(bpm) {
  const p = bpm / MAX_HR
  if (p < 0.5) return { name: 'Resting', n: 0 }
  if (p < 0.6) return { name: 'Warm-up', n: 1 }
  if (p < 0.7) return { name: 'Fat burn', n: 2 }
  if (p < 0.8) return { name: 'Cardio', n: 3 }
  if (p < 0.9) return { name: 'Hard', n: 4 }
  return { name: 'Peak', n: 5 }
}

const sm = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const bump = (x, a, p, b) => (x < a || x > b ? 0 : x < p ? sm(a, p, x) : 1 - sm(p, b, x))

export function cycle(bpm) {
  const period = 60 / bpm
  const sys = Math.min(0.34, 0.12 + 0.4 * period * 0.5)
  const atrial = 0.1 / period
  const vStart = 0.12 / period
  const vPeak = vStart + (sys * 0.45) / period
  const vEnd = vStart + sys / period + 0.08 / period
  return { period, atrial, vStart, vPeak, vEnd }
}

export function activation(phase, bpm) {
  const c = cycle(bpm)
  const a = bump(phase, 0, c.atrial * 0.6, c.atrial * 1.3)
  const v = bump(phase, c.vStart, Math.min(c.vPeak, 0.6), Math.min(c.vEnd, 0.95))
  return [a, v]
}

export function soundTimes(bpm) {
  const c = cycle(bpm)
  return [c.vStart, Math.min(c.vEnd - 0.04 / c.period, 0.9)]
}

export function ecg(phase, bpm) {
  const c = cycle(bpm)
  const t = phase * c.period
  const g = (mu, s, a) => a * Math.exp(-((t - mu) * (t - mu)) / (2 * s * s))
  const qrs = c.vStart * c.period
  const tw = qrs + Math.min(0.3, c.period * 0.38)
  return g(0.05, 0.022, 0.14) + g(qrs - 0.022, 0.007, -0.12) + g(qrs, 0.009, 1.0) + g(qrs + 0.024, 0.008, -0.24) + g(tw, 0.04, 0.26)
}
