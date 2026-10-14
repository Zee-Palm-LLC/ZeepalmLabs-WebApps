import { BY_ID, DRINK_SCORE } from '../data/foods.js'

const KEYS = ['kcal', 'p', 'c', 'f', 'fi', 'su']
const PLATE_GROUPS = ['veg', 'fruit', 'protein', 'grain', 'dairy', 'treat']
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function totals(plate) {
  const t = { kcal: 0, p: 0, c: 0, f: 0, fi: 0, su: 0, n: 0, vol: 0, animal: 0, proc: 0 }
  const vol = Object.fromEntries(PLATE_GROUPS.map((g) => [g, 0]))
  const count = Object.fromEntries(PLATE_GROUPS.map((g) => [g, 0]))
  const ids = new Set()
  const cols = new Set()
  const solids = [...plate.items, ...plate.side]
  for (const it of solids) {
    const f = BY_ID[it.food]
    for (const k of KEYS) t[k] += f[k]
    vol[f.g] += f.g === 'dairy' ? f.vol * 0.6 : f.vol
    count[f.g] += 1
    t.vol += f.vol
    t.n += 1
    if (!f.plant) t.animal += 1
    if (f.proc) t.proc += 1
    ids.add(f.id)
    if (f.col) cols.add(f.col)
  }
  if (plate.drink) {
    const d = BY_ID[plate.drink]
    for (const k of KEYS) t[k] += d[k]
    if (!d.plant) t.animal += 1
  }
  const vsum = Object.values(vol).reduce((a, b) => a + b, 0) || 1
  const share = Object.fromEntries(PLATE_GROUPS.map((g) => [g, vol[g] / vsum]))
  return { ...t, share, count, kinds: ids.size, colors: cols.size }
}

function band(v, lo, hi, fall) {
  if (v >= lo && v <= hi) return 1
  const d = v < lo ? lo - v : v - hi
  return clamp(1 - d / fall)
}

export function scorePlate(plate, goal) {
  const t = totals(plate)
  if (t.n === 0) {
    return { total: 0, empty: true, t, parts: { balance: 0, nutrition: 0, variety: 0, drink: 0 }, tips: [] }
  }
  let dev = 0
  for (const g of PLATE_GROUPS) {
    const ideal = goal.ideal[g] || 0
    const w = g === 'dairy' ? 0.5 : g === 'treat' ? 1.5 : 1
    dev += Math.abs(t.share[g] - ideal) * w
  }
  dev = Math.min(1, dev / 2)
  const balance = 40 * clamp(1 - 1.5 * dev)

  const kcal = 12 * band(t.kcal, goal.kcal[0], goal.kcal[1], 320)
  const prot = 9 * clamp(t.p / goal.protein)
  const fib = 6 * clamp(t.fi / 10)
  const sug = 5 * clamp(1 - (t.su - 15) / 30)
  let carb
  if (goal.carbs != null) carb = 3 * clamp(1 - (t.c - goal.carbs) / 40)
  else if (goal.carbMin != null) carb = 3 * clamp(t.c / goal.carbMin)
  else carb = 3 * clamp(1 - t.proc * 0.5)
  const nutrition = kcal + prot + fib + sug + carb

  const variety = 9 * clamp(t.kinds / 5) + 6 * clamp(t.colors / 4)
  const drink = plate.drink ? DRINK_SCORE[plate.drink] : 5

  let total = balance + nutrition + variety + drink
  if (goal.plant) total -= t.animal * 9
  total -= Math.max(0, t.count.treat - 1) * 4
  total = Math.round(clamp(total, 0, 100))

  return {
    total,
    empty: false,
    t,
    parts: {
      balance: Math.round(balance),
      nutrition: Math.round(nutrition),
      variety: Math.round(variety),
      drink: Math.round(drink),
    },
    tips: tips(t, goal, plate),
  }
}

function tips(t, goal, plate) {
  const out = []
  const s = t.share
  if (goal.plant && t.animal > 0) out.push('animal')
  if (t.count.treat >= 2) out.push('treats')
  if (plate.drink === 'soda' || plate.drink === 'bubbletea') out.push('soda')
  if (s.veg < (goal.ideal.veg || 0) - 0.12) out.push('veg')
  if (t.p < goal.protein * 0.7) out.push('protein')
  if (goal.carbs != null && t.c > goal.carbs + 10) out.push('carbs')
  if (goal.carbMin != null && t.c < goal.carbMin * 0.75) out.push('fuel')
  if (t.su > 35) out.push('sugar')
  if (t.kcal > goal.kcal[1] + 120) out.push('big')
  if (t.kcal < goal.kcal[0] - 150) out.push('small')
  if ((goal.ideal.grain || 0) > 0.1 && s.grain < 0.08) out.push('grain')
  if ((goal.ideal.fruit || 0) > 0.08 && s.fruit === 0) out.push('fruit')
  if (t.kinds < 3) out.push('variety')
  if (!plate.drink) out.push('drink')
  return out
}

export function hue(v) {
  return Math.round(Math.max(0, Math.min(1, (v - 20) / 70)) * 128)
}

export function grade(v) {
  if (v >= 92) return 'A+'
  if (v >= 82) return 'A'
  if (v >= 70) return 'B'
  if (v >= 58) return 'C'
  if (v >= 45) return 'D'
  return 'F'
}

export function verdict(v) {
  if (v >= 92) return 'Chef’s kiss'
  if (v >= 82) return 'Chef approved'
  if (v >= 70) return 'Solid plate'
  if (v >= 58) return 'Getting there'
  if (v >= 45) return 'Needs work'
  return 'Send it back'
}
