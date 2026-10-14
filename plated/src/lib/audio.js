let ctx = null
let master = null
let noiseBuf = null
let enabled = true

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setSound(on) {
  enabled = on
  if (on) ac()
}

export function unlock() {
  if (enabled) ac()
}

function tone(freq, t0, dur, { type = 'sine', gain = 0.3, to = null, attack = 0.004 } = {}) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

function noise(t0, dur, { f = 1200, q = 0.8, gain = 0.2, type = 'bandpass', to = null } = {}) {
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  const bq = ctx.createBiquadFilter()
  bq.type = type
  bq.frequency.setValueAtTime(f, t0)
  if (to) bq.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  bq.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  s.connect(bq).connect(g).connect(master)
  s.start(t0, Math.random() * 0.5)
  s.stop(t0 + dur + 0.02)
}

function go() {
  if (!enabled) return null
  return ac()
}

export const sfx = {
  pick() {
    if (!go()) return
    const t = ctx.currentTime
    tone(520, t, 0.08, { type: 'triangle', gain: 0.12, to: 780 })
  },
  plop(size = 1) {
    if (!go()) return
    const t = ctx.currentTime
    const f = 260 / Math.sqrt(size)
    tone(f * 1.9, t, 0.16, { gain: 0.32, to: f * 0.7 })
    noise(t, 0.06, { f: 2400, q: 1.2, gain: 0.06 })
    tone(f * 3.2, t + 0.02, 0.05, { type: 'triangle', gain: 0.05 })
  },
  clink() {
    if (!go()) return
    const t = ctx.currentTime
    tone(2630, t, 0.5, { gain: 0.08 })
    tone(3950, t, 0.35, { gain: 0.05 })
    tone(1320, t, 0.2, { gain: 0.05 })
  },
  sizzle() {
    if (!go()) return
    const t = ctx.currentTime
    noise(t, 0.7, { f: 5200, q: 0.6, gain: 0.05, type: 'highpass' })
  },
  pop() {
    if (!go()) return
    const t = ctx.currentTime
    tone(700, t, 0.09, { type: 'triangle', gain: 0.16, to: 1300 })
  },
  whoosh() {
    if (!go()) return
    const t = ctx.currentTime
    noise(t, 0.45, { f: 300, q: 0.7, gain: 0.16, to: 2400 })
  },
  tick() {
    if (!go()) return
    const t = ctx.currentTime
    tone(1800, t, 0.03, { type: 'square', gain: 0.03 })
  },
  bell() {
    if (!go()) return
    const t = ctx.currentTime
    const p = [1, 2.76, 5.4, 8.93]
    p.forEach((m, i) => tone(1046 * m, t, 1.6 / (1 + i * 0.8), { gain: 0.16 / (1 + i), attack: 0.002 }))
  },
  nope() {
    if (!go()) return
    const t = ctx.currentTime
    tone(220, t, 0.12, { type: 'square', gain: 0.05, to: 160 })
    tone(180, t + 0.1, 0.16, { type: 'square', gain: 0.05, to: 120 })
  },
  stars(n) {
    if (!go()) return
    const t = ctx.currentTime
    const notes = [784, 988, 1175, 1568]
    for (let i = 0; i < Math.max(1, n + 1); i++) tone(notes[i], t + i * 0.11, 0.35, { type: 'triangle', gain: 0.12 })
  },
  fanfare() {
    if (!go()) return
    const t = ctx.currentTime
    ;[523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.09, 0.6, { type: 'triangle', gain: 0.1 }))
  },
}
