import { clamp, range, smooth } from "./math.js";

export const cookSteps = [
  { key: "fire", label: "Fire lit, 450°C", at: 0.03 },
  { key: "on", label: "On the grate", at: 0.16 },
  { key: "sear", label: "Sear side A", at: 0.28 },
  { key: "flip", label: "Flip once", at: 0.6 },
  { key: "rest", label: "Rest 6 min", at: 0.78 },
  { key: "pass", label: "Salt and pass", at: 0.9 },
];

const onGrate = 0.16;
const offGrate = 0.76;
const flipAt = 0.6;

export function cookState(progress) {
  const heat = smooth(range(progress, 0, 0.12));
  const flicker = Math.sin(progress * 180) * 6 + Math.sin(progress * 77) * 4;
  const grill = Math.round(clamp(heat * 450 + heat * flicker, 0, 470));

  const cooking = range(progress, onGrate, offGrate);
  const resting = range(progress, offGrate, 0.86);
  const core = 18 + 30 * Math.pow(cooking, 1.35) + 8 * smooth(resting);

  const cookSeconds = cooking * 480;
  const restSeconds = resting * 360;
  const side = progress < onGrate ? "" : progress < flipAt ? "A" : progress < offGrate ? "B" : "";

  let stepIndex = -1;
  cookSteps.forEach((step, index) => {
    if (progress >= step.at) stepIndex = index;
  });

  return { grill, core, cookSeconds, restSeconds, side, stepIndex, resting: progress >= offGrate };
}

export function clock(seconds) {
  const whole = Math.floor(seconds);
  const minutes = String(Math.floor(whole / 60)).padStart(2, "0");
  const rest = String(whole % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function doneness(core) {
  if (core < 46) return "Raw";
  if (core < 50) return "Blue";
  if (core < 54) return "Rare";
  if (core < 58) return "Medium-rare";
  if (core < 63) return "Medium";
  return "Medium-well";
}
