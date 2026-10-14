export const S = 0.92
export const Y0 = 1.42
export const ROLL = -0.34
export const YAW = -0.22

export function f(x, y, z) {
  const a = x * x + 2.25 * y * y + z * z - 1
  return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z
}

export function toWorld(hx, hy, hz) {
  let x = hx * S
  let y = hz * S
  const z = hy * S
  const cr = Math.cos(ROLL)
  const sr = Math.sin(ROLL)
  const x1 = x * cr - y * sr
  const y1 = x * sr + y * cr
  x = x1
  y = y1
  const cy = Math.cos(YAW)
  const sy = Math.sin(YAW)
  return [x * cy + z * sy, y + Y0, -x * sy + z * cy]
}

function icosphere(level) {
  const t = (1 + Math.sqrt(5)) / 2
  let verts = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map((v) => {
    const l = Math.hypot(...v)
    return v.map((c) => c / l)
  })
  let faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ]
  for (let l = 0; l < level; l++) {
    const cache = new Map()
    const mid = (a, b) => {
      const k = a < b ? a * 1e6 + b : b * 1e6 + a
      if (cache.has(k)) return cache.get(k)
      const m = [(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2, (verts[a][2] + verts[b][2]) / 2]
      const len = Math.hypot(...m)
      verts.push(m.map((c) => c / len))
      cache.set(k, verts.length - 1)
      return verts.length - 1
    }
    const nf = []
    for (const [a, b, c] of faces) {
      const ab = mid(a, b)
      const bc = mid(b, c)
      const ca = mid(c, a)
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    faces = nf
  }
  return { verts, faces }
}

const C = [0, 0, 0.05]

function surfacePoint(d) {
  let lo = 0
  let hi = 0
  for (let r = 0.02; r < 2.4; r += 0.01) {
    if (f(C[0] + d[0] * r, C[1] + d[1] * r, C[2] + d[2] * r) > 0) {
      hi = r
      break
    }
    lo = r
  }
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2
    if (f(C[0] + d[0] * m, C[1] + d[1] * m, C[2] + d[2] * m) > 0) hi = m
    else lo = m
  }
  const r = (lo + hi) / 2
  return [C[0] + d[0] * r, C[1] + d[1] * r, C[2] + d[2] * r]
}

function inv3(m) {
  const [a, b, c, d, e, g, h, i, k] = m
  const A = e * k - g * i
  const B = -(d * k - g * h)
  const Cc = d * i - e * h
  const det = a * A + b * B + c * Cc
  const q = 1 / det
  return [A * q, -(b * k - c * i) * q, (b * g - c * e) * q, B * q, (a * k - c * h) * q, -(a * g - c * d) * q, Cc * q, -(a * i - b * h) * q, (a * e - b * d) * q]
}

export function buildHeart() {
  const h = 0.26
  const x0 = -1.3
  const y0 = -0.78
  const z0 = -1.17
  const nx = 10
  const ny = 6
  const nz = 10
  const gid = (i, j, k) => i + (nx + 1) * (j + (ny + 1) * k)
  const gpos = (i, j, k) => [x0 + i * h, y0 + j * h, z0 + k * h]
  const keep = new Uint8Array(nx * ny * nz)
  const cid = (i, j, k) => i + nx * (j + ny * k)
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        let inside = false
        for (let c = 0; c < 9 && !inside; c++) {
          const p = c < 8 ? gpos(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1)) : gpos(i + 0.5, j + 0.5, k + 0.5)
          if (f(p[0], p[1], p[2]) < 0) inside = true
        }
        keep[cid(i, j, k)] = inside ? 1 : 0
      }
  const used = new Map()
  const hpos = []
  const vertexAt = (i, j, k) => {
    const g = gid(i, j, k)
    if (!used.has(g)) {
      used.set(g, used.size)
      hpos.push(gpos(i, j, k))
    }
    return used.get(g)
  }
  const tets = []
  const cellTets = new Map()
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        if (!keep[cid(i, j, k)]) continue
        const v = (bx, by, bz) => vertexAt(i + bx, j + by, k + bz)
        const even = (i + j + k) % 2 === 0
        const list = even
          ? [
              [v(1, 0, 0), v(0, 1, 0), v(0, 0, 1), v(1, 1, 1)],
              [v(0, 0, 0), v(1, 0, 0), v(0, 1, 0), v(0, 0, 1)],
              [v(1, 1, 0), v(1, 0, 0), v(0, 1, 0), v(1, 1, 1)],
              [v(1, 0, 1), v(1, 0, 0), v(0, 0, 1), v(1, 1, 1)],
              [v(0, 1, 1), v(0, 1, 0), v(0, 0, 1), v(1, 1, 1)],
            ]
          : [
              [v(0, 0, 0), v(1, 1, 0), v(1, 0, 1), v(0, 1, 1)],
              [v(1, 0, 0), v(0, 0, 0), v(1, 1, 0), v(1, 0, 1)],
              [v(0, 1, 0), v(0, 0, 0), v(1, 1, 0), v(0, 1, 1)],
              [v(0, 0, 1), v(0, 0, 0), v(1, 0, 1), v(0, 1, 1)],
              [v(1, 1, 1), v(1, 1, 0), v(1, 0, 1), v(0, 1, 1)],
            ]
        const start = tets.length
        tets.push(...list)
        cellTets.set(cid(i, j, k), [start, start + 1, start + 2, start + 3, start + 4])
      }
  const N = hpos.length
  const rest = new Float32Array(N * 3)
  const heartPos = new Float32Array(N * 3)
  hpos.forEach((p, i) => {
    heartPos.set(p, i * 3)
    rest.set(toWorld(p[0], p[1], p[2]), i * 3)
  })
  const W = (i) => [rest[i * 3], rest[i * 3 + 1], rest[i * 3 + 2]]
  for (const t of tets) {
    const [a, b, c, d] = t.map(W)
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const e3 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]
    const vol = e1[0] * (e2[1] * e3[2] - e2[2] * e3[1]) - e1[1] * (e2[0] * e3[2] - e2[2] * e3[0]) + e1[2] * (e2[0] * e3[1] - e2[1] * e3[0])
    if (vol < 0) {
      const s = t[2]
      t[2] = t[3]
      t[3] = s
    }
  }
  const edgeSet = new Map()
  for (const t of tets)
    for (let a = 0; a < 4; a++)
      for (let b = a + 1; b < 4; b++) {
        const e0 = Math.min(t[a], t[b])
        const e1 = Math.max(t[a], t[b])
        edgeSet.set(e0 * 100000 + e1, [e0, e1])
      }
  const edges = new Uint32Array(edgeSet.size * 2)
  let q = 0
  for (const [e0, e1] of edgeSet.values()) {
    edges[q++] = e0
    edges[q++] = e1
  }
  const sim = { rest, heartPos, tets: new Uint32Array(tets.flat()), edges }

  const { verts, faces } = icosphere(5)
  const V = verts.length
  const rHeart = new Float32Array(V * 3)
  const rWorld = new Float32Array(V * 3)
  for (let i = 0; i < V; i++) {
    const p = surfacePoint(verts[i])
    rHeart.set(p, i * 3)
    rWorld.set(toWorld(p[0], p[1], p[2]), i * 3)
  }
  const indices = new Uint32Array(faces.length * 3)
  const cw = toWorld(C[0], C[1], C[2])
  faces.forEach((fc, k) => {
    const P = fc.map((i) => [rWorld[i * 3], rWorld[i * 3 + 1], rWorld[i * 3 + 2]])
    const e1 = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]]
    const e2 = [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]]
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    const m = [(P[0][0] + P[1][0] + P[2][0]) / 3 - cw[0], (P[0][1] + P[1][1] + P[2][1]) / 3 - cw[1], (P[0][2] + P[1][2] + P[2][2]) / 3 - cw[2]]
    const out = n[0] * m[0] + n[1] * m[1] + n[2] * m[2] > 0
    indices[k * 3] = fc[0]
    indices[k * 3 + 1] = out ? fc[1] : fc[2]
    indices[k * 3 + 2] = out ? fc[2] : fc[1]
  })

  const tm = []
  for (let t = 0; t < tets.length; t++) {
    const p = tets[t].map((i) => hpos[i])
    const m = [p[1][0] - p[0][0], p[2][0] - p[0][0], p[3][0] - p[0][0], p[1][1] - p[0][1], p[2][1] - p[0][1], p[3][1] - p[0][1], p[1][2] - p[0][2], p[2][2] - p[0][2], p[3][2] - p[0][2]]
    tm.push({ o: p[0], inv: inv3(m) })
  }
  const bary = (t, x) => {
    const { o, inv } = tm[t]
    const d = [x[0] - o[0], x[1] - o[1], x[2] - o[2]]
    const l1 = inv[0] * d[0] + inv[1] * d[1] + inv[2] * d[2]
    const l2 = inv[3] * d[0] + inv[4] * d[1] + inv[5] * d[2]
    const l3 = inv[6] * d[0] + inv[7] * d[1] + inv[8] * d[2]
    return [1 - l1 - l2 - l3, l1, l2, l3]
  }
  const bindTet = new Uint32Array(V)
  const bindW = new Float32Array(V * 4)
  for (let v = 0; v < V; v++) {
    const p = [rHeart[v * 3], rHeart[v * 3 + 1], rHeart[v * 3 + 2]]
    const ci = Math.min(nx - 1, Math.max(0, Math.floor((p[0] - x0) / h)))
    const cj = Math.min(ny - 1, Math.max(0, Math.floor((p[1] - y0) / h)))
    const ck = Math.min(nz - 1, Math.max(0, Math.floor((p[2] - z0) / h)))
    let best = -1
    let bm = -Infinity
    let bw = null
    for (let r = 0; r <= 2 && bm < -1e-4; r++)
      for (let dk = -r; dk <= r; dk++)
        for (let dj = -r; dj <= r; dj++)
          for (let di = -r; di <= r; di++) {
            const ii = ci + di
            const jj = cj + dj
            const kk = ck + dk
            if (ii < 0 || jj < 0 || kk < 0 || ii >= nx || jj >= ny || kk >= nz) continue
            const list = cellTets.get(cid(ii, jj, kk))
            if (!list) continue
            for (const t of list) {
              const w = bary(t, p)
              const mn = Math.min(...w)
              if (mn > bm) {
                bm = mn
                best = t
                bw = w
              }
            }
          }
    bindTet[v] = best
    bindW.set(bw, v * 4)
  }

  const anchorAt = (tx, tz) => {
    let bi = 0
    let bd = Infinity
    for (let v = 0; v < V; v++) {
      if (rHeart[v * 3 + 1] < 0.12) continue
      const d = (rHeart[v * 3] - tx) ** 2 + (rHeart[v * 3 + 2] - tz) ** 2
      if (d < bd) {
        bd = d
        bi = v
      }
    }
    return bi
  }
  const anchors = {
    ra: anchorAt(-0.62, 0.62),
    la: anchorAt(0.66, 0.66),
    rv: anchorAt(-0.36, -0.12),
    lv: anchorAt(0.42, -0.2),
    apex: anchorAt(0.04, -0.9),
  }

  return {
    sim,
    render: { rest: rWorld, restHeart: rHeart, indices, bindTet, bindW, V },
    anchors,
  }
}
