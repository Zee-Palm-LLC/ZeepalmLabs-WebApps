import { MeshBuilder, M } from './mesh.js'
import { height, pathWeight, pondDist, groundKind, WATER } from './terrain.js'
import { AREAS, BARN, HOUSE, COOP, POND, LANTERNS, HAY, TREES, SIGN, SCARECROW, PUMPKINS } from './layout.js'
import { rng, fbm2, hash2 } from './noise.js'

const WOOD = [0.34, 0.22, 0.13]
const WOOD_D = [0.22, 0.14, 0.085]
const RED = [0.46, 0.075, 0.055]
const CREAM = [0.86, 0.8, 0.68]
const ROOF = [0.17, 0.115, 0.12]
const IRON = [0.06, 0.055, 0.06]
const STRAW = [0.78, 0.6, 0.27]
const GLOW = [1.0, 0.6, 0.24]

const EM = (k) => [2, k, 0, 0]
const SWAY = (k, seed = 0) => [3, 0, k, seed]
const vary = (c, r, a = 0.08) => c.map((x) => x * (1 - a + 2 * a * r()))

const FONT = {
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
}

function gable(mb, cx, cz, w, d, h, peak, col, faceZ) {
  const z = cz + (faceZ * d) / 2
  const m = M.I()
  const pts = [
    [cx - w / 2, h, z],
    [cx + w / 2, h, z],
    [cx, peak, z],
  ]
  mb.flatQuad(m, faceZ > 0 ? pts : [pts[1], pts[0], pts[2]], col)
}

function roof(mb, cx, cz, w, d, h, peak, col, over = 0.35) {
  const half = w / 2 + over
  const rise = peak - h
  const len = Math.hypot(w / 2 + over, rise * (1 + over / (w / 2)))
  const ang = Math.atan2(rise, w / 2)
  for (const s of [-1, 1]) {
    const m = M.mul(M.T(cx + (s * half) / 2 - (s * over) / 2, (h + peak) / 2 - over * Math.tan(ang) * 0.5 + 0.06, cz), M.Rz(-s * ang))
    mb.box(m, len, 0.14, d + over * 2, col)
    for (let k = -3; k <= 3; k++) {
      const mm = M.mul(m, M.T(0, 0.08, (k * (d + over * 2)) / 7.2))
      mb.box(mm, len, 0.02, 0.05, col.map((c) => c * 0.7))
    }
  }
  mb.box(M.mul(M.T(cx, peak + 0.12, cz)), 0.24, 0.16, d + over * 2.1, col.map((c) => c * 0.8))
}

function windowGlow(mb, m, w, h, frame = CREAM, k = 2.6) {
  mb.box(m, w, h, 0.06, GLOW, EM(k))
  mb.box(M.mul(m, M.T(0, 0, 0.04)), 0.05, h, 0.04, frame)
  mb.box(M.mul(m, M.T(0, 0, 0.04)), w, 0.05, 0.04, frame)
  for (const sx of [-1, 1]) mb.box(M.mul(m, M.T((sx * w) / 2, 0, 0.03)), 0.08, h + 0.08, 0.06, frame)
  for (const sy of [-1, 1]) mb.box(M.mul(m, M.T(0, (sy * h) / 2, 0.03)), w + 0.08, 0.08, 0.06, frame)
}

function barn(mb, lights) {
  const { x, z, w, d, h, peak } = BARN
  const g = height(x, z + d / 2)
  const m0 = M.T(x, g, z)
  mb.box(M.mul(m0, M.T(0, h / 2, 0)), w, h, d, RED)
  const r = rng(42)
  for (let k = 0; k < 22; k++) {
    const px = -w / 2 + 0.15 + (k * (w - 0.3)) / 21
    if (Math.abs(px) < 1.25) continue
    mb.box(M.mul(m0, M.T(px, h / 2, d / 2 + 0.012)), 0.025, h - 0.1, 0.02, vary(RED, r).map((c) => c * 0.72))
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mb.box(M.mul(m0, M.T((sx * w) / 2, h / 2, (sz * d) / 2)), 0.18, h + 0.05, 0.18, CREAM)
  mb.box(M.mul(m0, M.T(0, h - 0.06, d / 2 + 0.05)), w + 0.1, 0.14, 0.1, CREAM)
  mb.box(M.mul(m0, M.T(0, 0.08, d / 2 + 0.05)), w + 0.1, 0.16, 0.1, CREAM)
  gable(mb, x, z, w, d, g + h, g + peak, RED, 1)
  gable(mb, x, z, w, d, g + h, g + peak, RED, -1)
  roof(mb, x, z, w, d, g + h, g + peak, ROOF)
  const dw = 1.15
  const dh = 2.35
  for (const s of [-1, 1]) {
    const dm = M.mul(m0, M.T(s * (dw / 2 + 0.03), dh / 2, d / 2 + 0.07))
    mb.box(dm, dw, dh, 0.08, [0.4, 0.06, 0.05])
    mb.box(M.mul(dm, M.T(0, 0, 0.05)), dw, 0.1, 0.04, CREAM)
    mb.box(M.mul(dm, M.T(0, dh / 2 - 0.05, 0.05)), dw, 0.1, 0.04, CREAM)
    mb.box(M.mul(dm, M.T(0, -dh / 2 + 0.05, 0.05)), dw, 0.1, 0.04, CREAM)
    const diag = Math.hypot(dw, dh / 2)
    for (const yy of [-1, 1]) {
      const a = Math.atan2(dh / 2, dw) * (yy * s)
      mb.box(M.mul(dm, M.T(0, (yy * dh) / 4, 0.055), M.Rz(a)), diag, 0.09, 0.03, CREAM)
    }
  }
  mb.box(M.mul(m0, M.T(0, dh / 2, d / 2 + 0.045)), 0.07, dh - 0.1, 0.03, GLOW, EM(4.5))
  mb.box(M.mul(m0, M.T(0, dh + 0.1, d / 2 + 0.06)), dw * 2 + 0.3, 0.16, 0.1, CREAM)
  windowGlow(mb, M.mul(m0, M.T(0, h + 0.75, d / 2 + 0.03)), 0.8, 0.75)
  for (const s of [-1, 1]) windowGlow(mb, M.mul(m0, M.T(s * 2.15, 1.9, d / 2 + 0.03)), 0.62, 0.55)
  const ring = []
  const rr = []
  for (let k = 0; k <= 28; k++) {
    const a = (k / 28) * Math.PI * 2
    ring.push([x + Math.cos(a) * 0.36, g + dh + 0.62 + Math.sin(a) * 0.36, z + d / 2 + 0.2])
    rr.push(0.085)
  }
  mb.tube(ring, rr, 8, (k) => (k % 3 === 0 ? [0.1, 0.24, 0.1] : [0.07, 0.19, 0.08]))
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3
    const c = k % 2 ? [0.95, 0.38, 0.05] : [0.85, 0.08, 0.06]
    mb.sphere(M.mul(M.T(x + Math.cos(a) * 0.36, g + dh + 0.62 + Math.sin(a) * 0.36, z + d / 2 + 0.29), M.S(0.06)), 8, c)
  }
  for (const s of [-1, 1]) mb.box(M.mul(M.T(x + s * 0.13, g + dh + 0.24, z + d / 2 + 0.28), M.Rz(s * 0.5)), 0.24, 0.12, 0.04, [0.95, 0.42, 0.05])
  const cu = M.T(x, g + peak + 0.1, z)
  mb.box(M.mul(cu, M.T(0, 0.35, 0)), 0.7, 0.7, 0.7, RED)
  windowGlow(mb, M.mul(cu, M.T(0, 0.38, 0.36)), 0.3, 0.32, CREAM, 2)
  mb.lathe(M.mul(cu, M.T(0, 0.7, 0)), [[0.62, 0], [0.4, 0.22], [0.02, 0.5]], 4, ROOF)
  mb.cylinder(M.mul(cu, M.T(0, 1.2, 0)), 0.02, 0.02, 0.5, 4, IRON)
  mb.box(M.mul(cu, M.T(0.08, 1.62, 0)), 0.34, 0.12, 0.02, IRON)
  lights.push({ p: [x, g + 1.4, z + d / 2 + 0.8], c: [1, 0.62, 0.3], i: 2.6, r: 5.5 })
  lights.push({ p: [x, g + h + 0.75, z + d / 2 + 0.6], c: [1, 0.62, 0.3], i: 0.9, r: 3.5 })
}

function house(mb, lights) {
  const { x, z, w, d, h, peak } = HOUSE
  const g = height(x, z + d / 2)
  const m0 = M.T(x, g, z)
  const WALL = [0.74, 0.66, 0.52]
  mb.box(M.mul(m0, M.T(0, h / 2, 0)), w, h, d, WALL)
  for (let k = 0; k < 14; k++) mb.box(M.mul(m0, M.T(0, 0.2 + k * 0.19, d / 2 + 0.01)), w, 0.025, 0.02, WALL.map((c) => c * 0.82))
  gable(mb, x, z, w, d, g + h, g + peak, WALL, 1)
  gable(mb, x, z, w, d, g + h, g + peak, WALL, -1)
  roof(mb, x, z, w, d, g + h, g + peak, [0.2, 0.14, 0.22], 0.3)
  mb.box(M.mul(m0, M.T(1.2, peak + 0.2, -0.6)), 0.5, 1.4, 0.5, [0.42, 0.16, 0.1])
  mb.box(M.mul(m0, M.T(1.2, peak + 0.92, -0.6)), 0.6, 0.12, 0.6, [0.3, 0.12, 0.08])
  for (const px of [-1.45, 1.45]) windowGlow(mb, M.mul(m0, M.T(px, 1.45, d / 2 + 0.03)), 0.7, 0.8, [0.92, 0.9, 0.84])
  windowGlow(mb, M.mul(m0, M.T(0, h + 0.55, d / 2 + 0.03)), 0.5, 0.5, [0.92, 0.9, 0.84], 2)
  mb.box(M.mul(m0, M.T(0, 0.85, d / 2 + 0.05)), 0.75, 1.7, 0.08, [0.3, 0.14, 0.1])
  mb.sphere(M.mul(m0, M.T(0.24, 0.85, d / 2 + 0.12), M.S(0.04)), 6, [0.8, 0.6, 0.2])
  mb.box(M.mul(m0, M.T(0, 2.0, d / 2 + 0.45)), 1.7, 0.08, 0.9, [0.2, 0.14, 0.22])
  for (const s of [-1, 1]) mb.box(M.mul(m0, M.T(s * 0.75, 1.0, d / 2 + 0.85)), 0.08, 2.0, 0.08, CREAM)
  mb.box(M.mul(m0, M.T(0, 0.08, d / 2 + 0.55)), 1.6, 0.16, 1.0, [0.45, 0.4, 0.36])
  lights.push({ p: [x - 1.45, g + 1.4, z + d / 2 + 0.7], c: [1, 0.66, 0.34], i: 1.4, r: 3.8 })
  lights.push({ p: [x + 1.45, g + 1.4, z + d / 2 + 0.7], c: [1, 0.66, 0.34], i: 1.4, r: 3.8 })
}

function fenceLine(mb, a, b, gaps = [], seed = 1) {
  const r = rng(seed)
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  const n = Math.max(2, Math.round(len / 1.15))
  const posts = []
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const px = a[0] + (b[0] - a[0]) * t
    const pz = a[1] + (b[1] - a[1]) * t
    posts.push([px, pz, height(px, pz), (r() - 0.5) * 0.12, (r() - 0.5) * 0.12])
  }
  const inGap = (px, pz) => gaps.some((g) => Math.hypot(px - g[0], pz - g[1]) < g[2])
  posts.forEach(([px, pz, py, tx, tz]) => {
    if (inGap(px, pz)) return
    mb.box(M.mul(M.T(px, py + 0.45, pz), M.Rx(tz), M.Rz(tx)), 0.12, 0.98, 0.12, vary(WOOD, r))
    mb.box(M.mul(M.T(px, py + 0.97, pz), M.Rx(tz), M.Rz(tx)), 0.15, 0.06, 0.15, vary(WOOD_D, r))
  })
  for (let k = 0; k < n; k++) {
    const p = posts[k]
    const q = posts[k + 1]
    const mx = (p[0] + q[0]) / 2
    const mz = (p[1] + q[1]) / 2
    if (inGap(mx, mz) || inGap(p[0], p[1]) || inGap(q[0], q[1])) continue
    const seg = Math.hypot(q[0] - p[0], q[1] - p[1])
    const yaw = Math.atan2(q[1] - p[1], q[0] - p[0])
    for (const [hy, dy] of [
      [0.42, (r() - 0.5) * 0.06],
      [0.78, (r() - 0.5) * 0.06],
    ]) {
      const y0 = p[2] + hy + dy
      const y1 = q[2] + hy - dy
      const slope = Math.atan2(y1 - y0, seg)
      mb.box(M.mul(M.T(mx, (y0 + y1) / 2, mz), M.Ry(-yaw), M.Rz(slope)), seg + 0.1, 0.09, 0.05, vary(WOOD, r, 0.12))
    }
  }
}

function fences(mb) {
  const P = AREAS.pasture
  const S = AREAS.sheep
  const R = AREAS.run
  const gapPath = [0.05, 0, 0]
  void gapPath
  fenceLine(mb, [P.x0, P.z0], [P.x1, P.z0], [], 11)
  fenceLine(mb, [P.x1, P.z0], [P.x1, P.z1], [], 12)
  fenceLine(mb, [P.x1, P.z1], [P.x0, P.z1], [[-5.0, P.z1, 0.5]], 13)
  fenceLine(mb, [P.x0, P.z1], [P.x0, P.z0], [], 14)
  fenceLine(mb, [S.x0, S.z0], [S.x1, S.z0], [], 21)
  fenceLine(mb, [S.x1, S.z0], [S.x1, S.z1], [], 22)
  fenceLine(mb, [S.x1, S.z1], [S.x0, S.z1], [], 23)
  fenceLine(mb, [S.x0, S.z1], [S.x0, S.z0], [], 24)
  const low = new MeshBuilder()
  fenceLine(low, [R.x0, R.z0], [R.x1, R.z0], [], 31)
  fenceLine(low, [R.x1, R.z0], [R.x1, R.z1], [], 32)
  fenceLine(low, [R.x1, R.z1], [R.x0, R.z1], [], 33)
  fenceLine(low, [R.x0, R.z1], [R.x0, R.z0], [[R.x0, 3.4, 0.45]], 34)
  for (let k = 0; k < low.v.length; k += 13) low.v[k + 1] = height(low.v[k], low.v[k + 2]) + (low.v[k + 1] - height(low.v[k], low.v[k + 2])) * 0.7
  const base = mb.n
  mb.v.push(...low.v)
  mb.i.push(...low.i.map((i) => i + base))
  mb.n += low.n
}

function coop(mb, lights) {
  const { x, z, w, d } = COOP
  const g = height(x, z)
  const m0 = M.T(x, g, z)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mb.box(M.mul(m0, M.T((sx * w) / 2.3, 0.3, (sz * d) / 2.3)), 0.08, 0.6, 0.08, WOOD_D)
  mb.box(M.mul(m0, M.T(0, 0.95, 0)), w, 0.75, d, [0.5, 0.36, 0.2])
  for (let k = 0; k < 6; k++) mb.box(M.mul(m0, M.T(0, 0.62 + k * 0.13, d / 2 + 0.01)), w, 0.02, 0.02, [0.32, 0.22, 0.12])
  mb.box(M.mul(m0, M.T(0, 1.42, 0.05), M.Rx(0.28)), w + 0.3, 0.08, d + 0.4, [0.55, 0.12, 0.08])
  windowGlow(mb, M.mul(m0, M.T(0.35, 1.0, d / 2 + 0.03)), 0.26, 0.26, CREAM, 2.2)
  mb.box(M.mul(m0, M.T(-0.3, 0.85, d / 2 + 0.03)), 0.34, 0.42, 0.04, [0.08, 0.05, 0.03])
  const ramp = M.mul(m0, M.T(-0.3, 0.32, d / 2 + 0.45), M.Rx(0.75))
  mb.box(ramp, 0.34, 0.03, 1.0, WOOD)
  for (let k = 0; k < 5; k++) mb.box(M.mul(ramp, M.T(0, 0.025, -0.4 + k * 0.2)), 0.34, 0.025, 0.03, WOOD_D)
  lights.push({ p: [x + 0.35, g + 1.0, z + d / 2 + 0.4], c: [1, 0.64, 0.3], i: 0.7, r: 2.4 })
  const r = rng(77)
  for (let k = 0; k < 40; k++) {
    const px = AREAS.run.x0 + 0.3 + r() * (AREAS.run.x1 - AREAS.run.x0 - 0.6)
    const pz = AREAS.run.z0 + 0.3 + r() * (AREAS.run.z1 - AREAS.run.z0 - 0.6)
    mb.box(M.mul(M.T(px, height(px, pz) + 0.012, pz), M.Ry(r() * 3)), 0.035, 0.025, 0.045, [0.95, 0.72, 0.12])
  }
  const tm = M.T(3.4, height(3.4, 4.6), 4.6)
  mb.box(M.mul(tm, M.T(0, 0.12, 0)), 0.9, 0.18, 0.32, WOOD_D)
  mb.box(M.mul(tm, M.T(0, 0.2, 0)), 0.8, 0.04, 0.24, [0.85, 0.66, 0.2])
}

function pasturePropsStatic(mb) {
  const tx = -2.6
  const tz = -3.5
  const g = height(tx, tz)
  const m0 = M.mul(M.T(tx, g, tz), M.Ry(0.2))
  mb.box(M.mul(m0, M.T(0, 0.28, 0)), 1.5, 0.4, 0.55, WOOD)
  mb.box(M.mul(m0, M.T(0, 0.44, 0)), 1.36, 0.04, 0.42, [0.12, 0.22, 0.3], [5, 0, 0, 0])
  for (const s of [-1, 1]) mb.box(M.mul(m0, M.T(s * 0.6, 0.12, 0)), 0.1, 0.24, 0.6, WOOD_D)
  const bucket = (bx, bz, col) => {
    const m = M.T(bx, height(bx, bz), bz)
    mb.cylinder(m, 0.16, 0.2, 0.32, 14, col)
    mb.cylinder(M.mul(m, M.T(0, 0.3, 0)), 0.205, 0.205, 0.03, 14, IRON, undefined, false)
    const arc = []
    const rr = []
    for (let k = 0; k <= 12; k++) {
      const a = (k / 12) * Math.PI
      arc.push([bx + Math.cos(a) * 0.2, height(bx, bz) + 0.32 + Math.sin(a) * 0.18, bz])
      rr.push(0.008)
    }
    mb.tube(arc, rr, 4, IRON)
  }
  bucket(-1.95, -1.4, [0.42, 0.44, 0.46])
  bucket(-6.9, -5.1, [0.42, 0.44, 0.46])
  const barrel = (bx, bz, s = 1) => {
    const m = M.mul(M.T(bx, height(bx, bz), bz), M.S(s))
    mb.lathe(m, [[0.0, 0], [0.32, 0], [0.37, 0.25], [0.39, 0.45], [0.37, 0.65], [0.32, 0.9], [0.0, 0.9]], 16, [0.36, 0.22, 0.12])
    for (const yy of [0.12, 0.45, 0.78]) mb.cylinder(M.mul(m, M.T(0, yy - 0.025, 0)), 0.38 - Math.abs(yy - 0.45) * 0.15, 0.38 - Math.abs(yy - 0.45) * 0.15, 0.05, 16, IRON, undefined, false)
  }
  barrel(-7.1, -6.6)
  barrel(-6.45, -6.9, 0.85)
  barrel(7.7, -7.6, 0.9)
  const crate = (bx, bz, yaw, s = 0.55, y = 0) => {
    const m = M.mul(M.T(bx, height(bx, bz) + s / 2 + y, bz), M.Ry(yaw))
    mb.box(m, s, s, s, [0.5, 0.35, 0.18])
    for (const f of [-1, 1]) {
      mb.box(M.mul(m, M.T(0, 0, (f * s) / 2)), s + 0.02, 0.06, 0.03, WOOD_D)
      mb.box(M.mul(m, M.T(0, (s / 2) * 0.85, (f * s) / 2)), s + 0.02, 0.05, 0.03, WOOD_D)
      mb.box(M.mul(m, M.T(0, (-s / 2) * 0.85, (f * s) / 2)), s + 0.02, 0.05, 0.03, WOOD_D)
    }
  }
  crate(-0.9, -7.6, 0.2)
  crate(-1.45, -7.4, -0.3, 0.45)
  crate(-0.95, -7.55, 0.5, 0.42, 0.55)
  crate(7.2, -6.9, 0.3, 0.5)
}

function haystacks(mb) {
  for (const [hx, hz, s] of [
    [-8.2, -7.0, 1.0],
    [-8.9, -5.2, 0.8],
    [10.2, -4.2, 1.1],
  ]) {
    const g = height(hx, hz)
    const m = M.mul(M.T(hx, g - 0.05, hz), M.S(s))
    const r = rng(Math.round(hx * 10))
    mb.lathe(m, [[0, 0], [1.1, 0], [1.15, 0.5], [1.0, 1.2], [0.7, 1.75], [0.32, 2.15], [0.05, 2.35], [0, 2.38]], 22, STRAW, undefined, (k, sIdx) => vary(STRAW, () => hash2(k, sIdx + r()), 0.18))
    mb.cylinder(M.mul(m, M.T(0, 2.3, 0)), 0.03, 0.03, 0.35, 4, WOOD_D)
  }
}

function tree(mb, t, hot) {
  const r = rng(t.seed * 977)
  const g = height(t.x, t.z)
  const base = [t.x, g - 0.1, t.z]
  const bark = t.kind === 'bare' ? [0.16, 0.12, 0.12] : [0.26, 0.17, 0.11]
  const branches = []
  const grow = (p, dir, len, rad, depth) => {
    const pts = [p]
    const rr = [rad]
    let d = dir
    let q = p
    const steps = 4
    for (let k = 1; k <= steps; k++) {
      const twist = t.kind === 'bare' ? 0.45 : 0.22
      d = [d[0] + (r() - 0.5) * twist, d[1] + (r() - 0.5) * twist * 0.4 + 0.02, d[2] + (r() - 0.5) * twist]
      const l = Math.hypot(...d)
      d = d.map((c) => c / l)
      q = [q[0] + (d[0] * len) / steps, q[1] + (d[1] * len) / steps, q[2] + (d[2] * len) / steps]
      pts.push(q)
      rr.push(rad * (1 - (k / steps) * 0.55))
    }
    mb.tube(pts, rr, depth === 0 ? 10 : 6, bark)
    branches.push({ p: q, depth })
    if (depth >= (t.kind === 'bare' ? 4 : 3)) return
    const n = depth === 0 ? 3 : 2
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2
      const spread = t.kind === 'bare' ? 0.8 : 0.65
      const nd = [d[0] + Math.cos(a) * spread, d[1] * 0.75 + 0.2, d[2] + Math.sin(a) * spread]
      grow(q, nd, len * 0.68, rr[rr.length - 1] * 0.95, depth + 1)
    }
  }
  grow(base, [0, 1, 0], 2.2 * t.s, 0.2 * t.s, 0)
  if (t.kind === 'bare') return
  const pal =
    t.kind === 'apple'
      ? [
          [0.22, 0.33, 0.1],
          [0.3, 0.38, 0.12],
          [0.42, 0.42, 0.12],
        ]
      : [
          [0.8, 0.32, 0.05],
          [0.72, 0.16, 0.06],
          [0.85, 0.55, 0.1],
          [0.55, 0.12, 0.08],
        ]
  for (const b of branches) {
    if (b.depth < 2) continue
    const s = (0.55 + r() * 0.35) * t.s
    const col = pal[Math.floor(r() * pal.length)]
    const m = M.mul(M.T(b.p[0], b.p[1] + 0.1, b.p[2]), M.S(s, s * 0.82, s))
    const seed = r() * 10
    mb.sphere(m, 14, col, SWAY(0.06, seed), (p) => {
      const n = fbm2(p[0] * 2.4 + seed, p[2] * 2.4 + p[1] * 1.7)
      const k = 0.82 + 0.32 * n
      return { p: [p[0] * k, p[1] * k, p[2] * k], c: col.map((c) => c * (0.75 + 0.45 * n)) }
    })
    if (t.kind === 'apple' && r() > 0.25) {
      for (let a = 0; a < 2; a++) {
        const th = r() * Math.PI * 2
        const ap = [b.p[0] + Math.cos(th) * s * 0.85, b.p[1] + 0.1 - s * 0.25 + r() * 0.3, b.p[2] + Math.sin(th) * s * 0.85 + 0.15]
        mb.sphere(M.mul(M.T(...ap), M.S(0.11, 0.1, 0.11)), 10, [0.72, 0.05, 0.04], SWAY(0.06, seed))
        hot.push({ kind: 'apple', p: ap, r: 0.4 })
      }
    }
  }
  if (t.kind === 'apple') hot.push({ kind: 'apple', p: [t.x, g + 2.4 * t.s, t.z], r: 1.4 * t.s })
}

function corn(mb, hot) {
  const r = rng(303)
  for (let row = 0; row < 2; row++)
    for (let k = 0; k < 12; k++) {
      const x = 2.0 + k * 0.5 + (r() - 0.5) * 0.15
      const z = -5.55 - row * 0.55 + (r() - 0.5) * 0.15
      const g = height(x, z)
      const hgt = 1.7 + r() * 0.5
      const seed = r() * 10
      const stalkCol = [0.55 + r() * 0.1, 0.48, 0.22]
      const pts = []
      const rr = []
      const lean = (r() - 0.5) * 0.2
      for (let s = 0; s <= 5; s++) {
        pts.push([x + lean * (s / 5) ** 2, g + (s / 5) * hgt, z])
        rr.push(0.035 * (1 - s / 7))
      }
      mb.tube(pts, rr, 5, stalkCol, SWAY(0.1, seed))
      for (let l = 0; l < 5; l++) {
        const y = g + 0.3 + l * (hgt / 5.5)
        const a = r() * Math.PI * 2
        const len = 0.55 + r() * 0.25
        const dx = Math.cos(a)
        const dz = Math.sin(a)
        const leaf = []
        const rl = []
        for (let s = 0; s <= 4; s++) {
          const t = s / 4
          leaf.push([x + dx * len * t, y + 0.25 * t - 0.45 * t * t, z + dz * len * t])
          rl.push(0.035 * (1 - t) + 0.005)
        }
        mb.tube(leaf, rl, 3, [0.62, 0.55, 0.26], SWAY(0.18, seed))
      }
      if (r() > 0.4) {
        const cy = g + hgt * 0.55
        mb.sphere(M.mul(M.T(x + 0.07, cy, z + 0.06), M.Rz(-0.4), M.S(0.06, 0.16, 0.06)), 8, [0.95, 0.72, 0.16], SWAY(0.1, seed))
        mb.sphere(M.mul(M.T(x + 0.05, cy - 0.04, z + 0.05), M.Rz(-0.4), M.S(0.068, 0.15, 0.068)), 8, [0.6, 0.6, 0.3], SWAY(0.1, seed))
        hot.push({ kind: 'corn', p: [x + 0.07, cy, z + 0.06], r: 0.32 })
      }
    }
}

function scarecrow(mb) {
  const { x, z } = SCARECROW
  const g = height(x, z)
  const m0 = M.mul(M.T(x, g, z), M.Ry(0.35))
  mb.cylinder(m0, 0.05, 0.05, 2.0, 6, WOOD_D)
  mb.box(M.mul(m0, M.T(0, 1.45, 0)), 1.5, 0.08, 0.08, WOOD_D)
  const plaid = (u, v) => ((Math.floor(u * 8) + Math.floor(v * 6)) % 2 ? [0.75, 0.32, 0.06] : [0.55, 0.18, 0.05])
  mb.param(
    M.mul(m0, M.T(0, 1.2, 0)),
    (u, v) => {
      const a = u * Math.PI * 2
      const r = 0.24 - 0.04 * v
      return [Math.cos(a) * r * 1.2, v * 0.6 - 0.3, Math.sin(a) * r * 0.8]
    },
    16,
    4,
    plaid,
  )
  for (const s of [-1, 1]) {
    mb.cylinder(M.mul(m0, M.T(s * 0.38, 1.45, 0), M.Rz((s * Math.PI) / 2)), 0.1, 0.08, 0.38, 8, [0.62, 0.24, 0.06])
    for (let k = 0; k < 5; k++) mb.cylinder(M.mul(m0, M.T(s * 0.78, 1.45, 0), M.Rz(s * (1.4 + (k - 2) * 0.25)), M.Ry(k)), 0.025, 0.0, 0.2, 3, STRAW)
  }
  mb.box(M.mul(m0, M.T(0, 0.82, 0)), 0.42, 0.3, 0.3, [0.16, 0.22, 0.42])
  for (const s of [-1, 1]) mb.box(M.mul(m0, M.T(s * 0.11, 0.55, 0)), 0.16, 0.45, 0.18, [0.16, 0.22, 0.42])
  const head = M.mul(m0, M.T(0, 1.78, 0))
  mb.sphere(M.mul(head, M.S(0.22, 0.24, 0.22)), 14, [0.72, 0.6, 0.4])
  for (const s of [-1, 1]) mb.box(M.mul(head, M.T(s * 0.08, 0.04, 0.2), M.Rz(0.78)), 0.06, 0.06, 0.02, [0.08, 0.05, 0.03])
  for (let k = 0; k < 5; k++) mb.box(M.mul(head, M.T(-0.08 + k * 0.04, -0.08 + Math.sin(k) * 0.01, 0.205)), 0.03, 0.012, 0.01, [0.08, 0.05, 0.03])
  mb.lathe(M.mul(head, M.T(0, 0.14, 0), M.Rz(0.08)), [[0.48, 0], [0.47, 0.03], [0.22, 0.05], [0.2, 0.2], [0.14, 0.26], [0.0, 0.27]], 20, STRAW)
  mb.cylinder(M.mul(head, M.T(0, 0.2, 0), M.Rz(0.08)), 0.205, 0.205, 0.05, 20, [0.75, 0.14, 0.1], undefined, false)
  for (let k = 0; k < 7; k++) mb.cylinder(M.mul(m0, M.T(0.12 - k * 0.04, 1.0, 0.1), M.Rz(Math.PI + (k - 3) * 0.12)), 0.02, 0.0, 0.18, 3, STRAW)
}

function sign(mb) {
  const { x, z } = SIGN
  const g = height(x, z)
  const m0 = M.mul(M.T(x, g, z), M.Ry(-0.35), M.S(0.78))
  for (const s of [-1, 1]) mb.box(M.mul(m0, M.T(s * 0.95, 0.6, 0)), 0.1, 1.2, 0.1, WOOD_D)
  mb.box(M.mul(m0, M.T(0, 1.02, -0.02), M.Rz(0.03)), 2.2, 0.72, 0.07, [0.4, 0.26, 0.14])
  const word = (w, y, sz, col) => {
    const total = w.length * 6 - 1
    let cx = (-total * sz) / 2
    for (const ch of w) {
      const g2 = FONT[ch]
      for (let row = 0; row < 7; row++)
        for (let c = 0; c < 5; c++)
          if (g2[row][c] === '1') mb.box(M.mul(m0, M.T(cx + c * sz + sz / 2, y - row * sz, 0.03), M.Rz(0.03)), sz * 0.92, sz * 0.92, 0.03, col, EM(0.35))
      cx += 6 * sz
    }
  }
  word('JELLY', 1.26, 0.034, [1.0, 0.62, 0.15])
  word('HARVEST', 0.97, 0.031, [0.98, 0.92, 0.8])
}

function lanternPosts(mb) {
  for (const l of LANTERNS) {
    if (l.wall) continue
    const g = height(l.x, l.z)
    const m = M.T(l.x, g, l.z)
    mb.box(M.mul(m, M.T(0, 0.85, 0)), 0.1, 1.7, 0.1, WOOD_D)
    const arm = l.x > 0 ? -1 : 1
    mb.box(M.mul(m, M.T(arm * 0.18, 1.62, 0)), 0.42, 0.06, 0.06, WOOD_D)
    mb.box(M.mul(m, M.T(arm * 0.35, 1.52, 0)), 0.015, 0.2, 0.015, IRON)
  }
}

function mushrooms(mb, hot) {
  const spots = [
    [-9.4, -1.4, 6],
    [-8.0, 3.6, 5],
    [-3.2, 5.4, 3],
    [8.9, -5.6, 5],
    [9.2, 0.0, 4],
    [-6.8, -6.2, 4],
    [0.6, -6.8, 3],
    [3.0, 6.6, 3],
  ]
  const r = rng(808)
  for (const [mx, mz, n] of spots) {
    for (let k = 0; k < n; k++) {
      const x = mx + (r() - 0.5) * 0.8
      const z = mz + (r() - 0.5) * 0.8
      const s = 0.07 + r() * 0.08
      const g = height(x, z)
      const hue = r() > 0.5 ? [0.62, 0.42, 0.26] : [0.9, 0.84, 0.74]
      mb.cylinder(M.T(x, g, z), s * 0.35, s * 0.28, s * 1.4, 6, [0.88, 0.84, 0.76])
      mb.lathe(M.mul(M.T(x, g + s * 1.3, z), M.S(s)), [[0.0, 0], [1.0, 0], [0.95, 0.25], [0.6, 0.62], [0.0, 0.8]], 12, hue)
    }
    hot.push({ kind: 'mushroom', p: [mx, height(mx, mz) + 0.2, mz], r: 0.6 })
  }
}

function strawberries(mb, hot) {
  const r = rng(515)
  const places = [
    [0.62, 3.8],
    [-0.62, 6.9],
    [1.0, 4.6],
    [-1.3, 4.4],
    [0.7, 8.4],
    [-0.75, 1.0],
  ]
  for (const [x0, z0] of places) {
    for (let k = 0; k < 6; k++) {
      const a = r() * Math.PI * 2
      const d = 0.08 + r() * 0.16
      const x = x0 + Math.cos(a) * d
      const z = z0 + Math.sin(a) * d
      const g = height(x, z)
      const leaf = [0.16 + r() * 0.06, 0.42 + r() * 0.1, 0.12]
      mb.sphere(M.mul(M.T(x, g + 0.02, z), M.Ry(r() * 6), M.S(0.11, 0.03, 0.07)), 8, leaf)
      if (k % 2 === 0) {
        const bx = x + (r() - 0.5) * 0.06
        const bz = z + (r() - 0.5) * 0.06
        const by = height(bx, bz) + 0.045
        mb.sphere(M.mul(M.T(bx, by, bz), M.Rz(Math.PI), M.S(0.04, 0.05, 0.04)), 10, [0.86, 0.05, 0.06], undefined, (p) => {
          const tip = p[1] < 0 ? 1 - Math.abs(p[1]) * 0.35 : 1
          return { p: [p[0] * tip, p[1], p[2] * tip] }
        })
        mb.sphere(M.mul(M.T(bx, by + 0.045, bz), M.S(0.03, 0.01, 0.03)), 6, [0.2, 0.5, 0.12])
      }
    }
    hot.push({ kind: 'strawberry', p: [x0, height(x0, z0) + 0.06, z0], r: 0.36 })
  }
}

function pondEdge(mb) {
  const r = rng(9)
  for (let k = 0; k < 34; k++) {
    const a = (k / 34) * Math.PI * 2 + r() * 0.1
    const x = POND.x + Math.cos(a) * POND.rx * (1.02 + r() * 0.08)
    const z = POND.z + Math.sin(a) * POND.rz * (1.02 + r() * 0.08)
    const s = 0.12 + r() * 0.14
    mb.sphere(M.mul(M.T(x, height(x, z) + s * 0.25, z), M.Ry(r() * 3), M.S(s * 1.3, s * 0.55, s)), 8, vary([0.36, 0.36, 0.38], r, 0.15))
  }
  for (let k = 0; k < 22; k++) {
    const a = r() * Math.PI * 2
    const d = 0.9 + r() * 0.12
    const x = POND.x + Math.cos(a) * POND.rx * d
    const z = POND.z + Math.sin(a) * POND.rz * d
    const g = Math.max(WATER, height(x, z))
    const h = 0.6 + r() * 0.5
    const seed = r() * 9
    mb.tube(
      [
        [x, g, z],
        [x + 0.02, g + h * 0.5, z],
        [x + 0.05, g + h, z],
      ],
      [0.018, 0.015, 0.008],
      4,
      [0.32, 0.36, 0.14],
      SWAY(0.14, seed),
    )
    if (r() > 0.5) mb.cylinder(M.T(x + 0.04, g + h * 0.72, z), 0.03, 0.03, 0.18, 6, [0.3, 0.16, 0.08], SWAY(0.14, seed))
  }
  for (let k = 0; k < 7; k++) {
    const a = r() * Math.PI * 2
    const d = r() * 0.6
    const x = POND.x + Math.cos(a) * POND.rx * d
    const z = POND.z + Math.sin(a) * POND.rz * d
    mb.cylinder(M.mul(M.T(x, WATER + 0.012, z), M.Ry(r() * 6)), 0.16 + r() * 0.08, 0.16, 0.012, 12, [0.16, 0.36, 0.14])
    if (k % 3 === 0) mb.sphere(M.mul(M.T(x, WATER + 0.06, z), M.S(0.06, 0.045, 0.06)), 8, [0.95, 0.75, 0.9], EM(0.4))
  }
}

function stones(mb) {
  const r = rng(61)
  for (let k = 0; k < 120; k++) {
    const z = -5 + r() * 15
    const side = r() > 0.5 ? 1 : -1
    const x = side * (0.55 + r() * 0.25) + 0.12 * Math.sin(z * 0.45)
    if (pathWeight(x, z) > 0.9) continue
    const s = 0.04 + r() * 0.07
    mb.sphere(M.mul(M.T(x, height(x, z) + s * 0.2, z), M.Ry(r() * 3), M.S(s * 1.4, s * 0.6, s)), 6, vary([0.42, 0.4, 0.38], r, 0.15))
  }
}

export function grassInstances() {
  const r = rng(1234)
  const out = []
  let tries = 0
  while (out.length < 15000 && tries < 120000) {
    tries++
    const x = -17 + r() * 34
    const z = -16 + r() * 28
    const k = groundKind(x, z)
    if (k[0] < 0.55 + r() * 0.3) continue
    if (pondDist(x, z) < 1.05) continue
    if (Math.abs(x - BARN.x) < BARN.w / 2 + 0.2 && Math.abs(z - BARN.z) < BARN.d / 2 + 0.2) continue
    if (Math.abs(x - HOUSE.x) < HOUSE.w / 2 + 0.2 && Math.abs(z - HOUSE.z) < HOUSE.d / 2 + 0.2) continue
    const dist = Math.hypot(x, z - 1)
    if (dist > 9 && r() < Math.min(0.75, (dist - 9) / 10)) continue
    const tall = 0.16 + r() * 0.26 + (fbm2(x * 0.4, z * 0.4) - 0.4) * 0.3
    out.push(x, height(x, z), z, Math.max(0.1, tall), r() * Math.PI * 2, r(), r(), 0)
  }
  return new Float32Array(out)
}

export function buildWorld() {
  const mb = new MeshBuilder()
  const lights = []
  const hot = []
  barn(mb, lights)
  house(mb, lights)
  fences(mb)
  coop(mb, lights)
  pasturePropsStatic(mb)
  haystacks(mb)
  for (const t of TREES) tree(mb, t, hot)
  corn(mb, hot)
  scarecrow(mb)
  sign(mb)
  lanternPosts(mb)
  mushrooms(mb, hot)
  strawberries(mb, hot)
  pondEdge(mb)
  stones(mb)
  return { mesh: mb.build(), lights, hot, pumpkins: PUMPKINS, hay: HAY, lanterns: LANTERNS }
}
