export default class HeartAudio {
  constructor() {
    this.ctx = null
    this.on = false
  }

  enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }
    this.ctx.resume()
    this.on = true
  }

  disable() {
    this.on = false
  }

  thump(kind) {
    if (!this.on || !this.ctx) return
    const c = this.ctx
    const t = c.currentTime + 0.005
    const lub = kind === 'lub'
    const f0 = lub ? 58 : 76
    const len = lub ? 0.24 : 0.16
    const o = c.createOscillator()
    const g = c.createGain()
    const lp = c.createBiquadFilter()
    o.type = 'sine'
    o.frequency.setValueAtTime(f0 * 1.7, t)
    o.frequency.exponentialRampToValueAtTime(f0, t + 0.045)
    lp.type = 'lowpass'
    lp.frequency.value = 240
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(lub ? 0.95 : 0.6, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    o.connect(lp).connect(g).connect(this.master)
    o.start(t)
    o.stop(t + len + 0.05)
    const n = Math.floor(c.sampleRate * 0.05)
    const buf = c.createBuffer(1, n, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.18))
    const src = c.createBufferSource()
    const bp = c.createBiquadFilter()
    const ng = c.createGain()
    src.buffer = buf
    bp.type = 'bandpass'
    bp.frequency.value = lub ? 140 : 190
    bp.Q.value = 1.2
    ng.gain.value = lub ? 0.35 : 0.25
    src.connect(bp).connect(ng).connect(this.master)
    src.start(t)
  }
}
