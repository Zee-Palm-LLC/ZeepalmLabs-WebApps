import { getUi } from "../store.js";

const MASK = "•••";

export function money(value, { compact = false, digits, hide = true } = {}) {
  if (hide && getUi().privacy) return `$${MASK}`;
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (compact && abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (compact && abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  const d = digits ?? (abs >= 1000 ? 0 : 2);
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function price(value) {
  const d = value >= 1000 ? 2 : value >= 1 ? 2 : 4;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function pct(value, digits = 1, sign = true) {
  const v = value * 100;
  const s = sign && v > 0 ? "+" : "";
  return `${s}${v.toFixed(digits)}%`;
}

export function qty(value, decimals = 4) {
  if (getUi().privacy) return MASK;
  return Number(value.toFixed(decimals)).toLocaleString("en-US", { maximumFractionDigits: decimals });
}

export function truncate(text, max = 16) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

export function shortDate(t) {
  return new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export { MASK };
