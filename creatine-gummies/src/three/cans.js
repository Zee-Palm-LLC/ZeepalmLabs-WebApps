import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { byId } from '../data/flavors.js'

const BODY_H = 2.3
const LID_H = 0.62
const GAP = 0.06
const TOTAL = BODY_H + GAP + LID_H
const R = 1

export function starPath(ctx, cx, cy, s, rot = Math.PI / 4) {
  const p = (x, y) => [cx + (x * Math.cos(rot) - y * Math.sin(rot)) * s, cy + (x * Math.sin(rot) + y * Math.cos(rot)) * s]
  const k = 0.16
  const pts = [
    [0, -1],
    [k, -k],
    [1, 0],
    [k, k],
    [0, 1],
    [-k, k],
    [-1, 0],
    [-k, -k],
  ]
  ctx.beginPath()
  ctx.moveTo(...p(...pts[0]))
  for (let i = 0; i < 8; i += 2) {
    const c = pts[i + 1]
    const e = pts[(i + 2) % 8]
    ctx.quadraticCurveTo(...p(...c), ...p(...e))
  }
  ctx.closePath()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function bodyTexture(f) {
  const W = 2048
  const H = Math.round((W * BODY_H) / (Math.PI * 2 * R))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = f.can
  ctx.fillRect(0, 0, W, H)
  const cx = W / 2
  ctx.fillStyle = f.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '400 62px Gelasio'
  const lines = f.words.map((w) => w.toUpperCase())
  ctx.fillText(lines[0], cx, H * 0.2)
  ctx.fillText(lines[1], cx, H * 0.2 + 64)
  ctx.font = '500 21px Figtree'
  ctx.globalAlpha = 0.85
  f.desc.forEach((l, i) => ctx.fillText(l, cx, H * 0.2 + 120 + i * 24))
  ctx.globalAlpha = 1
  const ly = H * 0.86
  const sq = 96
  const tx = cx - 300
  ctx.fillStyle = f.logoFill
  roundRect(ctx, tx - sq / 2, ly - sq / 2 - 22, sq, sq, 16)
  ctx.fill()
  ctx.fillStyle = f.logoInk
  starPath(ctx, tx, ly - 22, 34)
  ctx.fill()
  ctx.fillStyle = f.ink
  ctx.textAlign = 'left'
  ctx.font = '400 78px Gelasio'
  ctx.fillText('Creatine Gummies', tx + 66, ly + 4)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function lidTexture(f) {
  const W = 2048
  const H = Math.round((W * LID_H) / (Math.PI * 2 * R * 1.012))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = f.lid
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = f.ink
  ctx.textAlign = 'center'
  ctx.font = '400 44px Gelasio'
  ctx.fillText(f.tag, W / 2, H * 0.64)
  starPath(ctx, W / 2 - 255, H * 0.52, 14, 0)
  ctx.fill()
  starPath(ctx, W / 2 + 255, H * 0.52, 14, 0)
  ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function shade(hex, k) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, k)
  return c
}

function makeCan(f) {
  const g = new THREE.Group()
  const mat = (map, color) => new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : color, roughness: 0.5, metalness: 0.0, envMapIntensity: 0.5 })
  const side = new THREE.Mesh(new THREE.CylinderGeometry(R, R, BODY_H, 160, 1, true, -Math.PI, Math.PI * 2), mat(bodyTexture(f)))
  side.position.y = BODY_H / 2
  g.add(side)
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(R, 96), mat(null, shade(f.can, -0.08)))
  bottom.rotation.x = Math.PI / 2
  g.add(bottom)
  const groove = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.985, R * 0.985, GAP, 160, 1, true), mat(null, shade(f.can, -0.12)))
  groove.position.y = BODY_H + GAP / 2
  g.add(groove)
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.012, R * 1.012, LID_H, 160, 1, true, -Math.PI, Math.PI * 2), mat(lidTexture(f)))
  lid.position.y = BODY_H + GAP + LID_H / 2
  g.add(lid)
  const pts = []
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2)
    pts.push(new THREE.Vector2(R * 1.012 - 0.05 + Math.cos(a) * 0.05, Math.sin(a) * 0.05))
  }
  pts.push(new THREE.Vector2(0, 0.05))
  const top = new THREE.Mesh(new THREE.LatheGeometry(pts, 160), mat(null, shade(f.lid, 0.02)))
  top.position.y = BODY_H + GAP + LID_H - 0.001
  g.add(top)
  g.children.forEach((m) => (m.position.y -= TOTAL / 2))
  return g
}

export const CAN_ASPECT = TOTAL / (2 * R)

export function createCanStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearColor(0x000000, 0)
  renderer.autoClear = false
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b0a4, 0.8))
  const key = new THREE.DirectionalLight(0xffffff, 2.3)
  key.position.set(-6, 3, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.9)
  rim.position.set(5, 2, -2)
  scene.add(rim)
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -5000, 5000)
  camera.position.z = 1000

  const proto = {}
  const protoFor = (id) => (proto[id] ||= makeCan(byId[id]))
  const items = new Set()

  const register = (el, flavor, init = {}) => {
    const group = protoFor(flavor).clone()
    scene.add(group)
    const h = { el, flavor, group, rotX: 0.32, rotY: 0, rotZ: 0, scale: 1, opacity: 1, dx: 0, dy: 0, visible: true, ...init }
    items.add(h)
    return h
  }
  const setFlavor = (h, flavor) => {
    if (h.flavor === flavor) return
    scene.remove(h.group)
    h.group = protoFor(flavor).clone()
    h.flavor = flavor
    scene.add(h.group)
  }
  const unregister = (h) => {
    scene.remove(h.group)
    items.delete(h)
  }

  let raf = 0
  const frame = () => {
    raf = requestAnimationFrame(frame)
    const w = window.innerWidth
    const hgt = window.innerHeight
    const dpr = renderer.getPixelRatio()
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(hgt * dpr)) renderer.setSize(w, hgt, false)
    camera.left = 0
    camera.right = w
    camera.top = 0
    camera.bottom = -hgt
    camera.updateProjectionMatrix()
    renderer.setScissorTest(false)
    renderer.clear()
    for (const h of items) {
      const r = h.el.getBoundingClientRect()
      const on = h.visible && h.opacity > 0.01 && r.bottom > -400 && r.top < hgt + 400 && r.width > 0
      h.group.visible = false
      if (!on) continue
      const s = (r.height / (CAN_ASPECT * 2)) * h.scale
      h.group.position.set(r.left + r.width / 2 + h.dx, -(r.top + r.height / 2 + h.dy), 0)
      h.group.scale.setScalar(s)
      h.group.rotation.set(h.rotX, h.rotY, h.rotZ, 'ZXY')
      h.group.traverse((m) => {
        if (m.material) {
          m.material.transparent = h.opacity < 0.999
          m.material.opacity = h.opacity
        }
      })
      const clip = h.el.closest('[data-clip]')
      for (const other of items) other.group.visible = other === h
      if (clip) {
        const c = clip.getBoundingClientRect()
        const x0 = Math.max(0, c.left)
        const y0 = Math.max(0, c.top)
        const x1 = Math.min(w, c.right)
        const y1 = Math.min(hgt, c.bottom)
        if (x1 <= x0 || y1 <= y0) continue
        renderer.setScissorTest(true)
        renderer.setScissor(x0, hgt - y1, x1 - x0, y1 - y0)
      } else renderer.setScissorTest(false)
      renderer.render(scene, camera)
    }
  }
  raf = requestAnimationFrame(frame)

  return {
    register,
    unregister,
    setFlavor,
    destroy() {
      cancelAnimationFrame(raf)
      renderer.dispose()
    },
  }
}
