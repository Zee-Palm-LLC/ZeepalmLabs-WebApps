export const STRIDE = 13

export const M = {
  I: () => [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  T: (x, y, z) => [1, 0, 0, 0, 1, 0, 0, 0, 1, x, y, z],
  S: (x, y = x, z = x) => [x, 0, 0, 0, y, 0, 0, 0, z, 0, 0, 0],
  Rx: (a) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return [1, 0, 0, 0, c, s, 0, -s, c, 0, 0, 0]
  },
  Ry: (a) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return [c, 0, -s, 0, 1, 0, s, 0, c, 0, 0, 0]
  },
  Rz: (a) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return [c, s, 0, -s, c, 0, 0, 0, 1, 0, 0, 0]
  },
  mul(...ms) {
    let r = ms[0]
    for (let k = 1; k < ms.length; k++) {
      const a = r
      const b = ms[k]
      const o = new Array(12)
      for (let c = 0; c < 3; c++)
        for (let rr = 0; rr < 3; rr++) o[c * 3 + rr] = a[rr] * b[c * 3] + a[3 + rr] * b[c * 3 + 1] + a[6 + rr] * b[c * 3 + 2]
      for (let rr = 0; rr < 3; rr++) o[9 + rr] = a[rr] * b[9] + a[3 + rr] * b[10] + a[6 + rr] * b[11] + a[9 + rr]
      r = o
    }
    return r
  },
  pt(m, p) {
    return [m[0] * p[0] + m[3] * p[1] + m[6] * p[2] + m[9], m[1] * p[0] + m[4] * p[1] + m[7] * p[2] + m[10], m[2] * p[0] + m[5] * p[1] + m[8] * p[2] + m[11]]
  },
  nrm(m, n) {
    const [a, b, c, d, e, f, g, h, i] = m
    const A = e * i - f * h
    const B = -(d * i - f * g)
    const C = d * h - e * g
    const D = -(b * i - c * h)
    const E = a * i - c * g
    const F = -(a * h - b * g)
    const G = b * f - c * e
    const H = -(a * f - c * d)
    const I = a * e - b * d
    const sg = a * A + d * D + g * G < 0 ? -1 : 1
    const x = (A * n[0] + D * n[1] + G * n[2]) * sg
    const y = (B * n[0] + E * n[1] + H * n[2]) * sg
    const z = (C * n[0] + F * n[1] + I * n[2]) * sg
    const l = Math.hypot(x, y, z) || 1
    return [x / l, y / l, z / l]
  },
}

export class MeshBuilder {
  constructor() {
    this.v = []
    this.i = []
    this.n = 0
  }

  vert(p, n, c, extra = [0, 0, 0, 0]) {
    this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], extra[0], extra[1], extra[2], extra[3])
    return this.n++
  }

  tri(a, b, c) {
    this.i.push(a, b, c)
  }

  flatQuad(m, p, col, extra) {
    const w = p.map((q) => M.pt(m, q))
    const e1 = [w[1][0] - w[0][0], w[1][1] - w[0][1], w[1][2] - w[0][2]]
    const e2 = [w[2][0] - w[0][0], w[2][1] - w[0][1], w[2][2] - w[0][2]]
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    const l = Math.hypot(...n) || 1
    n = [n[0] / l, n[1] / l, n[2] / l]
    const ids = w.map((q) => this.vert(q, n, col, extra))
    this.tri(ids[0], ids[1], ids[2])
    if (ids.length === 4) this.tri(ids[0], ids[2], ids[3])
  }

  box(m, sx, sy, sz, col, extra, shade = true) {
    const x = sx / 2
    const y = sy / 2
    const z = sz / 2
    const f = [
      [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]],
      [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]],
      [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]],
      [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]],
      [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]],
      [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]],
    ]
    const k = [1, 0.92, 0.96, 0.94, 1.04, 0.8]
    f.forEach((q, j) => this.flatQuad(m, q, shade ? col.map((c) => c * k[j]) : col, extra))
  }

  cylinder(m, r0, r1, h, seg, col, extra, caps = true, y0 = 0) {
    const base = this.n
    for (let s = 0; s <= seg; s++) {
      const a = (s / seg) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const slope = (r0 - r1) / h
      const nn = M.nrm(m, [ca, slope, sa])
      this.vert(M.pt(m, [ca * r0, y0, sa * r0]), nn, col, extra)
      this.vert(M.pt(m, [ca * r1, y0 + h, sa * r1]), nn, col, extra)
    }
    for (let s = 0; s < seg; s++) {
      const a = base + s * 2
      this.tri(a, a + 1, a + 2)
      this.tri(a + 1, a + 3, a + 2)
    }
    if (caps) {
      for (const [r, yy, up] of [
        [r1, y0 + h, 1],
        [r0, y0, -1],
      ]) {
        if (r <= 0) continue
        const nn = M.nrm(m, [0, up, 0])
        const c = this.vert(M.pt(m, [0, yy, 0]), nn, col, extra)
        const ring = this.n
        for (let s = 0; s <= seg; s++) {
          const a = (s / seg) * Math.PI * 2
          this.vert(M.pt(m, [Math.cos(a) * r, yy, Math.sin(a) * r]), nn, col, extra)
        }
        for (let s = 0; s < seg; s++) {
          if (up > 0) this.tri(c, ring + s + 1, ring + s)
          else this.tri(c, ring + s, ring + s + 1)
        }
      }
    }
  }

  sphere(m, seg, col, extra, fn) {
    const rings = Math.max(4, Math.round(seg / 2))
    const base = this.n
    for (let r = 0; r <= rings; r++) {
      const th = (r / rings) * Math.PI
      for (let s = 0; s <= seg; s++) {
        const ph = (s / seg) * Math.PI * 2
        let p = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]
        let n = p
        let c = col
        if (fn) {
          const o = fn(p, th, ph)
          p = o.p || p
          n = o.n || n
          c = o.c || col
        }
        this.vert(M.pt(m, p), M.nrm(m, n), c, extra)
      }
    }
    for (let r = 0; r < rings; r++)
      for (let s = 0; s < seg; s++) {
        const a = base + r * (seg + 1) + s
        const b = a + seg + 1
        this.tri(a, a + 1, b)
        this.tri(a + 1, b + 1, b)
      }
  }

  lathe(m, prof, seg, col, extra, colFn) {
    const base = this.n
    for (let k = 0; k < prof.length; k++) {
      const [r, y] = prof[k]
      const p0 = prof[Math.max(0, k - 1)]
      const p1 = prof[Math.min(prof.length - 1, k + 1)]
      const dr = p1[0] - p0[0]
      const dy = p1[1] - p0[1]
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2
        const ca = Math.cos(a)
        const sa = Math.sin(a)
        const n = [dy * ca, -dr, dy * sa]
        this.vert(M.pt(m, [ca * r, y, sa * r]), M.nrm(m, n), colFn ? colFn(k, s) : col, extra)
      }
    }
    for (let k = 0; k < prof.length - 1; k++)
      for (let s = 0; s < seg; s++) {
        const a = base + k * (seg + 1) + s
        const b = a + seg + 1
        this.tri(a, b, a + 1)
        this.tri(a + 1, b, b + 1)
      }
  }

  tube(pts, radii, seg, col, extra) {
    const base = this.n
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k]
      const q = pts[Math.min(pts.length - 1, k + 1)]
      const pp = pts[Math.max(0, k - 1)]
      let t = [q[0] - pp[0], q[1] - pp[1], q[2] - pp[2]]
      const tl = Math.hypot(...t) || 1
      t = t.map((c) => c / tl)
      let ref = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
      let u = [t[1] * ref[2] - t[2] * ref[1], t[2] * ref[0] - t[0] * ref[2], t[0] * ref[1] - t[1] * ref[0]]
      const ul = Math.hypot(...u) || 1
      u = u.map((c) => c / ul)
      const w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]]
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2
        const n = [u[0] * Math.cos(a) + w[0] * Math.sin(a), u[1] * Math.cos(a) + w[1] * Math.sin(a), u[2] * Math.cos(a) + w[2] * Math.sin(a)]
        const r = radii[k]
        this.vert([p[0] + n[0] * r, p[1] + n[1] * r, p[2] + n[2] * r], n, typeof col === 'function' ? col(k) : col, extra)
      }
    }
    for (let k = 0; k < pts.length - 1; k++)
      for (let s = 0; s < seg; s++) {
        const a = base + k * (seg + 1) + s
        const b = a + seg + 1
        this.tri(a, a + 1, b)
        this.tri(a + 1, b + 1, b)
      }
  }

  param(m, f, nu, nv, colFn, extra) {
    const base = this.n
    const e = 1e-3
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const u = i / nu
        const v = j / nv
        const p = f(u, v)
        const pu = f(Math.min(1, u + e), v)
        const pu0 = f(Math.max(0, u - e), v)
        const pv = f(u, Math.min(1, v + e))
        const pv0 = f(u, Math.max(0, v - e))
        const du = [pu[0] - pu0[0], pu[1] - pu0[1], pu[2] - pu0[2]]
        const dv = [pv[0] - pv0[0], pv[1] - pv0[1], pv[2] - pv0[2]]
        let n = [du[1] * dv[2] - du[2] * dv[1], du[2] * dv[0] - du[0] * dv[2], du[0] * dv[1] - du[1] * dv[0]]
        if (Math.hypot(...n) < 1e-12) n = [p[0], p[1], p[2]]
        this.vert(M.pt(m, p), M.nrm(m, n), colFn ? colFn(u, v, p) : [1, 1, 1], extra)
      }
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const a = base + j * (nu + 1) + i
        const b = a + nu + 1
        this.tri(a, a + 1, b)
        this.tri(a + 1, b + 1, b)
      }
  }

  build() {
    return { data: new Float32Array(this.v), idx: new Uint32Array(this.i) }
  }
}
