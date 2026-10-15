let ctx = null
let master = null
let amb = null
let noiseBuf = null
let on = false
let timers = []

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      d[i] = i % 2 ? w : last * 3.5
    }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function env(g, t, a, peak, dur) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + a)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
}

function osc(type, f0, f1, t, dur, peak, filter, pan = 0, vib = 0) {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f0, t)
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur)
  if (vib) {
    const l = ctx.createOscillator()
    const lg = ctx.createGain()
    l.frequency.value = vib[0]
    lg.gain.value = vib[1]
    l.connect(lg).connect(o.frequency)
    l.start(t)
    l.stop(t + dur + 0.05)
  }
  const g = ctx.createGain()
  env(g, t, Math.min(0.08, dur * 0.25), peak, dur)
  let node = o.connect(g)
  if (filter) {
    const b = ctx.createBiquadFilter()
    b.type = filter[0]
    b.frequency.value = filter[1]
    b.Q.value = filter[2] ?? 1
    node = node.connect(b)
  }
  const p = ctx.createStereoPanner()
  p.pan.value = pan
  node.connect(p).connect(master)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function noise(t, dur, peak, type, f, q = 1, dest = master) {
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  const b = ctx.createBiquadFilter()
  b.type = type
  b.frequency.value = f
  b.Q.value = q
  const g = ctx.createGain()
  env(g, t, Math.min(0.03, dur * 0.3), peak, dur)
  s.connect(b).connect(g).connect(dest)
  s.start(t, Math.random())
  s.stop(t + dur + 0.05)
}

const VOICES = {
  moo(t) {
    osc('sawtooth', 128, 92, t, 1.25, 0.22, ['lowpass', 620, 2], 0, [5, 3])
    osc('sawtooth', 256, 184, t + 0.02, 1.2, 0.05, ['bandpass', 780, 4])
  },
  baa(t) {
    osc('sawtooth', 300, 270, t, 0.75, 0.14, ['bandpass', 1150, 2.5], 0, [7.5, 22])
    osc('square', 600, 540, t, 0.7, 0.03, ['bandpass', 2300, 3], 0, [7.5, 40])
  },
  cluck(t) {
    for (let k = 0; k < 3; k++) osc('square', 560 - k * 40, 380, t + k * 0.11, 0.07, 0.07, ['bandpass', 1400, 3])
  },
  cheep(t) {
    for (let k = 0; k < 2; k++) osc('sine', 2500, 3600, t + k * 0.13, 0.08, 0.08)
  },
  oink(t) {
    for (let k = 0; k < 2; k++) {
      osc('sawtooth', 150, 120, t + k * 0.22, 0.16, 0.16, ['lowpass', 520, 3])
      noise(t + k * 0.22, 0.15, 0.05, 'bandpass', 700, 2)
    }
  },
  meow(t) {
    osc('sawtooth', 480, 720, t, 0.25, 0.08, ['bandpass', 1300, 4])
    osc('sawtooth', 720, 430, t + 0.25, 0.4, 0.08, ['bandpass', 1200, 4])
  },
  boo(t) {
    osc('sine', 260, 180, t, 1.4, 0.14, null, 0, [5, 12])
    osc('sine', 390, 270, t + 0.03, 1.3, 0.05, null, 0, [5.5, 15])
  },
  squish(t) {
    osc('sine', 240, 80, t, 0.22, 0.25)
    noise(t, 0.12, 0.05, 'bandpass', 900, 1.5)
  },
  thud(t) {
    osc('sine', 110, 55, t, 0.2, 0.3)
    noise(t, 0.1, 0.06, 'lowpass', 400)
  },
  on(t) {
    osc('triangle', 660, 990, t, 0.12, 0.08)
  },
  off(t) {
    osc('triangle', 660, 420, t, 0.12, 0.06)
  },
  pluck(t) {
    osc('triangle', 700, 320, t, 0.18, 0.12)
    noise(t, 0.06, 0.05, 'highpass', 2500)
  },
  crinkle(t) {
    for (let k = 0; k < 5; k++) noise(t + k * 0.035, 0.04, 0.06, 'highpass', 4500 + k * 300)
  },
  harvest(t) {
    ;[1046, 1318, 1568].forEach((f, k) => osc('sine', f, null, t + k * 0.07, 0.6, 0.07))
    osc('sine', 2093, null, t + 0.22, 0.8, 0.03)
  },
}

export function sfx(name) {
  if (!on || !ac() || !VOICES[name]) return
  VOICES[name](ctx.currentTime + 0.01)
}

function bird() {
  if (!on) return
  const t = ctx.currentTime + 0.02
  const pan = Math.random() * 1.6 - 0.8
  const base = 2200 + Math.random() * 1600
  const n = 2 + Math.floor(Math.random() * 4)
  for (let k = 0; k < n; k++) {
    const f0 = base * (0.9 + Math.random() * 0.3)
    osc('sine', f0, f0 * (Math.random() > 0.5 ? 1.35 : 0.75), t + k * 0.11, 0.08, 0.018, null, pan)
  }
  timers.push(setTimeout(bird, 900 + Math.random() * 2600))
}

function startAmbience() {
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  const b = ctx.createBiquadFilter()
  b.type = 'lowpass'
  b.frequency.value = 520
  const g = ctx.createGain()
  g.gain.value = 0.025
  const l = ctx.createOscillator()
  const lg = ctx.createGain()
  l.frequency.value = 0.08
  lg.gain.value = 0.018
  l.connect(lg).connect(g.gain)
  s.connect(b).connect(g).connect(master)
  s.start()
  l.start()
  amb = { s, l }
  bird()
}

export function setSound(v) {
  on = v
  if (on) {
    if (!ac()) return
    if (!amb) startAmbience()
    master.gain.setTargetAtTime(0.6, ctx.currentTime, 0.1)
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    timers.forEach(clearTimeout)
    timers = []
    if (amb) {
      amb.s.stop()
      amb.l.stop()
      amb = null
    }
  }
}
