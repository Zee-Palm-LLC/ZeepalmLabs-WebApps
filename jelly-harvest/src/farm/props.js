import { MeshBuilder, M } from './mesh.js'
import { hash2 } from './noise.js'

const IRON = [0.05, 0.045, 0.05]

export function pumpkinMesh() {
  const mb = new MeshBuilder()
  const f = (u, v) => {
    const ph = u * Math.PI * 2
    const th = v * Math.PI
    const rib = 1 - 0.1 * Math.pow(1 - Math.abs(Math.sin(4 * ph)), 3)
    const bulge = 1 + 0.03 * Math.sin(ph * 3 + 1)
    const r = rib * bulge
    let y = Math.cos(th) * 0.72
    const s = Math.sin(th)
    if (th < 0.45) y -= 0.16 * (1 - th / 0.45) ** 2
    if (th > Math.PI - 0.35) y += 0.08 * (1 - (Math.PI - th) / 0.35) ** 2
    return [Math.cos(ph) * s * r, y + 0.72, Math.sin(ph) * s * r]
  }
  mb.param(
    M.I(),
    f,
    64,
    28,
    (u, v) => {
      const ph = u * Math.PI * 2
      const crease = Math.pow(1 - Math.abs(Math.sin(4 * ph)), 6)
      const n = hash2(Math.floor(u * 40), Math.floor(v * 20))
      const k = 1 - crease * 0.35 - n * 0.06
      return [0.95 * k, 0.36 * k, 0.04 * k]
    },
    [4, 0, 0, 0],
  )
  const stem = []
  const rr = []
  for (let k = 0; k <= 6; k++) {
    const t = k / 6
    stem.push([0.06 * t * t, 1.32 + t * 0.32, -0.04 * t])
    rr.push(0.09 * (1 - t * 0.45))
  }
  mb.tube(stem, rr, 8, [0.24, 0.26, 0.08])
  const vine = []
  const vr = []
  for (let k = 0; k <= 10; k++) {
    const t = k / 10
    vine.push([0.08 + Math.cos(t * 6) * 0.18 * t, 1.36 + Math.sin(t * 7) * 0.05, Math.sin(t * 6) * 0.18 * t])
    vr.push(0.014)
  }
  mb.tube(vine, vr, 4, [0.18, 0.3, 0.08])
  mb.sphere(M.mul(M.T(-0.18, 1.38, 0.1), M.Rz(0.6), M.S(0.16, 0.02, 0.1)), 10, [0.18, 0.34, 0.1])
  return mb.build()
}

export function hayMesh() {
  const mb = new MeshBuilder()
  const straw = (u, v) => {
    const n = hash2(Math.floor(u * 50), Math.floor(v * 12))
    return [0.78 * (0.85 + n * 0.25), 0.6 * (0.85 + n * 0.25), 0.27 * (0.8 + n * 0.3)]
  }
  const W = 1.1
  const H = 0.55
  const D = 0.62
  mb.param(
    M.I(),
    (u, v) => {
      const a = u * Math.PI * 2
      const c = Math.cos(a)
      const s = Math.sin(a)
      const sq = (x) => Math.sign(x) * Math.pow(Math.abs(x), 0.32)
      return [(v - 0.5) * W, H / 2 + sq(s) * (H / 2), sq(c) * (D / 2)]
    },
    40,
    12,
    straw,
  )
  for (const sx of [-1, 1]) {
    mb.param(
      M.I(),
      (u, v) => {
        const a = u * Math.PI * 2
        const sq = (x) => Math.sign(x) * Math.pow(Math.abs(x), 0.32)
        return [sx * (W / 2), H / 2 + sq(Math.sin(a)) * (H / 2) * v, sq(Math.cos(a)) * (D / 2) * v]
      },
      40,
      4,
      straw,
    )
  }
  for (const x of [-0.28, 0.28]) {
    const pts = []
    const rr = []
    for (let k = 0; k <= 24; k++) {
      const a = (k / 24) * Math.PI * 2
      const sq = (q) => Math.sign(q) * Math.pow(Math.abs(q), 0.32)
      pts.push([x, H / 2 + sq(Math.sin(a)) * (H / 2 + 0.01), sq(Math.cos(a)) * (D / 2 + 0.01)])
      rr.push(0.012)
    }
    mb.tube(pts, rr, 4, [0.35, 0.18, 0.08])
  }
  return mb.build()
}

export function lanternMesh() {
  const mb = new MeshBuilder()
  const h = 0.32
  const w = 0.2
  mb.box(M.T(0, 0.02, 0), w + 0.06, 0.04, w + 0.06, IRON)
  mb.box(M.T(0, h + 0.02, 0), w + 0.08, 0.04, w + 0.08, IRON)
  mb.lathe(M.T(0, h + 0.04, 0), [[0.17, 0], [0.12, 0.06], [0.03, 0.14], [0.0, 0.15]], 4, IRON)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mb.box(M.T((sx * w) / 2, h / 2 + 0.02, (sz * w) / 2), 0.025, h, 0.025, IRON)
  mb.box(M.T(0, h / 2 + 0.02, 0), w - 0.01, h - 0.02, w - 0.01, [1.0, 0.72, 0.36], [6, 3.2, 0, 0])
  mb.sphere(M.mul(M.T(0, h * 0.42, 0), M.S(0.035, 0.07, 0.035)), 8, [1.0, 0.8, 0.4], [6, 9.0, 0, 0])
  const ring = []
  const rr = []
  for (let k = 0; k <= 12; k++) {
    const a = (k / 12) * Math.PI
    ring.push([Math.cos(a) * 0.06, h + 0.2 + Math.sin(a) * 0.07, 0])
    rr.push(0.008)
  }
  mb.tube(ring, rr, 4, IRON)
  return mb.build()
}
