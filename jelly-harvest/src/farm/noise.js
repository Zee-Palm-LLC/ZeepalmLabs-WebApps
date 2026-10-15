export function hash2(x, y) {
  let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return h - Math.floor(h)
}

export function hash3(x, y, z) {
  let h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return h - Math.floor(h)
}

export function noise2(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash2(ix, iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1)
  const d = hash2(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

export function noise3(x, y, z) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const uz = fz * fz * (3 - 2 * fz)
  const l = (a, b, t) => a + (b - a) * t
  const n = (i, j, k) => hash3(ix + i, iy + j, iz + k)
  return l(
    l(l(n(0, 0, 0), n(1, 0, 0), ux), l(n(0, 1, 0), n(1, 1, 0), ux), uy),
    l(l(n(0, 0, 1), n(1, 0, 1), ux), l(n(0, 1, 1), n(1, 1, 1), ux), uy),
    uz,
  )
}

export function fbm2(x, y, o = 4) {
  let s = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < o; i++) {
    s += a * noise2(x * f, y * f)
    f *= 2.03
    a *= 0.5
  }
  return s
}

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
