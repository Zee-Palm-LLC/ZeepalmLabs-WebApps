import { GRID, ROADS, SPOTS, sdfAt, bodyGrid, FINGERS } from './body.js'
import { rng } from './noise.js'

const TABLE = [0.98, 0.94, 0.91]
const toSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)
const c = (r, g, b, a = 1) => `rgba(${r},${g},${b},${a})`

function blob(ctx, pts) {
  const n = pts.length
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(pts[n - 1], pts[0])
  ctx.moveTo(m0[0], m0[1])
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const m = mid(p, pts[(i + 1) % n])
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1])
  }
  ctx.closePath()
}

function line(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1])
  if (pts.length === 2) return ctx.lineTo(pts[1][0], pts[1][1])
  for (let i = 1; i < pts.length - 1; i++) {
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1])
  }
  const l = pts[pts.length - 1]
  ctx.lineTo(l[0], l[1])
}

const mirror = (pts) => pts.map(([x, z]) => [-x, z])
const both = (pts) => [pts, mirror(pts)]

function centroid(pts) {
  let x = 0
  let z = 0
  for (const p of pts) {
    x += p[0]
    z += p[1]
  }
  return [x / pts.length, z / pts.length]
}

const ORGANS = {
  lungR: [
    [-1.35, -9.05],
    [-0.8, -8.65],
    [-0.55, -7.5],
    [-0.6, -6.1],
    [-0.75, -5.0],
    [-1.3, -4.75],
    [-2.0, -4.85],
    [-2.55, -5.3],
    [-2.72, -6.6],
    [-2.5, -8.0],
    [-2.0, -8.85],
  ],
  lungL: [
    [1.35, -9.05],
    [0.82, -8.65],
    [0.68, -7.7],
    [1.25, -7.25],
    [1.62, -6.4],
    [1.35, -5.5],
    [1.6, -4.95],
    [2.15, -4.95],
    [2.62, -5.4],
    [2.72, -6.7],
    [2.5, -8.0],
    [2.0, -8.85],
  ],
  heart: [
    [-0.4, -6.9],
    [-0.05, -7.4],
    [0.6, -7.45],
    [1.3, -7.15],
    [1.65, -6.5],
    [1.55, -5.8],
    [1.2, -5.4],
    [0.55, -5.55],
    [-0.15, -5.95],
    [-0.48, -6.4],
  ],
  liver: [
    [-2.4, -4.6],
    [-1.2, -4.7],
    [0.0, -4.55],
    [0.9, -4.3],
    [1.2, -4.0],
    [0.65, -3.65],
    [-0.2, -3.1],
    [-1.0, -2.65],
    [-1.8, -2.6],
    [-2.35, -3.0],
    [-2.55, -3.8],
  ],
  stomach: [
    [0.72, -4.55],
    [1.4, -4.8],
    [2.05, -4.55],
    [2.32, -3.9],
    [2.22, -3.1],
    [1.75, -2.72],
    [1.05, -2.78],
    [0.45, -2.95],
    [0.22, -3.32],
    [0.62, -3.42],
    [1.15, -3.45],
    [1.32, -3.85],
    [1.0, -4.2],
  ],
  pancreas: [
    [-0.18, -2.22],
    [0.4, -2.4],
    [1.0, -2.52],
    [1.7, -2.72],
    [2.0, -2.95],
    [1.7, -3.08],
    [1.0, -2.88],
    [0.35, -2.72],
    [-0.18, -2.6],
  ],
  spleen: [
    [1.92, -4.6],
    [2.25, -4.45],
    [2.35, -3.95],
    [2.18, -3.55],
    [1.98, -3.75],
    [1.88, -4.2],
  ],
  bladder: [
    [-0.45, 0.82],
    [0, 0.68],
    [0.45, 0.82],
    [0.5, 1.15],
    [0.2, 1.42],
    [-0.2, 1.42],
    [-0.5, 1.15],
  ],
}

function kidney(cx, cz, sgn) {
  const pts = []
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2
    let rx = 0.33
    const rz = 0.56
    const dent = Math.max(0, Math.cos(a) * -sgn)
    rx -= dent * dent * dent * 0.16
    const x = Math.cos(a) * rx
    const z = Math.sin(a) * rz
    const t = -0.2 * sgn
    pts.push([cx + x * Math.cos(t) - z * Math.sin(t), cz + x * Math.sin(t) + z * Math.cos(t)])
  }
  return pts
}

export function paintSkin({ features, canal }) {
  const { x0, x1, z0, z1 } = GRID
  const W = 1536
  const H = Math.round((W * (z1 - z0)) / (x1 - x0))
  const S = W / (x1 - x0)
  const make = () => {
    const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H })
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.setTransform(S, 0, 0, S, -x0 * S, -z0 * S)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    return ctx
  }
  const C = make()
  const K = make()
  const r = rng(77)
  const both2 = (fn) => {
    fn(1)
    fn(-1)
  }
  const radial = (ctx, x, z, rad, col, a) => {
    const g = ctx.createRadialGradient(x, z, 0, x, z, rad)
    g.addColorStop(0, c(...col, a))
    g.addColorStop(1, c(...col, 0))
    ctx.fillStyle = g
    ctx.fillRect(x - rad, z - rad, rad * 2, rad * 2)
  }
  const stroke = (ctx, pts, col, w) => {
    ctx.beginPath()
    line(ctx, pts)
    ctx.strokeStyle = col
    ctx.lineWidth = w
    ctx.stroke()
  }
  const organ = (pts, inner, outer, a, edge, maskA = 0.4) => {
    const [cx, cz] = centroid(pts)
    let rad = 0
    for (const p of pts) rad = Math.max(rad, Math.hypot(p[0] - cx, p[1] - cz))
    const g = C.createRadialGradient(cx - rad * 0.2, cz - rad * 0.25, rad * 0.05, cx, cz, rad * 1.05)
    g.addColorStop(0, c(...inner, a))
    g.addColorStop(1, c(...outer, a))
    C.beginPath()
    blob(C, pts)
    C.fillStyle = g
    C.fill()
    C.strokeStyle = c(...edge, 0.45)
    C.lineWidth = 0.035
    C.stroke()
    K.beginPath()
    blob(K, pts)
    K.fillStyle = c(0, 0, 0, maskA)
    K.fill()
  }
  const clipTo = (pts, fn) => {
    C.save()
    C.beginPath()
    blob(C, pts)
    C.clip()
    fn()
    C.restore()
  }

  C.fillStyle = c(236, 196, 178)
  C.fillRect(x0, z0, x1 - x0, z1 - z0)
  K.fillStyle = '#fff'
  K.fillRect(x0, z0, x1 - x0, z1 - z0)

  for (let k = 0; k < 1400; k++) {
    const x = x0 + r() * (x1 - x0)
    const z = z0 + r() * (z1 - z0)
    if (sdfAt(x, z) > 0.2) continue
    const pick = r()
    const col = pick < 0.35 ? [214, 148, 132] : pick < 0.65 ? [244, 206, 176] : pick < 0.9 ? [250, 218, 202] : [196, 140, 120]
    radial(C, x, z, 0.06 + r() * 0.5, col, 0.05 + r() * 0.05)
  }
  for (let k = 0; k < 2600; k++) {
    const x = x0 + r() * (x1 - x0)
    const z = z0 + r() * (z1 - z0)
    if (sdfAt(x, z) > 0) continue
    C.fillStyle = c(190, 130, 112, 0.05 + r() * 0.06)
    C.beginPath()
    C.arc(x, z, 0.01 + r() * 0.02, 0, Math.PI * 2)
    C.fill()
  }

  both2((s) => {
    radial(C, s * 0.72, -12.3, 0.48, [232, 140, 130], 0.24)
    radial(C, s * 1.55, 8.05, 0.55, [218, 140, 128], 0.2)
    radial(C, s * 4.5, -3.25, 0.45, [215, 145, 130], 0.18)
    radial(C, s * 5.22, 1.85, 0.6, [232, 150, 140], 0.22)
    for (const f of FINGERS) radial(C, s * f[2], f[3] - 0.05, 0.15, [236, 140, 132], 0.32)
    radial(C, s * 1.82, 16.7, 0.55, [228, 140, 128], 0.2)
    radial(C, s * 1.52, -12.35, 0.35, [210, 140, 128], 0.25)
    radial(C, s * 3.05, -7.55, 0.6, [190, 135, 118], 0.2)
    radial(C, s * 0.75, 1.75, 0.5, [190, 135, 118], 0.16)
  })
  radial(C, 0, -12.05, 0.22, [232, 145, 135], 0.22)
  radial(C, 0, -10.7, 1.0, [175, 120, 105], 0.18)

  C.lineWidth = 0.12
  C.strokeStyle = c(255, 246, 232, 0.2)
  both2((s) => {
    for (let k = 0; k < 9; k++) {
      const zz = -8.95 + k * 0.52
      const len = 1.0 - Math.abs(k - 3.5) * 0.06
      const pts = [
        [s * 0.3, zz],
        [s * 1.15 * len, zz + 0.12],
        [s * 2.05 * len, zz + 0.45],
        [s * 2.6 * len, zz + 0.95],
      ]
      C.beginPath()
      line(C, pts)
      C.stroke()
    }
    stroke(C, [
      [s * 0.3, -9.28],
      [s * 1.5, -9.4],
      [s * 2.9, -9.08],
    ], c(255, 246, 232, 0.28), 0.15)
    stroke(C, [
      [s * 0.6, 1.2],
      [s * 1.2, -0.6],
      [s * 2.0, -0.9],
      [s * 2.5, -0.35],
      [s * 2.3, 0.55],
    ], c(255, 246, 232, 0.16), 0.14)
    C.beginPath()
    C.ellipse(s * 1.55, 8.02, 0.3, 0.36, 0, 0, Math.PI * 2)
    C.fillStyle = c(255, 244, 230, 0.16)
    C.fill()
  })
  stroke(C, [
    [0, -9.15],
    [0, -5.05],
  ], c(255, 246, 232, 0.2), 0.32)

  stroke(C, [
    [0, -10.4],
    [0.05, -8.85],
  ], c(244, 226, 214, 0.75), 0.24)
  for (let k = 0; k < 8; k++)
    stroke(C, [
      [-0.11, -10.3 + k * 0.18],
      [0.13, -10.28 + k * 0.18],
    ], c(214, 180, 168, 0.6), 0.03)
  both2((s) => {
    stroke(C, [
      [s * 0.05, -8.85],
      [s * 0.5, -8.2],
      [s * (s > 0 ? 1.0 : 0.95), -7.7],
    ], c(244, 226, 214, 0.65), 0.15)
  })

  organ(ORGANS.lungR, [244, 170, 178], [214, 120, 134], 0.82, [170, 80, 95])
  organ(ORGANS.lungL, [244, 170, 178], [214, 120, 134], 0.82, [170, 80, 95])
  for (const pts of [ORGANS.lungR, ORGANS.lungL])
    clipTo(pts, () => {
      const [ox, oz] = centroid(pts)
      for (let k = 0; k < 900; k++) {
        const x = ox + (r() - 0.5) * 2.4
        const z = oz + (r() - 0.5) * 4.6
        C.fillStyle = r() < 0.5 ? c(190, 95, 110, 0.18) : c(255, 205, 210, 0.2)
        C.beginPath()
        C.arc(x, z, 0.02 + r() * 0.05, 0, Math.PI * 2)
        C.fill()
      }
      const s = Math.sign(ox)
      const hx = s * 0.95
      const hz = -7.4
      const tree = (x, z, a, len, w, d) => {
        if (d === 0) return
        const ex = x + Math.cos(a) * len
        const ez = z + Math.sin(a) * len
        stroke(C, [
          [x, z],
          [ex, ez],
        ], c(250, 214, 214, 0.45), w)
        tree(ex, ez, a - 0.45 - r() * 0.2, len * 0.72, w * 0.68, d - 1)
        tree(ex, ez, a + 0.45 + r() * 0.2, len * 0.72, w * 0.68, d - 1)
      }
      for (const a of [-1.9, -2.6, 0.9, 1.4]) tree(hx, hz, s > 0 ? Math.PI - a : a, 0.55, 0.07, 5)
      stroke(C, [
        [s * 0.9, -8.4],
        [s * 1.9, -6.9],
        [s * 2.5, -5.3],
      ], c(160, 70, 85, 0.45), 0.025)
    })

  organ(ORGANS.heart, [214, 80, 88], [150, 30, 42], 0.9, [110, 20, 30])
  clipTo(ORGANS.heart, () => {
    stroke(C, [
      [0.9, -7.35],
      [0.7, -6.6],
      [0.95, -5.9],
      [1.25, -5.45],
    ], c(240, 220, 150, 0.55), 0.07)
    stroke(C, [
      [-0.2, -6.7],
      [0.25, -6.3],
      [0.5, -5.7],
    ], c(240, 220, 150, 0.45), 0.05)
  })

  stroke(C, [
    [-2.7, -4.7],
    [-1.2, -4.95],
    [0, -4.75],
    [1.3, -4.95],
    [2.6, -4.7],
  ], c(200, 120, 115, 0.3), 0.06)

  organ(ORGANS.stomach, [240, 176, 162], [205, 120, 112], 0.88, [160, 80, 75])
  clipTo(ORGANS.stomach, () => {
    for (let k = 0; k < 9; k++)
      stroke(C, [
        [1.0 + k * 0.13, -4.55],
        [1.25 + k * 0.1, -3.8],
        [1.15 + k * 0.08, -3.0],
      ], c(200, 110, 105, 0.3), 0.025)
  })
  organ(ORGANS.spleen, [176, 96, 128], [130, 60, 92], 0.85, [100, 40, 70])
  organ(ORGANS.liver, [176, 82, 74], [126, 46, 42], 0.9, [96, 30, 28])
  clipTo(ORGANS.liver, () => {
    stroke(C, [
      [0.05, -4.55],
      [-0.25, -3.6],
      [-0.4, -3.0],
    ], c(100, 30, 28, 0.4), 0.03)
    for (let k = 0; k < 500; k++) {
      C.fillStyle = r() < 0.5 ? c(110, 36, 32, 0.15) : c(196, 110, 100, 0.12)
      C.beginPath()
      C.arc(-2.5 + r() * 3.8, -4.7 + r() * 2.2, 0.03 + r() * 0.06, 0, Math.PI * 2)
      C.fill()
    }
  })
  C.beginPath()
  C.ellipse(-0.75, -2.85, 0.16, 0.24, 0.4, 0, Math.PI * 2)
  C.fillStyle = c(150, 175, 100, 0.8)
  C.fill()
  organ(ORGANS.pancreas, [248, 222, 170], [222, 180, 128], 0.9, [180, 140, 90])
  clipTo(ORGANS.pancreas, () => {
    for (let k = 0; k < 120; k++) {
      C.strokeStyle = c(200, 160, 110, 0.35)
      C.lineWidth = 0.012
      C.beginPath()
      C.arc(-0.1 + r() * 2.0, -2.95 + r() * 0.75, 0.05 + r() * 0.05, 0, Math.PI * 2)
      C.stroke()
    }
  })

  both2((s) => {
    const kp = kidney(s * 1.55, -1.85, s)
    organ(kp, [196, 92, 92], [140, 48, 54], 0.9, [100, 30, 36])
    C.beginPath()
    C.ellipse(s * 1.32, -1.85, 0.1, 0.18, 0, 0, Math.PI * 2)
    C.fillStyle = c(244, 214, 196, 0.8)
    C.fill()
    C.beginPath()
    C.ellipse(s * 1.62, -2.45, 0.22, 0.1, s * 0.4, 0, Math.PI * 2)
    C.fillStyle = c(236, 196, 110, 0.85)
    C.fill()
    stroke(C, [
      [s * 1.28, -1.75],
      [s * 1.0, -0.6],
      [s * 0.7, 0.3],
      [s * 0.35, 0.95],
    ], c(236, 206, 190, 0.7), 0.06)
  })
  organ(ORGANS.bladder, [244, 214, 160], [216, 176, 124], 0.88, [170, 130, 90])

  const SI = [
    [-0.75, -1.15],
    [0.75, -1.15],
    [0.82, 0.3],
    [0.3, 0.62],
    [-0.4, 0.6],
    [-0.8, 0.2],
  ]
  organ(SI, [244, 180, 172], [222, 140, 134], 0.85, [180, 100, 96])
  clipTo(SI, () => {
    for (let k = 0; k < 26; k++) {
      const x = -0.7 + r() * 1.4
      const z = -1.05 + r() * 1.55
      C.strokeStyle = c(200, 110, 108, 0.4)
      C.lineWidth = 0.05
      C.beginPath()
      C.ellipse(x, z, 0.12 + r() * 0.12, 0.08 + r() * 0.1, r() * 3, 0, Math.PI * 2)
      C.stroke()
    }
  })
  const colon = canal.slice(Math.floor(canal.length * 0.47))
  stroke(C, colon, c(226, 150, 136, 0.9), 0.44)
  for (let i = 2; i < colon.length - 1; i += 2) {
    const p = colon[i]
    const q = colon[i + 1]
    const dx = q[0] - p[0]
    const dz = q[1] - p[1]
    const l = Math.hypot(dx, dz) || 1
    stroke(C, [
      [p[0] - (dz / l) * 0.2, p[1] + (dx / l) * 0.2],
      [p[0] + (dz / l) * 0.2, p[1] - (dx / l) * 0.2],
    ], c(180, 100, 92, 0.4), 0.025)
  }
  K.lineCap = 'round'
  K.beginPath()
  line(K, colon)
  K.strokeStyle = c(0, 0, 0, 0.4)
  K.lineWidth = 0.44
  K.stroke()

  C.save()
  C.beginPath()
  C.ellipse(0, -14.05, 1.25, 0.95, 0, 0, Math.PI * 2)
  C.fillStyle = c(238, 196, 200, 0.82)
  C.fill()
  C.clip()
  for (let k = 0; k < 70; k++) {
    let x = -1.2 + r() * 2.4
    let z = -14.95 + r() * 1.8
    const pts = [[x, z]]
    let a = r() * 6.28
    for (let q = 0; q < 6; q++) {
      a += (r() - 0.5) * 2.2
      x += Math.cos(a) * 0.12
      z += Math.sin(a) * 0.12
      pts.push([x, z])
    }
    stroke(C, pts, c(206, 146, 158, 0.55), 0.035)
  }
  stroke(C, [
    [0, -15.0],
    [0, -13.1],
  ], c(170, 110, 120, 0.6), 0.04)
  C.restore()

  both2((s) => {
    stroke(C, [
      [s * 0.16, -13.28],
      [s * 0.5, -13.4],
      [s * 0.86, -13.25],
    ], c(118, 84, 66, 0.75), 0.075)
    for (let k = 0; k < 18; k++) {
      const t = k / 17
      const x = s * (0.16 + t * 0.7)
      const z = -13.28 - Math.sin(t * Math.PI) * 0.1
      stroke(C, [
        [x, z + 0.04],
        [x + s * 0.06, z - 0.03],
      ], c(100, 70, 55, 0.6), 0.012)
    }
    radial(C, s * 0.5, -12.92, 0.3, [196, 140, 128], 0.28)
    stroke(C, [
      [s * 0.27, -12.87],
      [s * 0.5, -12.8],
      [s * 0.75, -12.88],
    ], c(70, 46, 40, 0.85), 0.03)
    stroke(C, [
      [s * 0.3, -12.98],
      [s * 0.5, -13.04],
      [s * 0.72, -12.98],
    ], c(150, 100, 88, 0.4), 0.014)
    C.beginPath()
    C.ellipse(s * 0.13, -11.97, 0.055, 0.032, s * 0.3, 0, Math.PI * 2)
    C.fillStyle = c(120, 70, 64, 0.75)
    C.fill()
    stroke(C, [
      [s * 0.1, -12.1],
      [s * 0.22, -12.04],
      [s * 0.2, -11.93],
    ], c(170, 110, 100, 0.4), 0.015)
    stroke(C, [
      [s * 1.48, -12.78],
      [s * 1.64, -12.4],
      [s * 1.5, -11.95],
    ], c(170, 110, 98, 0.55), 0.035)
    stroke(C, [
      [s * 1.48, -12.55],
      [s * 1.55, -12.3],
      [s * 1.48, -12.1],
    ], c(185, 125, 112, 0.4), 0.025)
  })
  stroke(C, [
    [0, -11.9],
    [0, -11.68],
  ], c(200, 140, 128, 0.35), 0.06)
  C.beginPath()
  blob(C, [
    [-0.31, -11.56],
    [-0.16, -11.67],
    [0, -11.62],
    [0.16, -11.67],
    [0.31, -11.56],
    [0, -11.53],
  ])
  C.fillStyle = c(196, 106, 108, 0.85)
  C.fill()
  C.beginPath()
  blob(C, [
    [-0.28, -11.54],
    [-0.12, -11.4],
    [0.12, -11.4],
    [0.28, -11.54],
    [0, -11.5],
  ])
  C.fillStyle = c(204, 116, 116, 0.85)
  C.fill()
  stroke(C, [
    [-0.31, -11.555],
    [0, -11.535],
    [0.31, -11.555],
  ], c(130, 62, 64, 0.8), 0.022)
  radial(C, 0, -11.44, 0.12, [255, 226, 220], 0.25)

  both2((s) => {
    for (const [ax, az, bx, bz] of FINGERS) {
      for (const t of [0.42, 0.72]) {
        const x = ax + (bx - ax) * t
        const z = az + (bz - az) * t
        stroke(C, [
          [s * (x - 0.08), z],
          [s * (x + 0.08), z + 0.01],
        ], c(176, 116, 106, 0.55), 0.016)
      }
    }
    stroke(C, [
      [s * 4.92, 2.35],
      [s * 5.25, 2.25],
      [s * 5.62, 2.08],
    ], c(176, 116, 106, 0.5), 0.02)
    stroke(C, [
      [s * 4.98, 2.0],
      [s * 5.3, 1.88],
      [s * 5.5, 1.62],
    ], c(176, 116, 106, 0.45), 0.02)
    stroke(C, [
      [s * 5.45, 1.25],
      [s * 5.3, 1.7],
      [s * 5.33, 2.3],
    ], c(176, 116, 106, 0.45), 0.02)
    for (const tx of [1.55, 1.83, 2.05, 2.25])
      stroke(C, [
        [s * tx, 16.45],
        [s * (tx + 0.02), 16.9],
      ], c(180, 120, 108, 0.5), 0.02)
    const nails = [
      [1.36, 16.74, 0.14, 0.12],
      [1.69, 16.8, 0.09, 0.08],
      [1.94, 16.8, 0.08, 0.07],
      [2.15, 16.76, 0.07, 0.065],
      [2.33, 16.68, 0.06, 0.055],
    ]
    for (const [nx, nz, rx, rz] of nails) {
      C.beginPath()
      C.ellipse(s * nx, nz, rx, rz, 0, 0, Math.PI * 2)
      C.fillStyle = c(250, 222, 212, 0.9)
      C.fill()
      C.strokeStyle = c(190, 130, 120, 0.6)
      C.lineWidth = 0.012
      C.stroke()
    }
  })
  radial(C, 0, -2.75, 0.14, [140, 86, 76], 0.6)

  const veins = [
    [
      [3.55, -7.9],
      [4.25, -5.6],
      [4.8, -3.3],
      [5.05, -1.3],
      [5.4, 0.9],
      [5.6, 1.6],
    ],
    [
      [3.6, -5.0],
      [4.05, -3.4],
      [4.3, -1.6],
      [4.75, 0.6],
    ],
    [
      [4.85, -3.1],
      [4.45, -3.05],
      [4.1, -3.0],
    ],
    [
      [5.0, 1.4],
      [5.12, 2.3],
      [5.0, 2.62],
    ],
    [
      [1.0, 1.7],
      [0.75, 4.2],
      [0.95, 7.6],
      [1.1, 9.5],
      [1.2, 12.5],
      [1.15, 14.6],
      [1.3, 15.6],
    ],
    [
      [2.0, 9.6],
      [2.02, 12.5],
      [1.8, 14.8],
    ],
    [
      [0.55, -11.0],
      [0.6, -9.7],
    ],
    [
      [1.5, 15.4],
      [1.8, 15.9],
      [2.1, 15.8],
    ],
  ]
  for (const v of veins)
    for (const pts of both(v)) {
      stroke(C, pts, c(110, 130, 186, 0.22), 0.13)
      stroke(C, pts, c(96, 116, 176, 0.38), 0.055)
    }

  const caps = [[], [], [], []]
  const grow = (x, z, a, len, d) => {
    const ex = x + Math.cos(a) * len
    const ez = z + Math.sin(a) * len
    if (sdfAt(ex, ez) > -0.12) return
    if (ez < -10.4 && Math.abs(ex) < 1.2) return
    caps[d].push([x, z, ex, ez])
    if (d === 3) return
    grow(ex, ez, a - 0.35 - r() * 0.4, len * 0.62, d + 1)
    grow(ex, ez, a + 0.35 + r() * 0.4, len * 0.62, d + 1)
  }
  for (const rd of ROADS) {
    for (let sAt = 0.25; sAt < rd.len; sAt += 0.42) {
      let i = 1
      while (i < rd.s.length - 1 && rd.s[i] < sAt) i++
      const p = rd.pts[i - 1]
      const q = rd.pts[i]
      const dx = q[0] - p[0]
      const dz = q[1] - p[1]
      const l = Math.hypot(dx, dz) || 1
      for (const side of [-1, 1]) {
        const nx = (-dz / l) * side
        const nz = (dx / l) * side
        const sx = p[0] + nx * (rd.w + 0.14)
        const sz = p[1] + nz * (rd.w + 0.14)
        if (sdfAt(sx, sz) > -0.1) continue
        grow(sx, sz, Math.atan2(nz, nx) + (r() - 0.5) * 0.8, 0.32 + r() * 0.2, 0)
      }
    }
  }
  caps.forEach((list, d) => {
    C.beginPath()
    for (const [ax, az, bx, bz] of list) {
      C.moveTo(ax, az)
      C.lineTo(bx, bz)
    }
    C.strokeStyle = c(196, 66, 74, 0.32 - d * 0.05)
    C.lineWidth = 0.045 * Math.pow(0.68, d)
    C.stroke()
  })

  const city = (draw) => {
    draw(C, true)
    draw(K, false)
  }
  city((ctx, col) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const rd of ROADS) {
      ctx.beginPath()
      line(ctx, rd.pts)
      ctx.strokeStyle = col ? c(228, 222, 212, 0.95) : c(0, 0, 0, 0.95)
      ctx.lineWidth = 2 * (rd.w + 0.065)
      ctx.stroke()
    }
  })
  C.setLineDash([0.08, 0.06])
  for (const sp of SPOTS) {
    C.strokeStyle = c(255, 250, 240, 0.55)
    C.lineWidth = 0.03
    C.beginPath()
    C.arc(sp.x, sp.z, sp.r * 1.05, 0, Math.PI * 2)
    C.stroke()
  }
  C.setLineDash([])
  for (const f of features) {
    if (f.type !== 'trees') continue
    city((ctx, col) => {
      const g = ctx.createRadialGradient(f.x, f.z, 0, f.x, f.z, f.r)
      g.addColorStop(0, col ? c(116, 160, 92, 0.9) : c(0, 0, 0, 0.9))
      g.addColorStop(0.7, col ? c(126, 168, 98, 0.75) : c(0, 0, 0, 0.75))
      g.addColorStop(1, col ? c(126, 168, 98, 0) : c(0, 0, 0, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(f.x, f.z, f.r, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  const SH = make()
  SH.fillStyle = c(70, 44, 36, 0.42)
  for (const f of features) {
    if (f.type !== 'box') continue
    SH.save()
    SH.translate(f.x, f.z)
    SH.rotate(-f.yaw)
    SH.fillRect(-f.w / 2 - 0.05, -f.d / 2 - 0.05, f.w + 0.1, f.d + 0.1)
    SH.restore()
  }
  C.save()
  C.setTransform(1, 0, 0, 1, 0, 0)
  C.filter = `blur(${Math.round(S * 0.035)}px)`
  C.drawImage(SH.canvas, 0, 0)
  C.restore()
  for (const f of features) {
    if (f.type !== 'box') continue
    city((ctx, col) => {
      ctx.save()
      ctx.translate(f.x, f.z)
      ctx.rotate(-f.yaw)
      ctx.fillStyle = col ? c(214, 206, 196, 0.85) : c(0, 0, 0, 0.85)
      ctx.fillRect(-f.w / 2 - 0.035, -f.d / 2 - 0.035, f.w + 0.07, f.d + 0.07)
      ctx.restore()
    })
  }

  const img = C.getImageData(0, 0, W, H).data
  const msk = K.getImageData(0, 0, W, H).data
  const T = TABLE.map((v) => toSrgb(v) * 255)
  const base = new Uint8Array(W * H * 4)
  const D = bodyGrid().D
  const gs = GRID.s
  const gw = GRID.nx + 1
  const AO = [0.12, 0.3, 0.28].map((m) => {
    const t = new Float32Array(256)
    for (let k = 0; k < 256; k++) t[k] = 1 - m * Math.exp(-(k / 255) * 1.2 / 0.22)
    return t
  })
  for (let py = 0; py < H; py++) {
    const fz = Math.min(GRID.nz - 1e-3, (py + 0.5) / S / gs)
    const j = Math.floor(fz)
    const tz = fz - j
    const r0 = j * gw
    const r1 = r0 + gw
    for (let px = 0; px < W; px++) {
      const fx = Math.min(GRID.nx - 1e-3, (px + 0.5) / S / gs)
      const i = fx | 0
      const tx = fx - i
      const a0 = D[r0 + i] + (D[r0 + i + 1] - D[r0 + i]) * tx
      const a1 = D[r1 + i] + (D[r1 + i + 1] - D[r1 + i]) * tx
      const d = a0 + (a1 - a0) * tz
      const o = (py * W + px) * 4
      if (d < -0.02) {
        base[o] = img[o]
        base[o + 1] = img[o + 1]
        base[o + 2] = img[o + 2]
        base[o + 3] = msk[o]
        continue
      }
      const t = d > 0.02 ? 1 : (d + 0.02) / 0.04
      const ai = d > 0 ? Math.min(255, ((d / 1.2) * 255) | 0) : 0
      const ao = d > 0 ? 1 : 0
      base[o] = img[o] * (1 - t) + T[0] * (ao ? AO[0][ai] : 1) * t
      base[o + 1] = img[o + 1] * (1 - t) + T[1] * (ao ? AO[1][ai] : 1) * t
      base[o + 2] = img[o + 2] * (1 - t) + T[2] * (ao ? AO[2][ai] : 1) * t
      base[o + 3] = msk[o] * (1 - t)
    }
  }
  const levels = [{ w: W, h: H, data: base }]
  let cur = levels[0]
  while (cur.w > 1 || cur.h > 1) {
    const w = Math.max(1, cur.w >> 1)
    const h = Math.max(1, cur.h >> 1)
    const out = new Uint8Array(w * h * 4)
    const src = cur.data
    for (let y = 0; y < h; y++) {
      const y0 = Math.min(cur.h - 1, y * 2)
      const y1 = Math.min(cur.h - 1, y * 2 + 1)
      for (let x = 0; x < w; x++) {
        const xa = Math.min(cur.w - 1, x * 2)
        const xb = Math.min(cur.w - 1, x * 2 + 1)
        const a = (y0 * cur.w + xa) * 4
        const b = (y0 * cur.w + xb) * 4
        const cc = (y1 * cur.w + xa) * 4
        const dd = (y1 * cur.w + xb) * 4
        const o = (y * w + x) * 4
        for (let k = 0; k < 4; k++) out[o + k] = (src[a + k] + src[b + k] + src[cc + k] + src[dd + k] + 2) >> 2
      }
    }
    cur = { w, h, data: out }
    levels.push(cur)
  }
  return { levels, bounds: [x0, z0, x1 - x0, z1 - z0] }
}
