import { perspective, ortho, lookAt, mul, invert, project, v3 } from './math.js'
import { buildCity } from './build.js'
import { truckMesh, podMesh, vanMesh, boatMesh, bladesMesh, turbineTowerMesh, jibMesh, chamberMesh, crateMesh, fillMesh, floorMesh } from './models.js'
import BodySim, { CARGO } from './sim.js'
import { DISTRICTS, DIST, SPOTS, BOARD_H, boardHeight } from './body.js'
import { sceneWGSL, shadowWGSL, glowWGSL, postWGSL } from './shaders.js'

const SHADOW = typeof window !== 'undefined' && window.innerWidth < 760 ? 2048 : 4096
const MSAA = 4
const CAM0 = { yaw: 0.0, pitch: 0.98, dist: 61, target: [0, 0.3, 3.3] }
const lerp = (a, b, t) => a + (b - a) * t
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

export default class GpuCity {
  static async device() {
    if (!navigator.gpu) throw new Error('WebGPU unavailable')
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No WebGPU adapter')
    return adapter.requestDevice()
  }

  constructor(canvas, device) {
    this.canvas = canvas
    this.device = device
    this.listeners = new Set()
    this.time = 0
    this.paused = false
    this.tilt = true
    this.speed = 1
    this.inset = 0
    this.shift = 0
    this.cam = { ...CAM0, target: [...CAM0.target] }
    this.goal = { ...CAM0, target: [...CAM0.target] }
    this.hover = null
    this.selected = null
    this.heartPhase = 0
    this.city = buildCity()
    this.sim = new BodySim()
    this.tap = null
    this.sim.on((t, v) => {
      if (t === 'ate') this.poke(DIST.stomach.x, DIST.stomach.z, 0.09)
      this.emit(t, v)
    })
    this.turbines = this.city.anchors.turbines.map(([x, z]) => ({ x, z, y: boardHeight(x, z), yaw: 0.6 }))
    this.boats = Array.from({ length: 6 }, (_, k) => ({ t: k / 6, col: [[0.95, 0.4, 0.3], [0.3, 0.6, 0.95], [0.98, 0.8, 0.2]][k % 3] }))
    this.ctx = canvas.getContext('webgpu')
    canvas.__cityOwner = this
    this.format = navigator.gpu.getPreferredCanvasFormat()
    this.ctx.configure({ device, format: this.format, alphaMode: 'opaque' })
    this.init()
    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement)
    this.bindPointer()
    this.last = performance.now()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  buffer(data, usage) {
    const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(data.byteLength / 4) * 4), usage, mappedAtCreation: true })
    new data.constructor(b.getMappedRange()).set(data)
    b.unmap()
    return b
  }

  init() {
    const d = this.device
    const B = GPUBufferUsage
    const m = this.city.mesh
    this.envVB = this.buffer(m.data, B.VERTEX)
    this.envIB = this.buffer(m.idx, B.INDEX)
    this.envCount = m.idx.length
    const types = {
      truck: [truckMesh(), 500],
      pod: [podMesh(), 500],
      van: [vanMesh(), 300],
      boat: [boatMesh(), 8],
      blades: [bladesMesh(), 4],
      tower: [turbineTowerMesh(), 4],
      jib: [jibMesh(), 4],
      chamber: [chamberMesh(), 4],
      crate: [crateMesh(), 80],
      fill: [fillMesh(), 8],
      floor: [floorMesh(), 48],
    }
    this.groups = {}
    for (const [k, [mesh, max]] of Object.entries(types)) {
      this.groups[k] = { vb: this.buffer(mesh.data, B.VERTEX), ib: this.buffer(mesh.idx, B.INDEX), count: mesh.idx.length, max, data: new Float32Array(max * 16), n: 0, inst: d.createBuffer({ size: max * 64, usage: B.VERTEX | B.COPY_DST }) }
    }
    this.glowMax = 900
    this.glowData = new Float32Array(this.glowMax * 8)
    this.glowBuf = d.createBuffer({ size: this.glowMax * 32, usage: B.VERTEX | B.COPY_DST })
    this.uni = new Float32Array(104)
    this.ubo = d.createBuffer({ size: 104 * 4, usage: B.UNIFORM | B.COPY_DST })
    this.shadowTex = d.createTexture({ size: [SHADOW, SHADOW], format: 'depth32float', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING })
    this.cmpSamp = d.createSampler({ compare: 'less', magFilter: 'linear', minFilter: 'linear' })
    this.linSamp = d.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' })
    const VF = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
    const F = GPUShaderStage.FRAGMENT
    const uni = { binding: 0, visibility: VF, buffer: { type: 'uniform' } }
    this.bglU = d.createBindGroupLayout({ entries: [uni] })
    this.bglLit = d.createBindGroupLayout({
      entries: [uni, { binding: 1, visibility: F, texture: { sampleType: 'depth' } }, { binding: 2, visibility: F, sampler: { type: 'comparison' } }, { binding: 3, visibility: F, texture: { sampleType: 'float' } }, { binding: 4, visibility: F, sampler: { type: 'filtering' } }],
    })
    const sk = this.city.skin
    this.skinTex = d.createTexture({ size: [sk.levels[0].w, sk.levels[0].h], format: 'rgba8unorm-srgb', mipLevelCount: sk.levels.length, usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST })
    sk.levels.forEach((lv, k) => d.queue.writeTexture({ texture: this.skinTex, mipLevel: k }, lv.data, { bytesPerRow: lv.w * 4, rowsPerImage: lv.h }, [lv.w, lv.h]))
    this.city.skin = null
    this.skinSamp = d.createSampler({ magFilter: 'linear', minFilter: 'linear', mipmapFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge', maxAnisotropy: 8 })
    this.bglPost = d.createBindGroupLayout({ entries: [uni, { binding: 1, visibility: F, texture: { sampleType: 'float' } }, { binding: 2, visibility: F, sampler: { type: 'filtering' } }] })
    this.bgU = d.createBindGroup({ layout: this.bglU, entries: [{ binding: 0, resource: { buffer: this.ubo } }] })
    this.bgLit = d.createBindGroup({
      layout: this.bglLit,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.shadowTex.createView() },
        { binding: 2, resource: this.cmpSamp },
        { binding: 3, resource: this.skinTex.createView() },
        { binding: 4, resource: this.skinSamp },
      ],
    })
    const mod = (code) => d.createShaderModule({ code })
    const mScene = mod(sceneWGSL)
    const mShadow = mod(shadowWGSL)
    const mGlow = mod(glowWGSL)
    const mPost = mod(postWGSL)
    this.modules = [mScene, mShadow, mGlow, mPost]
    const layout = (bgl) => d.createPipelineLayout({ bindGroupLayouts: [bgl] })
    const envAttr = [
      { shaderLocation: 0, offset: 0, format: 'float32x3' },
      { shaderLocation: 1, offset: 12, format: 'float32x3' },
      { shaderLocation: 2, offset: 24, format: 'float32x3' },
      { shaderLocation: 3, offset: 36, format: 'float32x4' },
    ]
    const envBuf = { arrayStride: 52, attributes: envAttr }
    const instBuf = {
      arrayStride: 64,
      stepMode: 'instance',
      attributes: [4, 5, 6, 7].map((loc, k) => ({ shaderLocation: loc, offset: k * 16, format: 'float32x4' })),
    }
    const hdr = 'rgba16float'
    const depth = { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less' }
    const ms = { count: MSAA }
    const sd = { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less', depthBias: 2, depthBiasSlopeScale: 2 }
    this.pShadow = d.createRenderPipeline({ layout: layout(this.bglU), vertex: { module: mShadow, entryPoint: 'vsShadow', buffers: [{ arrayStride: 52, attributes: [envAttr[0]] }] }, primitive: { cullMode: 'none' }, depthStencil: sd })
    this.pShadowInst = d.createRenderPipeline({ layout: layout(this.bglU), vertex: { module: mShadow, entryPoint: 'vsShadowInst', buffers: [{ arrayStride: 52, attributes: [envAttr[0]] }, instBuf] }, primitive: { cullMode: 'none' }, depthStencil: sd })
    this.pBack = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mScene, entryPoint: 'vsFull' },
      fragment: { module: mScene, entryPoint: 'fsBack', targets: [{ format: hdr }] },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'always' },
      multisample: ms,
    })
    this.pEnv = d.createRenderPipeline({
      layout: layout(this.bglLit),
      vertex: { module: mScene, entryPoint: 'vsEnv', buffers: [envBuf] },
      fragment: { module: mScene, entryPoint: 'fsScene', targets: [{ format: hdr }] },
      primitive: { cullMode: 'none' },
      depthStencil: depth,
      multisample: ms,
    })
    this.pInst = d.createRenderPipeline({
      layout: layout(this.bglLit),
      vertex: { module: mScene, entryPoint: 'vsInst', buffers: [envBuf, instBuf] },
      fragment: { module: mScene, entryPoint: 'fsScene', targets: [{ format: hdr }] },
      primitive: { cullMode: 'none' },
      depthStencil: depth,
      multisample: ms,
    })
    this.pGlow = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: {
        module: mGlow,
        entryPoint: 'vsGlow',
        buffers: [
          {
            arrayStride: 32,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x4' },
              { shaderLocation: 1, offset: 16, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: { module: mGlow, entryPoint: 'fsGlow', targets: [{ format: hdr, blend: { color: { srcFactor: 'one', dstFactor: 'one' }, alpha: { srcFactor: 'zero', dstFactor: 'one' } } }] },
      primitive: { topology: 'triangle-strip' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'less' },
      multisample: ms,
    })
    this.pPost = d.createRenderPipeline({
      layout: layout(this.bglPost),
      vertex: { module: mPost, entryPoint: 'vsFull' },
      fragment: { module: mPost, entryPoint: 'fsPost', targets: [{ format: this.format }] },
    })
    for (const mm of this.modules)
      mm.getCompilationInfo().then((info) => {
        for (const msg of info.messages) if (msg.type === 'error') console.error('WGSL', msg.lineNum, msg.message)
      })
  }

  resize() {
    const p = this.canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, p.clientWidth < 760 ? 2 : 1.5)
    const w = Math.max(2, Math.round(p.clientWidth * dpr))
    const h = Math.max(2, Math.round(p.clientHeight * dpr))
    this.canvas.width = w
    this.canvas.height = h
    this.cssW = p.clientWidth
    this.cssH = p.clientHeight
    this.W = w
    this.H = h
    const d = this.device
    for (const k of ['msColor', 'msDepth', 'hdrOut']) this[k] && this[k].destroy()
    const RA = GPUTextureUsage.RENDER_ATTACHMENT
    const TB = GPUTextureUsage.TEXTURE_BINDING
    this.msColor = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA, sampleCount: MSAA })
    this.msDepth = d.createTexture({ size: [w, h], format: 'depth32float', usage: RA, sampleCount: MSAA })
    this.hdrOut = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA | TB })
    this.bgPost = d.createBindGroup({
      layout: this.bglPost,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.hdrOut.createView() },
        { binding: 2, resource: this.linSamp },
      ],
    })
    const aspect = (this.cssW - this.inset) / Math.max(1, this.cssH)
    this.fitK = Math.max(1, Math.min(2, 0.55 / aspect))
  }

  setInset(px) {
    this.inset = px
    this.resize()
  }

  camera() {
    const c = this.cam
    const g = this.goal
    const k = 0.1
    c.yaw += (g.yaw - c.yaw) * k
    c.pitch += (g.pitch - c.pitch) * k
    c.dist += (g.dist - c.dist) * k
    for (let a = 0; a < 3; a++) c.target[a] += (g.target[a] - c.target[a]) * k
    const dist = c.dist * this.fitK
    const eye = [c.target[0] + Math.sin(c.yaw) * Math.cos(c.pitch) * dist, c.target[1] + Math.sin(c.pitch) * dist, c.target[2] + Math.cos(c.yaw) * Math.cos(c.pitch) * dist]
    this.eye = eye
    this.view = lookAt(eye, c.target, [0, 1, 0])
    this.proj = perspective((28 * Math.PI) / 180, this.W / this.H, 0.3, 200)
    const gs = this.inset / Math.max(1, this.cssW)
    this.shift += (gs - this.shift) * 0.12
    this.proj[8] = this.shift
    this.viewProj = mul(this.proj, this.view)
    this.invViewProj = invert(this.viewProj)
    const n = this.sim.s.night
    const L = v3.norm(mix3([-0.45, 0.78, -0.32], [0.35, 0.8, -0.4], n))
    this.sunDir = L
    const ctr = [0, 0, 1.0]
    const lv = lookAt(v3.add(ctr, v3.scale(L, 40)), ctr, [0, 1, 0])
    this.lightViewProj = mul(ortho(-19, 19, -19, 19, 5, 90), lv)
  }

  writeUniforms() {
    const u = this.uni
    const s = this.sim.s
    const n = s.night
    u.set(this.viewProj, 0)
    u.set(this.invViewProj, 16)
    u.set(this.lightViewProj, 32)
    u.set(this.view, 48)
    u.set([...this.eye, this.time], 64)
    u.set([...this.sunDir, lerp(2.3, 0.42, n)], 68)
    u.set([...mix3([1.0, 0.84, 0.66], [0.55, 0.66, 1.0], n), 0.85], 72)
    u.set([...mix3([0.36, 0.38, 0.48], [0.05, 0.06, 0.15], n), 0], 76)
    u.set([...mix3([0.21, 0.16, 0.11], [0.03, 0.025, 0.05], n), lerp(0.78, 1.15, n)], 80)
    u.set([0, 0, 0, 0], 84)
    u.set([n, s.exercise, s.jam, this.heartPhase], 88)
    const tp = this.tap
    u.set(tp ? [tp.x, tp.z, this.time - tp.t, tp.a] : [0, 0, -1, 0], 92)
    u.set([this.W, this.H, 1 / this.W, 1 / this.H], 96)
    const fp = project(this.viewProj, this.cam.target)
    u.set([(1 - fp[1]) / 2, lerp(0.09, 0.3, Math.min(1, Math.max(0, (this.cam.dist - 10) / 48))), this.tilt ? 1 : 0, 1.18], 100)
    this.device.queue.writeBuffer(this.ubo, 0, u)
  }

  put(g, m, tint) {
    const grp = this.groups[g]
    if (grp.n >= grp.max) return
    const o = grp.n * 16
    grp.data.set(m, o)
    grp.data.set(tint, o + 12)
    grp.n++
  }

  orient(x, y, z, fx, fy, fz) {
    const l = Math.hypot(fx, fy, fz) || 1
    fx /= l
    fy /= l
    fz /= l
    let ux = -fx * fy
    let uy = 1 - fy * fy
    let uz = -fz * fy
    const ul = Math.hypot(ux, uy, uz) || 1
    ux /= ul
    uy /= ul
    uz /= ul
    const zx = fy * uz - fz * uy
    const zy = fz * ux - fx * uz
    const zz = fx * uy - fy * ux
    return [fx, fy, fz, x, ux, uy, uz, y, zx, zy, zz, z]
  }

  mat(x, y, z, yaw, sx = 1, sy = sx, sz = sx) {
    const c = Math.cos(yaw)
    const s = Math.sin(yaw)
    return [c * sx, 0, -s * sx, x, 0, sy, 0, y, s * sz, 0, c * sz, z]
  }

  writeInstances() {
    for (const g of Object.values(this.groups)) g.n = 0
    const sim = this.sim
    const s = sim.s
    for (const v of sim.vehicles) {
      if (v.phase === 'queue') continue
      const c = CARGO[v.cargo]
      let p
      if (v.phase === 'dwell') {
        const seg = v.route[v.idx]
        p = sim.place({ route: v.route, idx: v.idx, s: Math.max(0, seg.road.len - 0.1) })
      } else p = sim.place(v)
      const ya = boardHeight(p.x + p.dx * 0.14, p.z + p.dz * 0.14)
      const yb = boardHeight(p.x - p.dx * 0.14, p.z - p.dz * 0.14)
      const k = c.kind === 'pod' ? 'pod' : c.kind === 'van' ? 'van' : 'truck'
      this.put(k, this.orient(p.x, (ya + yb) / 2 + 0.03, p.z, p.dx, (ya - yb) / 0.28, p.dz), [...c.color, v.id % 10])
    }
    const t = this.time
    const beat = this.heartPhase
    const pulse = Math.pow(Math.max(0, Math.sin(beat * Math.PI * 2)), 6)
    const H = DIST.heart
    const hg = boardHeight(H.x, H.z) + 0.5
    const ch = [
      [-0.22, -0.18, 0.34],
      [0.22, -0.18, 0.34],
      [-0.18, 0.2, 0.3],
      [0.2, 0.22, 0.28],
    ]
    ch.forEach(([dx, dz, r], k) => {
      const sc = r * (1 + pulse * (k < 2 ? 0.14 : 0.09))
      this.put('chamber', this.mat(H.x + dx, hg + 0.15 + (k < 2 ? 0.08 : 0), H.z + dz, 0, sc, sc * 0.9, sc), [0.86, 0.14, 0.18, 0])
    })
    const spin = t * (1.2 + (s.hr - 50) * 0.04)
    for (const tb of this.turbines) {
      this.put('tower', this.mat(tb.x, tb.y, tb.z, tb.yaw), [1, 1, 1, 0])
      const cs = Math.cos(spin + tb.x)
      const sn = Math.sin(spin + tb.x)
      const cy = Math.cos(tb.yaw)
      const sy = Math.sin(tb.yaw)
      this.put('blades', [cs * cy, sn, -cs * sy, tb.x + sy * 0.06, -sn * cy, cs, sn * sy, tb.y + 0.72, sy, 0, cy, tb.z + cy * 0.06], [1, 1, 1, 0])
    }
    const A = this.city.anchors
    for (const id of ['armL', 'armR', 'legL', 'legR']) {
      const site = A.sites[id]
      const floors = 2 + Math.round(s.muscle * 9)
      const sc = id.startsWith('leg') ? 1.0 : 0.82
      for (let f = 0; f < floors; f++) this.put('floor', this.mat(site.base[0], site.base[1] + f * 0.11 * sc, site.base[2], 0.2, sc, sc, sc), [0.86, 0.3, 0.3, 0])
      const busy = s.exercise > 0.2 || s.night > 0.5 || s.recentTrain > 0
      const a = busy ? t * 0.6 + id.length : 0.6 + id.length
      this.put('jib', this.mat(site.crane[0], site.crane[1], site.crane[2], a), [0.86, 0.3, 0.3, 0])
    }
    for (const sp of A.silos) {
      const h = 0.04 + s.fat * 0.5
      this.put('fill', this.mat(sp[0], sp[1] + 0.005, sp[2], 0, 0.154, h, 0.154), [1.0, 0.82, 0.28, 0])
    }
    for (const tk of A.tanks) {
      const h = 0.02 + s.hydration * 0.28
      this.put('fill', this.mat(tk[0], tk[1], tk[2], 0, 0.194, h, 0.194), [0.2, 0.62, 1.0, 0])
    }
    const stalls = A.stalls
    sim.crates.forEach((c, k) => {
      const st = stalls[k % stalls.length]
      const lvl = Math.floor(k / stalls.length)
      const off = ((k * 37) % 5) * 0.03 - 0.06
      this.put('crate', this.mat(st[0] + off, st[1] - 0.02 + lvl * 0.085, st[2] + off * 0.7, k), [...c.color, 0])
    })
    const canal = A.canal
    for (const b of this.boats) {
      b.t = (b.t + (0.012 + s.digesting * 0.03) * (1 / 60)) % 1
      const f = b.t * (canal.length - 1)
      const i = Math.floor(f)
      const p = canal[i]
      const q = canal[Math.min(canal.length - 1, i + 1)]
      const x = p[0] + (q[0] - p[0]) * (f - i)
      const z = p[1] + (q[1] - p[1]) * (f - i)
      this.put('boat', this.mat(x, boardHeight(x, z) + 0.015, z, Math.atan2(-(q[1] - p[1]), q[0] - p[0])), [...b.col, 0])
    }
    for (const g of Object.values(this.groups)) if (g.n) this.device.queue.writeBuffer(g.inst, 0, g.data, 0, g.n * 16)
  }

  writeGlows() {
    const s = this.sim.s
    const A = this.city.anchors
    let n = 0
    const add = (p, size, col, a) => {
      if (n >= this.glowMax || a <= 0.001) return
      this.glowData.set([p[0], p[1], p[2], size, col[0], col[1], col[2], a], n * 8)
      n++
    }
    for (const l of this.city.lights) add(l, 0.22, [1, 0.8, 0.5], s.night * 0.9)
    const pulse = Math.pow(Math.max(0, Math.sin(this.heartPhase * Math.PI * 2)), 6)
    const H = DIST.heart
    add([H.x, boardHeight(H.x, H.z) + 0.75, H.z], 1.6 + pulse * 0.5, [1, 0.25, 0.25], 0.35 + pulse * 0.6 + s.night * 0.4)
    for (const m of A.mitos) add(m, 0.6 + s.exercise * 0.9, [0.3, 1, 0.9], 0.08 + s.exercise * (0.9 + 0.3 * Math.sin(this.time * 6 + m[0])))
    const B = DIST.brain
    const t = this.time
    for (let k = 0; k < 26; k++) {
      const a = k * 2.4 + t * (0.6 + (k % 3) * 0.2)
      const r = 0.6 + (k % 5) * 0.28
      add([B.x + Math.cos(a) * r, boardHeight(B.x, B.z) + 0.55 + Math.sin(t * 2 + k) * 0.18, B.z + Math.sin(a) * r * 0.9], 0.12, [0.85, 0.6, 1], 0.6 + 0.4 * Math.sin(t * 5 + k) * s.focus)
    }
    const brake = Math.max(s.jam, s.night * 0.6)
    for (const v of this.sim.vehicles) {
      if (v.phase === 'dwell' || v.phase === 'queue') continue
      const flash = v.cargo === 'repair' || v.cargo === 'insulin'
      const stopped = brake > 0.05 && v.v < 0.25
      if (!flash && !stopped) continue
      const p = this.sim.place(v)
      const y = boardHeight(p.x, p.z)
      if (flash) add([p.x, y + 0.22, p.z], 0.18, CARGO[v.cargo].color, 0.5 * (0.5 + 0.5 * Math.sin(t * 12 + v.id)))
      if (stopped) add([p.x - p.dx * 0.17, y + 0.08, p.z - p.dz * 0.17], 0.16, [1, 0.08, 0.04], brake * 0.9)
    }
    this.glowCount = n
    this.device.queue.writeBuffer(this.glowBuf, 0, this.glowData, 0, n * 8)
  }

  render() {
    this.camera()
    this.writeUniforms()
    this.writeInstances()
    this.writeGlows()
    const d = this.device
    const enc = d.createCommandEncoder()
    let pass = enc.beginRenderPass({ colorAttachments: [], depthStencilAttachment: { view: this.shadowTex.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' } })
    pass.setBindGroup(0, this.bgU)
    pass.setPipeline(this.pShadow)
    pass.setVertexBuffer(0, this.envVB)
    pass.setIndexBuffer(this.envIB, 'uint32')
    pass.drawIndexed(this.envCount)
    pass.setPipeline(this.pShadowInst)
    for (const g of Object.values(this.groups)) {
      if (!g.n) continue
      pass.setVertexBuffer(0, g.vb)
      pass.setVertexBuffer(1, g.inst)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, g.n)
    }
    pass.end()
    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.msColor.createView(), resolveTarget: this.hdrOut.createView(), loadOp: 'clear', storeOp: 'discard', clearValue: [0, 0, 0, 1] }],
      depthStencilAttachment: { view: this.msDepth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    })
    pass.setPipeline(this.pBack)
    pass.setBindGroup(0, this.bgU)
    pass.draw(3)
    pass.setPipeline(this.pEnv)
    pass.setBindGroup(0, this.bgLit)
    pass.setVertexBuffer(0, this.envVB)
    pass.setIndexBuffer(this.envIB, 'uint32')
    pass.drawIndexed(this.envCount)
    pass.setPipeline(this.pInst)
    for (const g of Object.values(this.groups)) {
      if (!g.n) continue
      pass.setVertexBuffer(0, g.vb)
      pass.setVertexBuffer(1, g.inst)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, g.n)
    }
    pass.setBindGroup(0, this.bgU)
    pass.setPipeline(this.pGlow)
    pass.setVertexBuffer(0, this.glowBuf)
    if (this.glowCount) pass.draw(4, this.glowCount)
    pass.end()
    pass = enc.beginRenderPass({ colorAttachments: [{ view: this.ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] })
    pass.setPipeline(this.pPost)
    pass.setBindGroup(0, this.bgPost)
    pass.draw(3)
    pass.end()
    d.queue.submit([enc.finish()])
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop)
    const real = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) {
      const dt = real * this.speed
      this.time += dt
      this.heartPhase = (this.heartPhase + (dt * this.sim.s.hr) / 60) % 1
      this.sim.step(dt)
    }
    this.render()
    this.frame = (this.frame || 0) + 1
    if (this.frame % 6 === 0) this.emit('frame', this.sim.s)
  }

  screenOf(p) {
    const q = project(this.viewProj, p)
    return { x: ((q[0] + 1) / 2) * this.cssW, y: ((1 - q[1]) / 2) * this.cssH, z: q[2] }
  }

  labels() {
    const A = this.city.anchors
    return DISTRICTS.map((d) => {
      const a = A[d.id] || [d.x, BOARD_H + 0.6, d.z]
      return { id: d.id, ...this.screenOf(a) }
    })
  }

  ray(cx, cy) {
    const r = this.canvas.getBoundingClientRect()
    const nx = ((cx - r.left) / r.width) * 2 - 1
    const ny = -(((cy - r.top) / r.height) * 2 - 1)
    const a = project(this.invViewProj, [nx, ny, 0])
    const b = project(this.invViewProj, [nx, ny, 1])
    return { o: a, d: v3.norm(v3.sub(b, a)) }
  }

  poke(x, z, a) {
    this.tap = { x, z, t: this.time, a }
  }

  groundAt(cx, cy) {
    const { o, d } = this.ray(cx, cy)
    if (d[1] > -1e-4) return null
    const t = (0.9 - o[1]) / d[1]
    const p = v3.add(o, v3.scale(d, t))
    return boardHeight(p[0], p[2]) > 0.05 ? [p[0], p[2]] : null
  }

  districtAt(cx, cy) {
    const { o, d } = this.ray(cx, cy)
    if (d[1] > -1e-4) return null
    const t = (BOARD_H * 0.9 - o[1]) / d[1]
    const p = v3.add(o, v3.scale(d, t))
    let best = null
    let bd = Infinity
    for (const sp of SPOTS) {
      const q = Math.hypot(sp.x - p[0], sp.z - p[2]) / (Math.max(0.55, sp.r) * 1.3)
      if (q < 1 && q < bd) {
        bd = q
        best = sp.d.id
      }
    }
    return best
  }

  focus(id) {
    const ds = DIST[id]
    if (!ds) return
    this.selected = id
    this.goal = { yaw: this.goal.yaw, pitch: 0.78, dist: id === 'brain' || id === 'lungs' || id === 'kidneys' ? 11 : 8.5, target: ds.alt ? [(ds.x + ds.alt[0]) / 2, BOARD_H, (ds.z + ds.alt[1]) / 2] : [ds.x, BOARD_H, ds.z] }
    this.emit('district', id)
  }

  resetView() {
    this.goal = { ...CAM0, target: [...CAM0.target] }
    this.selected = null
    this.emit('district', null)
  }

  bindPointer() {
    const el = this.canvas
    let start = null
    let mode = null
    const pts = new Map()
    let pinch = null
    this.onDown = (e) => {
      pts.set(e.pointerId, [e.clientX, e.clientY])
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), dist: this.goal.dist }
        mode = 'pinch'
        return
      }
      start = { x: e.clientX, y: e.clientY, yaw: this.goal.yaw, pitch: this.goal.pitch, target: [...this.goal.target] }
      mode = e.button === 2 || e.shiftKey ? 'pan' : 'orbit'
      this.emit('interact')
    }
    this.onMove = (e) => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY])
      if (mode === 'pinch' && pts.size >= 2) {
        const [a, b] = [...pts.values()]
        const dd = Math.hypot(a[0] - b[0], a[1] - b[1])
        this.goal.dist = Math.max(6, Math.min(75, (pinch.dist * pinch.d) / Math.max(20, dd)))
        return
      }
      if (!mode) {
        if (e.pointerType === 'mouse') {
          const h = this.districtAt(e.clientX, e.clientY)
          if (h !== this.hover) {
            this.hover = h
            el.style.cursor = h ? 'pointer' : ''
            this.emit('hover', h)
          }
        }
        return
      }
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) > 6) start.moved = true
      if (!start.moved) return
      if (mode === 'orbit') {
        this.goal.yaw = start.yaw - dx * 0.005
        this.goal.pitch = Math.max(0.35, Math.min(1.35, start.pitch + dy * 0.004))
      } else if (mode === 'pan') {
        const s = this.goal.dist * 0.0018
        const cy = Math.cos(this.goal.yaw)
        const sy = Math.sin(this.goal.yaw)
        this.goal.target[0] = Math.max(-8, Math.min(8, start.target[0] - (dx * cy + dy * sy) * s))
        this.goal.target[2] = Math.max(-15, Math.min(17, start.target[2] - (-dx * sy + dy * cy) * s))
      }
    }
    this.onUp = (e) => {
      pts.delete(e.pointerId)
      if (mode === 'pinch') {
        if (pts.size === 0) mode = null
        return
      }
      if (mode && start && !start.moved) {
        const id = this.districtAt(e.clientX, e.clientY)
        const hit = this.groundAt(e.clientX, e.clientY)
        if (hit) this.poke(hit[0], hit[1], 0.12)
        if (id) this.focus(id)
      }
      mode = null
    }
    this.onWheel = (e) => {
      e.preventDefault()
      this.goal.dist = Math.max(6, Math.min(75, this.goal.dist * Math.exp(e.deltaY * 0.0012)))
    }
    this.onCtx = (e) => e.preventDefault()
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('wheel', this.onWheel, { passive: false })
    el.addEventListener('contextmenu', this.onCtx)
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit(type, v) {
    this.listeners.forEach((fn) => fn(type, v))
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    const el = this.canvas
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    el.removeEventListener('wheel', this.onWheel)
    el.removeEventListener('contextmenu', this.onCtx)
    if (el.__cityOwner === this) this.ctx.unconfigure()
    this.device.destroy()
  }
}
