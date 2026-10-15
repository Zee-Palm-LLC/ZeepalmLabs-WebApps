import { fbm2, smooth } from './noise.js'
import { AREAS, BARN, HOUSE, POND, PATH_W, COOP } from './layout.js'

const FLAT = [
  { x0: BARN.x - BARN.w / 2 - 0.4, x1: BARN.x + BARN.w / 2 + 0.4, z0: BARN.z - BARN.d / 2 - 0.4, z1: BARN.z + BARN.d / 2 + 1.2, m: 2.4 },
  { x0: HOUSE.x - HOUSE.w / 2 - 0.4, x1: HOUSE.x + HOUSE.w / 2 + 0.4, z0: HOUSE.z - HOUSE.d / 2 - 0.4, z1: HOUSE.z + HOUSE.d / 2 + 0.8, m: 2.4 },
  { ...AREAS.pasture, m: 1.6, k: 0.75 },
  { ...AREAS.sheep, m: 1.6, k: 0.75 },
  { ...AREAS.run, m: 1.2, k: 0.9 },
  { x0: COOP.x - 1, x1: COOP.x + 1, z0: COOP.z - 0.8, z1: COOP.z + 0.8, m: 0.8 },
]

function rectDist(r, x, z) {
  const dx = Math.max(r.x0 - x, 0, x - r.x1)
  const dz = Math.max(r.z0 - z, 0, z - r.z1)
  return Math.hypot(dx, dz)
}

export function pathCenter(z) {
  if (z > -4.6) return 0.12 * Math.sin(z * 0.45)
  const t = smooth(-4.6, -5.9, z)
  return 0.12 * Math.sin(z * 0.45) * (1 - t) + (BARN.x + 0.0) * t
}

export function pathWeight(x, z) {
  if (z < -6.1 || z > 13) return 0
  let d
  if (z > -4.8) d = Math.abs(x - pathCenter(z))
  else {
    const bend = Math.abs(z + 5.4)
    const across = x < 0.4 && x > BARN.x - 0.9 ? bend : Math.min(Math.abs(x - 0.0), Math.abs(x - BARN.x)) + bend
    d = Math.min(Math.abs(x - pathCenter(z)), across)
  }
  const wob = 0.12 * (fbm2(x * 1.3, z * 1.3) - 0.5)
  return 1 - smooth(PATH_W * 0.75, PATH_W * 1.15, d + wob)
}

export function pondDist(x, z) {
  const dx = (x - POND.x) / POND.rx
  const dz = (z - POND.z) / POND.rz
  return Math.sqrt(dx * dx + dz * dz)
}

export const WATER = -0.16

export function rawHeight(x, z) {
  let h = 0.16 * Math.sin(x * 0.35 + 1.3) * Math.cos(z * 0.28) + 0.42 * (fbm2(x * 0.09 + 5, z * 0.09 + 2) - 0.5)
  h += smooth(-11, -23, z) * (3.2 + 1.6 * Math.sin(x * 0.21 + 0.6) + 1.2 * fbm2(x * 0.15, z * 0.15))
  h += smooth(11, 21, Math.abs(x)) * (2.2 + 0.8 * Math.sin(z * 0.3))
  h += smooth(9, 16, z) * 0.6 - smooth(18, 34, z) * 0.9
  let flat = 0
  for (const r of FLAT) {
    const w = (1 - smooth(0, r.m, rectDist(r, x, z))) * (r.k ?? 1)
    flat = Math.max(flat, w)
  }
  h *= 1 - flat
  const pw = pathWeight(x, z)
  h -= 0.04 * pw
  const pd = pondDist(x, z)
  h -= 0.62 * (1 - smooth(0.0, 1.25, pd)) * (1 - smooth(0.0, 1.25, pd) * 0.2)
  return h
}

const HG = { x0: -26, z0: -30, s: 0.125, nx: 0, nz: 0, data: null }

export function bakeHeight() {
  if (HG.data) return
  HG.nx = Math.round(52 / HG.s) + 1
  HG.nz = Math.round(70 / HG.s) + 1
  HG.data = new Float32Array(HG.nx * HG.nz)
  for (let j = 0; j < HG.nz; j++) for (let i = 0; i < HG.nx; i++) HG.data[j * HG.nx + i] = rawHeight(HG.x0 + i * HG.s, HG.z0 + j * HG.s)
}

export function height(x, z) {
  const d = HG.data
  if (!d) return rawHeight(x, z)
  const fx = (x - HG.x0) / HG.s
  const fz = (z - HG.z0) / HG.s
  if (fx < 0 || fz < 0 || fx >= HG.nx - 1 || fz >= HG.nz - 1) return rawHeight(x, z)
  const i = fx | 0
  const j = fz | 0
  const tx = fx - i
  const tz = fz - j
  const o = j * HG.nx + i
  const a = d[o] + (d[o + 1] - d[o]) * tx
  const b = d[o + HG.nx] + (d[o + HG.nx + 1] - d[o + HG.nx]) * tx
  return a + (b - a) * tz
}

export function normalAt(x, z) {
  const e = 0.08
  const hx = height(x + e, z) - height(x - e, z)
  const hz = height(x, z + e) - height(x, z - e)
  const nx = -hx
  const ny = 2 * e
  const nz = -hz
  const l = Math.hypot(nx, ny, nz)
  return [nx / l, ny / l, nz / l]
}

export function groundKind(x, z) {
  const path = pathWeight(x, z)
  const pd = pondDist(x, z)
  const shore = (1 - smooth(1.0, 1.35, pd)) * (pd > 0.92 ? 1 : 0.4)
  const r = AREAS.run
  const runW = 1 - smooth(0, 0.5, rectDist(r, x, z))
  const yard = 1 - smooth(0, 1.2, rectDist({ x0: BARN.x - 2.6, x1: BARN.x + 2.6, z0: BARN.z + BARN.d / 2, z1: BARN.z + BARN.d / 2 + 1.0 }, x, z))
  const mudNoise = fbm2(x * 0.7 + 3, z * 0.7)
  let dirt = Math.max(runW * (0.55 + 0.45 * mudNoise), shore, yard * 0.85)
  dirt = Math.max(dirt, smooth(0.62, 0.7, fbm2(x * 0.35 + 9, z * 0.35 - 4)) * 0.6)
  dirt *= 1 - path
  return [Math.max(0, 1 - dirt - path), dirt, path]
}

export function buildTerrain() {
  const x0 = -26
  const x1 = 26
  const z0 = -30
  const z1 = 40
  const s = 0.25
  const nx = Math.round((x1 - x0) / s)
  const nz = Math.round((z1 - z0) / s)
  const V = (nx + 1) * (nz + 1)
  const data = new Float32Array(V * 13)
  let o = 0
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * s
      const z = z0 + j * s
      const y = height(x, z)
      const n = normalAt(x, z)
      const k = groundKind(x, z)
      data.set([x, y, z, n[0], n[1], n[2], k[0], k[1], k[2], 1, 0, 0, fbm2(x * 2.1, z * 2.1)], o)
      o += 13
    }
  const idx = new Uint32Array(nx * nz * 6)
  let q = 0
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i
      const b = a + 1
      const c = a + nx + 1
      const d = c + 1
      idx[q++] = a
      idx[q++] = c
      idx[q++] = b
      idx[q++] = b
      idx[q++] = c
      idx[q++] = d
    }
  return { data, idx }
}
