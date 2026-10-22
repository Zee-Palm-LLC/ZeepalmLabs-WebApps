import * as THREE from 'three'
import { makeLandMask } from './landMask.js'

const DEG = Math.PI / 180
const SPACING = 2.3 // degrees between hex centres
const HEX_HEIGHT = 0.007

const sphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Glassy blue ball: lit from the upper left, violet in the lower shadow,
// with a pale rim like the source render.
const sphereFragment = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vec3 n = normalize(vNormal);
    float light = dot(n, normalize(vec3(-0.55, 0.65, 0.55))) * 0.5 + 0.5;
    vec3 deep = vec3(0.35, 0.36, 0.88);
    vec3 mid = vec3(0.47, 0.6, 0.97);
    vec3 high = vec3(0.80, 0.86, 1.0);
    vec3 col = mix(deep, mid, smoothstep(0.15, 0.62, light));
    col = mix(col, high, smoothstep(0.62, 1.0, light) * 0.85);
    float rim = pow(1.0 - max(n.z, 0.0), 2.6);
    col = mix(col, vec3(0.88, 0.89, 1.0), rim * 0.6);
    gl_FragColor = vec4(col, 1.0);
  }
`

function hexCells(isLand) {
  const cells = []
  const rowStep = SPACING * 0.866
  let row = 0
  for (let lat = -82; lat <= 84; lat += rowStep, row++) {
    const ring = Math.max(1, Math.floor((360 * Math.cos(lat * DEG)) / SPACING))
    const step = 360 / ring
    const offset = row % 2 ? step / 2 : 0
    for (let i = 0; i < ring; i++) {
      const lon = -180 + offset + i * step
      if (isLand(lat, lon)) cells.push({ lat, lon })
    }
  }
  return cells
}

const toVec = (lat, lon, r) =>
  new THREE.Vector3(
    r * Math.cos(lat * DEG) * Math.sin(lon * DEG),
    r * Math.sin(lat * DEG),
    r * Math.cos(lat * DEG) * Math.cos(lon * DEG),
  )

// Deterministic pseudo-random, so the cell shading is the same every load.
const hash = (a, b) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export function createGlobe(canvas, { centerLon = 18, tilt = 0.3, intro = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50)
  camera.position.set(0, 0, 4.6)

  scene.add(new THREE.AmbientLight(0xffffff, 1.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  key.position.set(-2.5, 3, 4)
  scene.add(key)

  const tiltGroup = new THREE.Group()
  tiltGroup.rotation.x = tilt
  scene.add(tiltGroup)
  const spin = new THREE.Group()
  spin.rotation.y = -centerLon * DEG
  tiltGroup.add(spin)

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.ShaderMaterial({ vertexShader: sphereVertex, fragmentShader: sphereFragment }),
  )
  spin.add(sphere)

  const cells = hexCells(makeLandMask())
  const radius = (SPACING * DEG) / Math.sqrt(3) * 0.86
  const hexGeo = new THREE.CylinderGeometry(radius, radius, HEX_HEIGHT, 6)
  const hexMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    emissive: new THREE.Color("#C9D2FF"),
    emissiveIntensity: 0.45,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
  })
  const hexes = new THREE.InstancedMesh(hexGeo, hexMat, cells.length)
  spin.add(hexes)

  const up = new THREE.Vector3(0, 1, 0)
  const lavender = new THREE.Color("#C3CDFA")
  const white = new THREE.Color('#FFFFFF')
  const front = toVec(15, centerLon, 1)
  const placed = cells.map(({ lat, lon }, i) => {
    const normal = toVec(lat, lon, 1)
    const n = hash(lat, lon)
    // Brighter blobs over northern Africa and Europe, as in the render.
    const glow = Math.max(0, 1 - normal.distanceTo(toVec(28, 20, 1)) * 1.6)
    const color = lavender.clone().lerp(white, Math.min(1, 0.35 + n * 0.45 + glow))
    hexes.setColorAt(i, color)
    return {
      position: normal.clone().multiplyScalar(1 + HEX_HEIGHT / 2),
      quaternion: new THREE.Quaternion().setFromUnitVectors(up, normal),
      // Cells nearest the viewer appear first, then the wave wraps around.
      delay: (1 - normal.dot(front)) * 0.55 + n * 0.25,
    }
  })
  hexes.instanceColor.needsUpdate = true

  const matrix = new THREE.Matrix4()
  const scaleVec = new THREE.Vector3()
  const setHexes = (t) => {
    placed.forEach((p, i) => {
      const k = intro ? THREE.MathUtils.clamp((t - p.delay) / 0.45, 0, 1) : 1
      const e = 1 - Math.pow(1 - k, 3)
      scaleVec.set(e, 1 + (1 - e) * 6, e)
      matrix.compose(p.position, p.quaternion, scaleVec)
      if (k === 0) matrix.makeScale(0, 0, 0)
      hexes.setMatrixAt(i, matrix)
    })
    hexes.instanceMatrix.needsUpdate = true
  }
  setHexes(0)

  let width = 0
  let height = 0
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w === width && h === height) return
    width = w
    height = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // In a tall container, pull back so the ball still fits the width.
    camera.position.z = 4.6 / Math.min(1, camera.aspect)
    camera.updateProjectionMatrix()
  }

  // Drag to spin; it eases back to the slow auto-rotation.
  let velocity = 0
  let dragging = false
  let lastX = 0
  const onDown = (e) => {
    dragging = true
    lastX = e.clientX
    canvas.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    spin.rotation.y += dx * 0.006
    velocity = dx * 0.006 * 60
  }
  const onUp = () => (dragging = false)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)

  const AUTO = 0.07
  const clock = new THREE.Clock()
  let elapsed = 0
  let introDone = !intro
  let frame = 0
  const tick = () => {
    frame = requestAnimationFrame(tick)
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt
    resize()
    if (!introDone) {
      setHexes(elapsed)
      if (elapsed > 1.4) introDone = true
    }
    if (!dragging) {
      velocity += (AUTO - velocity) * Math.min(1, dt * 2.5)
      spin.rotation.y += velocity * dt
    }
    renderer.render(scene, camera)
  }
  tick()

  return () => {
    cancelAnimationFrame(frame)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    hexGeo.dispose()
    hexMat.dispose()
    sphere.geometry.dispose()
    sphere.material.dispose()
    renderer.dispose()
  }
}
