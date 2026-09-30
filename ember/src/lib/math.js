export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const lerp = (from, to, amount) => from + (to - from) * amount;

export const range = (value, start, end) => clamp((value - start) / (end - start));

export const smooth = (value) => value * value * (3 - 2 * value);

export const easeOut = (value) => 1 - Math.pow(1 - value, 3);

export function windowOpacity(progress, start, end, fade) {
  if (progress <= start || progress >= end) return 0;
  return Math.min(1, (progress - start) / fade, (end - progress) / fade);
}
