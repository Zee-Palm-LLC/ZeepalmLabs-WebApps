import { range, smooth } from "./math.js";

export const load = 142.5;
export const frames = 240;

const pullStart = 0.44;
const pullEnd = 0.86;
const peakSpeed = 1.84;
const topHeight = 2.06;
const repSeconds = 1.18;

const phases = [
  [0.2, "Approach"],
  [0.4, "Grip"],
  [0.58, "First pull"],
  [0.72, "Second pull"],
  [0.86, "Drive"],
  [1.01, "Lockout"],
];

function bell(value, center, width) {
  const distance = (value - center) / width;
  return Math.exp(-distance * distance);
}

function speedShape(t) {
  if (t <= 0 || t >= 1) return 0;
  const envelope = Math.pow(Math.sin(Math.PI * t), 0.45);
  return envelope * (0.52 * bell(t, 0.26, 0.17) + bell(t, 0.66, 0.15));
}

export function telemetry(progress) {
  const t = range(progress, pullStart, pullEnd);
  const velocity = peakSpeed * speedShape(t);
  return {
    velocity,
    height: topHeight * smooth(t),
    power: velocity * load * 9.81,
    seconds: t * repSeconds,
  };
}

export function phaseAt(progress) {
  return phases.find(([until]) => progress < until)[1];
}

export function speedCurve(width, height, steps = 160) {
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const t = range(progress, pullStart, pullEnd);
    const x = progress * width;
    const y = height - 4 - speedShape(t) * (height - 12);
    points.push(`${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

const setProfiles = {
  100: { base: 0.96, decay: 0.028, plates: ["large", "medium"] },
  120: { base: 0.78, decay: 0.04, plates: ["large", "large"] },
  140: { base: 0.6, decay: 0.062, plates: ["large", "large", "medium"] },
};

const wobble = [0, 0.012, -0.008, 0.01, -0.014, 0.006, -0.01, 0.004];

export const setLoads = [100, 120, 140];
export const maxReps = 8;
export const dropLimit = 0.2;

export function platesFor(kg) {
  return setProfiles[kg].plates;
}

export function repSpeed(kg, repIndex) {
  const profile = setProfiles[kg];
  const fatigue = profile.decay * Math.pow(repIndex, 1.35);
  return profile.base * (1 - fatigue) + wobble[repIndex % wobble.length];
}
