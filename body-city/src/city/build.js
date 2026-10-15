import { MeshBuilder, M } from './mesh.js'
import { bodySdf, boardHeight, sdfAt, bodyGrid, GRID, DIST, SPOTS, ROADS, distToRoads, catmull } from './body.js'
import { paintSkin } from './skin.js'
import { rng } from './noise.js'

const PAL = [
  [0.98, 0.9, 0.78],
  [0.98, 0.76, 0.64],
  [0.72, 0.9, 0.82],
  [0.7, 0.84, 0.96],
  [0.86, 0.78, 0.96],
  [1.0, 0.92, 0.6],
  [0.96, 0.66, 0.7],
]
const ROOFS = [
  [0.78, 0.36, 0.26],
  [0.36, 0.42, 0.56],
  [0.52, 0.32, 0.36],
  [0.3, 0.5, 0.42],
]
const WALL = (k) => [8, k, 0, 0]
const GLASS = [6, 0, 0, 0]
const SWAY = (seed) => [3, 0, 0.03, seed]
const MITO = [9, 0, 0, 0]
const BULB = [10, 0, 0, 0]
const EMIT = (k) => [2, k, 0, 0]

const y0 = (x, z) => boardHeight(x, z)
const FEATURES = []

function footY(x, z, w, d, yaw) {
  const c = Math.cos(yaw)
  const sn = Math.sin(yaw)
  let lo = y0(x, z)
  let hi = lo
  for (const [a, b] of [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [-w / 2, d / 2],
    [w / 2, d / 2],
  ]) {
    const h = y0(x + a * c + b * sn, z - a * sn + b * c)
    lo = Math.min(lo, h)
    hi = Math.max(hi, h)
  }
  return [lo, hi - lo]
}

function house(mb, x, z, yaw, s, col, roof) {
  const w = 0.34
  const d = 0.3
  const [g, drop] = footY(x, z, w * s, d * s, yaw)
  FEATURES.push({ type: 'box', x, z, w: w * s, d: d * s, yaw })
  const m = M.mul(M.T(x, g, z), M.Ry(yaw), M.S(s))
  const h = 0.24 + drop / s
  mb.box(M.mul(m, M.T(0, h / 2, 0)), w, h, d, col, WALL(0))
  const r = 0.14
  for (const sx of [-1, 1]) {
    const mm = M.mul(m, M.T((sx * w) / 4, h + r / 2, 0), M.Rz(-sx * 0.72))
    mb.box(mm, w * 0.72, 0.03, d + 0.06, roof)
  }
  mb.flatQuad(m, [
    [-w / 2, h, d / 2],
    [w / 2, h, d / 2],
    [0, h + r, d / 2],
  ], col)
  mb.flatQuad(m, [
    [w / 2, h, -d / 2],
    [-w / 2, h, -d / 2],
    [0, h + r, -d / 2],
  ], col)
  mb.box(M.mul(m, M.T(0.06, 0.06, d / 2 + 0.005)), 0.07, 0.12, 0.01, [0.4, 0.25, 0.18])
}

function tower(mb, x, z, w, d, h, col, roof, yaw = 0) {
  const [g, drop] = footY(x, z, w, d, yaw)
  h += drop
  FEATURES.push({ type: 'box', x, z, w, d, yaw })
  const m = M.mul(M.T(x, g, z), M.Ry(yaw))
  mb.box(M.mul(m, M.T(0, h / 2, 0)), w, h, d, col, WALL(1))
  mb.box(M.mul(m, M.T(0, h + 0.02, 0)), w + 0.04, 0.04, d + 0.04, roof)
  mb.box(M.mul(m, M.T(w * 0.2, h + 0.08, -d * 0.15)), w * 0.3, 0.1, d * 0.3, [0.85, 0.85, 0.82])
}

function tree(mb, x, z, s, r) {
  const g = y0(x, z)
  const seed = r() * 10
  const col = [0.3 + r() * 0.15, 0.62 + r() * 0.15, 0.3 + r() * 0.1]
  mb.cylinder(M.T(x, g, z), 0.025 * s, 0.02 * s, 0.16 * s, 5, [0.45, 0.3, 0.2])
  mb.sphere(M.mul(M.T(x, g + 0.2 * s, z), M.S(0.12 * s, 0.13 * s, 0.12 * s)), 8, col, SWAY(seed))
}

function streetlight(mb, x, z) {
  const g = y0(x, z)
  mb.cylinder(M.T(x, g, z), 0.012, 0.01, 0.26, 4, [0.25, 0.25, 0.28])
  mb.sphere(M.mul(M.T(x, g + 0.27, z), M.S(0.03)), 6, [1, 0.9, 0.7], BULB)
}

const TABLE = [0.98, 0.94, 0.91]

function board(mb) {
  const { x0, z0, s: st, nx, nz } = GRID
  const { H, D } = bodyGrid()
  const W = nx + 1
  const at = (A, i, j) => A[Math.max(0, Math.min(nz, j)) * W + Math.max(0, Math.min(nx, i))]
  const R = 6
  const box = new Float32Array(W * (nz + 1))
  const tmp = new Float32Array(W * (nz + 1))
  for (let j = 0; j <= nz; j++) {
    let acc = 0
    for (let i = -R; i <= R; i++) acc += at(H, i, j)
    for (let i = 0; i <= nx; i++) {
      tmp[j * W + i] = acc / (2 * R + 1)
      acc += at(H, i + R + 1, j) - at(H, i - R, j)
    }
  }
  for (let i = 0; i <= nx; i++) {
    let acc = 0
    for (let j = -R; j <= R; j++) acc += at(tmp, i, j)
    for (let j = 0; j <= nz; j++) {
      box[j * W + i] = acc / (2 * R + 1)
      acc += at(tmp, i, j + R + 1) - at(tmp, i, j - R)
    }
  }
  const base = mb.n
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) {
      let x = x0 + i * st
      let z = z0 + j * st
      const o = j * W + i
      const d = D[o]
      let h = H[o]
      if (d >= 0 && d < st * 1.5) {
        const gx = (bodySdf(x + 0.01, z) - bodySdf(x - 0.01, z)) / 0.02
        const gz = (bodySdf(x, z + 0.01) - bodySdf(x, z - 0.01)) / 0.02
        const gl = Math.hypot(gx, gz) || 1
        x -= (gx / gl) * d
        z -= (gz / gl) * d
        h = 0.004
      } else if (d >= 0) h = -0.05
      const hx = (at(H, i + 1, j) - at(H, i - 1, j)) / (2 * st)
      const hz = (at(H, i, j + 1) - at(H, i, j - 1)) / (2 * st)
      const l = Math.hypot(hx, 1, hz)
      const cav = Math.max(0, box[o] - h)
      const ao = d < 0 ? Math.max(0.55, 1 - cav * 1.6) : 1
      mb.vert([x, h, z], [-hx / l, 1 / l, -hz / l], [ao, ao, ao], [1, 0, 0, 0])
    }
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const a = base + j * W + i
      const b = a + 1
      const c = a + W
      const d = c + 1
      mb.tri(a, c, b)
      mb.tri(b, c, d)
    }
  const T = 60
  mb.flatQuad(M.T(0, -0.002, 0), [
    [-T, 0, T],
    [T, 0, T],
    [T, 0, -T],
    [-T, 0, -T],
  ], TABLE, [7, 0, 0, 0])
}

function roads(mb) {
  const SIDES = [-1, -0.5, 0, 0.5, 1]
  for (const r of ROADS) {
    const base = mb.n
    const n = r.pts.length
    const frame = (i) => {
      const p = r.pts[i]
      const q = r.pts[Math.min(n - 1, i + 1)]
      const o = r.pts[Math.max(0, i - 1)]
      let dx = q[0] - o[0]
      let dz = q[1] - o[1]
      const l = Math.hypot(dx, dz) || 1
      return [p, dx / l, dz / l]
    }
    for (let i = 0; i < n; i++) {
      const [p, dx, dz] = frame(i)
      for (const side of SIDES) {
        const x = p[0] - dz * r.w * side
        const z = p[1] + dx * r.w * side
        mb.vert([x, y0(x, z) + 0.024, z], [0, 1, 0], [side, r.s[i], r.w], [4, 0, 0, r.id])
      }
    }
    const K = SIDES.length
    for (let i = 0; i < n - 1; i++)
      for (let k = 0; k < K - 1; k++) {
        const a = base + i * K + k
        mb.tri(a, a + 1, a + K)
        mb.tri(a + 1, a + K + 1, a + K)
      }
    for (const side of [-1, 1]) {
      const cb = mb.n
      for (let i = 0; i < n; i++) {
        const [p, dx, dz] = frame(i)
        for (const k of [0, 1]) {
          const ww = r.w + k * 0.05
          const x = p[0] - dz * ww * side
          const z = p[1] + dx * ww * side
          mb.vert([x, y0(x, z) + 0.036 - k * 0.014, z], [0, 1, 0], [0.92, 0.9, 0.86], [0, 0, 0, 0])
        }
      }
      for (let i = 0; i < n - 1; i++) {
        const a = cb + i * 2
        if (side < 0) mb.tri(a, a + 2, a + 1)
        else mb.tri(a, a + 1, a + 2)
        if (side < 0) mb.tri(a + 1, a + 2, a + 3)
        else mb.tri(a + 1, a + 3, a + 2)
      }
    }
  }
}

function canalPath() {
  const raw = [
    [0.62, -1.2],
    [0.2, -1.05],
    [-0.55, -1.0],
    [-0.62, -0.62],
    [-0.1, -0.52],
    [0.6, -0.42],
    [0.62, -0.02],
    [0.0, 0.08],
    [-0.6, 0.15],
    [-0.95, 0.4],
    [-1.0, -0.4],
    [-0.98, -1.45],
    [-0.5, -1.62],
    [0.5, -1.62],
    [0.98, -1.45],
    [1.0, -0.4],
    [0.95, 0.4],
    [0.55, 0.78],
    [0.12, 0.86],
  ]
  return catmull(raw, 6)
}

function greenhouse(mb, x, z, yaw) {
  const g = y0(x, z)
  const m = M.mul(M.T(x, g, z), M.Ry(yaw))
  mb.box(M.mul(m, M.T(0, 0.02, 0)), 0.56, 0.04, 0.32, [0.86, 0.86, 0.84])
  mb.param(m, (u, v) => {
    const a = u * Math.PI
    return [(v - 0.5) * 0.54, Math.sin(a) * 0.18 + 0.04, Math.cos(a) * 0.15]
  }, 12, 4, () => [0.6, 0.92, 0.88], GLASS)
  for (let k = 0; k < 4; k++) mb.box(M.mul(m, M.T(-0.18 + k * 0.12, 0.06, 0)), 0.1, 0.04, 0.2, [0.36, 0.7, 0.38])
}

function waterTower(mb, tx, tz) {
  const g = y0(tx, tz)
  for (const [lx, lz] of [
    [-0.1, -0.1],
    [0.1, -0.1],
    [-0.1, 0.1],
    [0.1, 0.1],
  ])
    mb.cylinder(M.T(tx + lx, g, tz + lz), 0.015, 0.015, 0.42, 4, [0.5, 0.5, 0.55])
  mb.cylinder(M.T(tx, g + 0.42, tz), 0.19, 0.19, 0.32, 18, [0.6, 0.85, 0.95], GLASS, false)
  mb.lathe(M.T(tx, g + 0.74, tz), [[0.2, 0], [0.12, 0.08], [0.0, 0.12]], 18, [0.85, 0.36, 0.3])
  return [tx, g + 0.43, tz]
}

function landmarks(mb, anchors) {
  const D = DIST
  {
    const { x, z } = D.brain
    const g = y0(x, z)
    const domes = [
      [0, 0.05, 0.42],
      [0.62, 0.2, 0.28],
      [-0.62, 0.2, 0.28],
      [0.34, -0.5, 0.25],
      [-0.34, -0.5, 0.25],
    ]
    for (const [dx, dz, r] of domes) {
      const gg = y0(x + dx, z + dz)
      mb.cylinder(M.T(x + dx, gg, z + dz), r * 1.02, r * 1.02, 0.08, 20, [0.9, 0.86, 0.95])
      mb.sphere(M.mul(M.T(x + dx, gg + 0.08, z + dz), M.S(r, r * 0.8, r)), 20, [0.72, 0.6, 1.0], GLASS, (p) => (p[1] < 0 ? { p: [p[0], 0, p[2]] } : {}))
      mb.sphere(M.mul(M.T(x + dx, gg + 0.08 + r * 0.3, z + dz), M.S(r * 0.35)), 10, [0.85, 0.7, 1.0], EMIT(1.6))
    }
    mb.cylinder(M.T(x, g + 0.3, z + 0.05), 0.04, 0.018, 0.65, 6, [0.86, 0.84, 0.9])
    mb.sphere(M.mul(M.T(x, g + 0.97, z + 0.05), M.S(0.055)), 8, [0.9, 0.7, 1], EMIT(3))
    anchors.brain = [x, g + 0.95, z]
  }
  {
    const { x, z } = D.heart
    const g = y0(x, z)
    mb.cylinder(M.T(x, g, z), 0.95, 0.9, 0.18, 28, [0.82, 0.74, 0.7])
    mb.cylinder(M.T(x, g + 0.18, z), 0.72, 0.7, 0.32, 28, [0.62, 0.12, 0.13], WALL(0.5))
    mb.cylinder(M.T(x + 0.62, g + 0.18, z - 0.45), 0.08, 0.06, 0.9, 10, [0.55, 0.12, 0.12])
    mb.cylinder(M.T(x - 0.55, g + 0.18, z - 0.55), 0.07, 0.05, 0.75, 10, [0.55, 0.12, 0.12])
    anchors.heart = [x, g + 0.95, z]
  }
  {
    const L = D.lungs
    const [ax, az] = L.alt
    for (const [dx, dz, yaw] of [
      [-0.35, -0.5, 0.3],
      [0.38, -0.42, -0.3],
      [-0.5, 0.2, 0.2],
      [0.25, 0.3, -0.15],
    ])
      greenhouse(mb, L.x + dx, L.z + dz, yaw)
    for (const [dx, dz, yaw] of [
      [-0.12, -0.25, 0.5],
      [0.1, 0.3, 0.45],
    ])
      greenhouse(mb, ax + dx, az + dz, yaw)
    anchors.turbines = [
      [L.x - 0.9, L.z + 0.75],
      [L.x + 0.55, L.z - 0.95],
      [L.x - 0.05, L.z + 0.95],
      [ax + 0.55, az - 0.45],
    ]
    anchors.lungs = [L.x, y0(L.x, L.z) + 0.6, L.z]
  }
  {
    const { x, z } = D.stomach
    const g = y0(x, z)
    mb.cylinder(M.T(x, g, z), 0.68, 0.68, 0.03, 24, [0.95, 0.88, 0.76])
    const stalls = []
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2
      const sx = x + Math.cos(a) * 0.45
      const sz = z + Math.sin(a) * 0.45
      const m = M.mul(M.T(sx, y0(sx, sz) + 0.03, sz), M.Ry(-a + Math.PI / 2))
      mb.box(M.mul(m, M.T(0, 0.06, 0)), 0.24, 0.12, 0.15, [0.7, 0.5, 0.32])
      const cols = [
        [0.95, 0.3, 0.3],
        [0.3, 0.6, 0.95],
        [0.3, 0.78, 0.45],
        [0.98, 0.7, 0.2],
      ]
      for (let q = 0; q < 5; q++) mb.box(M.mul(m, M.T(-0.11 + q * 0.055, 0.26, 0), M.Rx(0.25)), 0.055, 0.012, 0.2, q % 2 ? [1, 1, 1] : cols[k % 4])
      for (const sx2 of [-1, 1]) mb.cylinder(M.mul(m, M.T(sx2 * 0.11, 0, 0.07)), 0.008, 0.008, 0.28, 4, [0.4, 0.3, 0.2])
      stalls.push([sx, y0(sx, sz) + 0.15, sz])
    }
    anchors.stomach = [x, g + 0.5, z]
    anchors.stalls = stalls
  }
  {
    const { x, z } = D.liver
    const g = y0(x, z)
    tower(mb, x - 0.2, z - 0.2, 0.7, 0.45, 0.32, [0.62, 0.32, 0.24], [0.4, 0.2, 0.16], 0.2)
    tower(mb, x + 0.45, z + 0.25, 0.35, 0.35, 0.5, [0.7, 0.4, 0.3], [0.4, 0.2, 0.16], 0.2)
    for (const [dx, dz] of [
      [-0.55, 0.45],
      [-0.2, 0.55],
    ]) {
      const gg = y0(x + dx, z + dz)
      mb.cylinder(M.T(x + dx, gg, z + dz), 0.16, 0.16, 0.34, 14, [0.75, 0.72, 0.68])
      mb.sphere(M.mul(M.T(x + dx, gg + 0.34, z + dz), M.S(0.16, 0.08, 0.16)), 12, [0.75, 0.72, 0.68])
    }
    mb.cylinder(M.T(x + 0.1, g, z - 0.6), 0.06, 0.05, 0.85, 8, [0.5, 0.42, 0.4])
    anchors.liver = [x, g + 0.75, z]
  }
  {
    const { x, z } = D.pancreas
    tower(mb, x + 0.05, z - 0.02, 0.36, 0.28, 0.3, [0.92, 0.94, 0.98], [0.25, 0.45, 0.9], -0.5)
    anchors.pancreas = [x, y0(x, z) + 0.55, z]
  }
  {
    const K = D.kidneys
    const tanks = []
    for (const [kx, kz, sgn] of [
      [K.x, K.z, -1],
      [K.alt[0], K.alt[1], 1],
    ]) {
      tanks.push(waterTower(mb, kx + sgn * 0.1, kz - 0.47))
      const px = kx - sgn * 0.05
      const pz = kz + 0.46
      mb.cylinder(M.T(px, y0(px, pz) + 0.01, pz), 0.14, 0.14, 0.02, 16, [0.3, 0.7, 0.9], [5, 0, 0, 0])
    }
    anchors.kidneys = [K.x, y0(K.x, K.z) + 0.9, K.z]
    anchors.tanks = tanks
  }
  {
    const { x, z } = D.gut
    const pts = canalPath()
    const base = mb.n
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const q = pts[Math.min(pts.length - 1, i + 1)]
      const o = pts[Math.max(0, i - 1)]
      let dx = q[0] - o[0]
      let dz = q[1] - o[1]
      const l = Math.hypot(dx, dz) || 1
      dx /= l
      dz /= l
      const w = i > pts.length * 0.5 ? 0.13 : 0.09
      for (const sd of [-1, 1]) {
        const px = p[0] - dz * w * sd
        const pz = p[1] + dx * w * sd
        mb.vert([px, y0(px, pz) + 0.012, pz], [0, 1, 0], [0.25, 0.65, 0.6], [5, 0, 0, 0])
      }
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = base + i * 2
      mb.tri(a, a + 1, a + 2)
      mb.tri(a + 1, a + 3, a + 2)
    }
    anchors.gut = [x, y0(x, z) + 0.5, z]
    anchors.canal = pts
  }
  {
    const { x, z } = D.fat
    const silos = []
    for (const [dx, dz] of [
      [-0.2, -0.18],
      [0.16, -0.22],
      [-0.05, 0.2],
    ]) {
      const sx = x + dx
      const sz = z + dz
      const g = y0(sx, sz)
      mb.cylinder(M.T(sx, g, sz), 0.15, 0.15, 0.55, 16, [0.95, 0.92, 0.82], GLASS, false)
      mb.sphere(M.mul(M.T(sx, g + 0.55, sz), M.S(0.15, 0.09, 0.15)), 12, [0.85, 0.82, 0.76])
      silos.push([sx, g, sz])
    }
    anchors.fat = [x, y0(x, z) + 0.85, z]
    anchors.silos = silos
  }
  const sites = {}
  for (const id of ['armL', 'armR', 'legL', 'legR']) {
    const { x, z } = D[id]
    const g = y0(x, z)
    const sg = Math.sign(x)
    const [gl] = footY(x, z, 0.6, 0.6, 0)
    mb.box(M.T(x, gl + 0.02, z), 0.6, 0.04 + (g - gl) * 2, 0.6, [0.82, 0.7, 0.55])
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4
      mb.box(M.mul(M.T(x + Math.cos(a) * 0.27, g + 0.03, z + Math.sin(a) * 0.27), M.Ry(a)), 0.06, 0.04, 0.06, [0.95, 0.55, 0.1])
    }
    const cx = x + sg * 0.24
    const cz = z - 0.2
    const cg = y0(cx, cz)
    mb.box(M.T(cx, cg + 0.6, cz), 0.04, 1.2, 0.04, [0.98, 0.75, 0.1])
    for (let k = 0; k < 10; k++) mb.box(M.mul(M.T(cx, cg + 0.06 + k * 0.12, cz), M.Ry(0.785)), 0.07, 0.008, 0.008, [0.9, 0.6, 0.08])
    sites[id] = { base: [x - sg * 0.06, g + 0.03, z + 0.06], crane: [cx, cg + 1.2, cz] }
    anchors[id] = [x, g + 1.0, z]
  }
  anchors.sites = sites
  const mitos = []
  for (const s of [-1, 1])
    for (const [mx, mz] of [
      [5.1, -1.7],
      [2.3, 1.95],
      [2.2, 10.3],
      [3.75, -7.55],
    ]) {
      const x = s * mx
      const z = mz
      const g = y0(x, z)
      const m = M.mul(M.T(x, g, z), M.Ry(Math.PI / 2 + 0.15 * s))
      mb.sphere(M.mul(m, M.T(0, 0.02, 0), M.S(0.3, 0.18, 0.16)), 18, [0.3, 0.85, 0.82], MITO, (p) => (p[1] < 0 ? { p: [p[0], 0, p[2]] } : {}))
      for (let k = 0; k < 4; k++) mb.box(M.mul(m, M.T(-0.16 + k * 0.107, 0.16, 0)), 0.02, 0.05, 0.26, [0.15, 0.5, 0.5])
      mitos.push([x, g + 0.15, z])
    }
  anchors.mitos = mitos
}

function neighbourhoods(mb, lights) {
  const r = rng(2024)
  const placed = []
  const free = (x, z, rad) => placed.every(([px, pz, pr]) => Math.hypot(px - x, pz - z) > pr + rad)
  for (const sp of SPOTS) placed.push([sp.x, sp.z, sp.r * (sp.d.id === 'brain' ? 1.15 : 0.95)])
  for (const p of canalPath()) placed.push([p[0], p[1], 0.16])
  let tries = 0
  let count = 0
  while (tries < 14000 && count < 600) {
    tries++
    const x = -6.4 + r() * 12.8
    const z = -15.2 + r() * 32.4
    const sdf = bodySdf(x, z)
    if (sdf > -0.32) continue
    if (z < -9.7) continue
    const rd = distToRoads(x, z)
    if (rd < 0.12) continue
    const kind = r()
    const rad = kind < 0.55 ? 0.2 : kind < 0.75 ? 0.24 : 0.15
    if (!free(x, z, rad)) continue
    const [, slope] = footY(x, z, rad * 1.6, rad * 1.6, 0)
    if (slope > 0.2) continue
    placed.push([x, z, rad])
    count++
    let near = null
    let nd = Infinity
    for (const sp of SPOTS) {
      const q = Math.hypot(sp.x - x, sp.z - z)
      if (q < nd) {
        nd = q
        near = { ...sp.d, r: sp.r }
      }
    }
    const yaw = Math.round(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.2
    const col = PAL[Math.floor(r() * PAL.length)]
    const tinted = near && nd < near.r * 2.2 ? col.map((v, i) => v * 0.8 + near.color[i] * 0.2) : col
    if (kind < 0.55) house(mb, x, z, yaw, 0.85 + r() * 0.35, tinted, ROOFS[Math.floor(r() * ROOFS.length)])
    else if (kind < 0.75) tower(mb, x, z, 0.26 + r() * 0.12, 0.26 + r() * 0.1, 0.35 + r() * (z > -9.5 && z < 1.5 ? 0.55 : 0.3), tinted, [0.92, 0.9, 0.86], yaw)
    else {
      const n = 2 + Math.floor(r() * 3)
      FEATURES.push({ type: 'trees', x, z, r: 0.3 })
      for (let k = 0; k < n; k++) tree(mb, x + (r() - 0.5) * 0.24, z + (r() - 0.5) * 0.24, 0.9 + r() * 0.6, r)
    }
  }
  for (const rd of ROADS) {
    const step = 0.9
    for (let s = 0.3; s < rd.len; s += step) {
      let i = 1
      while (i < rd.s.length - 1 && rd.s[i] < s) i++
      const a = rd.pts[i - 1]
      const b = rd.pts[i]
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const l = Math.hypot(dx, dz) || 1
      for (const side of [-1, 1]) {
        const x = a[0] - (dz / l) * (rd.w + 0.1) * side
        const z = a[1] + (dx / l) * (rd.w + 0.1) * side
        if (sdfAt(x, z) > -0.1) continue
        if (z < -10.4 && Math.abs(x) < 1.35) continue
        streetlight(mb, x, z)
        lights.push([x, y0(x, z) + 0.27, z])
      }
    }
  }
}

export function buildCity() {
  const mb = new MeshBuilder()
  const anchors = {}
  const lights = []
  FEATURES.length = 0
  board(mb)
  roads(mb)
  landmarks(mb, anchors)
  neighbourhoods(mb, lights)
  const skin = paintSkin({ features: FEATURES, canal: anchors.canal })
  return { mesh: mb.build(), anchors, lights, skin }
}
