// Generated ambient bed + UI ticks (no audio files). Starts only after the visitor opts in.
let ctx = null;
let master = null;

export function startAudio() {
  if (ctx) { ctx.resume(); master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.5); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 0.7;
  filter.connect(master);
  const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07; lfoGain.gain.value = 420; lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();

  // A1 + E2 + A2 + C#3 pad, slightly detuned
  [55, 82.41, 110, 138.59].forEach((f, i) => {
    [-6, 6].forEach((det) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = i === 0 ? 'sine' : 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      g.gain.value = i === 0 ? 0.22 : 0.045; o.connect(g); g.connect(filter); o.start();
    });
  });
  master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
}

export function stopAudio() {
  if (!ctx) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
}

export function tick(freq = 1800, dur = 0.05, vol = 0.05) {
  if (!ctx || master.gain.value < 0.01) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
}
