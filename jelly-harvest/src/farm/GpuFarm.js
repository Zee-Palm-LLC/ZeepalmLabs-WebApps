import { perspective, ortho, lookAt, mul, invert, project, v3 } from './math.js'
import { buildTerrain, height, bakeHeight } from './terrain.js'
import { buildWorld, grassInstances } from './world.js'
import { pumpkinMesh, hayMesh, lanternMesh } from './props.js'
import Creature from './creature.js'
import { herdConfig, PALETTES } from './farmdata.js'
import { POND, LANTERNS } from './layout.js'
import { WATER } from './terrain.js'
import { skyWGSL, envWGSL, shadowWGSL, grassWGSL, backWGSL, jellyWGSL, glowWGSL, lineWGSL, postWGSL } from './shaders.js'
import { MeshBuilder } from './mesh.js'
import { rng } from './noise.js'

const DT = 1 / 60
const SHADOW = 2048
const MSAA = 4
const MOON_SKY = [-0.27, 0.17, -1]
const CAM0 = { yaw: 0.0, pitch: 0.17, dist: 14.2, target: [0.1, 0.95, -1.2] }

function pondMesh() {
  const mb = new MeshBuilder()
  const c = mb.vert([POND.x, WATER, POND.z], [0, 1, 0], [0, 0, 0], [7, 0, 0, 0])
  const seg = 48
  for (let k = 0; k <= seg; k++) {
    const a = (k / seg) * Math.PI * 2
    mb.vert([POND.x + Math.cos(a) * POND.rx * 1.08, WATER, POND.z + Math.sin(a) * POND.rz * 1.08], [0, 1, 0], [0, 0, 0], [7, 0, 0, 0])
  }
  for (let k = 0; k < seg; k++) mb.tri(c, c + 2 + k, c + 1 + k)
  return mb.build()
}

export default class GpuFarm {
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
    this.acc = 0
    this.paused = false
    this.slow = false
    this.showMesh = false
    this.glow = true
    this.firmness = 0.45
    this.wobble = 0.55
    this.paletteIdx = 0
    this.selected = -1
    this.hovered = -1
    this.cam = { ...CAM0, target: [...CAM0.target] }
    this.goal = { ...CAM0, target: [...CAM0.target] }

    bakeHeight()
    const world = buildWorld()
    this.world = world
    const terrain = buildTerrain()
    const pond = pondMesh()
    this.envData = this.merge([terrain, world.mesh, pond])
    this.grass = grassInstances()
    this.meshes = { pumpkin: pumpkinMesh(), hay: hayMesh(), lantern: lanternMesh() }
    this.initProps()

    const groundFns = {
      cat: (x, z) => Math.max(height(x, z), this.baleTop(this.props.find((p) => p.cat), x, z)),
      catAnchor: () => {
        const b = this.props.find((p) => p.cat)
        return { x: b.x + Math.sin(b.yaw) * 0.0, z: b.z, y: b.y + 0.55 * b.s }
      },
    }
    this.herd = herdConfig(groundFns).map((cfg, i) => new Creature(cfg, i))
    for (const c of this.herd) {
      c.body.firmness = this.firmness
      c.body.damping = 1 - this.wobble
    }

    this.ctx = canvas.getContext('webgpu')
    canvas.__farmOwner = this
    this.format = navigator.gpu.getPreferredCanvasFormat()
    this.ctx.configure({ device, format: this.format, alphaMode: 'opaque' })
    this.initResources()
    this.applyPalette(0)
    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement)
    this.bindPointer()
    this.last = performance.now()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  merge(list) {
    let nv = 0
    let ni = 0
    for (const m of list) {
      nv += m.data.length
      ni += m.idx.length
    }
    const data = new Float32Array(nv)
    const idx = new Uint32Array(ni)
    let ov = 0
    let oi = 0
    for (const m of list) {
      data.set(m.data, ov)
      const base = ov / 13
      for (let k = 0; k < m.idx.length; k++) idx[oi + k] = m.idx[k] + base
      ov += m.data.length
      oi += m.idx.length
    }
    for (let k = 0; k < data.length; k += 13) {
      if (Math.abs(data[k + 9] - 3) < 0.5) {
        const lift = data[k + 1] - height(data[k], data[k + 2])
        data[k + 11] *= Math.pow(Math.min(1, Math.max(0, lift / 1.4)), 1.4)
      }
    }
    return { data, idx }
  }

  initProps() {
    const r = rng(99)
    this.props = []
    for (const p of this.world.pumpkins)
      this.props.push({ type: 'pumpkin', x: p.x, z: p.z, x0: p.x, z0: p.z, yaw: p.carved ? 0.15 + (r() - 0.5) * 0.5 : r() * 6, yaw0: 0, s: p.s * 0.5, carved: p.carved, face: p.face ?? 0, lit: true, wob: 9, seed: r() * 10, drag: true })
    for (const h of this.world.hay) this.props.push({ type: 'hay', x: h.x, z: h.z, x0: h.x, z0: h.z, yaw: h.yaw, yaw0: h.yaw, s: 1, wob: 9, seed: r() * 10, drag: true, cat: !!h.cat })
    for (const l of LANTERNS) {
      const g = height(l.x, l.z)
      const arm = l.x > 0 ? -1 : 1
      const pos = l.wall ? [l.x, g + 1.75, l.z + 0.15] : [l.x + arm * 0.35, g + 1.08, l.z]
      this.props.push({ type: 'lantern', x: pos[0], z: pos[2], y: pos[1], fixedY: true, yaw: 0, s: 1, lit: true, wob: 9, seed: r() * 10, drag: false })
    }
    for (const p of this.props) {
      p.yaw0 = p.yaw
      if (!p.fixedY) p.y = height(p.x, p.z)
    }
  }

  baleTop(b, x, z) {
    if (!b) return -Infinity
    const dx = x - b.x
    const dz = z - b.z
    const c = Math.cos(b.yaw)
    const s = Math.sin(b.yaw)
    const lx = dx * c - dz * s
    const lz = dx * s + dz * c
    if (Math.abs(lx) < 0.55 && Math.abs(lz) < 0.31) return b.y + 0.55
    return -Infinity
  }

  buffer(data, usage) {
    const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(data.byteLength / 4) * 4), usage, mappedAtCreation: true })
    new data.constructor(b.getMappedRange()).set(data)
    b.unmap()
    return b
  }

  initResources() {
    const d = this.device
    const B = GPUBufferUsage
    this.envVB = this.buffer(this.envData.data, B.VERTEX)
    this.envIB = this.buffer(this.envData.idx, B.INDEX)
    this.envCount = this.envData.idx.length
    this.grassVB = this.buffer(this.grass, B.VERTEX)
    this.grassCount = this.grass.length / 8
    this.grassIB = this.buffer(new Uint16Array([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6, 0]), B.INDEX)
    this.propGpu = {}
    for (const [k, m] of Object.entries(this.meshes)) {
      const n = this.props.filter((p) => p.type === k).length
      this.propGpu[k] = { vb: this.buffer(m.data, B.VERTEX), ib: this.buffer(m.idx, B.INDEX), count: m.idx.length, inst: d.createBuffer({ size: Math.max(64, n * 64), usage: B.VERTEX | B.COPY_DST }), n, data: new Float32Array(n * 16) }
    }
    this.bglAnimal = d.createBindGroupLayout({
      entries: [0, 1, 2].map((binding) => ({ binding, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } })),
    })
    this.animalGpu = this.herd.map((c) => {
      const V = c.ren.V
      const st = new ArrayBuffer(V * 60)
      const u32 = new Uint32Array(st)
      const f32 = new Float32Array(st)
      for (let i = 0; i < V; i++) {
        const o = i * 15
        u32[o] = c.ren.bindTet[i]
        f32.set(c.ren.bindW.subarray(i * 4, i * 4 + 4), o + 1)
        f32.set(c.ren.normal.subarray(i * 3, i * 3 + 3), o + 5)
        f32.set(c.ren.rest.subarray(i * 3, i * 3 + 3), o + 8)
        f32.set(c.ren.color.subarray(i * 4, i * 4 + 4), o + 11)
      }
      const M = c.sim.tets.length / 4
      const X = c.sim.rest
      const T = c.sim.tets
      const dmi = new Float32Array(M * 12)
      for (let t = 0; t < M; t++) {
        const [i0, i1, i2, i3] = [T[t * 4] * 3, T[t * 4 + 1] * 3, T[t * 4 + 2] * 3, T[t * 4 + 3] * 3]
        const a = [X[i1] - X[i0], X[i2] - X[i0], X[i3] - X[i0]]
        const b = [X[i1 + 1] - X[i0 + 1], X[i2 + 1] - X[i0 + 1], X[i3 + 1] - X[i0 + 1]]
        const cc = [X[i1 + 2] - X[i0 + 2], X[i2 + 2] - X[i0 + 2], X[i3 + 2] - X[i0 + 2]]
        const det = a[0] * (b[1] * cc[2] - b[2] * cc[1]) - a[1] * (b[0] * cc[2] - b[2] * cc[0]) + a[2] * (b[0] * cc[1] - b[1] * cc[0])
        const k = 1 / det
        dmi.set([(b[1] * cc[2] - b[2] * cc[1]) * k, (a[2] * cc[1] - a[1] * cc[2]) * k, (a[1] * b[2] - a[2] * b[1]) * k, 0], t * 12)
        dmi.set([(b[2] * cc[0] - b[0] * cc[2]) * k, (a[0] * cc[2] - a[2] * cc[0]) * k, (a[2] * b[0] - a[0] * b[2]) * k, 0], t * 12 + 4)
        dmi.set([(b[0] * cc[1] - b[1] * cc[0]) * k, (a[1] * cc[0] - a[0] * cc[1]) * k, (a[0] * b[1] - a[1] * b[0]) * k, 0], t * 12 + 8)
      }
      const parts = d.createBuffer({ size: c.body.N * 16, usage: B.STORAGE | B.VERTEX | B.COPY_DST })
      const tets = this.buffer(c.sim.tets, B.STORAGE)
      const dm = this.buffer(dmi, B.STORAGE)
      return {
        parts,
        st: this.buffer(new Uint8Array(st), B.VERTEX),
        ib: this.buffer(c.ren.indices, B.INDEX),
        count: c.ren.indices.length,
        bg: d.createBindGroup({
          layout: this.bglAnimal,
          entries: [
            { binding: 0, resource: { buffer: parts } },
            { binding: 1, resource: { buffer: tets } },
            { binding: 2, resource: { buffer: dm } },
          ],
        }),
        lineIB: this.buffer(c.sim.edges, B.INDEX),
        lineCount: c.sim.edges.length,
      }
    })
    this.animalBuf = d.createBuffer({ size: this.herd.length * 32, usage: B.STORAGE | B.COPY_DST })
    this.animalData = new Float32Array(this.herd.length * 8)
    this.glowMax = 400
    this.glowBuf = d.createBuffer({ size: this.glowMax * 48, usage: B.VERTEX | B.COPY_DST })
    this.glowData = new Float32Array(this.glowMax * 12)
    this.initStaticGlows()
    const r = rng(5)
    const bats = []
    for (let k = 0; k < 7; k++) bats.push(r(), 0.7 + r() * 0.6, 6 + r() * 6, 0.45 + r() * 0.35)
    this.batVB = this.buffer(new Float32Array(bats), B.VERTEX)
    this.ubo = d.createBuffer({ size: 384 * 4, usage: B.UNIFORM | B.COPY_DST })
    this.uni = new Float32Array(384)

    this.shadowTex = d.createTexture({ size: [SHADOW, SHADOW], format: 'depth32float', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING })
    this.linSamp = d.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' })
    this.cmpSamp = d.createSampler({ compare: 'less', magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' })

    const VF = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
    const F = GPUShaderStage.FRAGMENT
    const uni = { binding: 0, visibility: VF, buffer: { type: 'uniform' } }
    const sh = [
      { binding: 1, visibility: F, texture: { sampleType: 'depth' } },
      { binding: 2, visibility: F, sampler: { type: 'comparison' } },
    ]
    const st = { binding: 3, visibility: VF, buffer: { type: 'read-only-storage' } }
    this.bglU = d.createBindGroupLayout({ entries: [uni] })
    this.bglLit = d.createBindGroupLayout({ entries: [uni, ...sh] })
    this.bglBack = d.createBindGroupLayout({ entries: [uni, st] })
    this.bglJelly = d.createBindGroupLayout({
      entries: [
        uni,
        ...sh,
        st,
        { binding: 4, visibility: F, texture: { sampleType: 'float' } },
        { binding: 5, visibility: F, sampler: { type: 'filtering' } },
        { binding: 6, visibility: F, texture: { sampleType: 'unfilterable-float' } },
      ],
    })
    this.bglPost = d.createBindGroupLayout({ entries: [uni, { binding: 1, visibility: F, texture: { sampleType: 'unfilterable-float' } }] })
    this.bgU = d.createBindGroup({ layout: this.bglU, entries: [{ binding: 0, resource: { buffer: this.ubo } }] })
    this.bgLit = d.createBindGroup({
      layout: this.bglLit,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.shadowTex.createView() },
        { binding: 2, resource: this.cmpSamp },
      ],
    })
    this.bgBack = d.createBindGroup({
      layout: this.bglBack,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 3, resource: { buffer: this.animalBuf } },
      ],
    })

    const mod = (code) => d.createShaderModule({ code })
    const mSky = mod(skyWGSL)
    const mEnv = mod(envWGSL)
    const mShadow = mod(shadowWGSL)
    const mGrass = mod(grassWGSL)
    const mBack = mod(backWGSL)
    const mJelly = mod(jellyWGSL)
    const mGlow = mod(glowWGSL)
    const mLine = mod(lineWGSL)
    const mPost = mod(postWGSL)
    this.modules = [mSky, mEnv, mShadow, mGrass, mBack, mJelly, mGlow, mLine, mPost]
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
      attributes: [
        { shaderLocation: 4, offset: 0, format: 'float32x4' },
        { shaderLocation: 5, offset: 16, format: 'float32x4' },
        { shaderLocation: 6, offset: 32, format: 'float32x4' },
        { shaderLocation: 7, offset: 48, format: 'float32x4' },
      ],
    }
    const jellyBufs = [
      {
        arrayStride: 60,
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'uint32' },
          { shaderLocation: 1, offset: 4, format: 'float32x4' },
          { shaderLocation: 2, offset: 20, format: 'float32x3' },
          { shaderLocation: 3, offset: 32, format: 'float32x3' },
          { shaderLocation: 4, offset: 44, format: 'float32x4' },
        ],
      },
    ]
    const layout2 = (bgl) => d.createPipelineLayout({ bindGroupLayouts: [bgl, this.bglAnimal] })
    const depth = { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less' }
    const ms = { count: MSAA }
    const hdr = 'rgba16float'
    const shadowDepth = { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less', depthBias: 2, depthBiasSlopeScale: 2.5 }
    this.pShadowEnv = d.createRenderPipeline({ layout: layout(this.bglU), vertex: { module: mShadow, entryPoint: 'vsShadowEnv', buffers: [envBuf] }, primitive: { cullMode: 'none' }, depthStencil: shadowDepth })
    this.pShadowProp = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mShadow, entryPoint: 'vsShadowProp', buffers: [{ arrayStride: 52, attributes: [envAttr[0]] }, instBuf] },
      primitive: { cullMode: 'none' },
      depthStencil: shadowDepth,
    })
    this.pShadowJelly = d.createRenderPipeline({
      layout: layout2(this.bglU),
      vertex: { module: mShadow, entryPoint: 'vsShadowJelly', buffers: jellyBufs },
      primitive: { cullMode: 'none' },
      depthStencil: shadowDepth,
    })
    this.pSky = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mSky, entryPoint: 'vsFull' },
      fragment: { module: mSky, entryPoint: 'fsSky', targets: [{ format: hdr }] },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'always' },
      multisample: ms,
    })
    this.pEnv = d.createRenderPipeline({
      layout: layout(this.bglLit),
      vertex: { module: mEnv, entryPoint: 'vsEnv', buffers: [envBuf] },
      fragment: { module: mEnv, entryPoint: 'fsEnv', targets: [{ format: hdr }] },
      primitive: { cullMode: 'none' },
      depthStencil: depth,
      multisample: ms,
    })
    this.pProp = d.createRenderPipeline({
      layout: layout(this.bglLit),
      vertex: { module: mEnv, entryPoint: 'vsProp', buffers: [envBuf, instBuf] },
      fragment: { module: mEnv, entryPoint: 'fsEnv', targets: [{ format: hdr }] },
      primitive: { cullMode: 'none' },
      depthStencil: depth,
      multisample: ms,
    })
    this.pGrass = d.createRenderPipeline({
      layout: layout(this.bglLit),
      vertex: {
        module: mGrass,
        entryPoint: 'vsGrass',
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
      fragment: { module: mGrass, entryPoint: 'fsGrass', targets: [{ format: hdr }] },
      primitive: { cullMode: 'none' },
      depthStencil: depth,
      multisample: ms,
    })
    this.pBack = d.createRenderPipeline({
      layout: layout2(this.bglBack),
      vertex: { module: mBack, entryPoint: 'vsJelly', buffers: jellyBufs },
      fragment: { module: mBack, entryPoint: 'fsBack', targets: [{ format: 'r32float' }] },
      primitive: { cullMode: 'front' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less' },
    })
    this.pJelly = d.createRenderPipeline({
      layout: layout2(this.bglJelly),
      vertex: { module: mJelly, entryPoint: 'vsJelly', buffers: jellyBufs },
      fragment: { module: mJelly, entryPoint: 'fsJelly', targets: [{ format: hdr }] },
      primitive: { cullMode: 'back' },
      depthStencil: depth,
      multisample: ms,
    })
    const add = { color: { srcFactor: 'one', dstFactor: 'one' }, alpha: { srcFactor: 'zero', dstFactor: 'one' } }
    this.pGlow = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: {
        module: mGlow,
        entryPoint: 'vsGlow',
        buffers: [
          {
            arrayStride: 48,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x4' },
              { shaderLocation: 1, offset: 16, format: 'float32x4' },
              { shaderLocation: 2, offset: 32, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: { module: mGlow, entryPoint: 'fsGlow', targets: [{ format: hdr, blend: add }] },
      primitive: { topology: 'triangle-strip' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'less' },
      multisample: ms,
    })
    this.pBat = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mGlow, entryPoint: 'vsBat', buffers: [{ arrayStride: 16, stepMode: 'instance', attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }] }] },
      fragment: {
        module: mGlow,
        entryPoint: 'fsBat',
        targets: [{ format: hdr, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }],
      },
      primitive: { topology: 'triangle-strip' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'less' },
      multisample: ms,
    })
    this.pLine = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mLine, entryPoint: 'vsLine', buffers: [{ arrayStride: 16, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }] },
      fragment: {
        module: mLine,
        entryPoint: 'fsLine',
        targets: [{ format: hdr, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }],
      },
      primitive: { topology: 'line-list' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: false, depthCompare: 'always' },
      multisample: ms,
    })
    this.pPost = d.createRenderPipeline({
      layout: layout(this.bglPost),
      vertex: { module: mPost, entryPoint: 'vsFull' },
      fragment: { module: mPost, entryPoint: 'fsPost', targets: [{ format: this.format }] },
    })
    for (const m of this.modules)
      m.getCompilationInfo().then((info) => {
        for (const msg of info.messages) if (msg.type === 'error') console.error('WGSL', msg.lineNum, msg.message)
      })
  }

  initStaticGlows() {
    const g = []
    for (const l of this.world.lights) g.push([...l.p, 0.9 * Math.sqrt(l.i), ...l.c, 0.35, 3, 0, 1, 0])
    const r = rng(31)
    const fly = []
    for (let k = 0; k < 70; k++) {
      const zone = r()
      let x
      let z
      if (zone < 0.45) {
        x = POND.x + (r() - 0.5) * 6
        z = POND.z + (r() - 0.5) * 4
      } else {
        x = (r() - 0.5) * 22
        z = -8 + r() * 14
      }
      fly.push([x, height(x, z) + 0.5 + r() * 1.4, z, 0.09, 0.85, 1.0, 0.35, 1.6, 1, r(), 0, 0])
    }
    const parts = []
    for (let k = 0; k < 90; k++) {
      const x = (r() - 0.5) * 20
      const z = -9 + r() * 15
      const c = r() > 0.5 ? [0.8, 0.5, 1.0] : [1.0, 0.8, 0.4]
      parts.push([x, height(x, z) + 0.2, z, 0.05, ...c, 0.9, 2, r(), 0, 0])
    }
    this.staticGlows = [...g, ...fly, ...parts]
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
    for (const k of ['sceneTex', 'backTex', 'backDepth', 'msColor', 'msDepth', 'hdrOut']) this[k] && this[k].destroy()
    const RA = GPUTextureUsage.RENDER_ATTACHMENT
    const TB = GPUTextureUsage.TEXTURE_BINDING
    this.sceneTex = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA | TB })
    this.backTex = d.createTexture({ size: [w, h], format: 'r32float', usage: RA | TB })
    this.backDepth = d.createTexture({ size: [w, h], format: 'depth32float', usage: RA })
    this.msColor = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA, sampleCount: MSAA })
    this.msDepth = d.createTexture({ size: [w, h], format: 'depth32float', usage: RA, sampleCount: MSAA })
    this.hdrOut = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA | TB })
    this.bgJelly = d.createBindGroup({
      layout: this.bglJelly,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.shadowTex.createView() },
        { binding: 2, resource: this.cmpSamp },
        { binding: 3, resource: { buffer: this.animalBuf } },
        { binding: 4, resource: this.sceneTex.createView() },
        { binding: 5, resource: this.linSamp },
        { binding: 6, resource: this.backTex.createView() },
      ],
    })
    this.bgPost = d.createBindGroup({
      layout: this.bglPost,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.hdrOut.createView() },
      ],
    })
    this.narrow = this.cssW < 760
    const aspect = (this.cssW - (this.inset || 0)) / Math.max(1, this.cssH)
    this.fitK = Math.max(1, Math.min(2.25, 1.45 / aspect))
    const wasPortrait = this.portrait
    this.portrait = aspect < 0.8
    if (this.portrait !== wasPortrait) {
      this.goal = this.camDefault()
      if (wasPortrait === undefined) this.cam = this.camDefault()
    }
  }

  camera() {
    const c = this.cam
    const g = this.goal
    const k = 0.12
    c.yaw += (g.yaw - c.yaw) * k
    c.pitch += (g.pitch - c.pitch) * k
    c.dist += (g.dist - c.dist) * k
    for (let a = 0; a < 3; a++) c.target[a] += (g.target[a] - c.target[a]) * k
    const dist = c.dist * this.fitK
    const eye = [c.target[0] + Math.sin(c.yaw) * Math.cos(c.pitch) * dist, c.target[1] + Math.sin(c.pitch) * dist, c.target[2] + Math.cos(c.yaw) * Math.cos(c.pitch) * dist]
    const gy = height(eye[0], eye[2]) + 0.8
    if (eye[1] < gy) eye[1] = gy
    this.eye = eye
    this.view = lookAt(eye, c.target, [0, 1, 0])
    const aspect = this.W / this.H
    this.proj = perspective((38 * Math.PI) / 180, aspect, 0.15, 140)
    const goalShift = (this.inset || 0) / Math.max(1, this.cssW)
    this.shift = (this.shift || 0) + (goalShift - (this.shift || 0)) * 0.12
    this.proj[8] = this.shift
    this.viewProj = mul(this.proj, this.view)
    this.invViewProj = invert(this.viewProj)
    const L = v3.norm(PALETTES[this.paletteIdx].moonDir.slice(0, 3))
    const ctr = [c.target[0] * 0.5, 0, c.target[2] * 0.5 - 1]
    const lv = lookAt(v3.add(ctr, v3.scale(L, 40)), ctr, [0, 1, 0])
    this.lightViewProj = mul(ortho(-19, 19, -19, 19, 5, 90), lv)
  }

  applyPalette(i) {
    this.paletteIdx = i
    const p = PALETTES[i]
    this.pal = p
    this.herd.forEach((c, k) => {
      const t = p.tint[c.species] || [1, 1, 1]
      const dens = c.def.density
      const opaque = { chick: 7, hen: 3.5, cat: 5, pig: 1.6, cow: 0.6, sheep: 0, ghost: 0 }[c.species]
      this.animalData.set([t[0], t[1], t[2], dens, c.species === 'ghost' ? 0.18 : 0, k * 3.7, 0, opaque], k * 8)
    })
  }

  setPalette(i) {
    this.applyPalette(i)
    this.emit('palette', i)
  }

  writeUniforms() {
    const u = this.uni
    const p = this.pal
    u.set(this.viewProj, 0)
    u.set(this.invViewProj, 16)
    u.set(this.lightViewProj, 32)
    u.set(this.view, 48)
    u.set([...this.eye, this.time], 64)
    const md = v3.norm(p.moonDir.slice(0, 3))
    u.set([...md, p.moonDir[3]], 68)
    u.set(p.moonCol, 72)
    u.set(p.skyTop, 76)
    u.set(p.skyHorizon, 80)
    u.set(p.ambSky, 84)
    u.set(p.ambGround, 88)
    u.set([p.fogCol[0], p.fogCol[1], p.fogCol[2], p.fogCol[3] * (this.glow ? 1 : 0.4)], 92)
    u.set(p.grassA, 96)
    u.set(p.grassB, 100)
    u.set(p.dirt, 104)
    u.set(p.path, 108)
    const ms = v3.norm(MOON_SKY)
    u.set([...ms, p.sunSize], 112)
    u.set([this.W, this.H, 1 / this.W, 1 / this.H], 116)
    const lights = this.lightList()
    u.set([this.showMesh ? 1 : 0, lights.length / 8, Math.min(16, this.herd.length), p.sun ? 1 : 0], 120)
    u.set([p.warm[0], p.warm[1], p.warm[2], p.warm[3] * (this.glow ? 1 : 0.45)], 124)
    u.fill(0, 128, 384)
    u.set(lights, 128)
    let k = 0
    for (const c of this.herd) {
      if (k >= 16 || !c.center) continue
      u.set([c.center[0], 0, c.center[2], c.radius * 0.75], 320 + k * 4)
      k++
    }
    this.device.queue.writeBuffer(this.ubo, 0, u)
    for (const c of this.herd) this.animalData[c.index * 8 + 6] = c.index === this.selected ? 1 : c.index === this.hovered ? 0.55 : 0
    this.device.queue.writeBuffer(this.animalBuf, 0, this.animalData)
  }

  lightList() {
    const out = []
    const push = (p, c, i, r) => out.length < 192 && out.push(p[0], p[1], p[2], r, c[0], c[1], c[2], i)
    for (const l of this.world.lights) push(l.p, l.c, l.i, l.r)
    const t = this.time
    for (const p of this.props) {
      if (p.type === 'lantern' && p.lit) push([p.x, p.y + 0.18, p.z], [1, 0.62, 0.28], 2.2 * (0.92 + 0.08 * Math.sin(t * 13 + p.seed * 3)), 4.2)
      if (p.type === 'pumpkin' && p.carved && p.lit) push([p.x, p.y + 0.72 * p.s, p.z], [1, 0.52, 0.14], 2.6 * (0.85 + 0.15 * Math.sin(t * 11 + p.seed * 7)), 3.6)
    }
    return out
  }

  writeProps() {
    const t = this.time
    for (const [k, g] of Object.entries(this.propGpu)) {
      let n = 0
      for (const p of this.props) {
        if (p.type !== k) continue
        p.wob += 1 / 60
        const w = Math.exp(-p.wob * 3.2) * Math.sin(p.wob * 18)
        const sy = p.s * (1 - 0.14 * w)
        const sxz = p.s * (1 + 0.08 * w)
        const ky = p.held ? 1.08 : 1
        const c = Math.cos(p.yaw)
        const s = Math.sin(p.yaw)
        const lift = p.held ? 0.25 : 0
        const o = n * 16
        g.data.set([c * sxz, 0, -s * sxz, p.x, 0, sy * ky, 0, p.y + lift, s * sxz, 0, c * sxz, p.z], o)
        const face = p.type === 'pumpkin' ? (p.carved ? p.face : -1) : 0
        g.data.set([p.lit === false ? 0 : 1, face, p.seed, 0], o + 12)
        n++
      }
      this.device.queue.writeBuffer(g.inst, 0, g.data)
    }
    void t
  }

  writeGlows() {
    const list = [...this.staticGlows]
    for (const p of this.props) {
      if (p.type === 'lantern' && p.lit) list.push([p.x, p.y + 0.18, p.z, 0.7, 1, 0.62, 0.3, 0.55, 3, 0, 1, 0])
      if (p.type === 'pumpkin' && p.carved && p.lit) list.push([p.x, p.y + 0.72 * p.s, p.z + 0.1, 1.3 * p.s * 2, 1, 0.5, 0.12, 0.3, 3, 0, 1, 0])
    }
    this.glowCount = Math.min(this.glowMax, list.length)
    for (let k = 0; k < this.glowCount; k++) this.glowData.set(list[k], k * 12)
    this.device.queue.writeBuffer(this.glowBuf, 0, this.glowData, 0, this.glowCount * 12)
  }

  render() {
    this.camera()
    this.writeUniforms()
    this.writeProps()
    this.writeGlows()
    const d = this.device
    const enc = d.createCommandEncoder()
    for (let k = 0; k < this.herd.length; k++) d.queue.writeBuffer(this.animalGpu[k].parts, 0, this.herd[k].gpuParts)

    let pass = enc.beginRenderPass({ colorAttachments: [], depthStencilAttachment: { view: this.shadowTex.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' } })
    pass.setBindGroup(0, this.bgU)
    pass.setPipeline(this.pShadowEnv)
    pass.setVertexBuffer(0, this.envVB)
    pass.setIndexBuffer(this.envIB, 'uint32')
    pass.drawIndexed(this.envCount)
    pass.setPipeline(this.pShadowProp)
    for (const g of Object.values(this.propGpu)) {
      pass.setVertexBuffer(0, g.vb)
      pass.setVertexBuffer(1, g.inst)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, g.n)
    }
    pass.setPipeline(this.pShadowJelly)
    for (const g of this.animalGpu) {
      pass.setBindGroup(1, g.bg)
      pass.setVertexBuffer(0, g.st)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count)
    }
    pass.end()

    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.msColor.createView(), resolveTarget: this.sceneTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }],
      depthStencilAttachment: { view: this.msDepth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' },
    })
    pass.setPipeline(this.pSky)
    pass.setBindGroup(0, this.bgU)
    pass.draw(3)
    pass.setPipeline(this.pEnv)
    pass.setBindGroup(0, this.bgLit)
    pass.setVertexBuffer(0, this.envVB)
    pass.setIndexBuffer(this.envIB, 'uint32')
    pass.drawIndexed(this.envCount)
    pass.setPipeline(this.pProp)
    for (const g of Object.values(this.propGpu)) {
      pass.setVertexBuffer(0, g.vb)
      pass.setVertexBuffer(1, g.inst)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, g.n)
    }
    pass.setPipeline(this.pGrass)
    pass.setVertexBuffer(0, this.grassVB)
    pass.setIndexBuffer(this.grassIB, 'uint16')
    pass.drawIndexed(15, this.grassCount)
    pass.end()

    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.backTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 0] }],
      depthStencilAttachment: { view: this.backDepth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    })
    pass.setPipeline(this.pBack)
    pass.setBindGroup(0, this.bgBack)
    this.herd.forEach((c, k) => {
      const g = this.animalGpu[k]
      pass.setBindGroup(1, g.bg)
      pass.setVertexBuffer(0, g.st)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, 1, 0, 0, k)
    })
    pass.end()

    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.msColor.createView(), resolveTarget: this.hdrOut.createView(), loadOp: 'load', storeOp: 'discard' }],
      depthStencilAttachment: { view: this.msDepth.createView(), depthLoadOp: 'load', depthStoreOp: 'discard' },
    })
    pass.setPipeline(this.pJelly)
    pass.setBindGroup(0, this.bgJelly)
    this.herd.forEach((c, k) => {
      const g = this.animalGpu[k]
      pass.setBindGroup(1, g.bg)
      pass.setVertexBuffer(0, g.st)
      pass.setIndexBuffer(g.ib, 'uint32')
      pass.drawIndexed(g.count, 1, 0, 0, k)
    })
    pass.setBindGroup(0, this.bgU)
    pass.setPipeline(this.pGlow)
    pass.setVertexBuffer(0, this.glowBuf)
    pass.draw(4, this.glowCount)
    if (this.showMesh) {
      pass.setPipeline(this.pLine)
      for (const g of this.animalGpu) {
        pass.setVertexBuffer(0, g.parts)
        pass.setIndexBuffer(g.lineIB, 'uint32')
        pass.drawIndexed(g.lineCount)
      }
    }
    pass.end()

    pass = enc.beginRenderPass({ colorAttachments: [{ view: this.ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] })
    pass.setPipeline(this.pPost)
    pass.setBindGroup(0, this.bgPost)
    pass.draw(3)
    pass.end()
    d.queue.submit([enc.finish()])
  }

  step(dt) {
    const ct = this.cam.target
    const walkers = this.lite
      ? []
      : this.herd
          .filter((c) => c.state === 'walk' && !c.grabbed)
          .sort((a, b) => Math.hypot(a.root.x - ct[0], a.root.z - ct[2]) - Math.hypot(b.root.x - ct[0], b.root.z - ct[2]))
          .slice(0, 3)
    for (const c of this.herd) {
      c.body.firmness = this.firmness
      c.body.damping = 1 - this.wobble
      c.update(dt, this.herd, true, { walkSim: walkers.includes(c) })
      c.simulate(dt, c.state === 'walk' && !c.grabbed ? 2 : 3)
    }
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop)
    const real = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) {
      const sdt = real * (this.slow ? 0.25 : 1)
      this.time += sdt
      this.acc += sdt
      let n = 0
      const t0 = performance.now()
      while (this.acc >= DT && n < 2) {
        this.step(DT)
        this.acc -= DT
        n++
      }
      if (this.acc > DT) this.acc = 0
      const cost = performance.now() - t0
      this.cost = (this.cost || cost) * 0.95 + cost * 0.05
      if (this.cost > 12 && !this.lite && this.frame > 240) this.lite = true
    }
    for (const c of this.herd) c.pack()
    this.render()
    this.frame = (this.frame || 0) + 1
    if (this.frame % 4 === 0) this.emit('frame')
  }

  ray(cx, cy) {
    const r = this.canvas.getBoundingClientRect()
    const nx = ((cx - r.left) / r.width) * 2 - 1
    const ny = -(((cy - r.top) / r.height) * 2 - 1)
    const a = project(this.invViewProj, [nx, ny, 0])
    const b = project(this.invViewProj, [nx, ny, 1])
    return { o: a, d: v3.norm(v3.sub(b, a)) }
  }

  rayTris(o, d, pos, idx, best) {
    for (let k = 0; k < idx.length; k += 3) {
      const a = idx[k] * 3
      const b = idx[k + 1] * 3
      const c = idx[k + 2] * 3
      const e1x = pos[b] - pos[a]
      const e1y = pos[b + 1] - pos[a + 1]
      const e1z = pos[b + 2] - pos[a + 2]
      const e2x = pos[c] - pos[a]
      const e2y = pos[c + 1] - pos[a + 1]
      const e2z = pos[c + 2] - pos[a + 2]
      const px = d[1] * e2z - d[2] * e2y
      const py = d[2] * e2x - d[0] * e2z
      const pz = d[0] * e2y - d[1] * e2x
      const det = e1x * px + e1y * py + e1z * pz
      if (Math.abs(det) < 1e-12) continue
      const inv = 1 / det
      const tx = o[0] - pos[a]
      const ty = o[1] - pos[a + 1]
      const tz = o[2] - pos[a + 2]
      const uu = (tx * px + ty * py + tz * pz) * inv
      if (uu < 0 || uu > 1) continue
      const qx = ty * e1z - tz * e1y
      const qy = tz * e1x - tx * e1z
      const qz = tx * e1y - ty * e1x
      const vv = (d[0] * qx + d[1] * qy + d[2] * qz) * inv
      if (vv < 0 || uu + vv > 1) continue
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv
      if (t > 0 && t < best) best = t
    }
    return best
  }

  raySphere(o, d, c, r) {
    const oc = v3.sub(o, c)
    const b = v3.dot(oc, d)
    const cc = v3.dot(oc, oc) - r * r
    const h = b * b - cc
    if (h < 0) return Infinity
    const t = -b - Math.sqrt(h)
    return t > 0 ? t : Infinity
  }

  pick(cx, cy) {
    const { o, d } = this.ray(cx, cy)
    let best = { t: Infinity }
    for (const c of this.herd) {
      if (!c.center) continue
      if (this.raySphere(o, d, c.center, c.radius * 1.1) === Infinity) continue
      c.skinPos()
      const t = this.rayTris(o, d, c.pos, c.ren.indices, best.t)
      if (t < best.t) best = { t, kind: 'animal', index: c.index }
    }
    for (const p of this.props) {
      const r = p.type === 'pumpkin' ? 1.05 * p.s : p.type === 'hay' ? 0.55 : 0.25
      const cy2 = p.type === 'pumpkin' ? 0.72 * p.s : p.type === 'hay' ? 0.3 : 0.18
      const t = this.raySphere(o, d, [p.x, p.y + cy2, p.z], r)
      if (t < best.t) best = { t, kind: 'prop', prop: p }
    }
    for (const h of this.world.hot) {
      const t = this.raySphere(o, d, h.p, h.r)
      if (t < best.t) best = { t, kind: 'hot', hot: h }
    }
    if (best.t === Infinity) return null
    best.p = v3.add(o, v3.scale(d, best.t))
    return best
  }

  groundHit(cx, cy) {
    const { o, d } = this.ray(cx, cy)
    let t = 0
    for (let k = 0; k < 80; k++) {
      const p = v3.add(o, v3.scale(d, t))
      const h = p[1] - height(p[0], p[2])
      if (h < 0.01) return p
      t += Math.max(0.05, h * 0.6)
      if (t > 120) break
    }
    return null
  }

  screenOf(p) {
    const q = project(this.viewProj, p)
    return { x: ((q[0] + 1) / 2) * this.cssW, y: ((1 - q[1]) / 2) * this.cssH, z: q[2] }
  }

  animalScreen(i) {
    const c = this.herd[i]
    if (!c || !c.center) return null
    const top = [c.center[0], c.center[1] + c.built.top * 0.55 + 0.25, c.center[2]]
    return this.screenOf(top)
  }

  bindPointer() {
    const el = this.canvas
    const pointers = new Map()
    let mode = null
    let start = null
    let moved = false
    let pinch = null
    const fwd = () => [-this.view[2], -this.view[6], -this.view[10]]
    this.onDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
      if (pointers.size === 2) {
        if (mode && mode.kind === 'animal') this.release(mode)
        const [a, b] = [...pointers.values()]
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: this.goal.dist, mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], target: [...this.goal.target] }
        mode = { kind: 'pinch' }
        return
      }
      start = { x: e.clientX, y: e.clientY, yaw: this.goal.yaw, pitch: this.goal.pitch }
      moved = false
      this.emit('interact')
      const hit = e.button === 0 || e.pointerType !== 'mouse' ? this.pick(e.clientX, e.clientY) : null
      if (e.button === 2 || e.shiftKey) {
        mode = { kind: 'pan', target: [...this.goal.target] }
        return
      }
      if (hit && hit.kind === 'animal') {
        const c = this.herd[hit.index]
        c.startGrab(hit.p)
        mode = { kind: 'animal', c, origin: hit.p, n: fwd() }
        el.style.cursor = 'grabbing'
        this.emit('grab', c.index)
        return
      }
      if (hit && hit.kind === 'prop' && hit.prop.drag) {
        mode = { kind: 'prop', p: hit.prop, off: [hit.prop.x - hit.p[0], hit.prop.z - hit.p[2]] }
        hit.prop.held = true
        return
      }
      if (hit && hit.kind === 'prop') {
        mode = { kind: 'tapProp', p: hit.prop }
        return
      }
      if (hit && hit.kind === 'hot') {
        mode = { kind: 'hot', h: hit.hot }
        return
      }
      mode = { kind: 'orbit' }
    }
    this.onMove = (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (mode && mode.kind === 'pinch' && pointers.size >= 2) {
        const [a, b] = [...pointers.values()]
        const dd = Math.hypot(a.x - b.x, a.y - b.y)
        this.goal.dist = Math.max(7, Math.min(26, (pinch.dist * pinch.d) / Math.max(20, dd)))
        return
      }
      if (!mode) {
        if (e.pointerType === 'mouse') {
          const hit = this.pick(e.clientX, e.clientY)
          const hv = hit && hit.kind === 'animal' ? hit.index : -1
          this.hovered = hv
          el.style.cursor = hit ? (hit.kind === 'animal' || (hit.kind === 'prop' && hit.prop.drag) ? 'grab' : 'pointer') : ''
        }
        return
      }
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) > 6) moved = true
      if (mode.kind === 'animal') {
        const { o, d } = this.ray(e.clientX, e.clientY)
        const n = mode.n
        const den = v3.dot(d, n)
        if (Math.abs(den) < 1e-6) return
        const org = mode.c.grabPoint()
        const t = v3.dot(v3.sub(org, o), n) / den
        mode.c.dragTo(v3.add(o, v3.scale(d, t)))
        return
      }
      if (mode.kind === 'prop') {
        const g = this.groundHit(e.clientX, e.clientY)
        if (g) {
          mode.p.x = g[0] + mode.off[0]
          mode.p.z = g[2] + mode.off[1]
          mode.p.y = height(mode.p.x, mode.p.z)
        }
        return
      }
      if (mode.kind === 'orbit' && moved) {
        this.goal.yaw = start.yaw - dx * 0.006
        this.goal.pitch = Math.max(0.06, Math.min(1.0, start.pitch + dy * 0.004))
        return
      }
      if (mode.kind === 'pan' && moved) {
        const s = this.goal.dist * 0.0016
        const cy = Math.cos(this.goal.yaw)
        const sy = Math.sin(this.goal.yaw)
        this.goal.target[0] = Math.max(-9, Math.min(9, mode.target[0] - (dx * cy + dy * sy) * s))
        this.goal.target[2] = Math.max(-9, Math.min(7, mode.target[2] - (-dx * sy + dy * cy) * s))
      }
    }
    this.onUp = (e) => {
      pointers.delete(e.pointerId)
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      } catch {
        void 0
      }
      if (!mode) return
      if (mode.kind === 'pinch') {
        if (pointers.size === 0) mode = null
        return
      }
      if (mode.kind === 'animal') this.release(mode, moved)
      else if (mode.kind === 'prop') {
        mode.p.held = false
        mode.p.wob = 0
        if (!moved) this.tapProp(mode.p)
        else this.emit('sfx', 'thud')
      } else if (mode.kind === 'tapProp' && !moved) this.tapProp(mode.p)
      else if (mode.kind === 'hot' && !moved) this.harvestHot(mode.h, e.clientX, e.clientY)
      mode = null
      el.style.cursor = ''
    }
    this.onWheel = (e) => {
      e.preventDefault()
      this.goal.dist = Math.max(7, Math.min(26, this.goal.dist * Math.exp(e.deltaY * 0.0012)))
    }
    this.onCtx = (e) => e.preventDefault()
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('wheel', this.onWheel, { passive: false })
    el.addEventListener('contextmenu', this.onCtx)
  }

  release(mode, moved) {
    const c = mode.c
    const stretch = c.endGrab()
    this.canvas.style.cursor = ''
    this.select(c.index)
    if (!moved) {
      c.boop()
      this.emit('sfx', c.cfg.sound)
      return
    }
    this.emit('sfx', 'squish')
    if (stretch > 0.35 + c.radius * 0.12) {
      this.emit('sfx', c.cfg.sound)
      this.harvestAnimal(c)
    }
  }

  harvestAnimal(c, force = false) {
    if (!c.cfg.gives) {
      const s = this.animalScreen(c.index)
      this.emit('harvest', { item: null, from: c.cfg.name, x: s?.x, y: s?.y, species: c.species })
      return
    }
    if (c.cool > 0 && !force) return
    c.cool = 1.4
    const s = this.animalScreen(c.index)
    this.emit('harvest', { item: c.cfg.gives, from: c.cfg.name, x: s?.x, y: s?.y })
  }

  harvestHot(h) {
    const s = this.screenOf(h.p)
    this.emit('harvest', { item: h.kind, from: h.kind === 'apple' ? 'Apple tree' : h.kind === 'corn' ? 'Corn rows' : h.kind === 'strawberry' ? 'Strawberry patch' : 'Mushroom patch', x: s.x, y: s.y })
    this.emit('sfx', 'pluck')
  }

  tapProp(p) {
    if (p.type === 'lantern') {
      p.lit = !p.lit
      this.emit('sfx', p.lit ? 'on' : 'off')
      return
    }
    if (p.type === 'pumpkin') {
      p.wob = 0
      if (p.carved) {
        p.lit = !p.lit
        this.emit('sfx', p.lit ? 'on' : 'off')
      }
      const s = this.screenOf([p.x, p.y + p.s, p.z])
      this.emit('harvest', { item: 'pumpkin', from: 'Pumpkin patch', x: s.x, y: s.y })
      return
    }
    if (p.type === 'hay') {
      p.wob = 0
      this.emit('sfx', 'thud')
    }
  }

  select(i) {
    this.selected = i
    const c = this.herd[i]
    if (c) this.emit('select', i)
  }

  focus(i) {
    const c = this.herd[i]
    if (!c || !c.center) return
    this.select(i)
    this.goal.target = [c.center[0], c.center[1] * 0.6 + 0.3, c.center[2]]
    this.goal.dist = c.species === 'chick' || c.species === 'hen' || c.species === 'cat' ? 7.5 : 9.5
    const dx = this.eye[0] - c.center[0]
    const dz = this.eye[2] - c.center[2]
    this.goal.yaw = Math.atan2(dx, dz)
    this.goal.pitch = 0.32
  }

  nudge() {
    let list = this.herd.filter((c) => c.species !== 'cat' || true)
    let c = this.herd[this.selected]
    if (!c) {
      const ctr = this.cam.target
      list = list.sort((a, b) => Math.hypot(a.root.x - ctr[0], a.root.z - ctr[2]) - Math.hypot(b.root.x - ctr[0], b.root.z - ctr[2]))
      c = list[Math.floor(Math.random() * Math.min(4, list.length))]
    }
    c.nudge()
    this.emit('sfx', c.cfg.sound)
    this.select(c.index)
  }

  collect(i) {
    const c = this.herd[i]
    if (!c) return
    c.boop()
    c.body.squeeze(0.4)
    this.emit('sfx', c.cfg.sound)
    this.harvestAnimal(c, true)
  }

  resetFarm() {
    this.initProps()
    for (const c of this.herd) c.reset()
    this.selected = -1
    this.emit('select', -1)
  }

  setInset(px) {
    this.inset = px
    if (this.shift === undefined) this.shift = px / Math.max(1, this.cssW)
    this.resize()
  }

  camDefault() {
    const c = { ...CAM0, target: [...CAM0.target] }
    if (this.portrait) {
      c.pitch = 0.34
      c.target = [0.1, 0.6, -0.6]
    }
    return c
  }

  resetView() {
    this.goal = this.camDefault()
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit(type, value) {
    this.listeners.forEach((fn) => fn(type, value))
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
    if (el.__farmOwner === this) this.ctx.unconfigure()
    this.device.destroy()
  }
}
