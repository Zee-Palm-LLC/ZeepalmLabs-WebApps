const drone = [
  { frequency: 55, type: "sine", level: 0.5 },
  { frequency: 82.4, type: "sine", level: 0.28 },
  { frequency: 110.4, type: "triangle", level: 0.1 },
];

export function createSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  let enabled = false;

  master.gain.value = 0;
  master.connect(context.destination);
  filter.type = "lowpass";
  filter.frequency.value = 380;
  filter.connect(master);

  for (const voice of drone) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.value = voice.frequency;
    gain.gain.value = voice.level;
    oscillator.connect(gain);
    gain.connect(filter);
    oscillator.start();
  }

  return {
    setEnabled(next) {
      enabled = next;
      if (next) context.resume();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(next ? 0.16 : 0, context.currentTime + 0.6);
    },
    blip(frequency = 660) {
      if (!enabled) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + 0.22);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    },
  };
}
