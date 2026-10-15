import SoftBody from './softbody.js'
import { buildCreature } from './build.js'
import { SPECIES } from './anatomy.js'
import { height } from './terrain.js'
import { inRect } from './layout.js'

const FEEL = {
  cow: { firm: 1.25, damp: 1.25, anchor: 0.022, speed: 0.42, grav: 9.8 },
  sheep: { firm: 0.7, damp: 1.1, anchor: 0.018, speed: 0.5, grav: 9.8 },
  hen: { firm: 1.0, damp: 0.7, anchor: 0.03, speed: 0.55, grav: 9.8 },
  chick: { firm: 1.0, damp: 0.55, anchor: 0.035, speed: 0.7, grav: 9.8 },
  pig: { firm: 0.9, damp: 0.9, anchor: 0.02, speed: 0.45, grav: 9.8 },
  cat: { firm: 0.95, damp: 0.8, anchor: 0.03, speed: 0, grav: 9.8 },
  ghost: { firm: 0.6, damp: 0.6, anchor: 0.012, speed: 0, grav: 0 },
}

const cache = new Map()

function rotMat(rx, ry, rz) {
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)
  return [cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz, -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz, sy * cx, -sx, cy * cx]
}

export default class Creature {
  constructor(cfg, index) {
    this.cfg = cfg
    this.index = index
    this.species = cfg.species
    const key = cfg.species + JSON.stringify(cfg.variant)
    if (!cache.has(key)) {
      const def = SPECIES[cfg.species](cfg.variant)
      cache.set(key, { def, built: buildCreature(def) })
    }
    const { def, built } = cache.get(key)
    this.def = def
    this.built = built
    this.sim = built.sim
    this.ren = built.render
    this.radius = built.radius
    this.feel = FEEL[cfg.species]
    this.groundFn = cfg.ground || ((x, z) => height(x, z))
    this.body = new SoftBody(built.sim, this.groundFn)
    this.body.firmK = this.feel.firm
    this.body.dampK = this.feel.damp
    this.body.anchor = this.feel.anchor
    this.body.gravity = this.feel.grav
    this.pose = def.parts.map(() => ({ rx: 0, ry: 0, rz: 0, tx: 0, ty: 0, tz: 0, sx: 1, sy: 1, sz: 1 }))
    this.partIdx = Object.fromEntries(def.parts.map((p, i) => [p.name, i]))
    this.mats = def.parts.map(() => new Float64Array(12))
    this.Xt = new Float64Array(this.sim.rest.length)
    this.pos = new Float32Array(this.ren.V * 3)
    this.gpuParts = new Float32Array(this.sim.rest.length / 3 * 4)
    this.awake = 0
    this.root = { x: cfg.x, z: cfg.z, yaw: cfg.yaw ?? 0, y: 0 }
    this.home = cfg.area
    this.state = 'idle'
    this.timer = 1 + Math.random() * 3
    this.target = null
    this.walkPhase = Math.random() * 6
    this.t = Math.random() * 100
    this.blinkT = 2 + Math.random() * 4
    this.blink = 0
    this.peck = 0
    this.flap = 0
    this.swish = 0
    this.look = 0
    this.lookGoal = 0
    this.grabbed = false
    this.maxStretch = 0
    this.cool = 0
    this.hover = false
    this.wobble = 0
    this.placeRoot()
    this.writeTarget()
    this.body.x.set(this.Xt)
    this.body.p.set(this.Xt)
    this.body.warmRotations()
  }

  placeRoot() {
    if (this.species === 'ghost') this.root.y = height(this.root.x, this.root.z) + 1.5
    else this.root.y = this.groundFn(this.root.x, this.root.z)
  }

  partMatrix(k) {
    const part = this.def.parts[k]
    const ps = this.pose[k]
    const R = rotMat(ps.rx, ps.ry, ps.rz)
    const [px, py, pz] = part.pivot
    const m = this.mats[k]
    const a = [R[0] * ps.sx, R[1] * ps.sx, R[2] * ps.sx, R[3] * ps.sy, R[4] * ps.sy, R[5] * ps.sy, R[6] * ps.sz, R[7] * ps.sz, R[8] * ps.sz]
    const tx = px + ps.tx - (a[0] * px + a[3] * py + a[6] * pz)
    const ty = py + ps.ty - (a[1] * px + a[4] * py + a[7] * pz)
    const tz = pz + ps.tz - (a[2] * px + a[5] * py + a[8] * pz)
    if (part.parent >= 0) {
      const P = this.mats[part.parent]
      for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) m[c * 3 + r] = P[r] * a[c * 3] + P[3 + r] * a[c * 3 + 1] + P[6 + r] * a[c * 3 + 2]
      m[9] = P[0] * tx + P[3] * ty + P[6] * tz + P[9]
      m[10] = P[1] * tx + P[4] * ty + P[7] * tz + P[10]
      m[11] = P[2] * tx + P[5] * ty + P[8] * tz + P[11]
    } else {
      m.set(a)
      m[9] = tx
      m[10] = ty
      m[11] = tz
    }
  }

  wake(sec) {
    if (this.awake <= 0) {
      const q = this.body.q
      for (let t = 0; t < this.body.M; t++) {
        q[t * 4] = 0
        q[t * 4 + 1] = 0
        q[t * 4 + 2] = 0
        q[t * 4 + 3] = 1
      }
      this.needTarget = true
    }
    this.awake = Math.max(this.awake, sec)
  }

  simulate(dt, sub) {
    if (this.awake > 0) {
      this.awake -= dt
      if (this.needTarget) {
        this.body.setTarget(this.Xt)
        this.needTarget = false
      }
      this.body.substeps = this.grabbed ? 10 : sub
      this.body.step(dt)
      return true
    }
    const x = this.body.x
    const X = this.Xt
    const k = 0.3
    for (let i = 0; i < x.length; i++) x[i] += (X[i] - x[i]) * k
    this.body.p.set(x)
    this.body.v.fill(0)
    return false
  }

  writeTarget(full = true) {
    const n = this.def.parts.length
    for (let k = 0; k < n; k++) this.partMatrix(k)
    const X = this.sim.rest
    const A = this.sim.partA
    const B = this.sim.partB
    const W = this.sim.partW
    const c = Math.cos(this.root.yaw)
    const s = Math.sin(this.root.yaw)
    const rx = this.root.x
    const ry = this.root.y
    const rz = this.root.z
    const Xt = this.Xt
    const mats = this.mats
    for (let i = 0; i < this.body.N; i++) {
      const x = X[i * 3]
      const y = X[i * 3 + 1]
      const z = X[i * 3 + 2]
      const ma = mats[A[i]]
      const mb = mats[B[i]]
      const w = W[i]
      const u = 1 - w
      const lx = (ma[0] * x + ma[3] * y + ma[6] * z + ma[9]) * w + (mb[0] * x + mb[3] * y + mb[6] * z + mb[9]) * u
      const ly = (ma[1] * x + ma[4] * y + ma[7] * z + ma[10]) * w + (mb[1] * x + mb[4] * y + mb[7] * z + mb[10]) * u
      const lz = (ma[2] * x + ma[5] * y + ma[8] * z + ma[11]) * w + (mb[2] * x + mb[5] * y + mb[8] * z + mb[11]) * u
      Xt[i * 3] = rx + lx * c + lz * s
      Xt[i * 3 + 1] = ry + ly
      Xt[i * 3 + 2] = rz - lx * s + lz * c
    }
    if (full) this.body.setTarget(Xt)
  }

  set(name, k, v) {
    const i = this.partIdx[name]
    if (i !== undefined) this.pose[i][k] = v
  }

  animate(dt, moving, ctx) {
    const t = this.t
    const sp = this.species
    for (const p of this.pose) {
      p.rx = 0
      p.ry = 0
      p.rz = 0
      p.tx = 0
      p.ty = 0
      p.tz = 0
      p.sx = 1
      p.sy = 1
      p.sz = 1
    }
    const breath = 1 + 0.018 * Math.sin(t * (sp === 'chick' ? 5 : 2.1))
    this.set('body', 'sx', breath)
    this.set('body', 'sy', 1 + (breath - 1) * 0.6)
    this.blinkT -= dt
    if (this.blinkT < 0) {
      this.blink = 0.16
      this.blinkT = 2.5 + Math.random() * 4
    }
    if (this.blink > 0) {
      this.blink -= dt
      this.set('eyes', 'sy', 0.15)
    }
    const amp = moving ? 1 : 0
    const ph = this.walkPhase
    const legs = sp === 'hen' || sp === 'chick' ? 0.75 : 0.45
    this.set('legFL', 'rx', Math.sin(ph) * legs * amp)
    this.set('legBR', 'rx', Math.sin(ph) * legs * amp)
    this.set('legFR', 'rx', -Math.sin(ph) * legs * amp)
    this.set('legBL', 'rx', -Math.sin(ph) * legs * amp)
    this.set('legL', 'rx', Math.sin(ph) * legs * amp)
    this.set('legR', 'rx', -Math.sin(ph) * legs * amp)
    if (moving) this.set('body', 'ty', Math.abs(Math.sin(ph)) * (sp === 'chick' ? 0.03 : sp === 'hen' ? 0.025 : 0.03))
    this.look += (this.lookGoal - this.look) * Math.min(1, dt * 3)
    const headY = this.look
    if (sp === 'cow') {
      this.swish = Math.max(0, this.swish - dt)
      this.set('tail', 'rz', Math.sin(t * 1.6) * 0.32 + Math.sin(t * 9) * 0.5 * this.swish)
      this.set('tail', 'rx', 0.1 * Math.sin(t * 0.9))
      const chew = moving ? 0 : 1
      this.set('head', 'rx', 0.05 * Math.sin(t * 5.2) * chew + (this.state === 'idle' && Math.sin(t * 0.13) > 0.6 ? -0.45 : 0))
      this.set('head', 'ry', headY + 0.04 * Math.sin(t * 2.6) * chew)
      this.set('earL', 'rz', -0.15 + (Math.sin(t * 7) > 0.97 ? -0.4 : 0) + 0.08 * Math.sin(t * 1.3))
      this.set('earR', 'rz', 0.15 + (Math.sin(t * 6.3 + 1) > 0.97 ? 0.4 : 0) - 0.08 * Math.sin(t * 1.3))
      if (Math.random() < dt * 0.15) this.swish = 1.2
    } else if (sp === 'sheep') {
      this.set('tail', 'rz', Math.sin(t * 6) * 0.25)
      const graze = this.state === 'idle' && Math.sin(t * 0.21 + this.index) > 0.3 ? 0.55 : 0
      this.set('head', 'rx', -graze + 0.03 * Math.sin(t * 4))
      this.set('head', 'ry', headY)
      this.set('earL', 'rz', -0.2 * Math.sin(t * 3.1) - 0.1)
      this.set('earR', 'rz', 0.2 * Math.sin(t * 3.1 + 0.6) + 0.1)
    } else if (sp === 'hen' || sp === 'chick') {
      if (this.peck <= 0 && !moving && Math.random() < dt * 0.6) this.peck = 0.9
      if (this.peck > 0) {
        this.peck -= dt
        const k = Math.max(0, Math.sin(this.peck * 18))
        this.set('head', 'rx', -0.9 * k)
        this.set('head', 'tz', 0.04 * k)
      } else {
        this.set('head', 'rx', 0.08 * Math.sin(t * 3))
        this.set('head', 'tz', moving ? 0.03 * Math.sin(ph * 2) : 0)
      }
      this.set('head', 'ry', headY + 0.25 * Math.sin(t * 0.9 + this.index))
      if (this.flap <= 0 && Math.random() < dt * 0.08) this.flap = 1.1
      if (this.flap > 0) {
        this.flap -= dt
        const a = Math.abs(Math.sin(this.flap * 16)) * 0.9
        this.set('wingL', 'rz', a)
        this.set('wingR', 'rz', -a)
      }
    } else if (sp === 'pig') {
      this.set('head', 'rx', 0.06 * Math.sin(t * 9) * (moving ? 0.4 : 1) + (this.state === 'idle' ? -0.25 : 0))
      this.set('head', 'ry', headY + 0.1 * Math.sin(t * 0.7))
      this.set('tail', 'rz', Math.sin(t * 10) * 0.3)
      this.set('earL', 'rx', 0.15 * Math.sin(t * 4))
      this.set('earR', 'rx', 0.15 * Math.sin(t * 4 + 1))
    } else if (sp === 'cat') {
      this.set('tail', 'ry', Math.sin(t * 1.1) * 0.35)
      this.set('tail', 'rz', Math.sin(t * 0.7) * 0.08)
      this.set('head', 'ry', headY + 0.3 * Math.sin(t * 0.35))
      this.set('head', 'rz', 0.08 * Math.sin(t * 0.9))
    } else if (sp === 'ghost') {
      this.set('armL', 'rz', 0.5 * Math.sin(t * 2.2))
      this.set('armR', 'rz', -0.5 * Math.sin(t * 2.2 + 0.8))
      this.set('body', 'ty', 0.12 * Math.sin(t * 1.4))
      this.set('body', 'rz', 0.08 * Math.sin(t * 0.9))
    }
    void ctx
  }

  chooseTarget(herd) {
    const a = this.home
    const m = 0.5
    if (this.species === 'chick' && this.cfg.follow != null) {
      const hen = herd[this.cfg.follow]
      const fx = Math.sin(hen.root.yaw)
      const fz = Math.cos(hen.root.yaw)
      const k = this.cfg.slot
      return [hen.root.x - fx * (0.45 + 0.18 * k) + fz * (k - 1) * 0.25, hen.root.z - fz * (0.45 + 0.18 * k) - fx * (k - 1) * 0.25]
    }
    let x = a.x0 + m + Math.random() * (a.x1 - a.x0 - 2 * m)
    let z = a.z0 + m + Math.random() * (a.z1 - a.z0 - 2 * m)
    if (this.species === 'sheep') {
      const flock = herd.filter((o) => o.species === 'sheep' && o !== this)
      if (flock.length) {
        const cx = flock.reduce((s, o) => s + o.root.x, 0) / flock.length
        const cz = flock.reduce((s, o) => s + o.root.z, 0) / flock.length
        x = x * 0.4 + cx * 0.6 + (Math.random() - 0.5) * 1.2
        z = z * 0.4 + cz * 0.6 + (Math.random() - 0.5) * 1.2
      }
    }
    x = Math.min(a.x1 - m, Math.max(a.x0 + m, x))
    z = Math.min(a.z1 - m, Math.max(a.z0 + m, z))
    return [x, z]
  }

  think(dt, herd, autonomous) {
    let dx = 0
    let dz = 0
    let dyaw = 0
    let moving = false
    const sp = this.species
    if (this.grabbed || !autonomous) return { dx, dz, dyaw, moving }
    if (sp === 'ghost') {
      const g = this.cfg.loop
      this.loopT = (this.loopT ?? Math.random() * 10) + dt
      const nx = g.x + Math.sin(this.loopT * 0.23) * g.rx
      const nz = g.z + Math.sin(this.loopT * 0.37) * g.rz
      dx = (nx - this.root.x) * Math.min(1, dt * 1.5)
      dz = (nz - this.root.z) * Math.min(1, dt * 1.5)
      const want = Math.atan2(Math.cos(this.loopT * 0.23) * g.rx * 0.23, 0.6)
      dyaw = (want - this.root.yaw) * Math.min(1, dt * 1.2)
      return { dx, dz, dyaw, moving: false }
    }
    if (sp === 'cat') {
      this.timer -= dt
      return { dx, dz, dyaw, moving }
    }
    this.timer -= dt
    if (this.state === 'settle') {
      if (this.timer <= 0) {
        this.state = 'idle'
        this.timer = 0.5
        if (!inRect(this.home, this.root.x, this.root.z, 0.2)) {
          this.state = 'walk'
          this.target = this.chooseTarget(herd)
        }
      }
      return { dx, dz, dyaw, moving }
    }
    if (this.state === 'idle') {
      if (this.species === 'chick' && this.cfg.follow != null) {
        const tgt = this.chooseTarget(herd)
        if (Math.hypot(tgt[0] - this.root.x, tgt[1] - this.root.z) > 0.5) {
          this.state = 'walk'
          this.target = tgt
        }
      }
      if (this.timer <= 0) {
        this.state = 'walk'
        this.target = this.chooseTarget(herd)
      }
      if (sp === 'sheep' && Math.random() < dt * 0.08) {
        this.wake(2.5)
        this.body.impulse(0, 2.6, 0)
        this.hopped = true
      }
      if (sp === 'chick' && Math.random() < dt * 0.15) {
        this.wake(2)
        this.body.impulse(0, 1.4, 0)
      }
      return { dx, dz, dyaw, moving }
    }
    if (this.state === 'walk') {
      if (this.species === 'chick' && this.cfg.follow != null && Math.random() < dt * 2) this.target = this.chooseTarget(herd)
      const tx = this.target[0] - this.root.x
      const tz = this.target[1] - this.root.z
      const dist = Math.hypot(tx, tz)
      if (dist < 0.15) {
        this.state = 'idle'
        this.timer = sp === 'chick' ? 0.4 + Math.random() : 2.5 + Math.random() * 5
        return { dx, dz, dyaw, moving }
      }
      const want = Math.atan2(tx, tz)
      let diff = want - this.root.yaw
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      const turn = 1.8 * dt
      dyaw = Math.max(-turn, Math.min(turn, diff))
      const facing = Math.max(0, Math.cos(diff))
      let speed = this.feel.speed * (0.25 + 0.75 * facing) * Math.min(1, dist / 0.4 + 0.3)
      for (const o of herd) {
        if (o === this || o.species === 'ghost' || o.species === 'cat') continue
        const ox = o.root.x - this.root.x
        const oz = o.root.z - this.root.z
        const od = Math.hypot(ox, oz)
        const minD = (this.radius + o.radius) * 0.62
        if (od < minD) {
          const ahead = (ox * Math.sin(this.root.yaw) + oz * Math.cos(this.root.yaw)) / (od || 1)
          if (ahead > 0.3) speed *= Math.max(0, (od - minD * 0.7) / (minD * 0.3))
          dyaw += 0.6 * dt * (ox * Math.cos(this.root.yaw) - oz * Math.sin(this.root.yaw) > 0 ? -1 : 1)
        }
      }
      const step = speed * dt
      dx = Math.sin(this.root.yaw + dyaw) * step
      dz = Math.cos(this.root.yaw + dyaw) * step
      this.walkPhase += step * (sp === 'hen' || sp === 'chick' ? 26 : sp === 'sheep' ? 11 : 7)
      moving = true
    }
    return { dx, dz, dyaw, moving }
  }

  grabPoint() {
    return [this.grabOrigin[0] + this.root.x - this.rootAtGrab[0], this.grabOrigin[1] + this.root.y - this.rootAtGrab[2], this.grabOrigin[2] + this.root.z - this.rootAtGrab[1]]
  }

  followGrab() {
    if (!this.grabbed || !this.raw) return
    const o = this.grabPoint()
    let dx = this.raw[0] - o[0]
    let dy = this.raw[1] - o[1]
    let dz = this.raw[2] - o[2]
    const L = Math.hypot(dx, dy, dz)
    const max = 0.85 + this.radius * 0.3
    if (L > 1e-6) {
      const k = (max * Math.tanh(L / max)) / L
      dx *= k
      dy *= k
      dz *= k
    }
    const tgt = [o[0] + dx, o[1] + dy, o[2] + dz]
    const gy = this.groundFn(tgt[0], tgt[2])
    if (tgt[1] < gy + 0.04) tgt[1] = gy + 0.04
    this.body.target = tgt
    this.maxStretch = Math.max(this.maxStretch, Math.hypot(dx, dy, dz))
    this.dragGoal = [this.raw[0] - this.grabOff[0], this.raw[2] - this.grabOff[1]]
  }

  update(dt, herd, autonomous, opts = {}) {
    this.t += dt
    this.cool = Math.max(0, this.cool - dt)
    this.followGrab()
    const { dx, dz, dyaw, moving } = this.think(dt, herd, autonomous)
    let mx = dx
    let mz = dz
    if (this.grabbed && this.dragGoal && this.species !== 'cat') {
      const gx = this.dragGoal[0] - this.root.x
      const gz = this.dragGoal[1] - this.root.z
      const gl = Math.hypot(gx, gz)
      const sp = Math.min((gl - 0.8) * 1.6, 2.4) * dt
      if (gl > 0.8) {
        mx = (gx / gl) * sp
        mz = (gz / gl) * sp
      }
    }
    if (this.cfg.anchorTo) {
      const a = this.cfg.anchorTo()
      mx = a.x - this.root.x
      mz = a.z - this.root.z
    }
    const oy = this.root.y
    this.root.x += mx
    this.root.z += mz
    this.root.yaw += dyaw
    if (this.cfg.anchorTo) this.root.y = this.cfg.anchorTo().y
    else this.placeRoot()
    const dy = this.root.y - oy
    if (mx || mz || dy || dyaw) this.body.moveRigid(mx, dy, mz, dyaw, this.root.x - mx, this.root.z - mz)
    if (moving && opts.walkSim) this.wake(0.4)
    if (this.grabbed) this.wake(4)
    this.animate(dt, moving, opts)
    this.writeTarget(this.awake > 0)
  }

  startGrab(hit) {
    this.wake(4)
    this.needTarget = true
    this.grabbed = true
    this.maxStretch = 0
    this.grabOrigin = [...hit]
    this.rootAtGrab = [this.root.x, this.root.z, this.root.y]
    this.grabOff = [hit[0] - this.root.x, hit[2] - this.root.z]
    this.raw = [...hit]
    this.body.startGrab(hit)
    this.dragGoal = null
  }

  dragTo(p) {
    this.raw = p
  }

  endGrab() {
    this.grabbed = false
    this.body.endGrab()
    this.dragGoal = null
    this.raw = null
    if (this.species !== 'cat') {
      const c = this.body.centroid()
      let rcx = 0
      let rcz = 0
      const X = this.Xt
      for (let i = 0; i < this.body.N; i++) {
        rcx += X[i * 3]
        rcz += X[i * 3 + 2]
      }
      rcx /= this.body.N
      rcz /= this.body.N
      this.root.x += c[0] - rcx
      this.root.z += c[2] - rcz
      if (this.species !== 'ghost') this.root.y = this.groundFn(this.root.x, this.root.z)
    }
    this.state = 'settle'
    this.timer = 1.2
    this.wake(4)
    const squish = this.maxStretch
    return squish
  }

  nudge() {
    this.wake(4)
    this.needTarget = true
    const a = Math.random() * Math.PI * 2
    this.body.impulse(Math.cos(a) * 1.2, 2.2, Math.sin(a) * 1.2)
    this.body.squeeze(0.35)
  }

  boop() {
    this.wake(3.5)
    this.needTarget = true
    this.body.squeeze(0.45)
  }

  reset() {
    this.root = { x: this.cfg.x, z: this.cfg.z, yaw: this.cfg.yaw ?? 0, y: 0 }
    this.placeRoot()
    this.state = 'idle'
    this.timer = 1 + Math.random() * 2
    this.grabbed = false
    this.body.endGrab()
    for (const p of this.pose) Object.assign(p, { rx: 0, ry: 0, rz: 0, tx: 0, ty: 0, tz: 0, sx: 1, sy: 1, sz: 1 })
    this.writeTarget()
    this.body.reset()
    this.body.warmRotations()
  }

  skinPos() {
    const { bindTet, bindW, V } = this.ren
    const tets = this.sim.tets
    const x = this.body.x
    const pos = this.pos
    for (let i = 0; i < V; i++) {
      const t = bindTet[i] * 4
      const a = tets[t] * 3
      const b = tets[t + 1] * 3
      const c = tets[t + 2] * 3
      const e = tets[t + 3] * 3
      const w0 = bindW[i * 4]
      const w1 = bindW[i * 4 + 1]
      const w2 = bindW[i * 4 + 2]
      const w3 = bindW[i * 4 + 3]
      pos[i * 3] = x[a] * w0 + x[b] * w1 + x[c] * w2 + x[e] * w3
      pos[i * 3 + 1] = x[a + 1] * w0 + x[b + 1] * w1 + x[c + 1] * w2 + x[e + 1] * w3
      pos[i * 3 + 2] = x[a + 2] * w0 + x[b + 2] * w1 + x[c + 2] * w2 + x[e + 2] * w3
    }
  }

  pack() {
    const x = this.body.x
    const out = this.gpuParts
    let cx = 0
    let cy = 0
    let cz = 0
    for (let i = 0; i < this.body.N; i++) {
      const px = x[i * 3]
      const py = x[i * 3 + 1]
      const pz = x[i * 3 + 2]
      out[i * 4] = px
      out[i * 4 + 1] = py
      out[i * 4 + 2] = pz
      cx += px
      cy += py
      cz += pz
    }
    const n = this.body.N
    this.center = [cx / n, cy / n, cz / n]
    return out
  }
}
