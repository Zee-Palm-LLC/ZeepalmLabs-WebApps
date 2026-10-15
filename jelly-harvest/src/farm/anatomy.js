import { noise3 } from './noise.js'

const len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z)

function rotY(a) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c, 0, -s, 0, 1, 0, s, 0, c]
}
function rotZ(a) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c, s, 0, -s, c, 0, 0, 0, 1]
}
function rotX(a) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [1, 0, 0, 0, c, s, 0, -s, c]
}
function mul3(a, b) {
  const o = new Array(9)
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2]
  return o
}
export const R3 = { rotX, rotY, rotZ, mul3 }

export const P = {
  ell: (c, r, rot) => ({ t: 'e', c, r, rot }),
  cap: (a, b, r, rb = r) => ({ t: 'c', a, b, r, rb }),
  sph: (c, r) => ({ t: 's', c, r }),
}

function evalPrim(q, x, y, z) {
  if (q.t === 's') return len3(x - q.c[0], y - q.c[1], z - q.c[2]) - q.r
  if (q.t === 'e') {
    let px = x - q.c[0]
    let py = y - q.c[1]
    let pz = z - q.c[2]
    if (q.rot) {
      const m = q.rot
      const ax = m[0] * px + m[1] * py + m[2] * pz
      const ay = m[3] * px + m[4] * py + m[5] * pz
      const az = m[6] * px + m[7] * py + m[8] * pz
      px = ax
      py = ay
      pz = az
    }
    const k0 = len3(px / q.r[0], py / q.r[1], pz / q.r[2])
    const k1 = len3(px / (q.r[0] * q.r[0]), py / (q.r[1] * q.r[1]), pz / (q.r[2] * q.r[2]))
    return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(...q.r)
  }
  const bax = q.b[0] - q.a[0]
  const bay = q.b[1] - q.a[1]
  const baz = q.b[2] - q.a[2]
  const pax = x - q.a[0]
  const pay = y - q.a[1]
  const paz = z - q.a[2]
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)))
  return len3(pax - bax * h, pay - bay * h, paz - baz * h) - (q.r + (q.rb - q.r) * h)
}

function smin(a, b, k) {
  if (k <= 0) return Math.min(a, b)
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

export function partDist(part, x, y, z) {
  let d = Infinity
  for (const q of part.prims) d = smin(d, evalPrim(q, x, y, z), part.k ?? 0)
  if (part.cut) d = Math.max(d, part.cut(x, y, z))
  return d
}

export function makeSdf(def) {
  const parts = def.parts
  const kb = def.blend
  return (x, y, z, out) => {
    let d = Infinity
    let best = 0
    let bd = Infinity
    for (let i = 0; i < parts.length; i++) {
      const pd = partDist(parts[i], x, y, z)
      if (pd < bd) {
        bd = pd
        best = i
      }
      d = smin(d, pd, parts[i].noBlend ? 0 : kb)
    }
    if (out) out.part = best
    return d
  }
}

const CREAM = [0.98, 0.93, 0.84]
const BLACK = [0.02, 0.02, 0.03]

function cow(v) {
  const patch = v.patch
  const skin = v.skin
  const P2 = 0.3
  const body = {
    name: 'body',
    parent: -1,
    pivot: [0, 0.95, 0],
    k: 0.22,
    prims: [P.ell([0, 1.0, 0], [0.56, 0.48, 0.9]), P.ell([0, 0.86, 0.05], [0.5, 0.42, 0.74]), P.ell([0, 1.05, 0.62], [0.4, 0.4, 0.4])],
    mat: (x, y, z) => {
      const n = noise3(x * 2.3 + v.seed, y * 2.3, z * 2.3 - v.seed)
      if (n > 0.62 && y > 0.62) return [...patch, 1]
      return [...skin, 0]
    },
  }
  const udder = { name: 'udder', parent: 0, pivot: [0, 0.6, -0.3], prims: [P.ell([0, 0.55, -0.3], [0.17, 0.12, 0.15])], mat: () => [1.0, 0.62, 0.66, 0] }
  const head = {
    name: 'head',
    parent: 0,
    pivot: [0, 1.12, 0.8],
    k: 0.12,
    prims: [P.ell([0, 1.22, 1.08], [0.32, 0.33, 0.36]), P.ell([0, 1.07, 1.38], [0.27, 0.21, 0.17])],
    mat: (x, y, z) => {
      if (z > 1.26 && y < 1.2) return [1.0, 0.6, 0.64, 0]
      const n = noise3(x * 2.3 + v.seed, y * 2.3, z * 2.3 - v.seed)
      if (n > 0.66 && y > 1.2) return [...patch, 1]
      return [...skin, 0]
    },
  }
  const eyes = { name: 'eyes', parent: 2, pivot: [0, 1.3, 1.2], noBlend: true, prims: [P.sph([0.19, 1.32, 1.3], 0.068), P.sph([-0.19, 1.32, 1.3], 0.068)], mat: () => [...BLACK, 1] }
  const nose = { name: 'nose', parent: 2, pivot: [0, 1.1, 1.5], noBlend: true, prims: [P.sph([0.09, 1.1, 1.53], 0.032), P.sph([-0.09, 1.1, 1.53], 0.032)], mat: () => [0.4, 0.12, 0.16, 1] }
  const horns = {
    name: 'horns',
    parent: 2,
    pivot: [0, 1.45, 1.0],
    prims: [P.cap([0.15, 1.46, 1.02], [0.27, 1.64, 0.96], 0.055, 0.03), P.cap([-0.15, 1.46, 1.02], [-0.27, 1.64, 0.96], 0.055, 0.03)],
    mat: () => [0.95, 0.86, 0.66, 1],
  }
  const earL = { name: 'earL', parent: 2, pivot: [0.3, 1.36, 0.98], prims: [P.ell([0.44, 1.35, 0.97], [0.16, 0.06, 0.1], rotZ(0.35))], mat: () => [...skin, 0] }
  const earR = { name: 'earR', parent: 2, pivot: [-0.3, 1.36, 0.98], prims: [P.ell([-0.44, 1.35, 0.97], [0.16, 0.06, 0.1], rotZ(-0.35))], mat: () => [...skin, 0] }
  const leg = (sx, sz, n) => ({
    name: n,
    parent: 0,
    pivot: [sx * P2, 0.8, sz * 0.55],
    prims: [P.cap([sx * P2, 0.82, sz * 0.55], [sx * P2, 0.13, sz * 0.57], 0.15, 0.13)],
    mat: (x, y) => (y < 0.15 ? [0.18, 0.12, 0.1, 1] : [...skin, 0]),
  })
  const tail = {
    name: 'tail',
    parent: 0,
    pivot: [0, 1.25, -0.86],
    prims: [P.cap([0, 1.25, -0.86], [0, 0.66, -1.02], 0.045, 0.04), P.ell([0, 0.58, -1.03], [0.08, 0.12, 0.08])],
    mat: (x, y) => (y < 0.72 ? [...patch, 1] : [...skin, 0]),
  }
  return {
    parts: [body, udder, head, eyes, nose, horns, earL, earR, leg(1, 1, 'legFL'), leg(-1, 1, 'legFR'), leg(1, -1, 'legBL'), leg(-1, -1, 'legBR'), tail],
    blend: 0.09,
    h: 0.33,
    g: 0.055,
    density: 1.5,
  }
}

function sheep(v) {
  const wool = v.wool
  const face = v.face
  const lobes = [
    [0, 0.82, 0, 0.36],
    [0.22, 0.8, 0.25, 0.29],
    [-0.22, 0.8, 0.25, 0.29],
    [0.22, 0.8, -0.25, 0.29],
    [-0.22, 0.8, -0.25, 0.29],
    [0, 1.0, 0.18, 0.27],
    [0, 1.0, -0.2, 0.27],
    [0.28, 0.68, 0, 0.26],
    [-0.28, 0.68, 0, 0.26],
    [0, 0.72, 0.36, 0.25],
    [0, 0.74, -0.4, 0.25],
    [0, 1.06, 0, 0.24],
    [0.2, 0.98, 0.02, 0.22],
    [-0.2, 0.98, 0.02, 0.22],
  ]
  const body = {
    name: 'body',
    parent: -1,
    pivot: [0, 0.8, 0],
    k: 0.06,
    prims: lobes.map(([x, y, z, r]) => P.sph([x, y, z], r)),
    mat: (x, y, z) => {
      const n = noise3(x * 6, y * 6, z * 6)
      return [wool[0] * (0.94 + n * 0.08), wool[1] * (0.94 + n * 0.08), wool[2] * (0.94 + n * 0.08), 3]
    },
  }
  const head = {
    name: 'head',
    parent: 0,
    pivot: [0, 0.86, 0.42],
    k: 0.05,
    prims: [P.ell([0, 0.86, 0.66], [0.16, 0.19, 0.23]), P.sph([0, 1.02, 0.58], 0.13)],
    mat: (x, y, z) => (y > 0.97 && z < 0.7 ? [...wool, 3] : z > 0.84 && y < 0.82 ? [1.0, 0.62, 0.66, 0] : [...face, 0]),
  }
  const eyes = { name: 'eyes', parent: 1, pivot: [0, 0.9, 0.8], noBlend: true, prims: [P.sph([0.11, 0.92, 0.8], 0.042), P.sph([-0.11, 0.92, 0.8], 0.042)], mat: () => [...BLACK, 1] }
  const earL = { name: 'earL', parent: 1, pivot: [0.15, 0.92, 0.62], prims: [P.ell([0.25, 0.86, 0.62], [0.13, 0.045, 0.07], rotZ(-0.5))], mat: () => [...face, 0] }
  const earR = { name: 'earR', parent: 1, pivot: [-0.15, 0.92, 0.62], prims: [P.ell([-0.25, 0.86, 0.62], [0.13, 0.045, 0.07], rotZ(0.5))], mat: () => [...face, 0] }
  const leg = (sx, sz, n) => ({
    name: n,
    parent: 0,
    pivot: [sx * 0.17, 0.52, sz * 0.27],
    prims: [P.cap([sx * 0.17, 0.56, sz * 0.27], [sx * 0.17, 0.065, sz * 0.28], 0.07, 0.065)],
    mat: (x, y) => (y < 0.1 ? [0.12, 0.1, 0.1, 1] : [...face, 0]),
  })
  const tail = { name: 'tail', parent: 0, pivot: [0, 0.86, -0.52], prims: [P.sph([0, 0.84, -0.6], 0.11)], mat: () => [...wool, 3] }
  return {
    parts: [body, head, eyes, earL, earR, leg(1, 1, 'legFL'), leg(-1, 1, 'legFR'), leg(1, -1, 'legBL'), leg(-1, -1, 'legBR'), tail],
    blend: 0.05,
    h: 0.25,
    g: 0.043,
    density: 2.2,
  }
}

function hen(v, s = 1) {
  const c = v.color
  const S = (p) => p.map((q) => q * s)
  const body = {
    name: 'body',
    parent: -1,
    pivot: S([0, 0.3, 0]),
    k: 0.08 * s,
    prims: [P.ell(S([0, 0.3, 0]), S([0.19, 0.19, 0.25])), P.ell(S([0, 0.28, 0.1]), S([0.17, 0.17, 0.17])), P.cap(S([0, 0.36, -0.18]), S([0, 0.5, -0.3]), 0.1 * s, 0.07 * s)],
    mat: () => [...c, 0],
  }
  const head = {
    name: 'head',
    parent: 0,
    pivot: S([0, 0.42, 0.14]),
    k: 0.04 * s,
    prims: [P.sph(S([0, 0.54, 0.17]), 0.11 * s)],
    mat: () => [...c, 0],
  }
  const comb = {
    name: 'comb',
    parent: 1,
    pivot: S([0, 0.62, 0.17]),
    k: 0.02 * s,
    prims: [P.sph(S([0, 0.66, 0.13]), 0.035 * s), P.sph(S([0, 0.68, 0.18]), 0.04 * s), P.sph(S([0, 0.66, 0.23]), 0.032 * s), P.ell(S([0, 0.44, 0.25]), S([0.03, 0.05, 0.03]))],
    mat: () => [0.95, 0.12, 0.1, 0],
  }
  const beak = { name: 'beak', parent: 1, pivot: S([0, 0.53, 0.26]), prims: [P.cap(S([0, 0.535, 0.26]), S([0, 0.515, 0.35]), 0.036 * s, 0.008 * s)], mat: () => [1.0, 0.62, 0.08, 1] }
  const eyes = { name: 'eyes', parent: 1, pivot: S([0, 0.57, 0.22]), noBlend: true, prims: [P.sph(S([0.075, 0.57, 0.235]), 0.022 * s), P.sph(S([-0.075, 0.57, 0.235]), 0.022 * s)], mat: () => [...BLACK, 1] }
  const wing = (sx, n) => ({ name: n, parent: 0, pivot: S([sx * 0.16, 0.38, 0.1]), prims: [P.ell(S([sx * 0.185, 0.3, -0.02]), S([0.045, 0.12, 0.18]), rotZ(sx * 0.15))], mat: () => [...c.map((q) => q * 0.88), 0] })
  const leg = (sx, n) => ({
    name: n,
    parent: 0,
    pivot: S([sx * 0.06, 0.15, 0.02]),
    k: 0.01 * s,
    prims: [P.cap(S([sx * 0.06, 0.16, 0.02]), S([sx * 0.06, 0.018, 0.04]), 0.022 * s), P.cap(S([sx * 0.06, 0.016, 0.03]), S([sx * 0.06, 0.016, 0.1]), 0.014 * s)],
    mat: () => [1.0, 0.6, 0.12, 1],
  })
  return {
    parts: [body, head, comb, beak, eyes, wing(1, 'wingL'), wing(-1, 'wingR'), leg(1, 'legL'), leg(-1, 'legR')],
    blend: 0.035 * s,
    h: 0.14 * s,
    g: 0.022 * s,
    density: 2.6,
  }
}

function chick(v) {
  const c = v.color
  const body = { name: 'body', parent: -1, pivot: [0, 0.13, 0], prims: [P.sph([0, 0.13, 0], 0.11)], mat: () => [...c, 0] }
  const head = { name: 'head', parent: 0, pivot: [0, 0.2, 0.04], prims: [P.sph([0, 0.25, 0.06], 0.075)], mat: () => [...c, 0] }
  const beak = { name: 'beak', parent: 1, pivot: [0, 0.25, 0.12], prims: [P.cap([0, 0.25, 0.12], [0, 0.24, 0.17], 0.022, 0.006)], mat: () => [1.0, 0.5, 0.05, 1] }
  const eyes = { name: 'eyes', parent: 1, pivot: [0, 0.27, 0.11], noBlend: true, prims: [P.sph([0.042, 0.272, 0.118], 0.014), P.sph([-0.042, 0.272, 0.118], 0.014)], mat: () => [...BLACK, 1] }
  const wing = (sx, n) => ({ name: n, parent: 0, pivot: [sx * 0.09, 0.15, 0.02], prims: [P.ell([sx * 0.105, 0.13, -0.01], [0.025, 0.05, 0.07])], mat: () => [...c.map((q) => q * 0.92), 0] })
  const leg = (sx, n) => ({ name: n, parent: 0, pivot: [sx * 0.035, 0.04, 0.0], prims: [P.cap([sx * 0.035, 0.05, 0.0], [sx * 0.035, 0.01, 0.02], 0.014)], mat: () => [1.0, 0.55, 0.1, 1] })
  return { parts: [body, head, beak, eyes, wing(1, 'wingL'), wing(-1, 'wingR'), leg(1, 'legL'), leg(-1, 'legR')], blend: 0.03, h: 0.085, g: 0.014, density: 3.4 }
}

function pig(v) {
  const c = v.color
  const body = { name: 'body', parent: -1, pivot: [0, 0.5, 0], prims: [P.ell([0, 0.52, 0], [0.36, 0.33, 0.55])], mat: () => [...c, 0] }
  const head = {
    name: 'head',
    parent: 0,
    pivot: [0, 0.52, 0.38],
    k: 0.06,
    prims: [P.ell([0, 0.58, 0.58], [0.26, 0.25, 0.22]), P.cap([0, 0.52, 0.74], [0, 0.52, 0.84], 0.11)],
    mat: (x, y, z) => (z > 0.8 ? [1.0, 0.5, 0.58, 0] : [...c, 0]),
  }
  const nose = { name: 'nose', parent: 1, pivot: [0, 0.52, 0.95], noBlend: true, prims: [P.sph([0.04, 0.53, 0.945], 0.024), P.sph([-0.04, 0.53, 0.945], 0.024)], mat: () => [0.45, 0.12, 0.18, 1] }
  const eyes = { name: 'eyes', parent: 1, pivot: [0, 0.66, 0.74], noBlend: true, prims: [P.sph([0.12, 0.67, 0.74], 0.04), P.sph([-0.12, 0.67, 0.74], 0.04)], mat: () => [...BLACK, 1] }
  const ear = (sx, n) => ({ name: n, parent: 1, pivot: [sx * 0.14, 0.76, 0.52], prims: [P.cap([sx * 0.14, 0.76, 0.52], [sx * 0.23, 0.86, 0.62], 0.075, 0.02)], mat: () => [...c, 0] })
  const leg = (sx, sz, n) => ({ name: n, parent: 0, pivot: [sx * 0.2, 0.32, sz * 0.32], prims: [P.cap([sx * 0.2, 0.34, sz * 0.32], [sx * 0.2, 0.06, sz * 0.33], 0.085, 0.075)], mat: (x, y) => (y < 0.08 ? [0.35, 0.18, 0.18, 1] : [...c, 0]) })
  const tailPts = []
  for (let k = 0; k < 6; k++) {
    const a = k * 1.2
    tailPts.push([Math.cos(a) * 0.045, 0.62 + Math.sin(a) * 0.045, -0.56 - k * 0.018])
  }
  const tail = { name: 'tail', parent: 0, pivot: [0, 0.62, -0.52], k: 0.02, prims: tailPts.slice(0, -1).map((p, k) => P.cap(p, tailPts[k + 1], 0.022)), mat: () => [...c, 0] }
  return { parts: [body, head, nose, eyes, ear(1, 'earL'), ear(-1, 'earR'), leg(1, 1, 'legFL'), leg(-1, 1, 'legFR'), leg(1, -1, 'legBL'), leg(-1, -1, 'legBR'), tail], blend: 0.07, h: 0.2, g: 0.036, density: 2.2 }
}

function cat(v) {
  const c = v.color
  const body = { name: 'body', parent: -1, pivot: [0, 0.25, 0], k: 0.08, prims: [P.ell([0, 0.27, -0.02], [0.17, 0.24, 0.2]), P.ell([0, 0.12, -0.04], [0.19, 0.12, 0.22])], mat: () => [...c, 0] }
  const head = {
    name: 'head',
    parent: 0,
    pivot: [0, 0.48, 0.04],
    k: 0.04,
    prims: [P.ell([0, 0.58, 0.06], [0.15, 0.13, 0.13]), P.cap([0.08, 0.66, 0.05], [0.12, 0.8, 0.03], 0.05, 0.008), P.cap([-0.08, 0.66, 0.05], [-0.12, 0.8, 0.03], 0.05, 0.008)],
    mat: () => [...c, 0],
  }
  const eyes = { name: 'eyes', parent: 1, pivot: [0, 0.6, 0.17], noBlend: true, prims: [P.ell([0.055, 0.6, 0.165], [0.03, 0.036, 0.02]), P.ell([-0.055, 0.6, 0.165], [0.03, 0.036, 0.02])], mat: () => [0.35, 0.75, 0.2, 1] }
  const nose = { name: 'nose', parent: 1, pivot: [0, 0.55, 0.18], noBlend: true, prims: [P.sph([0, 0.555, 0.185], 0.015)], mat: () => [1.0, 0.45, 0.6, 1] }
  const leg = (sx, n) => ({ name: n, parent: 0, pivot: [sx * 0.07, 0.25, 0.12], prims: [P.cap([sx * 0.07, 0.25, 0.12], [sx * 0.07, 0.03, 0.15], 0.042, 0.038)], mat: () => [...c, 0] })
  const tp = [
    [0, 0.06, -0.2],
    [0.14, 0.045, -0.26],
    [0.26, 0.05, -0.14],
    [0.29, 0.06, 0.04],
    [0.24, 0.08, 0.16],
  ]
  const tail = { name: 'tail', parent: 0, pivot: [0, 0.07, -0.18], k: 0.02, prims: tp.slice(0, -1).map((p, k) => P.cap(p, tp[k + 1], 0.034, 0.03)), mat: () => [...c, 0] }
  return { parts: [body, head, eyes, nose, leg(1, 'legL'), leg(-1, 'legR'), tail], blend: 0.035, h: 0.115, g: 0.02, density: 3.4 }
}

function ghost(v) {
  const c = v.color
  const body = {
    name: 'body',
    parent: -1,
    pivot: [0, 0.75, 0],
    k: 0.1,
    prims: [P.ell([0, 0.82, 0], [0.36, 0.45, 0.32]), P.ell([0, 0.55, 0], [0.38, 0.32, 0.34])],
    cut: (x, y, z) => 0.3 + 0.07 * Math.sin(Math.atan2(x, z) * 5) - y,
    mat: () => [...c, 0],
  }
  const eyes = { name: 'eyes', parent: 0, pivot: [0, 0.9, 0.28], noBlend: true, prims: [P.ell([0.12, 0.92, 0.29], [0.05, 0.075, 0.03]), P.ell([-0.12, 0.92, 0.29], [0.05, 0.075, 0.03])], mat: () => [0.05, 0.03, 0.1, 1] }
  const mouth = { name: 'mouth', parent: 0, pivot: [0, 0.74, 0.3], noBlend: true, prims: [P.ell([0, 0.74, 0.305], [0.055, 0.065, 0.025])], mat: () => [0.05, 0.03, 0.1, 1] }
  const arm = (sx, n) => ({ name: n, parent: 0, pivot: [sx * 0.3, 0.75, 0.04], prims: [P.cap([sx * 0.3, 0.75, 0.04], [sx * 0.5, 0.86, 0.12], 0.075, 0.05)], mat: () => [...c, 0] })
  return { parts: [body, eyes, mouth, arm(1, 'armL'), arm(-1, 'armR')], blend: 0.06, h: 0.19, g: 0.036, density: 0.9 }
}

export const SPECIES = {
  cow,
  sheep,
  hen: (v) => hen(v, 1),
  chick,
  pig,
  cat,
  ghost,
}

export { CREAM }
