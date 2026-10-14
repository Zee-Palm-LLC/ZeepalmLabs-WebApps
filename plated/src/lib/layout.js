import { BY_ID } from '../data/foods.js'

const RAD = Math.PI / 180

export const SECTORS = {
  protein: [-90, 0],
  grain: [0, 90],
  fruit: [90, 150],
  veg: [150, 270],
}

export const PIE_ORDER = ['veg', 'fruit', 'protein', 'grain', 'dairy', 'treat']

export const sizeOf = (food) => 0.19 * Math.sqrt(BY_ID[food].vol) + 0.03

function rand(a, b) {
  return a + Math.random() * (b - a)
}

export function placeOnPlate(items, food) {
  const g = BY_ID[food].g
  const s = sizeOf(food)
  let lo, hi, r0, r1
  if (SECTORS[g]) {
    ;[lo, hi] = SECTORS[g]
    lo += 9
    hi -= 9
    r0 = 0.24
    r1 = 0.6
  } else {
    lo = -180
    hi = 180
    r0 = 0
    r1 = 0.45
  }
  let best = null
  let bestScore = -Infinity
  for (let i = 0; i < 48; i++) {
    const a = rand(lo, hi) * RAD
    const r = Math.sqrt(rand(r0 * r0, r1 * r1))
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    let m = 2
    for (const it of items) {
      const d = Math.hypot(it.x - x, it.y - y) - (it.s + s) * 0.42
      if (d < m) m = d
    }
    const edge = 0.7 - (r + s * 0.4)
    const sc = Math.min(m, edge * 1.4) + Math.random() * 0.02
    if (sc > bestScore) {
      bestScore = sc
      best = { x, y }
    }
  }
  return { ...best, s, rot: rand(-28, 28) }
}

export function placeOnSide(side, food) {
  const s = sizeOf(food) * 1.7
  let best = null
  let bestScore = -Infinity
  for (let i = 0; i < 30; i++) {
    const a = rand(0, 360) * RAD
    const r = Math.sqrt(Math.random()) * 0.32
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    let m = 2
    for (const it of side) m = Math.min(m, Math.hypot(it.x - x, it.y - y))
    if (m > bestScore) {
      bestScore = m
      best = { x, y }
    }
  }
  return { ...best, s, rot: rand(-24, 24) }
}

export function pieSectors(items) {
  const vol = {}
  let sum = 0
  for (const it of items) {
    const f = BY_ID[it.food]
    vol[f.g] = (vol[f.g] || 0) + f.vol
    sum += f.vol
  }
  const out = []
  let a = -90
  for (const g of PIE_ORDER) {
    if (!vol[g]) continue
    const span = (vol[g] / sum) * 360
    out.push({ g, a0: a, a1: a + span, share: vol[g] / sum })
    a += span
  }
  return out
}

export function idealSectors(goal) {
  const out = []
  let a = -90
  for (const g of PIE_ORDER) {
    const v = goal.ideal[g]
    if (!v) continue
    out.push({ g, a0: a, a1: a + v * 360, share: v })
    a += v * 360
  }
  return out
}

export function piePositions(items, sectors) {
  const pos = {}
  for (const sec of sectors) {
    const group = items.filter((it) => BY_ID[it.food].g === sec.g)
    const n = group.length
    const span = sec.a1 - sec.a0
    const two = span >= 60 && n >= 3
    const scale = Math.min(0.85, Math.max(0.5, 0.45 + span / 400))
    group.forEach((it, i) => {
      const ring = two ? i % 2 : 0
      const k = two ? Math.floor(i / 2) : i
      const cnt = two ? (ring === 0 ? Math.ceil(n / 2) : Math.floor(n / 2)) : n
      const a = (sec.a0 + (span * (k + 0.5)) / cnt) * RAD
      const r = two ? (ring === 0 ? 0.62 : 0.32) : n === 1 && span > 300 ? 0 : 0.5
      pos[it.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r, scale }
    })
  }
  return pos
}

export function arcPath(cx, cy, r0, r1, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0
  const p = (r, a) => [cx + Math.cos(a * RAD) * r, cy + Math.sin(a * RAD) * r]
  if (a1 - a0 >= 359.99) {
    const [x0, y0] = p(r1, a0)
    const [x1, y1] = p(r1, a0 + 180)
    const [x2, y2] = p(r0, a0)
    const [x3, y3] = p(r0, a0 + 180)
    return `M${x0} ${y0}A${r1} ${r1} 0 1 1 ${x1} ${y1}A${r1} ${r1} 0 1 1 ${x0} ${y0}M${x2} ${y2}A${r0} ${r0} 0 1 0 ${x3} ${y3}A${r0} ${r0} 0 1 0 ${x2} ${y2}Z`
  }
  const [ax, ay] = p(r1, a0)
  const [bx, by] = p(r1, a1)
  const [cx2, cy2] = p(r0, a1)
  const [dx, dy] = p(r0, a0)
  return `M${ax} ${ay}A${r1} ${r1} 0 ${large} 1 ${bx} ${by}L${cx2} ${cy2}A${r0} ${r0} 0 ${large} 0 ${dx} ${dy}Z`
}
