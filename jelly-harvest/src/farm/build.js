import { makeSdf, partDist } from './anatomy.js'

function bounds(def, sdf) {
  let mn = [Infinity, Infinity, Infinity]
  let mx = [-Infinity, -Infinity, -Infinity]
  for (const part of def.parts)
    for (const q of part.prims) {
      const pts = q.t === 'c' ? [q.a, q.b] : [q.c]
      const r = q.t === 'e' ? Math.max(...q.r) : q.t === 'c' ? Math.max(q.r, q.rb) : q.r
      for (const p of pts)
        for (let a = 0; a < 3; a++) {
          mn[a] = Math.min(mn[a], p[a] - r)
          mx[a] = Math.max(mx[a], p[a] + r)
        }
    }
  void sdf
  return { mn, mx }
}

function inv3(m) {
  const [a, b, c, d, e, g, h, i, k] = m
  const A = e * k - g * i
  const B = -(d * k - g * h)
  const C = d * i - e * h
  const det = a * A + b * B + c * C
  const q = 1 / det
  return [A * q, -(b * k - c * i) * q, (b * g - c * e) * q, B * q, (a * k - c * h) * q, -(a * g - c * d) * q, C * q, -(a * i - b * h) * q, (a * e - b * d) * q]
}

export function buildCreature(def) {
  const sdf = makeSdf(def)
  const { mn, mx } = bounds(def, sdf)
  const h = def.h
  const pad = h * 0.6
  const x0 = Math.floor((mn[0] - pad) / h) * h
  const z0 = Math.floor((mn[2] - pad) / h) * h
  const y0 = Math.min(0, Math.floor((mn[1] - pad) / h) * h)
  const nx = Math.ceil((mx[0] + pad - x0) / h)
  const ny = Math.ceil((mx[1] + pad - y0) / h)
  const nz = Math.ceil((mx[2] + pad - z0) / h)
  const inflate = h * 0.42
  const gpos = (i, j, k) => [x0 + i * h, y0 + j * h, z0 + k * h]
  const cid = (i, j, k) => i + nx * (j + ny * k)
  const keep = new Uint8Array(nx * ny * nz)
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        let inside = false
        for (let c = 0; c < 9 && !inside; c++) {
          const p = c < 8 ? gpos(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1)) : gpos(i + 0.5, j + 0.5, k + 0.5)
          if (p[1] < -1e-6) continue
          if (sdf(p[0], p[1], p[2]) < inflate) inside = true
        }
        if (inside && y0 + j * h < -1e-6) inside = false
        keep[cid(i, j, k)] = inside ? 1 : 0
      }
  const gid = (i, j, k) => i + (nx + 1) * (j + (ny + 1) * k)
  const used = new Map()
  const pos = []
  const vtx = (i, j, k) => {
    const g = gid(i, j, k)
    if (!used.has(g)) {
      used.set(g, used.size)
      pos.push(gpos(i, j, k))
    }
    return used.get(g)
  }
  const tets = []
  const cellTets = new Map()
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        if (!keep[cid(i, j, k)]) continue
        const v = (bx, by, bz) => vtx(i + bx, j + by, k + bz)
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
  for (const t of tets) {
    const [a, b, c, d] = t.map((q) => pos[q])
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
  const N = pos.length
  const rest = new Float32Array(N * 3)
  pos.forEach((p, i) => rest.set(p, i * 3))
  const edgeSet = new Map()
  for (const t of tets)
    for (let a = 0; a < 4; a++)
      for (let b = a + 1; b < 4; b++) {
        const e0 = Math.min(t[a], t[b])
        const e1 = Math.max(t[a], t[b])
        edgeSet.set(e0 * 1000003 + e1, [e0, e1])
      }
  const edges = new Uint32Array(edgeSet.size * 2)
  let q = 0
  for (const [e0, e1] of edgeSet.values()) {
    edges[q++] = e0
    edges[q++] = e1
  }

  const P = def.parts.length
  const tau = h * 0.55
  const partA = new Uint8Array(N)
  const partB = new Uint8Array(N)
  const partW = new Float32Array(N)
  const pd = new Float64Array(P)
  for (let i = 0; i < N; i++) {
    const [x, y, z] = pos[i]
    let a = 0
    let b = 0
    for (let k = 0; k < P; k++) {
      pd[k] = def.parts[k].noBlend ? Infinity : partDist(def.parts[k], x, y, z)
      if (pd[k] < pd[a]) a = k
    }
    b = a
    let bd = Infinity
    for (let k = 0; k < P; k++) {
      if (k === a) continue
      if (pd[k] < bd) {
        bd = pd[k]
        b = k
      }
    }
    const wa = Math.exp(-(pd[a] - pd[a]) / tau)
    const wb = Math.exp(-(pd[b] - pd[a]) / tau)
    partA[i] = a
    partB[i] = b
    partW[i] = b === a ? 1 : wa / (wa + wb)
  }

  const g = def.g
  const gpad = g * 2.5
  const sx0 = mn[0] - gpad
  const sy0 = Math.min(mn[1], 0) - gpad
  const sz0 = mn[2] - gpad
  const sx = Math.ceil((mx[0] + gpad - sx0) / g)
  const sy = Math.ceil((mx[1] + gpad - sy0) / g)
  const sz = Math.ceil((mx[2] + gpad - sz0) / g)
  const fid = (i, j, k) => i + (sx + 1) * (j + (sy + 1) * k)
  const field = new Float32Array((sx + 1) * (sy + 1) * (sz + 1))
  for (let k = 0; k <= sz; k++)
    for (let j = 0; j <= sy; j++)
      for (let i = 0; i <= sx; i++) field[fid(i, j, k)] = sdf(sx0 + i * g, sy0 + j * g, sz0 + k * g)
  const cellV = new Int32Array(sx * sy * sz).fill(-1)
  const sid = (i, j, k) => i + sx * (j + sy * k)
  const verts = []
  const EDGES = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  const cv = new Float32Array(8)
  for (let k = 0; k < sz; k++)
    for (let j = 0; j < sy; j++)
      for (let i = 0; i < sx; i++) {
        let neg = 0
        for (let c = 0; c < 8; c++) {
          cv[c] = field[fid(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]
          if (cv[c] < 0) neg++
        }
        if (neg === 0 || neg === 8) continue
        let ax = 0
        let ay = 0
        let az = 0
        let cnt = 0
        for (const [a, b] of EDGES) {
          if (cv[a] < 0 === cv[b] < 0) continue
          const t = cv[a] / (cv[a] - cv[b])
          const pa = [a & 1, (a >> 1) & 1, (a >> 2) & 1]
          const pb = [b & 1, (b >> 1) & 1, (b >> 2) & 1]
          ax += pa[0] + (pb[0] - pa[0]) * t
          ay += pa[1] + (pb[1] - pa[1]) * t
          az += pa[2] + (pb[2] - pa[2]) * t
          cnt++
        }
        cellV[sid(i, j, k)] = verts.length
        verts.push([sx0 + (i + ax / cnt) * g, sy0 + (j + ay / cnt) * g, sz0 + (k + az / cnt) * g])
      }
  const grad = (x, y, z) => {
    const e = g * 0.25
    return [sdf(x + e, y, z) - sdf(x - e, y, z), sdf(x, y + e, z) - sdf(x, y - e, z), sdf(x, y, z + e) - sdf(x, y, z - e)].map((c) => c / (2 * e))
  }
  for (const p of verts)
    for (let it = 0; it < 3; it++) {
      const d = sdf(p[0], p[1], p[2])
      const gr = grad(p[0], p[1], p[2])
      const l2 = gr[0] * gr[0] + gr[1] * gr[1] + gr[2] * gr[2] || 1
      const s = Math.max(-g * 0.6, Math.min(g * 0.6, d)) / l2
      p[0] -= gr[0] * s
      p[1] -= gr[1] * s
      p[2] -= gr[2] * s
    }
  const tris = []
  const quad = (a, b, c, d) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    tris.push([a, b, c], [a, c, d])
  }
  for (let k = 1; k < sz; k++)
    for (let j = 1; j < sy; j++)
      for (let i = 0; i < sx; i++) {
        const f0 = field[fid(i, j, k)]
        const f1 = field[fid(i + 1, j, k)]
        if (f0 < 0 === f1 < 0) continue
        quad(cellV[sid(i, j - 1, k - 1)], cellV[sid(i, j, k - 1)], cellV[sid(i, j, k)], cellV[sid(i, j - 1, k)])
      }
  for (let k = 1; k < sz; k++)
    for (let j = 0; j < sy; j++)
      for (let i = 1; i < sx; i++) {
        const f0 = field[fid(i, j, k)]
        const f1 = field[fid(i, j + 1, k)]
        if (f0 < 0 === f1 < 0) continue
        quad(cellV[sid(i - 1, j, k - 1)], cellV[sid(i, j, k - 1)], cellV[sid(i, j, k)], cellV[sid(i - 1, j, k)])
      }
  for (let k = 0; k < sz; k++)
    for (let j = 1; j < sy; j++)
      for (let i = 1; i < sx; i++) {
        const f0 = field[fid(i, j, k)]
        const f1 = field[fid(i, j, k + 1)]
        if (f0 < 0 === f1 < 0) continue
        quad(cellV[sid(i - 1, j - 1, k)], cellV[sid(i, j - 1, k)], cellV[sid(i, j, k)], cellV[sid(i - 1, j, k)])
      }
  const V = verts.length
  const indices = new Uint32Array(tris.length * 3)
  tris.forEach((t, n) => {
    const [a, b, c] = t.map((i) => verts[i])
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]
    const gr = grad(m[0], m[1], m[2])
    const out = nn[0] * gr[0] + nn[1] * gr[1] + nn[2] * gr[2] > 0
    indices[n * 3] = t[0]
    indices[n * 3 + 1] = out ? t[1] : t[2]
    indices[n * 3 + 2] = out ? t[2] : t[1]
  })

  const restN = new Float32Array(V * 3)
  for (let k = 0; k < indices.length; k += 3) {
    const [a, b, c] = [indices[k], indices[k + 1], indices[k + 2]].map((i) => verts[i])
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    for (const i of [indices[k], indices[k + 1], indices[k + 2]]) {
      restN[i * 3] += nn[0]
      restN[i * 3 + 1] += nn[1]
      restN[i * 3 + 2] += nn[2]
    }
  }
  for (let i = 0; i < V; i++) {
    const l = Math.hypot(restN[i * 3], restN[i * 3 + 1], restN[i * 3 + 2]) || 1
    restN[i * 3] /= l
    restN[i * 3 + 1] /= l
    restN[i * 3 + 2] /= l
  }
  const restR = new Float32Array(V * 3)
  const color = new Float32Array(V * 4)
  const tmp = {}
  verts.forEach((p, i) => {
    restR.set(p, i * 3)
    sdf(p[0], p[1], p[2], tmp)
    let part = tmp.part
    for (let k = 0; k < P; k++) if (def.parts[k].noBlend && partDist(def.parts[k], p[0], p[1], p[2]) < g * 0.6) part = k
    const c = def.parts[part].mat(p[0], p[1], p[2])
    color.set(c, i * 4)
  })

  const tm = tets.map((t) => {
    const p = t.map((i) => pos[i])
    const m = [p[1][0] - p[0][0], p[2][0] - p[0][0], p[3][0] - p[0][0], p[1][1] - p[0][1], p[2][1] - p[0][1], p[3][1] - p[0][1], p[1][2] - p[0][2], p[2][2] - p[0][2], p[3][2] - p[0][2]]
    return { o: p[0], inv: inv3(m) }
  })
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
    const p = verts[v]
    const ci = Math.min(nx - 1, Math.max(0, Math.floor((p[0] - x0) / h)))
    const cj = Math.min(ny - 1, Math.max(0, Math.floor((p[1] - y0) / h)))
    const ck = Math.min(nz - 1, Math.max(0, Math.floor((p[2] - z0) / h)))
    let best = -1
    let bm = -Infinity
    let bw = null
    for (let r = 0; r <= 3 && bm < -1e-4; r++)
      for (let dk = -r; dk <= r; dk++)
        for (let dj = -r; dj <= r; dj++)
          for (let di = -r; di <= r; di++) {
            if (Math.max(Math.abs(di), Math.abs(dj), Math.abs(dk)) !== r) continue
            const ii = ci + di
            const jj = cj + dj
            const kk = ck + dk
            if (ii < 0 || jj < 0 || kk < 0 || ii >= nx || jj >= ny || kk >= nz) continue
            const list = cellTets.get(cid(ii, jj, kk))
            if (!list) continue
            for (const t of list) {
              const w = bary(t, p)
              const m = Math.min(...w)
              if (m > bm) {
                bm = m
                best = t
                bw = w
              }
            }
          }
    if (best < 0) {
      best = 0
      bw = [1, 0, 0, 0]
    }
    bindTet[v] = best
    bindW.set(bw, v * 4)
  }
  let top = 0
  let span = 0
  for (let i = 0; i < V; i++) {
    top = Math.max(top, restR[i * 3 + 1])
    span = Math.max(span, Math.hypot(restR[i * 3], restR[i * 3 + 2]))
  }
  return {
    sim: { rest, tets: new Uint32Array(tets.flat()), edges, partA, partB, partW },
    render: { rest: restR, normal: restN, indices, color, bindTet, bindW, V },
    radius: Math.max(top, span),
    top,
  }
}
