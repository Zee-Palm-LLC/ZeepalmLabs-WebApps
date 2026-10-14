export const R = 1
export const T = 0.36
export const BEVEL = 0.085
export const FILLET = 0.14
export const YAW = 0.28
export const VC = (4 * R) / (3 * Math.PI)

function smax(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.max(a, b) + h * h * k * 0.25
}

export function sdf(u, v) {
  return smax(Math.hypot(u, v) - R, -v, FILLET)
}

function grad(u, v) {
  const e = 1e-4
  const gx = sdf(u + e, v) - sdf(u - e, v)
  const gy = sdf(u, v + e) - sdf(u, v - e)
  const l = Math.hypot(gx, gy) || 1
  return [gx / l, gy / l]
}

function boundary(level, spacing) {
  const cu = 0
  const cv = 0.36
  const M = 2400
  const raw = []
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2
    const du = Math.cos(a)
    const dv = Math.sin(a)
    let lo = 0
    let hi = 2.5
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2
      if (sdf(cu + du * m, cv + dv * m) < level) lo = m
      else hi = m
    }
    raw.push([cu + du * lo, cv + dv * lo])
  }
  const cum = [0]
  for (let i = 1; i <= M; i++) {
    const a = raw[i - 1]
    const b = raw[i % M]
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]))
  }
  const L = cum[M]
  const n = Math.max(12, Math.round(L / spacing))
  const pts = []
  let j = 0
  for (let k = 0; k < n; k++) {
    const s = (k / n) * L
    while (cum[j + 1] < s) j++
    const t = (s - cum[j]) / (cum[j + 1] - cum[j] || 1)
    const a = raw[j]
    const b = raw[(j + 1) % M]
    const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    const g = grad(p[0], p[1])
    if (g[1] < -0.999) p[1] -= 0.0006 * (1 - (p[0] / R) ** 2)
    pts.push({ p, n: g })
  }
  return pts
}

function circum(P, a, b, c) {
  const [ax, ay] = P[a]
  const [bx, by] = P[b]
  const [cx, cy] = P[c]
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  const a2 = ax * ax + ay * ay
  const b2 = bx * bx + by * by
  const c2 = cx * cx + cy * cy
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d
  return { a, b, c, x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 }
}

export function delaunay(points) {
  const n = points.length
  let minx = Infinity
  let miny = Infinity
  let maxx = -Infinity
  let maxy = -Infinity
  for (const [x, y] of points) {
    minx = Math.min(minx, x)
    miny = Math.min(miny, y)
    maxx = Math.max(maxx, x)
    maxy = Math.max(maxy, y)
  }
  const d = Math.max(maxx - minx, maxy - miny) * 20
  const mx = (minx + maxx) / 2
  const my = (miny + maxy) / 2
  const P = points.concat([
    [mx - d, my - d],
    [mx, my + d],
    [mx + d, my - d],
  ])
  let tris = [circum(P, n, n + 1, n + 2)]
  for (let i = 0; i < n; i++) {
    const [px, py] = P[i]
    const keep = []
    const edges = new Map()
    for (const t of tris) {
      if ((px - t.x) ** 2 + (py - t.y) ** 2 < t.r2 * (1 - 1e-12)) {
        for (const [e0, e1] of [
          [t.a, t.b],
          [t.b, t.c],
          [t.c, t.a],
        ]) {
          const k = e0 < e1 ? e0 * 100000 + e1 : e1 * 100000 + e0
          if (edges.has(k)) edges.delete(k)
          else edges.set(k, [e0, e1])
        }
      } else keep.push(t)
    }
    for (const [e0, e1] of edges.values()) keep.push(circum(P, e0, e1, i))
    tris = keep
  }
  const out = []
  for (const t of tris) {
    if (t.a >= n || t.b >= n || t.c >= n) continue
    const [ax, ay] = P[t.a]
    const [bx, by] = P[t.b]
    const [cx, cy] = P[t.c]
    const area = ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / 2
    if (Math.abs(area) < 1e-7) continue
    out.push(area > 0 ? [t.a, t.b, t.c] : [t.a, t.c, t.b])
  }
  return out
}

function hexFill(spacing, maxLevel) {
  const pts = []
  const dy = spacing * 0.866
  for (let j = -2; j * dy < 1.2; j++) {
    const off = (j & 1) * spacing * 0.5
    for (let x = -1.2 + off; x < 1.2; x += spacing) {
      const y = j * dy
      if (sdf(x, y) < maxLevel) pts.push([x, y])
    }
  }
  return pts
}

export function toWorld(u, y, v) {
  const x0 = u
  const z0 = VC - v
  const c = Math.cos(YAW)
  const s = Math.sin(YAW)
  return [x0 * c + z0 * s, y, -x0 * s + z0 * c]
}

function inv3(m) {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h
  const B = -(d * i - f * g)
  const C = d * h - e * g
  const det = a * A + b * B + c * C
  const k = 1 / det
  return [A * k, -(b * i - c * h) * k, (b * f - c * e) * k, B * k, (a * i - c * g) * k, -(a * f - c * d) * k, C * k, -(a * h - b * g) * k, (a * e - b * d) * k]
}

export function buildSim() {
  const h = 0.12
  const bnd = boundary(0.016, h).map((b) => b.p)
  const inner = hexFill(h, -0.55 * h)
  const pts = bnd.concat(inner)
  const tris = delaunay(pts)
  const n2 = pts.length
  const layers = [0, T / 2, T]
  const N = n2 * layers.length
  const rest = new Float32Array(N * 3)
  const prof = new Float32Array(N * 3)
  for (let L = 0; L < layers.length; L++)
    for (let i = 0; i < n2; i++) {
      const id = L * n2 + i
      const w = toWorld(pts[i][0], layers[L], pts[i][1])
      rest.set(w, id * 3)
      prof.set([pts[i][0], layers[L], pts[i][1]], id * 3)
    }
  const tets = []
  for (const t of tris)
    for (let L = 0; L < layers.length - 1; L++) {
      const [i, j, k] = [...t].sort((x, y) => x - y)
      const a = L * n2 + i
      const b = L * n2 + j
      const c = L * n2 + k
      const a1 = a + n2
      const b1 = b + n2
      const c1 = c + n2
      tets.push([a, b, c, a1], [b, c, a1, b1], [c, a1, b1, c1])
    }
  const P = (id) => [prof[id * 3], prof[id * 3 + 1], prof[id * 3 + 2]]
  const W = (id) => [rest[id * 3], rest[id * 3 + 1], rest[id * 3 + 2]]
  for (const tt of tets) {
    const [p0, p1, p2, p3] = tt.map(W)
    const d1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]
    const d2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]]
    const d3 = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]]
    const vol = d1[0] * (d2[1] * d3[2] - d2[2] * d3[1]) - d1[1] * (d2[0] * d3[2] - d2[2] * d3[0]) + d1[2] * (d2[0] * d3[1] - d2[1] * d3[0])
    if (vol < 0) {
      const s = tt[2]
      tt[2] = tt[3]
      tt[3] = s
    }
  }
  const edgeSet = new Map()
  for (const tt of tets)
    for (let a = 0; a < 4; a++)
      for (let b = a + 1; b < 4; b++) {
        const e0 = Math.min(tt[a], tt[b])
        const e1 = Math.max(tt[a], tt[b])
        edgeSet.set(e0 * 100000 + e1, [e0, e1])
      }
  const edges = new Uint32Array(edgeSet.size * 2)
  let k = 0
  for (const [e0, e1] of edgeSet.values()) {
    edges[k++] = e0
    edges[k++] = e1
  }
  return { rest, prof, tets: new Uint32Array(tets.flat()), edges, tris2: tris, pts2: pts, n2, layers, P, W }
}

export function buildRender(sim) {
  const ring = boundary(-BEVEL, 0.026)
  const nb = ring.length
  const rows = []
  for (let k = 0; k <= 4; k++) {
    const f = (k / 4) * (Math.PI / 2)
    rows.push([BEVEL * Math.sin(f), T - BEVEL + BEVEL * Math.cos(f)])
  }
  rows.push([BEVEL, T / 2])
  for (let k = 0; k <= 4; k++) {
    const f = (k / 4) * (Math.PI / 2)
    rows.push([BEVEL * Math.cos(f), BEVEL - BEVEL * Math.sin(f)])
  }
  const prof = []
  for (const [hh, y] of rows)
    for (const { p, n } of ring) prof.push([p[0] + n[0] * hh, y, p[1] + n[1] * hh])
  const idx = []
  const nr = rows.length
  for (let r = 0; r < nr - 1; r++)
    for (let i = 0; i < nb; i++) {
      const a = r * nb + i
      const b = r * nb + ((i + 1) % nb)
      const c = (r + 1) * nb + i
      const d = (r + 1) * nb + ((i + 1) % nb)
      idx.push([a, c, b], [b, c, d])
    }
  const interior = hexFill(0.05, -BEVEL - 0.03)
  const capPts = ring.map((b) => b.p).concat(interior)
  const capTris = delaunay(capPts)
  const topBase = prof.length
  for (const [x, v] of interior) prof.push([x, T, v])
  const botBase = prof.length
  for (const [x, v] of interior) prof.push([x, 0, v])
  const mapTop = (i) => (i < nb ? i : topBase + (i - nb))
  const mapBot = (i) => (i < nb ? (nr - 1) * nb + i : botBase + (i - nb))
  for (const [a, b, c] of capTris) {
    idx.push([mapTop(a), mapTop(b), mapTop(c)])
    idx.push([mapBot(a), mapBot(b), mapBot(c)])
  }
  const V = prof.length
  const rest = new Float32Array(V * 3)
  const restProf = new Float32Array(V * 3)
  for (let i = 0; i < V; i++) {
    restProf.set(prof[i], i * 3)
    rest.set(toWorld(prof[i][0], prof[i][1], prof[i][2]), i * 3)
  }
  const C = toWorld(0, T / 2, VC)
  const indices = new Uint32Array(idx.length * 3)
  idx.forEach((t, q) => {
    const p0 = [rest[t[0] * 3], rest[t[0] * 3 + 1], rest[t[0] * 3 + 2]]
    const p1 = [rest[t[1] * 3], rest[t[1] * 3 + 1], rest[t[1] * 3 + 2]]
    const p2 = [rest[t[2] * 3], rest[t[2] * 3 + 1], rest[t[2] * 3 + 2]]
    const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]
    const e2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]]
    const nx = e1[1] * e2[2] - e1[2] * e2[1]
    const ny = e1[2] * e2[0] - e1[0] * e2[2]
    const nz = e1[0] * e2[1] - e1[1] * e2[0]
    const cx = (p0[0] + p1[0] + p2[0]) / 3 - C[0]
    const cy = (p0[1] + p1[1] + p2[1]) / 3 - C[1]
    const cz = (p0[2] + p1[2] + p2[2]) / 3 - C[2]
    const out = nx * cx + ny * cy + nz * cz > 0
    indices[q * 3] = t[0]
    indices[q * 3 + 1] = out ? t[1] : t[2]
    indices[q * 3 + 2] = out ? t[2] : t[1]
  })

  const bindTet = new Uint32Array(V)
  const bindW = new Float32Array(V * 4)
  const { tris2, pts2, n2, layers, tets } = sim
  const tetOf = (t, L, k) => (t * (layers.length - 1) + L) * 3 + k
  const tetM = []
  for (let q = 0; q < tets.length / 4; q++) {
    const p = [0, 1, 2, 3].map((j) => sim.P(tets[q * 4 + j]))
    const m = [p[1][0] - p[0][0], p[2][0] - p[0][0], p[3][0] - p[0][0], p[1][1] - p[0][1], p[2][1] - p[0][1], p[3][1] - p[0][1], p[1][2] - p[0][2], p[2][2] - p[0][2], p[3][2] - p[0][2]]
    tetM.push({ o: p[0], inv: inv3(m) })
  }
  const bary = (q, x) => {
    const { o, inv } = tetM[q]
    const d = [x[0] - o[0], x[1] - o[1], x[2] - o[2]]
    const l1 = inv[0] * d[0] + inv[1] * d[1] + inv[2] * d[2]
    const l2 = inv[3] * d[0] + inv[4] * d[1] + inv[5] * d[2]
    const l3 = inv[6] * d[0] + inv[7] * d[1] + inv[8] * d[2]
    return [1 - l1 - l2 - l3, l1, l2, l3]
  }
  for (let i = 0; i < V; i++) {
    const [u, y, v] = prof[i]
    let best = -1
    let bestMin = -Infinity
    for (let t = 0; t < tris2.length; t++) {
      const [a, b, c] = tris2[t]
      const [ax, ay] = pts2[a]
      const [bx, by] = pts2[b]
      const [cx, cy] = pts2[c]
      const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
      const l0 = ((by - cy) * (u - cx) + (cx - bx) * (v - cy)) / det
      const l1 = ((cy - ay) * (u - cx) + (ax - cx) * (v - cy)) / det
      const l2 = 1 - l0 - l1
      const mn = Math.min(l0, l1, l2)
      if (mn > bestMin) {
        bestMin = mn
        best = t
      }
      if (mn >= 0) break
    }
    const L = y < T / 2 ? 0 : 1
    let bq = 0
    let bw = null
    let bm = -Infinity
    for (let k = 0; k < 3; k++) {
      const q = tetOf(best, L, k)
      const w = bary(q, [u, y, v])
      const mn = Math.min(...w)
      if (mn > bm) {
        bm = mn
        bq = q
        bw = w
      }
    }
    bindTet[i] = bq
    bindW.set(bw, i * 4)
  }
  void n2
  return { rest, restProf, indices, bindTet, bindW, V }
}
