let ctx = null
let master = null
let filt = null
let on = false

function ensure() {
  if (ctx) return
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = 0
  filt = ctx.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = 600
  filt.connect(master)
  master.connect(ctx.destination)
  const notes = [55, 82.4, 110, 164.8, 220]
  notes.forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i % 2 ? 'sawtooth' : 'sine'
    o.frequency.value = f
    o.detune.value = (i - 2) * 4
    const g = ctx.createGain()
    g.gain.value = i % 2 ? 0.018 : 0.06
    const l = ctx.createOscillator()
    l.frequency.value = 0.07 + i * 0.03
    const lg = ctx.createGain()
    lg.gain.value = g.gain.value * 0.6
    l.connect(lg)
    lg.connect(g.gain)
    o.connect(g)
    g.connect(filt)
    o.start()
    l.start()
  })
  const n = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.5
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.6
  const ng = ctx.createGain()
  ng.gain.value = 0.012
  src.connect(bp)
  bp.connect(ng)
  ng.connect(master)
  src.start()
}

export function setSound(v) {
  on = v
  if (v) {
    ensure()
    ctx.resume()
  }
  if (!ctx) return
  master.gain.setTargetAtTime(v ? 0.55 : 0, ctx.currentTime, 0.35)
}

export function scrollTone(p) {
  if (!ctx || !on) return
  filt.frequency.setTargetAtTime(500 + p * 2400, ctx.currentTime, 0.2)
}

export function whoosh(up = true) {
  if (!ctx || !on) return
  const t = ctx.currentTime
  const n = ctx.sampleRate * 0.7
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource()
  s.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.4
  bp.frequency.setValueAtTime(up ? 400 : 2200, t)
  bp.frequency.exponentialRampToValueAtTime(up ? 2400 : 380, t + 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.65)
  s.connect(bp)
  bp.connect(g)
  g.connect(master)
  s.start(t)
  s.stop(t + 0.7)
}

export function tick() {
  if (!ctx || !on) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.frequency.value = 1400
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.05, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
  o.connect(g)
  g.connect(master)
  o.start(t)
  o.stop(t + 0.1)
}
