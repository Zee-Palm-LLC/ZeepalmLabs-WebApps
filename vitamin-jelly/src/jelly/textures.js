import * as THREE from 'three'

export const RINGS = { flesh: 0.87, pith: 0.935 }

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export function sliceTexture(v, size = 1024) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const cx = size / 2
  const cy = size / 2
  const R = size / 2
  const rand = rng(11)

  g.fillStyle = v.peel
  g.fillRect(0, 0, size, size)

  const peel = g.createRadialGradient(cx, cy, R * RINGS.pith, cx, cy, R)
  peel.addColorStop(0, v.peel)
  peel.addColorStop(1, v.peelDark)
  g.fillStyle = peel
  g.beginPath()
  g.arc(cx, cy, R, 0, Math.PI * 2)
  g.fill()

  g.fillStyle = v.pith
  g.beginPath()
  g.arc(cx, cy, R * RINGS.pith, 0, Math.PI * 2)
  g.fill()

  const segs = 10
  const rf = R * RINGS.flesh
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + 0.035
    const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.035
    g.save()
    g.beginPath()
    g.moveTo(cx + Math.cos((a0 + a1) / 2) * R * 0.06, cy + Math.sin((a0 + a1) / 2) * R * 0.06)
    g.arc(cx, cy, rf - 4, a0, a1)
    g.closePath()
    g.clip()
    const grd = g.createRadialGradient(cx, cy, R * 0.05, cx, cy, rf)
    grd.addColorStop(0, v.pulp[1])
    grd.addColorStop(0.55, v.pulp[0])
    grd.addColorStop(1, v.pulp[2])
    g.fillStyle = grd
    g.fillRect(0, 0, size, size)
    for (let k = 0; k < 260; k++) {
      const a = a0 + (a1 - a0) * (0.06 + rand() * 0.88)
      const r = R * 0.1 + rand() * (rf - R * 0.12)
      const len = 12 + rand() * 30
      const w = 3.5 + rand() * 5.5
      g.save()
      g.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      g.rotate(a)
      const sac = g.createLinearGradient(-len, 0, len, 0)
      sac.addColorStop(0, 'rgba(255,255,255,0)')
      sac.addColorStop(0.5, v.vesicle)
      sac.addColorStop(1, 'rgba(255,255,255,0)')
      g.globalAlpha = 0.35 + rand() * 0.45
      g.fillStyle = rand() > 0.28 ? sac : v.pulp[2]
      g.beginPath()
      g.ellipse(0, 0, len, w, 0, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
    g.restore()
  }

  g.strokeStyle = v.membrane
  g.lineCap = 'round'
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2
    g.lineWidth = 6
    g.globalAlpha = 0.85
    g.beginPath()
    g.moveTo(cx + Math.cos(a) * R * 0.05, cy + Math.sin(a) * R * 0.05)
    g.lineTo(cx + Math.cos(a) * (rf - 2), cy + Math.sin(a) * (rf - 2))
    g.stroke()
  }
  g.globalAlpha = 1
  g.lineWidth = 5
  g.beginPath()
  g.arc(cx, cy, rf - 2, 0, Math.PI * 2)
  g.stroke()

  g.fillStyle = v.membrane
  g.beginPath()
  g.arc(cx, cy, R * 0.06, 0, Math.PI * 2)
  g.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
