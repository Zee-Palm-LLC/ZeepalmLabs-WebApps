import * as THREE from 'three'
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { sliceTexture, RINGS } from './textures.js'

const R = 1
const T = 0.34
const BEVEL = 0.085
const YAW = 0.28
const STEP = 1 / 120

function splitGroups(geo) {
  const pos = geo.attributes.position
  return geo.groups.map((g) => {
    const out = new THREE.BufferGeometry()
    const arr = new Float32Array(g.count * 3)
    for (let i = 0; i < g.count; i++) {
      arr[i * 3] = pos.getX(g.start + i)
      arr[i * 3 + 1] = pos.getY(g.start + i)
      arr[i * 3 + 2] = pos.getZ(g.start + i)
    }
    out.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return out
  })
}

function buildSlice() {
  const shape = new THREE.Shape()
  shape.moveTo(R, 0)
  shape.absarc(0, 0, R, 0, Math.PI, false)
  const n = 40
  for (let i = 1; i <= n; i++) shape.lineTo(-R + (2 * R * i) / n, 0)
  const depth = T - 2 * BEVEL
  const ex = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 3,
    curveSegments: 72,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL * 0.92,
    bevelOffset: -BEVEL * 0.92,
    bevelSegments: 6,
  })
  ex.translate(0, 0, -depth / 2)
  ex.rotateX(-Math.PI / 2)
  const cz = (4 * R) / (3 * Math.PI)
  ex.translate(0, 0, cz)
  ex.rotateY(YAW)
  const parts = splitGroups(ex).map((g) => {
    const tess = new TessellateModifier(0.045, 8)
    return tess.modify(g)
  })
  return parts
}

function studio() {
  const env = new THREE.Scene()
  env.background = new THREE.Color('#6d6158')
  const box = (w, h, x, y, z, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.97, 0.92).multiplyScalar(k), side: THREE.DoubleSide }))
    m.position.set(x, y, z)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  box(5, 2.2, -2, 7, -7, 2.6)
  box(4, 1.4, 3, 6, -6, 1.6)
  box(7, 3, 1, 7, 6, 2.2)
  box(3, 8, -8, 2, 1, 1.4)
  box(3, 6, 8, 2.5, -2, 1.1)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: '#d9cbb8', side: THREE.DoubleSide }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -3
  env.add(floor)
  return env
}

function smooth(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default class JellyScene {
  constructor(canvas, variety) {
    this.canvas = canvas
    this.variety = variety
    this.params = { firmness: 0.4, damping: 0.45 }
    this.paused = false
    this.slow = false
    this.showMesh = false
    this.acc = 0
    this.time = 0
    this.listeners = new Set()

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 0.85
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    this.renderer = renderer

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ece6dc')
    this.scene = scene
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(studio(), 0.03).texture
    scene.environmentIntensity = 0.7

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    this.camera = camera

    scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd8c3a8, 0.3))
    const key = new THREE.DirectionalLight(0xfff1e0, 1.35)
    key.position.set(-2.6, 6.5, 3.2)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -4
    key.shadow.camera.right = 4
    key.shadow.camera.top = 4
    key.shadow.camera.bottom = -4
    key.shadow.camera.near = 1
    key.shadow.camera.far = 20
    key.shadow.radius = 9
    key.shadow.blurSamples = 16
    key.shadow.bias = -0.0005
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffe2c0, 1.1)
    rim.position.set(3.5, 2.2, -3.5)
    scene.add(rim)
    const spec = new THREE.DirectionalLight(0xffffff, 0.9)
    spec.position.set(1.5, 4, 6)
    scene.add(spec)

    const floorMat = new THREE.ShadowMaterial({ color: new THREE.Color(variety.attenuation).multiplyScalar(0.55), opacity: 0.5 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -T / 2 - 0.004
    floor.receiveShadow = true
    scene.add(floor)
    this.floor = floor
    this.floorY = -T / 2

    const [capsRaw, sidesRaw] = buildSlice()
    const caps = mergeVertices(capsRaw, 1e-5)
    const sides = mergeVertices(sidesRaw, 1e-5)
    this.prepAttributes(caps, true)
    this.prepAttributes(sides, false)
    const geo = mergeGeometries([caps, sides], true)
    this.geo = geo
    this.rest = Float32Array.from(geo.attributes.position.array)

    const tex = sliceTexture(variety)
    this.capsMat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.07,
      metalness: 0,
      transmission: 0,
      thickness: 0.7,
      emissive: new THREE.Color('#ff7a10'),
      emissiveIntensity: 0.06,
      side: THREE.DoubleSide,
      ior: 1.36,
      clearcoat: 0.7,
      clearcoatRoughness: 0.06,
      attenuationColor: new THREE.Color(variety.attenuation),
      attenuationDistance: 0.45,
      sheen: 0.0,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color('#ffffff'),
      specularIntensity: 0.6,
    })
    this.sidesMat = this.capsMat.clone()
    this.sidesMat.map = null
    this.sidesMat.emissive = new THREE.Color(variety.attenuation)
    this.sidesMat.emissiveIntensity = 0.14
    this.sidesMat.vertexColors = true
    this.applySideColors(variety)

    const mesh = new THREE.Mesh(geo, [this.capsMat, this.sidesMat])
    mesh.castShadow = true
    mesh.frustumCulled = false
    scene.add(mesh)
    this.mesh = mesh

    this.wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x2a1a10, wireframe: true, transparent: true, opacity: 0.22, depthTest: true }))
    this.wire.visible = false
    this.wire.frustumCulled = false
    scene.add(this.wire)

    this.buildLattice()
    if (!new URLSearchParams(window.location.search).has('still')) this.dropIn()

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.drag = null
    this.hover = false
    this.bindPointer()

    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement)
    this.last = performance.now()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  prepAttributes(g, isCap) {
    g.deleteAttribute('normal')
    const n = g.attributes.position.count
    const uv = new Float32Array(n * 2)
    const col = new Float32Array(n * 3).fill(1)
    const p = g.attributes.position
    const c = Math.cos(-YAW)
    const s = Math.sin(-YAW)
    const cz = (4 * R) / (3 * Math.PI)
    for (let i = 0; i < n; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const lx = x * c + z * s
      const lz = -x * s + z * c - cz
      uv[i * 2] = (lx / R + 1) / 2
      uv[i * 2 + 1] = (lz / R + 1) / 2
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.userData.isCap = isCap
  }

  applySideColors(v) {
    const g = this.geo
    const sideGroup = g.groups[1]
    const col = g.attributes.color
    const rest = this.rest
    const c = Math.cos(-YAW)
    const s = Math.sin(-YAW)
    const cz = (4 * R) / (3 * Math.PI)
    const peel = new THREE.Color(v.peel)
    const pith = new THREE.Color(v.pith)
    const pulp = new THREE.Color(v.pulp[0])
    const pulpLight = new THREE.Color(v.pulp[1])
    const idx = g.index
    const seen = new Set()
    const tmp = new THREE.Color()
    for (let k = sideGroup.start; k < sideGroup.start + sideGroup.count; k++) {
      const i = idx.getX(k)
      if (seen.has(i)) continue
      seen.add(i)
      const x = rest[i * 3]
      const y = rest[i * 3 + 1]
      const z = rest[i * 3 + 2]
      const lx = x * c + z * s
      const lz = -x * s + z * c - cz
      const r = Math.hypot(lx, lz) / R
      const flat = 1 - smooth(-0.04, -0.13, lz)
      const rx = Math.abs(lx) / R
      const band = rx < RINGS.flesh - 0.01 ? 0 : rx < RINGS.pith ? 1 : 2
      tmp.copy(band === 0 ? pulp.clone().lerp(pulpLight, 0.35 + 0.3 * Math.abs(y) / T) : band === 1 ? pith : peel)
      const arc = peel.clone().lerp(pith, smooth(0.12, 0.2, Math.abs(y)) * 0.25)
      tmp.lerp(arc, 1 - flat)
      if (r > 0.995) tmp.lerp(peel, 0.6)
      col.setXYZ(i, tmp.r, tmp.g, tmp.b)
    }
    col.needsUpdate = true
  }

  buildLattice() {
    const pos = this.rest
    const min = new THREE.Vector3(Infinity, Infinity, Infinity)
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    for (let i = 0; i < pos.length; i += 3) {
      min.x = Math.min(min.x, pos[i])
      min.y = Math.min(min.y, pos[i + 1])
      min.z = Math.min(min.z, pos[i + 2])
      max.x = Math.max(max.x, pos[i])
      max.y = Math.max(max.y, pos[i + 1])
      max.z = Math.max(max.z, pos[i + 2])
    }
    min.addScalar(-0.03)
    max.addScalar(0.03)
    const nx = 13
    const ny = 3
    const nz = 11
    this.lat = { nx, ny, nz, min, size: max.clone().sub(min) }
    const N = nx * ny * nz
    this.np = new Float32Array(N * 3)
    this.nprev = new Float32Array(N * 3)
    this.nrest = new Float32Array(N * 3)
    this.grabW = new Float32Array(N)
    this.grabStart = new Float32Array(N * 3)
    const id = (i, j, k) => i + nx * (j + ny * k)
    this.id = id
    for (let k = 0; k < nz; k++)
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++) {
          const n = id(i, j, k) * 3
          const x = min.x + (this.lat.size.x * i) / (nx - 1)
          const y = min.y + (this.lat.size.y * j) / (ny - 1)
          const z = min.z + (this.lat.size.z * k) / (nz - 1)
          this.nrest[n] = this.np[n] = this.nprev[n] = x
          this.nrest[n + 1] = this.np[n + 1] = this.nprev[n + 1] = y
          this.nrest[n + 2] = this.np[n + 2] = this.nprev[n + 2] = z
        }
    const cons = []
    for (let k = 0; k < nz; k++)
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++)
          for (let dk = 0; dk <= 1; dk++)
            for (let dj = -1; dj <= 1; dj++)
              for (let di = -1; di <= 1; di++) {
                if (dk === 0 && (dj < 0 || (dj === 0 && di <= 0))) continue
                const i2 = i + di
                const j2 = j + dj
                const k2 = k + dk
                if (i2 < 0 || j2 < 0 || k2 < 0 || i2 >= nx || j2 >= ny || k2 >= nz) continue
                const a = id(i, j, k)
                const b = id(i2, j2, k2)
                const dx = this.nrest[b * 3] - this.nrest[a * 3]
                const dy = this.nrest[b * 3 + 1] - this.nrest[a * 3 + 1]
                const dz = this.nrest[b * 3 + 2] - this.nrest[a * 3 + 2]
                cons.push(a, b, Math.hypot(dx, dy, dz))
              }
    this.cons = new Float32Array(cons)

    const vc = pos.length / 3
    this.bind = new Int32Array(vc)
    this.frac = new Float32Array(vc * 3)
    for (let v = 0; v < vc; v++) {
      const fx = ((pos[v * 3] - min.x) / this.lat.size.x) * (nx - 1)
      const fy = ((pos[v * 3 + 1] - min.y) / this.lat.size.y) * (ny - 1)
      const fz = ((pos[v * 3 + 2] - min.z) / this.lat.size.z) * (nz - 1)
      const i = Math.min(nx - 2, Math.max(0, Math.floor(fx)))
      const j = Math.min(ny - 2, Math.max(0, Math.floor(fy)))
      const k = Math.min(nz - 2, Math.max(0, Math.floor(fz)))
      this.bind[v] = id(i, j, k)
      this.frac[v * 3] = fx - i
      this.frac[v * 3 + 1] = fy - j
      this.frac[v * 3 + 2] = fz - k
    }
  }

  dropIn() {
    for (let n = 0; n < this.np.length; n += 3) {
      const x = this.nrest[n]
      this.np[n + 1] = this.nrest[n + 1] + 1.1 + x * 0.2
      this.nprev[n + 1] = this.np[n + 1] + 0.01
      this.np[n] = this.nrest[n] + 0.2
      this.nprev[n] = this.np[n]
    }
  }

  step() {
    const f = this.params.firmness
    const stiff = 0.02 + 0.32 * f * f
    const anchor = 0.006 + 0.028 * f
    const damp = 0.004 + 0.07 * this.params.damping
    const np = this.np
    const pv = this.nprev
    const nr = this.nrest
    const N = np.length / 3
    for (let n = 0; n < N; n++) {
      const o = n * 3
      for (let a = 0; a < 3; a++) {
        const v = (np[o + a] - pv[o + a]) * (1 - damp)
        pv[o + a] = np[o + a]
        np[o + a] += v
      }
      np[o + 1] -= 0.0003
    }
    const cons = this.cons
    const iters = 4
    for (let it = 0; it < iters; it++) {
      for (let c = 0; c < cons.length; c += 3) {
        const a = cons[c] * 3
        const b = cons[c + 1] * 3
        const dx = np[b] - np[a]
        const dy = np[b + 1] - np[a + 1]
        const dz = np[b + 2] - np[a + 2]
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        const k = ((len - cons[c + 2]) / len) * 0.5 * stiff
        const wa = 1 - this.grabW[cons[c]] * 0.85
        const wb = 1 - this.grabW[cons[c + 1]] * 0.85
        np[a] += dx * k * wa
        np[a + 1] += dy * k * wa
        np[a + 2] += dz * k * wa
        np[b] -= dx * k * wb
        np[b + 1] -= dy * k * wb
        np[b + 2] -= dz * k * wb
      }
      for (let n = 0; n < N; n++) {
        const o = n * 3
        const w = this.grabW[n]
        const an = anchor * (1 - w)
        np[o] += (nr[o] - np[o]) * an
        np[o + 1] += (nr[o + 1] - np[o + 1]) * an
        np[o + 2] += (nr[o + 2] - np[o + 2]) * an
        if (this.drag && w > 0) {
          const t = this.drag.delta
          np[o] += (this.grabStart[o] + t.x - np[o]) * w
          np[o + 1] += (this.grabStart[o + 1] + t.y - np[o + 1]) * w
          np[o + 2] += (this.grabStart[o + 2] + t.z - np[o + 2]) * w
        }
        const floorY = this.floorY - 0.03 + (nr[o + 1] - this.lat.min.y)
        if (np[o + 1] < floorY) {
          np[o + 1] = floorY
          pv[o] = np[o] - (np[o] - pv[o]) * 0.6
          pv[o + 2] = np[o + 2] - (np[o + 2] - pv[o + 2]) * 0.6
        }
      }
    }
  }

  deform() {
    const pos = this.geo.attributes.position.array
    const np = this.np
    const { nx, ny } = this.lat
    const sy = nx
    const sz = nx * ny
    const vc = pos.length / 3
    for (let v = 0; v < vc; v++) {
      const b = this.bind[v]
      const fx = this.frac[v * 3]
      const fy = this.frac[v * 3 + 1]
      const fz = this.frac[v * 3 + 2]
      const ids = [b, b + 1, b + sy, b + sy + 1, b + sz, b + sz + 1, b + sz + sy, b + sz + sy + 1]
      const ws = [(1 - fx) * (1 - fy) * (1 - fz), fx * (1 - fy) * (1 - fz), (1 - fx) * fy * (1 - fz), fx * fy * (1 - fz), (1 - fx) * (1 - fy) * fz, fx * (1 - fy) * fz, (1 - fx) * fy * fz, fx * fy * fz]
      let x = 0
      let y = 0
      let z = 0
      for (let q = 0; q < 8; q++) {
        const o = ids[q] * 3
        const nrx = this.nrest[o]
        const nry = this.nrest[o + 1]
        const nrz = this.nrest[o + 2]
        x += (np[o] - nrx) * ws[q]
        y += (np[o + 1] - nry) * ws[q]
        z += (np[o + 2] - nrz) * ws[q]
      }
      pos[v * 3] = this.rest[v * 3] + x
      pos[v * 3 + 1] = this.rest[v * 3 + 1] + y
      pos[v * 3 + 2] = this.rest[v * 3 + 2] + z
    }
    this.geo.attributes.position.needsUpdate = true
    this.geo.computeVertexNormals()
    this.geo.computeBoundingSphere()
  }

  bindPointer() {
    const el = this.canvas
    const plane = new THREE.Plane()
    const hit = new THREE.Vector3()
    const toNdc = (e) => {
      const r = el.getBoundingClientRect()
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const pick = () => {
      this.raycaster.setFromCamera(this.pointer, this.camera)
      return this.raycaster.intersectObject(this.mesh, false)[0]
    }
    this.onDown = (e) => {
      toNdc(e)
      const h = pick()
      if (!h) return
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
      const n = new THREE.Vector3()
      this.camera.getWorldDirection(n)
      plane.setFromNormalAndCoplanarPoint(n.negate(), h.point)
      const sigma = 0.3
      const N = this.np.length / 3
      for (let i = 0; i < N; i++) {
        const o = i * 3
        const dx = this.np[o] - h.point.x
        const dy = this.np[o + 1] - h.point.y
        const dz = this.np[o + 2] - h.point.z
        const w = Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * sigma * sigma))
        this.grabW[i] = w > 0.04 ? Math.min(0.92, w) : 0
        this.grabStart[o] = this.np[o]
        this.grabStart[o + 1] = this.np[o + 1]
        this.grabStart[o + 2] = this.np[o + 2]
      }
      this.drag = { origin: h.point.clone(), plane, delta: new THREE.Vector3() }
      el.style.cursor = 'grabbing'
      this.emit('grab', true)
    }
    this.onMove = (e) => {
      toNdc(e)
      if (this.drag) {
        this.raycaster.setFromCamera(this.pointer, this.camera)
        if (this.raycaster.ray.intersectPlane(this.drag.plane, hit)) {
          const d = hit.clone().sub(this.drag.origin)
          const m = d.length()
          const max = 2.6
          if (m > max) d.multiplyScalar(max / m)
          d.y = Math.max(d.y, -0.15)
          this.drag.delta.copy(d)
        }
        return
      }
      const over = !!pick()
      if (over !== this.hover) {
        this.hover = over
        el.style.cursor = over ? 'grab' : ''
      }
    }
    this.onUp = (e) => {
      if (!this.drag) return
      this.drag = null
      this.grabW.fill(0)
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

  resize() {
    const p = this.canvas.parentElement
    const w = p.clientWidth
    const h = p.clientHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    const narrow = w < 760
    const fit = Math.max(1, 1.25 / this.camera.aspect)
    const dist = (narrow ? 7.6 : 7.4) * Math.min(fit, 2.1)
    const el = THREE.MathUtils.degToRad(narrow ? 42 : 36)
    this.camera.position.set(0.15, Math.sin(el) * dist, Math.cos(el) * dist)
    this.camera.lookAt(0.05, narrow ? 0.1 : -0.05, 0)
    this.camera.updateProjectionMatrix()
  }

  setVariety(v) {
    this.variety = v
    const old = this.capsMat.map
    this.capsMat.map = sliceTexture(v)
    this.capsMat.emissive.set(v.attenuation)
    this.sidesMat.emissive.set(v.attenuation)
    this.capsMat.needsUpdate = true
    old && old.dispose()
    this.capsMat.attenuationColor.set(v.attenuation)
    this.sidesMat.attenuationColor.set(v.attenuation)
    this.applySideColors(v)
    this.floor.material.color.set(v.attenuation).multiplyScalar(0.55)
    this.nudge(0.5)
  }

  setFirmness(f) {
    this.params.firmness = f
  }

  setDamping(d) {
    this.params.damping = d
  }

  setPaused(p) {
    this.paused = p
  }

  setSlow(s) {
    this.slow = s
  }

  setShowMesh(s) {
    this.wire.visible = s
  }

  nudge(k = 1) {
    const N = this.np.length / 3
    const a = Math.random() * Math.PI * 2
    for (let i = 0; i < N; i++) {
      const o = i * 3
      const x = this.np[o]
      const z = this.np[o + 2]
      const s = Math.sin(x * 2.4 + a) * 0.5 + Math.cos(z * 2.1 - a) * 0.5
      this.nprev[o + 1] -= (0.045 + 0.035 * s) * k
      this.nprev[o] -= Math.cos(a) * 0.01 * k * s
      this.nprev[o + 2] -= Math.sin(a) * 0.01 * k * s
    }
  }

  reset() {
    this.np.set(this.nrest)
    this.nprev.set(this.nrest)
    this.grabW.fill(0)
    this.drag = null
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) {
      this.acc += dt * (this.slow ? 0.25 : 1)
      let n = 0
      while (this.acc >= STEP && n < 8) {
        this.step()
        this.acc -= STEP
        n++
      }
    }
    this.deform()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    const el = this.canvas
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    this.geo.dispose()
    this.capsMat.map && this.capsMat.map.dispose()
    this.capsMat.dispose()
    this.sidesMat.dispose()
    this.renderer.dispose()
  }
}
