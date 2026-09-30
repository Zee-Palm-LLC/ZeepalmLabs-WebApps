function noiseBuffer(context, seconds) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

export function createSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const rumbleSource = context.createBufferSource();
  rumbleSource.buffer = noiseBuffer(context, 4);
  rumbleSource.loop = true;
  const rumbleFilter = context.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 260;
  const rumbleGain = context.createGain();
  rumbleGain.gain.value = 0.55;
  rumbleSource.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(master);
  rumbleSource.start();

  const crackles = noiseBuffer(context, 0.2);
  let enabled = false;
  let timer = 0;

  const crackle = () => {
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = crackles;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200 + Math.random() * 4200;
    filter.Q.value = 1.5 + Math.random() * 4;
    const gain = context.createGain();
    const level = 0.15 + Math.random() * 0.55;
    const length = 0.01 + Math.random() * 0.05;
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now, Math.random() * 0.15, length + 0.02);
  };

  const schedule = () => {
    if (!enabled) return;
    const burst = Math.random() < 0.2 ? 2 + Math.floor(Math.random() * 4) : 1;
    for (let index = 0; index < burst; index += 1) setTimeout(crackle, index * (20 + Math.random() * 40));
    timer = setTimeout(schedule, 60 + Math.random() * 420);
  };

  return {
    setEnabled(next) {
      enabled = next;
      if (next) {
        context.resume();
        schedule();
      } else {
        clearTimeout(timer);
      }
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(next ? 0.5 : 0, context.currentTime + 0.8);
    },
    bell() {
      if (!enabled) return;
      const now = context.currentTime;
      [1, 2.76, 5.4].forEach((ratio, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 1320 * ratio;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12 / (index + 1), now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 / (index + 1));
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 1.7);
      });
    },
    tick() {
      if (!enabled) return;
      crackle();
    },
  };
}
