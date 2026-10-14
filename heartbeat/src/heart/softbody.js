
export default class SoftBody {
  constructor(sim) {
    const N = sim.rest.length / 3
    this.N = N
    this.X = Float64Array.from(sim.rest)
    this.x = Float64Array.from(sim.rest)
    this.p = Float64Array.from(sim.rest)
    this.v = new Float64Array(N * 3)
    this.tets = sim.tets
    this.edges = sim.edges
    const M = this.tets.length / 4
    this.M = M
    this.DmInv = new Float64Array(M * 9)
    this.vol0 = new Float64Array(M)
    this.off = new Float64Array(M * 12)
    this.q = new Float64Array(M * 4)
    const mass = new Float32Array(N)
    const X = this.X
    for (let t = 0; t < M; t++) {
      const i0 = this.tets[t * 4] * 3
      const i1 = this.tets[t * 4 + 1] * 3
      const i2 = this.tets[t * 4 + 2] * 3
      const i3 = this.tets[t * 4 + 3] * 3
      const a = [X[i1] - X[i0], X[i2] - X[i0], X[i3] - X[i0]]
      const b = [X[i1 + 1] - X[i0 + 1], X[i2 + 1] - X[i0 + 1], X[i3 + 1] - X[i0 + 1]]
      const c = [X[i1 + 2] - X[i0 + 2], X[i2 + 2] - X[i0 + 2], X[i3 + 2] - X[i0 + 2]]
      const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])
      const k = 1 / det
      const inv = [
        (b[1] * c[2] - b[2] * c[1]) * k,
        (a[2] * c[1] - a[1] * c[2]) * k,
        (a[1] * b[2] - a[2] * b[1]) * k,
        (b[2] * c[0] - b[0] * c[2]) * k,
        (a[0] * c[2] - a[2] * c[0]) * k,
        (a[2] * b[0] - a[0] * b[2]) * k,
        (b[0] * c[1] - b[1] * c[0]) * k,
        (a[1] * c[0] - a[0] * c[1]) * k,
        (a[0] * b[1] - a[1] * b[0]) * k,
      ]
      this.DmInv.set(inv, t * 9)
      const vol = det / 6
      this.vol0[t] = vol
      const ids = [i0, i1, i2, i3]
      let cx = 0
      let cy = 0
      let cz = 0
      for (const i of ids) {
        cx += X[i] / 4
        cy += X[i + 1] / 4
        cz += X[i + 2] / 4
      }
      ids.forEach((i, j) => {
        this.off[t * 12 + j * 3] = X[i] - cx
        this.off[t * 12 + j * 3 + 1] = X[i + 1] - cy
        this.off[t * 12 + j * 3 + 2] = X[i + 2] - cz
        mass[i / 3] += Math.abs(vol) / 4
      })
      this.q[t * 4 + 3] = 1
    }
    this.w = new Float64Array(N)
    let total = 0
    for (let i = 0; i < N; i++) total += mass[i]
    for (let i = 0; i < N; i++) this.w[i] = mass[i] > 0 ? total / N / mass[i] : 0
    const E = this.edges.length / 2
    this.L0 = new Float64Array(E)
    for (let e = 0; e < E; e++) {
      const a = this.edges[e * 2] * 3
      const b = this.edges[e * 2 + 1] * 3
      this.L0[e] = Math.hypot(X[b] - X[a], X[b + 1] - X[a + 1], X[b + 2] - X[a + 2])
    }
    this.substeps = 12
    this.firmness = 0.4
    this.damping = 0.45
    this.grab = null
    this.target = [0, 0, 0]
    this.Xt = Float64Array.from(this.X)
    this.anchor = 0.0025
  }

  setTarget(Xt) {
    this.Xt.set(Xt)
    const X = this.Xt
    for (let t = 0; t < this.M; t++) {
      const i0 = this.tets[t * 4] * 3
      const i1 = this.tets[t * 4 + 1] * 3
      const i2 = this.tets[t * 4 + 2] * 3
      const i3 = this.tets[t * 4 + 3] * 3
      const cx = (X[i0] + X[i1] + X[i2] + X[i3]) / 4
      const cy = (X[i0 + 1] + X[i1 + 1] + X[i2 + 1] + X[i3 + 1]) / 4
      const cz = (X[i0 + 2] + X[i1 + 2] + X[i2 + 2] + X[i3 + 2]) / 4
      const ids = [i0, i1, i2, i3]
      for (let j = 0; j < 4; j++) {
        this.off[t * 12 + j * 3] = X[ids[j]] - cx
        this.off[t * 12 + j * 3 + 1] = X[ids[j] + 1] - cy
        this.off[t * 12 + j * 3 + 2] = X[ids[j] + 2] - cz
      }
      const ax = X[i1] - X[i0]
      const ay = X[i1 + 1] - X[i0 + 1]
      const az = X[i1 + 2] - X[i0 + 2]
      const bx = X[i2] - X[i0]
      const by = X[i2 + 1] - X[i0 + 1]
      const bz = X[i2 + 2] - X[i0 + 2]
      const ex = X[i3] - X[i0]
      const ey = X[i3 + 1] - X[i0 + 1]
      const ez = X[i3 + 2] - X[i0 + 2]
      this.vol0[t] = (ax * (by * ez - bz * ey) - ay * (bx * ez - bz * ex) + az * (bx * ey - by * ex)) / 6
    }
    const E = this.L0.length
    for (let e = 0; e < E; e++) {
      const a = this.edges[e * 2] * 3
      const b = this.edges[e * 2 + 1] * 3
      this.L0[e] = Math.hypot(X[b] - X[a], X[b + 1] - X[a + 1], X[b + 2] - X[a + 2])
    }
  }

  solveAnchor() {
    const x = this.x
    const X = this.Xt
    const k = this.grab ? this.anchor * 0.55 : this.anchor
    for (let i = 0; i < this.N * 3; i++) x[i] += (X[i] - x[i]) * k
  }

  compliance() {
    return Math.pow(10, -1.9 - 2.4 * this.firmness)
  }

  reset() {
    this.x.set(this.Xt)
    this.p.set(this.Xt)
    this.v.fill(0)
    for (let t = 0; t < this.M; t++) {
      this.q[t * 4] = 0
      this.q[t * 4 + 1] = 0
      this.q[t * 4 + 2] = 0
      this.q[t * 4 + 3] = 1
    }
    this.grab = null
  }

  squeeze(k = 1) {
    let cx = 0
    let cy = 0
    let cz = 0
    for (let i = 0; i < this.N; i++) {
      cx += this.x[i * 3] / this.N
      cy += this.x[i * 3 + 1] / this.N
      cz += this.x[i * 3 + 2] / this.N
    }
    for (let i = 0; i < this.N; i++) {
      this.v[i * 3] -= (this.x[i * 3] - cx) * 3.2 * k
      this.v[i * 3 + 1] -= (this.x[i * 3 + 1] - cy) * 3.2 * k
      this.v[i * 3 + 2] -= (this.x[i * 3 + 2] - cz) * 3.2 * k
    }
  }

  startGrab(hit) {
    const sigma = 0.16
    const patch = []
    let minOff = Infinity
    for (let i = 0; i < this.N; i++) {
      const dx = this.x[i * 3] - hit[0]
      const dy = this.x[i * 3 + 1] - hit[1]
      const dz = this.x[i * 3 + 2] - hit[2]
      const wgt = Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * sigma * sigma))
      if (wgt > 0.06) {
        patch.push(i, wgt, dx, dy, dz)
        minOff = Math.min(minOff, dy)
      }
    }
    this.grab = { patch: Float32Array.from(patch), minOff }
    this.target = [...hit]
  }

  endGrab() {
    this.grab = null
  }

  step(dt) {
    const S = this.substeps
    const h = dt / S
    const x = this.x
    const p = this.p
    const v = this.v
    const w = this.w
    const N = this.N
    const alpha = this.compliance()
    const at = alpha / (h * h)
    const drag = 1 - 0.35 * h
    const kdFrame = 0.02 + 0.55 * Math.pow(this.damping, 1.2)
    const kd = 1 - Math.pow(1 - kdFrame, 1 / S)
    for (let s = 0; s < S; s++) {
      for (let i = 0; i < N; i++) {
        const o = i * 3
        v[o] *= drag
        v[o + 1] *= drag
        v[o + 2] *= drag
        p[o] = x[o]
        p[o + 1] = x[o + 1]
        p[o + 2] = x[o + 2]
        x[o] += v[o] * h
        x[o + 1] += v[o + 1] * h
        x[o + 2] += v[o + 2] * h
      }
      this.solveGrab(h)
      this.solveAnchor()
      this.solveEdges(at)
      this.solveShape(at * 0.25)
      this.solveVolume(h)
      this.solveLimits()
      this.solveFloor()
      for (let i = 0; i < N * 3; i++) v[i] = (x[i] - p[i]) / h
      this.dampEdges(kd)
      if (!this.grab) {
        for (let i = 0; i < N; i++) {
          const o = i * 3
          const sp = v[o] * v[o] + v[o + 1] * v[o + 1] + v[o + 2] * v[o + 2]
          if (sp < 0.0009) {
            v[o] *= 0.985
            v[o + 1] *= 0.985
            v[o + 2] *= 0.985
          }
        }
      }
    }
    void w
    for (let i = 0; i < N * 3; i += 7) {
      if (!Number.isFinite(x[i]) || Math.abs(x[i]) > 50) {
        this.reset()
        return false
      }
    }
    return true
  }

  solveGrab(h) {
    if (!this.grab) return
    const g = this.grab.patch
    const x = this.x
    const t = this.target
    const lift = Math.max(0, 0.025 - (t[1] + this.grab.minOff))
    const ag = 5e-7 / (h * h)
    for (let k = 0; k < g.length; k += 5) {
      const i = g[k] * 3
      const wgt = g[k + 1]
      const wi = this.w[g[k]]
      const f = (wgt * wi) / (wi + ag)
      x[i] += (t[0] + g[k + 2] - x[i]) * f
      x[i + 1] += (t[1] + lift + g[k + 3] - x[i + 1]) * f
      x[i + 2] += (t[2] + g[k + 4] - x[i + 2]) * f
    }
  }

  solveEdges(at) {
    const x = this.x
    const w = this.w
    const E = this.L0.length
    const ed = this.edges
    for (let e = 0; e < E; e++) {
      const a = ed[e * 2]
      const b = ed[e * 2 + 1]
      const wa = w[a]
      const wb = w[b]
      const ia = a * 3
      const ib = b * 3
      const dx = x[ib] - x[ia]
      const dy = x[ib + 1] - x[ia + 1]
      const dz = x[ib + 2] - x[ia + 2]
      const L = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (L < 1e-9) continue
      const C = L - this.L0[e]
      const lam = -C / (wa + wb + at)
      const nx = dx / L
      const ny = dy / L
      const nz = dz / L
      x[ia] -= nx * lam * wa
      x[ia + 1] -= ny * lam * wa
      x[ia + 2] -= nz * lam * wa
      x[ib] += nx * lam * wb
      x[ib + 1] += ny * lam * wb
      x[ib + 2] += nz * lam * wb
    }
  }

  solveLimits() {
    const x = this.x
    const w = this.w
    const E = this.L0.length
    const ed = this.edges
    for (let e = 0; e < E; e++) {
      const a = ed[e * 2]
      const b = ed[e * 2 + 1]
      const ia = a * 3
      const ib = b * 3
      const dx = x[ib] - x[ia]
      const dy = x[ib + 1] - x[ia + 1]
      const dz = x[ib + 2] - x[ia + 2]
      const L = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const L0 = this.L0[e]
      let goal = L
      if (L > 1.8 * L0) goal = 1.8 * L0
      else if (L < 0.35 * L0) goal = 0.35 * L0
      else continue
      if (L < 1e-9) continue
      const wa = w[a]
      const wb = w[b]
      const s = (L - goal) / L / (wa + wb)
      x[ia] += dx * s * wa
      x[ia + 1] += dy * s * wa
      x[ia + 2] += dz * s * wa
      x[ib] -= dx * s * wb
      x[ib + 1] -= dy * s * wb
      x[ib + 2] -= dz * s * wb
    }
  }

  solveShape(at) {
    const x = this.x
    const tets = this.tets
    const D = this.DmInv
    const q = this.q
    const off = this.off
    const w = this.w
    for (let t = 0; t < this.M; t++) {
      const i0 = tets[t * 4] * 3
      const i1 = tets[t * 4 + 1] * 3
      const i2 = tets[t * 4 + 2] * 3
      const i3 = tets[t * 4 + 3] * 3
      const d1x = x[i1] - x[i0]
      const d1y = x[i1 + 1] - x[i0 + 1]
      const d1z = x[i1 + 2] - x[i0 + 2]
      const d2x = x[i2] - x[i0]
      const d2y = x[i2 + 1] - x[i0 + 1]
      const d2z = x[i2 + 2] - x[i0 + 2]
      const d3x = x[i3] - x[i0]
      const d3y = x[i3 + 1] - x[i0 + 1]
      const d3z = x[i3 + 2] - x[i0 + 2]
      const m = t * 9
      const a00 = d1x * D[m] + d2x * D[m + 3] + d3x * D[m + 6]
      const a01 = d1x * D[m + 1] + d2x * D[m + 4] + d3x * D[m + 7]
      const a02 = d1x * D[m + 2] + d2x * D[m + 5] + d3x * D[m + 8]
      const a10 = d1y * D[m] + d2y * D[m + 3] + d3y * D[m + 6]
      const a11 = d1y * D[m + 1] + d2y * D[m + 4] + d3y * D[m + 7]
      const a12 = d1y * D[m + 2] + d2y * D[m + 5] + d3y * D[m + 8]
      const a20 = d1z * D[m] + d2z * D[m + 3] + d3z * D[m + 6]
      const a21 = d1z * D[m + 1] + d2z * D[m + 4] + d3z * D[m + 7]
      const a22 = d1z * D[m + 2] + d2z * D[m + 5] + d3z * D[m + 8]
      let qx = q[t * 4]
      let qy = q[t * 4 + 1]
      let qz = q[t * 4 + 2]
      let qw = q[t * 4 + 3]
      let r00 = 1
      let r01 = 0
      let r02 = 0
      let r10 = 0
      let r11 = 1
      let r12 = 0
      let r20 = 0
      let r21 = 0
      let r22 = 1
      for (let it = 0; it < 1; it++) {
        r00 = 1 - 2 * (qy * qy + qz * qz)
        r01 = 2 * (qx * qy - qw * qz)
        r02 = 2 * (qx * qz + qw * qy)
        r10 = 2 * (qx * qy + qw * qz)
        r11 = 1 - 2 * (qx * qx + qz * qz)
        r12 = 2 * (qy * qz - qw * qx)
        r20 = 2 * (qx * qz - qw * qy)
        r21 = 2 * (qy * qz + qw * qx)
        r22 = 1 - 2 * (qx * qx + qy * qy)
        const ox = r10 * a20 - r20 * a10 + (r11 * a21 - r21 * a11) + (r12 * a22 - r22 * a12)
        const oy = r20 * a00 - r00 * a20 + (r21 * a01 - r01 * a21) + (r22 * a02 - r02 * a22)
        const oz = r00 * a10 - r10 * a00 + (r01 * a11 - r11 * a01) + (r02 * a12 - r12 * a02)
        const den = Math.abs(r00 * a00 + r10 * a10 + r20 * a20 + r01 * a01 + r11 * a11 + r21 * a21 + r02 * a02 + r12 * a12 + r22 * a22) + 1e-9
        const wx = ox / den
        const wy = oy / den
        const wz = oz / den
        const a2 = wx * wx + wy * wy + wz * wz
        if (a2 < 1e-18) break
        let s
        let bw
        if (a2 < 0.04) {
          s = 0.5 - a2 / 48
          bw = 1 - a2 / 8
        } else {
          const ang = Math.sqrt(a2)
          s = Math.sin(ang / 2) / ang
          bw = Math.cos(ang / 2)
        }
        const bx = wx * s
        const by = wy * s
        const bz = wz * s
        const nx = bw * qx + bx * qw + by * qz - bz * qy
        const ny = bw * qy - bx * qz + by * qw + bz * qx
        const nz = bw * qz + bx * qy - by * qx + bz * qw
        const nw = bw * qw - bx * qx - by * qy - bz * qz
        const il = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz + nw * nw)
        qx = nx * il
        qy = ny * il
        qz = nz * il
        qw = nw * il
      }
      r00 = 1 - 2 * (qy * qy + qz * qz)
      r01 = 2 * (qx * qy - qw * qz)
      r02 = 2 * (qx * qz + qw * qy)
      r10 = 2 * (qx * qy + qw * qz)
      r11 = 1 - 2 * (qx * qx + qz * qz)
      r12 = 2 * (qy * qz - qw * qx)
      r20 = 2 * (qx * qz - qw * qy)
      r21 = 2 * (qy * qz + qw * qx)
      r22 = 1 - 2 * (qx * qx + qy * qy)
      q[t * 4] = qx
      q[t * 4 + 1] = qy
      q[t * 4 + 2] = qz
      q[t * 4 + 3] = qw
      const cx = (x[i0] + x[i1] + x[i2] + x[i3]) / 4
      const cy = (x[i0 + 1] + x[i1 + 1] + x[i2 + 1] + x[i3 + 1]) / 4
      const cz = (x[i0 + 2] + x[i1 + 2] + x[i2 + 2] + x[i3 + 2]) / 4
      const o = t * 12
      {
        const ox = off[o + 0]
        const oy = off[o + 1]
        const oz = off[o + 2]
        const wi = w[i0 / 3]
        const f = wi / (wi + at)
        x[i0] += (cx + r00 * ox + r01 * oy + r02 * oz - x[i0]) * f
        x[i0 + 1] += (cy + r10 * ox + r11 * oy + r12 * oz - x[i0 + 1]) * f
        x[i0 + 2] += (cz + r20 * ox + r21 * oy + r22 * oz - x[i0 + 2]) * f
      }
      {
        const ox = off[o + 3]
        const oy = off[o + 4]
        const oz = off[o + 5]
        const wi = w[i1 / 3]
        const f = wi / (wi + at)
        x[i1] += (cx + r00 * ox + r01 * oy + r02 * oz - x[i1]) * f
        x[i1 + 1] += (cy + r10 * ox + r11 * oy + r12 * oz - x[i1 + 1]) * f
        x[i1 + 2] += (cz + r20 * ox + r21 * oy + r22 * oz - x[i1 + 2]) * f
      }
      {
        const ox = off[o + 6]
        const oy = off[o + 7]
        const oz = off[o + 8]
        const wi = w[i2 / 3]
        const f = wi / (wi + at)
        x[i2] += (cx + r00 * ox + r01 * oy + r02 * oz - x[i2]) * f
        x[i2 + 1] += (cy + r10 * ox + r11 * oy + r12 * oz - x[i2 + 1]) * f
        x[i2 + 2] += (cz + r20 * ox + r21 * oy + r22 * oz - x[i2 + 2]) * f
      }
      {
        const ox = off[o + 9]
        const oy = off[o + 10]
        const oz = off[o + 11]
        const wi = w[i3 / 3]
        const f = wi / (wi + at)
        x[i3] += (cx + r00 * ox + r01 * oy + r02 * oz - x[i3]) * f
        x[i3 + 1] += (cy + r10 * ox + r11 * oy + r12 * oz - x[i3 + 1]) * f
        x[i3 + 2] += (cz + r20 * ox + r21 * oy + r22 * oz - x[i3 + 2]) * f
      }
    }
  }

  solveVolume(h) {
    const x = this.x
    const w = this.w
    const tets = this.tets
    const av = 1e-13 / (h * h)
    for (let t = 0; t < this.M; t++) {
      const a = tets[t * 4]
      const b = tets[t * 4 + 1]
      const c = tets[t * 4 + 2]
      const d = tets[t * 4 + 3]
      const i0 = a * 3
      const i1 = b * 3
      const i2 = c * 3
      const i3 = d * 3
      const e1x = x[i1] - x[i0]
      const e1y = x[i1 + 1] - x[i0 + 1]
      const e1z = x[i1 + 2] - x[i0 + 2]
      const e2x = x[i2] - x[i0]
      const e2y = x[i2 + 1] - x[i0 + 1]
      const e2z = x[i2 + 2] - x[i0 + 2]
      const e3x = x[i3] - x[i0]
      const e3y = x[i3 + 1] - x[i0 + 1]
      const e3z = x[i3 + 2] - x[i0 + 2]
      const g1x = (e2y * e3z - e2z * e3y) / 6
      const g1y = (e2z * e3x - e2x * e3z) / 6
      const g1z = (e2x * e3y - e2y * e3x) / 6
      const g2x = (e3y * e1z - e3z * e1y) / 6
      const g2y = (e3z * e1x - e3x * e1z) / 6
      const g2z = (e3x * e1y - e3y * e1x) / 6
      const g3x = (e1y * e2z - e1z * e2y) / 6
      const g3y = (e1z * e2x - e1x * e2z) / 6
      const g3z = (e1x * e2y - e1y * e2x) / 6
      const g0x = -g1x - g2x - g3x
      const g0y = -g1y - g2y - g3y
      const g0z = -g1z - g2z - g3z
      const vol = e1x * g1x + e1y * g1y + e1z * g1z
      const C = vol - this.vol0[t]
      const wsum = w[a] * (g0x * g0x + g0y * g0y + g0z * g0z) + w[b] * (g1x * g1x + g1y * g1y + g1z * g1z) + w[c] * (g2x * g2x + g2y * g2y + g2z * g2z) + w[d] * (g3x * g3x + g3y * g3y + g3z * g3z)
      if (wsum < 1e-12) continue
      const lam = -C / (wsum + av)
      x[i0] += lam * w[a] * g0x
      x[i0 + 1] += lam * w[a] * g0y
      x[i0 + 2] += lam * w[a] * g0z
      x[i1] += lam * w[b] * g1x
      x[i1 + 1] += lam * w[b] * g1y
      x[i1 + 2] += lam * w[b] * g1z
      x[i2] += lam * w[c] * g2x
      x[i2 + 1] += lam * w[c] * g2y
      x[i2 + 2] += lam * w[c] * g2z
      x[i3] += lam * w[d] * g3x
      x[i3 + 1] += lam * w[d] * g3y
      x[i3 + 2] += lam * w[d] * g3z
    }
  }

  solveFloor() {
    const x = this.x
    const p = this.p
    const us = 0.9
    const uk = 0.6
    for (let i = 0; i < this.N; i++) {
      const o = i * 3
      const pen = -x[o + 1]
      if (pen < -0.004) continue
      if (pen > 0) x[o + 1] = 0
      const tx = x[o] - p[o]
      const tz = x[o + 2] - p[o + 2]
      const tl = Math.sqrt(tx * tx + tz * tz)
      const grip = Math.max(pen, 0) + (this.grab ? 0.0012 : 0.0002)
      if (tl < us * grip) {
        x[o] = p[o]
        x[o + 2] = p[o + 2]
      } else if (tl > 0) {
        const k = Math.min((uk * grip) / tl, 1)
        x[o] -= tx * k
        x[o + 2] -= tz * k
      }
    }
  }

  dampEdges(kd) {
    const v = this.v
    const x = this.x
    const w = this.w
    const ed = this.edges
    const E = this.L0.length
    for (let e = 0; e < E; e++) {
      const a = ed[e * 2]
      const b = ed[e * 2 + 1]
      const ia = a * 3
      const ib = b * 3
      let nx = x[ib] - x[ia]
      let ny = x[ib + 1] - x[ia + 1]
      let nz = x[ib + 2] - x[ia + 2]
      const L = Math.sqrt(nx * nx + ny * ny + nz * nz)
      if (L < 1e-9) continue
      nx /= L
      ny /= L
      nz /= L
      const dv = (v[ib] - v[ia]) * nx + (v[ib + 1] - v[ia + 1]) * ny + (v[ib + 2] - v[ia + 2]) * nz
      const wa = w[a]
      const wb = w[b]
      const s = (dv * kd) / (wa + wb)
      v[ia] += nx * s * wa
      v[ia + 1] += ny * s * wa
      v[ia + 2] += nz * s * wa
      v[ib] -= nx * s * wb
      v[ib + 1] -= ny * s * wb
      v[ib + 2] -= nz * s * wb
    }
  }
}
