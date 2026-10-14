import SoftBody from './softbody.js'
import { buildSim, buildRender, T, R, VC } from './geometry.js'
import { sceneWGSL, shadowWGSL, backWGSL, copyWGSL, frontWGSL, lineWGSL, postWGSL } from './shaders.js'
import { perspective, ortho, lookAt, mul, invert, project, v3 } from './math.js'

const DT = 1 / 60
const SHADOW = 2048
const LIGHT = [-2.6, 6.4, -2.0]

export default class GpuJelly {
  static async device() {
    if (!navigator.gpu) throw new Error('WebGPU unavailable')
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No WebGPU adapter')
    return adapter.requestDevice()
  }

  constructor(canvas, device, variety) {
    this.canvas = canvas
    this.device = device
    this.variety = variety
    this.paused = false
    this.slow = false
    this.showMesh = false
    this.hover = false
    this.drag = null
    this.acc = 0
    this.listeners = new Set()
    this.exposure = 1.0

    const sim = buildSim()
    const ren = buildRender(sim)
    this.sim = sim
    this.ren = ren
    this.body = new SoftBody(sim)
    this.pos = new Float32Array(ren.V * 3)
    this.dyn = new Float32Array(ren.V * 6)
    this.linePos = new Float32Array(this.body.N * 3)

    if (new URLSearchParams(window.location.search).has('still')) this.body.reset()
    else this.body.drop(1.15)

    this.ctx = canvas.getContext('webgpu')
    canvas.__jellyOwner = this
    this.format = navigator.gpu.getPreferredCanvasFormat()
    this.ctx.configure({ device, format: this.format, alphaMode: 'opaque' })

    this.initResources()
    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement)
    this.bindPointer()
    this.last = performance.now()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  buffer(data, usage) {
    const b = this.device.createBuffer({ size: Math.ceil(data.byteLength / 4) * 4, usage, mappedAtCreation: true })
    new data.constructor(b.getMappedRange()).set(data)
    b.unmap()
    return b
  }

  initResources() {
    const d = this.device
    const V = GPUBufferUsage
    this.vbDyn = d.createBuffer({ size: this.dyn.byteLength, usage: V.VERTEX | V.COPY_DST })
    this.vbRest = this.buffer(this.ren.restProf, V.VERTEX)
    this.ib = this.buffer(this.ren.indices, V.INDEX)
    this.lineVB = d.createBuffer({ size: this.linePos.byteLength, usage: V.VERTEX | V.COPY_DST })
    this.lineIB = this.buffer(this.sim.edges, V.INDEX)
    this.ubo = d.createBuffer({ size: 400, usage: V.UNIFORM | V.COPY_DST })
    this.uni = new Float32Array(100)

    this.shadowTex = d.createTexture({ size: [SHADOW, SHADOW], format: 'depth32float', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING })
    this.linSamp = d.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' })
    this.cmpSamp = d.createSampler({ compare: 'less', magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' })

    const VF = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
    const F = GPUShaderStage.FRAGMENT
    const uni = { binding: 0, visibility: VF, buffer: { type: 'uniform' } }
    this.bglU = d.createBindGroupLayout({ entries: [uni] })
    this.bglScene = d.createBindGroupLayout({
      entries: [uni, { binding: 1, visibility: F, texture: { sampleType: 'depth' } }, { binding: 2, visibility: F, sampler: { type: 'comparison' } }],
    })
    this.bglCopy = d.createBindGroupLayout({ entries: [{ binding: 0, visibility: F, texture: { sampleType: 'unfilterable-float' } }] })
    this.bglFront = d.createBindGroupLayout({
      entries: [
        uni,
        { binding: 1, visibility: F, texture: { sampleType: 'float' } },
        { binding: 2, visibility: F, sampler: { type: 'filtering' } },
        { binding: 3, visibility: F, texture: { sampleType: 'unfilterable-float' } },
      ],
    })
    this.bglPost = d.createBindGroupLayout({ entries: [uni, { binding: 1, visibility: F, texture: { sampleType: 'unfilterable-float' } }] })
    this.bgU = d.createBindGroup({ layout: this.bglU, entries: [{ binding: 0, resource: { buffer: this.ubo } }] })
    this.bgScene = d.createBindGroup({
      layout: this.bglScene,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.shadowTex.createView() },
        { binding: 2, resource: this.cmpSamp },
      ],
    })

    const mod = (code) => d.createShaderModule({ code })
    const mScene = mod(sceneWGSL)
    const mShadow = mod(shadowWGSL)
    const mBack = mod(backWGSL)
    const mCopy = mod(copyWGSL)
    const mFront = mod(frontWGSL)
    const mLine = mod(lineWGSL)
    const mPost = mod(postWGSL)
    this.modules = [mScene, mShadow, mBack, mCopy, mFront, mLine, mPost]
    const layout = (bgl) => d.createPipelineLayout({ bindGroupLayouts: [bgl] })
    const jellyBuffers = [
      {
        arrayStride: 24,
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },
          { shaderLocation: 1, offset: 12, format: 'float32x3' },
        ],
      },
      { arrayStride: 12, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x3' }] },
    ]
    this.pShadow = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mShadow, entryPoint: 'vsShadow', buffers: [{ arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less' },
    })
    this.pScene = d.createRenderPipeline({
      layout: layout(this.bglScene),
      vertex: { module: mScene, entryPoint: 'vsFull' },
      fragment: { module: mScene, entryPoint: 'fsScene', targets: [{ format: 'rgba16float' }] },
    })
    this.pBack = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mBack, entryPoint: 'vsJelly', buffers: jellyBuffers },
      fragment: { module: mBack, entryPoint: 'fsBack', targets: [{ format: 'rgba32float' }] },
      primitive: { topology: 'triangle-list', cullMode: 'front' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
    })
    const ms = { count: 4 }
    const noDepth = { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' }
    this.pCopy = d.createRenderPipeline({
      layout: layout(this.bglCopy),
      vertex: { module: mCopy, entryPoint: 'vsFull' },
      fragment: { module: mCopy, entryPoint: 'fsCopy', targets: [{ format: 'rgba16float' }] },
      depthStencil: noDepth,
      multisample: ms,
    })
    this.pFront = d.createRenderPipeline({
      layout: layout(this.bglFront),
      vertex: { module: mFront, entryPoint: 'vsJelly', buffers: jellyBuffers },
      fragment: { module: mFront, entryPoint: 'fsFront', targets: [{ format: 'rgba16float' }] },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
      multisample: ms,
    })
    this.pLine = d.createRenderPipeline({
      layout: layout(this.bglU),
      vertex: { module: mLine, entryPoint: 'vsLine', buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }] },
      fragment: {
        module: mLine,
        entryPoint: 'fsLine',
        targets: [
          {
            format: 'rgba16float',
            blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } },
          },
        ],
      },
      primitive: { topology: 'line-list' },
      depthStencil: noDepth,
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

  resize() {
    const p = this.canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
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
    this.backTex = d.createTexture({ size: [w, h], format: 'rgba32float', usage: RA | TB })
    this.backDepth = d.createTexture({ size: [w, h], format: 'depth24plus', usage: RA })
    this.msColor = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA, sampleCount: 4 })
    this.msDepth = d.createTexture({ size: [w, h], format: 'depth24plus', usage: RA, sampleCount: 4 })
    this.hdrOut = d.createTexture({ size: [w, h], format: 'rgba16float', usage: RA | TB })
    this.bgCopy = d.createBindGroup({ layout: this.bglCopy, entries: [{ binding: 0, resource: this.sceneTex.createView() }] })
    this.bgFront = d.createBindGroup({
      layout: this.bglFront,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.sceneTex.createView() },
        { binding: 2, resource: this.linSamp },
        { binding: 3, resource: this.backTex.createView() },
      ],
    })
    this.bgPost = d.createBindGroup({
      layout: this.bglPost,
      entries: [
        { binding: 0, resource: { buffer: this.ubo } },
        { binding: 1, resource: this.hdrOut.createView() },
      ],
    })
    const aspect = w / h
    const narrow = this.cssW < 760
    const fit = Math.max(1, 1.25 / aspect)
    const dist = (narrow ? 7.6 : 7.4) * Math.min(fit, 2.1)
    const el = (narrow ? 42 : 36) * (Math.PI / 180)
    this.eye = [0.15, Math.sin(el) * dist + T / 2, Math.cos(el) * dist]
    this.view = lookAt(this.eye, [0.05, narrow ? 0.27 : 0.12, 0], [0, 1, 0])
    this.proj = perspective((30 * Math.PI) / 180, aspect, 0.1, 80)
    this.viewProj = mul(this.proj, this.view)
    this.invViewProj = invert(this.viewProj)
    const lv = lookAt(LIGHT, [0, 0, 0], [0, 0, -1])
    this.lightViewProj = mul(ortho(-2.2, 2.2, -2.2, 2.2, 1, 12), lv)
  }

  writeUniforms(time) {
    const u = this.uni
    const v = this.variety.gpu
    u.set(this.viewProj, 0)
    u.set(this.invViewProj, 16)
    u.set(this.lightViewProj, 32)
    u.set(this.view, 48)
    u.set([...this.eye, time], 64)
    u.set([...LIGHT, 1.2], 68)
    u.set([...v.flesh, v.fleshD], 72)
    u.set([...v.pith, 1], 76)
    u.set([...v.rind, v.rindD], 80)
    u.set([...v.membrane, 1], 84)
    u.set([this.exposure, T, R, VC], 88)
    u.set([this.W, this.H, 1 / this.W, 1 / this.H], 92)
    u.set([0, this.showMesh ? 1 : 0, 0, 0], 96)
    this.device.queue.writeBuffer(this.ubo, 0, u)
  }

  skin() {
    const { bindTet, bindW, indices, V } = this.ren
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
    const dyn = this.dyn
    for (let i = 0; i < V; i++) {
      dyn[i * 6 + 3] = 0
      dyn[i * 6 + 4] = 0
      dyn[i * 6 + 5] = 0
    }
    for (let k = 0; k < indices.length; k += 3) {
      const a = indices[k]
      const b = indices[k + 1]
      const c = indices[k + 2]
      const ax = pos[a * 3]
      const ay = pos[a * 3 + 1]
      const az = pos[a * 3 + 2]
      const e1x = pos[b * 3] - ax
      const e1y = pos[b * 3 + 1] - ay
      const e1z = pos[b * 3 + 2] - az
      const e2x = pos[c * 3] - ax
      const e2y = pos[c * 3 + 1] - ay
      const e2z = pos[c * 3 + 2] - az
      const nx = e1y * e2z - e1z * e2y
      const ny = e1z * e2x - e1x * e2z
      const nz = e1x * e2y - e1y * e2x
      for (const q of [a, b, c]) {
        dyn[q * 6 + 3] += nx
        dyn[q * 6 + 4] += ny
        dyn[q * 6 + 5] += nz
      }
    }
    for (let i = 0; i < V; i++) {
      dyn[i * 6] = pos[i * 3]
      dyn[i * 6 + 1] = pos[i * 3 + 1]
      dyn[i * 6 + 2] = pos[i * 3 + 2]
      const nx = dyn[i * 6 + 3]
      const ny = dyn[i * 6 + 4]
      const nz = dyn[i * 6 + 5]
      const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      dyn[i * 6 + 3] = nx / l
      dyn[i * 6 + 4] = ny / l
      dyn[i * 6 + 5] = nz / l
    }
    this.device.queue.writeBuffer(this.vbDyn, 0, dyn)
    if (this.showMesh) {
      this.linePos.set(x)
      this.device.queue.writeBuffer(this.lineVB, 0, this.linePos)
    }
  }

  render(time) {
    this.writeUniforms(time)
    const d = this.device
    const enc = d.createCommandEncoder()
    const nIdx = this.ren.indices.length

    let pass = enc.beginRenderPass({
      colorAttachments: [],
      depthStencilAttachment: { view: this.shadowTex.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' },
    })
    pass.setPipeline(this.pShadow)
    pass.setBindGroup(0, this.bgU)
    pass.setVertexBuffer(0, this.vbDyn)
    pass.setIndexBuffer(this.ib, 'uint32')
    pass.drawIndexed(nIdx)
    pass.end()

    pass = enc.beginRenderPass({ colorAttachments: [{ view: this.sceneTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] })
    pass.setPipeline(this.pScene)
    pass.setBindGroup(0, this.bgScene)
    pass.draw(3)
    pass.end()

    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.backTex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 0] }],
      depthStencilAttachment: { view: this.backDepth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    })
    pass.setPipeline(this.pBack)
    pass.setBindGroup(0, this.bgU)
    pass.setVertexBuffer(0, this.vbDyn)
    pass.setVertexBuffer(1, this.vbRest)
    pass.setIndexBuffer(this.ib, 'uint32')
    pass.drawIndexed(nIdx)
    pass.end()

    pass = enc.beginRenderPass({
      colorAttachments: [{ view: this.msColor.createView(), resolveTarget: this.hdrOut.createView(), loadOp: 'clear', storeOp: 'discard', clearValue: [0, 0, 0, 1] }],
      depthStencilAttachment: { view: this.msDepth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    })
    pass.setPipeline(this.pCopy)
    pass.setBindGroup(0, this.bgCopy)
    pass.draw(3)
    pass.setPipeline(this.pFront)
    pass.setBindGroup(0, this.bgFront)
    pass.setVertexBuffer(0, this.vbDyn)
    pass.setVertexBuffer(1, this.vbRest)
    pass.setIndexBuffer(this.ib, 'uint32')
    pass.drawIndexed(nIdx)
    if (this.showMesh) {
      pass.setPipeline(this.pLine)
      pass.setBindGroup(0, this.bgU)
      pass.setVertexBuffer(0, this.lineVB)
      pass.setIndexBuffer(this.lineIB, 'uint32')
      pass.drawIndexed(this.sim.edges.length)
    }
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
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) {
      this.acc += dt * (this.slow ? 0.25 : 1)
      let n = 0
      while (this.acc >= DT && n < 2) {
        const t0 = performance.now()
        this.body.step(DT)
        this.cost = (this.cost || 0) * 0.9 + (performance.now() - t0) * 0.1
        if (this.cost > 11 && this.body.substeps > 7) {
          this.body.substeps -= 1
          this.cost = 8
        }
        this.acc -= DT
        n++
      }
      if (this.acc > DT) this.acc = 0
    }
    this.skin()
    this.render(now / 1000)
  }

  ray(cx, cy) {
    const r = this.canvas.getBoundingClientRect()
    const nx = ((cx - r.left) / r.width) * 2 - 1
    const ny = -(((cy - r.top) / r.height) * 2 - 1)
    const a = project(this.invViewProj, [nx, ny, 0])
    const b = project(this.invViewProj, [nx, ny, 1])
    return { o: a, d: v3.norm(v3.sub(b, a)) }
  }

  pick(cx, cy) {
    const { o, d } = this.ray(cx, cy)
    const pos = this.pos
    const idx = this.ren.indices
    let best = Infinity
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
    return best < Infinity ? v3.add(o, v3.scale(d, best)) : null
  }

  bindPointer() {
    const el = this.canvas
    const fwd = () => [-this.view[2], -this.view[6], -this.view[10]]
    this.onDown = (e) => {
      const hit = this.pick(e.clientX, e.clientY)
      if (!hit) return
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
      this.body.startGrab(hit)
      this.drag = { origin: hit, n: fwd() }
      el.style.cursor = 'grabbing'
      this.emit('grab', true)
    }
    this.onMove = (e) => {
      if (this.drag) {
        const { o, d } = this.ray(e.clientX, e.clientY)
        const n = this.drag.n
        const den = v3.dot(d, n)
        if (Math.abs(den) < 1e-6) return
        const t = v3.dot(v3.sub(this.drag.origin, o), n) / den
        const p = v3.add(o, v3.scale(d, t))
        let dlt = v3.sub(p, this.drag.origin)
        const L = v3.len(dlt)
        const max = 1.15
        if (L > 1e-6) dlt = v3.scale(dlt, (max * Math.tanh(L / max)) / L)
        this.body.target = v3.add(this.drag.origin, dlt)
        return
      }
      const over = !!this.pick(e.clientX, e.clientY)
      if (over !== this.hover) {
        this.hover = over
        el.style.cursor = over ? 'grab' : ''
      }
    }
    this.onUp = (e) => {
      if (!this.drag) return
      this.drag = null
      this.body.endGrab()
      el.style.cursor = this.hover ? 'grab' : ''
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      } catch {
        void 0
      }
      this.emit('grab', false)
    }
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit(type, value) {
    this.listeners.forEach((fn) => fn(type, value))
  }

  setVariety(v) {
    this.variety = v
    this.body.nudge(0.45)
  }

  setFirmness(f) {
    this.body.firmness = f
  }

  setDamping(d) {
    this.body.damping = d
  }

  setPaused(p) {
    this.paused = p
  }

  setSlow(s) {
    this.slow = s
  }

  setShowMesh(s) {
    this.showMesh = s
  }

  nudge(k = 1) {
    this.body.nudge(k)
  }

  reset() {
    this.drag = null
    this.body.drop(0.35)
  }

  dropIn() {
    this.body.drop(1.15)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    const el = this.canvas
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    if (el.__jellyOwner === this) this.ctx.unconfigure()
    this.device.destroy()
  }
}
