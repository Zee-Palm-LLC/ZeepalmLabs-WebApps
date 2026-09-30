export const times = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

export function upcomingDays(count = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
}

function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0) / 4294967295;
}

export function isClosed(date) {
  return date.getDay() === 1;
}

export function availability(date, time, seat, guests) {
  const key = `${date.toDateString()}-${time}-${seat}`;
  const busy = hash(key);
  const weekend = date.getDay() === 5 || date.getDay() === 6;
  const peak = time >= "19:00" && time <= "20:30";
  const pressure = busy + (weekend ? 0.25 : 0) + (peak ? 0.2 : 0) + guests * 0.03;
  if (pressure > 1.15) return "full";
  if (pressure > 0.9) return "few";
  return "open";
}

export function dayLabel(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

export function longDate(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function bookingCode(parts) {
  const letters = "ACDEFHJKMNPRTVWXY";
  const value = hash(parts.join("|"));
  let code = "";
  let seed = Math.floor(value * 1e9);
  for (let index = 0; index < 5; index += 1) {
    code += letters[seed % letters.length];
    seed = Math.floor(seed / letters.length) + 7;
  }
  return `EMB-${code}`;
}
