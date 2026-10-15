export const BOARD_H = 0.5

function capsule(px, pz, ax, az, bx, bz, r) {
  const bax = bx - ax
  const baz = bz - az
  const pax = px - ax
  const paz = pz - az
  const h = Math.max(0, Math.min(1, (pax * bax + paz * baz) / (bax * bax + baz * baz)))
  return Math.hypot(pax - bax * h, paz - baz * h) - r
}

function cone(px, pz, ax, az, bx, bz, ra, rb) {
  const bax = bx - ax
  const baz = bz - az
  const pax = px - ax
  const paz = pz - az
  const h = Math.max(0, Math.min(1, (pax * bax + paz * baz) / (bax * bax + baz * baz)))
  return Math.hypot(pax - bax * h, paz - baz * h) - (ra + (rb - ra) * h)
}

function coneDome(px, pz, ax, az, bx, bz, ra, rb, k, p = 2) {
  const bax = bx - ax
  const baz = bz - az
  const pax = px - ax
  const paz = pz - az
  const h = Math.max(0, Math.min(1, (pax * bax + paz * baz) / (bax * bax + baz * baz)))
  const r = ra + (rb - ra) * h
  return dome(Math.hypot(pax - bax * h, paz - baz * h) / r, r * k, p)
}

function ellipse(px, pz, cx, cz, rx, rz) {
  const x = (px - cx) / rx
  const z = (pz - cz) / rz
  const k = Math.hypot(x, z)
  return (k - 1) * Math.min(rx, rz)
}

function eDome(px, pz, cx, cz, rx, rz, a, p = 2) {
  return dome(Math.hypot((px - cx) / rx, (pz - cz) / rz), a, p)
}

function dome(u, a, p) {
  if (u >= 1) return 0
  return a * Math.pow(1 - Math.pow(u, p), 1 / p)
}

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

function smax(a, b, k) {
  return -smin(-a, -b, k)
}

export const FINGERS = [
  [4.92, 2.68, 4.99, 3.72, 0.12],
  [5.15, 2.78, 5.27, 4.12, 0.13],
  [5.38, 2.8, 5.55, 4.32, 0.135],
  [5.6, 2.72, 5.83, 4.06, 0.13],
]
export const THUMB = [5.5, 1.4, 6.08, 2.55, 0.19, 0.14]

function arm(X, z) {
  let d = ellipse(X, z, 3.38, -8.45, 0.95, 1.02)
  d = smin(d, cone(X, z, 3.4, -8.2, 3.98, -5.7, 0.95, 0.86), 0.5)
  d = smin(d, cone(X, z, 3.98, -5.7, 4.5, -3.3, 0.86, 0.66), 0.4)
  d = smin(d, cone(X, z, 4.5, -3.3, 4.68, -1.5, 0.68, 0.74), 0.4)
  d = smin(d, cone(X, z, 4.68, -1.5, 5.12, 0.9, 0.74, 0.42), 0.4)
  d = smin(d, cone(X, z, 5.12, 1.0, 5.3, 2.5, 0.44, 0.56), 0.25)
  for (const [ax, az, bx, bz, r] of FINGERS) d = smin(d, capsule(X, z, ax, az, bx, bz, r), 0.08)
  d = smin(d, cone(X, z, ...THUMB), 0.15)
  return d
}

function armH(X, z) {
  let h = eDome(X, z, 3.38, -8.45, 0.95, 1.02, 0.82)
  h = smax(h, coneDome(X, z, 3.4, -8.2, 3.98, -5.7, 0.95, 0.86, 0.85), 0.15)
  h = smax(h, coneDome(X, z, 3.98, -5.7, 4.5, -3.3, 0.86, 0.66, 0.85), 0.15)
  h = smax(h, coneDome(X, z, 4.5, -3.3, 4.68, -1.5, 0.68, 0.74, 0.85), 0.12)
  h = smax(h, coneDome(X, z, 4.68, -1.5, 5.12, 0.9, 0.74, 0.42, 0.82), 0.12)
  h = smax(h, coneDome(X, z, 5.12, 1.0, 5.3, 2.5, 0.44, 0.56, 0.5, 2.4), 0.1)
  for (const [ax, az, bx, bz, r] of FINGERS) h = smax(h, coneDome(X, z, ax, az, bx, bz, r, r * 0.85, 1.1), 0.05)
  h = smax(h, coneDome(X, z, ...THUMB, 1.1), 0.06)
  return h
}

function leg(X, z) {
  let d = cone(X, z, 1.45, 0.2, 1.55, 7.4, 1.5, 0.82)
  d = smin(d, ellipse(X, z, 1.55, 8.1, 0.82, 0.9), 0.5)
  d = smin(d, cone(X, z, 1.55, 8.4, 1.72, 10.5, 0.8, 0.86), 0.5)
  d = smin(d, cone(X, z, 1.72, 10.5, 1.5, 14.9, 0.86, 0.42), 0.5)
  d = smin(d, cone(X, z, 1.5, 15.0, 1.76, 16.35, 0.45, 0.6), 0.3)
  d = smin(d, ellipse(X, z, 1.8, 16.55, 0.62, 0.42), 0.2)
  return d
}

function legH(X, z) {
  let h = coneDome(X, z, 1.45, 0.2, 1.55, 7.4, 1.5, 0.82, 0.76, 2.2)
  h = smax(h, eDome(X, z, 1.55, 8.1, 0.82, 0.9, 0.66), 0.2)
  h = smax(h, coneDome(X, z, 1.55, 8.4, 1.72, 10.5, 0.8, 0.86, 0.84), 0.2)
  h = smax(h, coneDome(X, z, 1.72, 10.5, 1.5, 14.9, 0.86, 0.42, 0.84), 0.2)
  h = smax(h, coneDome(X, z, 1.5, 15.0, 1.76, 16.35, 0.45, 0.6, 1.15), 0.15)
  h = smax(h, eDome(X, z, 1.8, 16.55, 0.62, 0.42, 0.62, 2.2), 0.1)
  return h
}

export function bodySdf(x, z) {
  const X = Math.abs(x)
  let t = 1e9
  if (z < -8.3) {
    t = ellipse(x, z, 0, -13.1, 1.55, 1.95)
    t = smin(t, ellipse(x, z, 0, -11.85, 1.12, 1.0), 0.8)
    t = smin(t, ellipse(X, z, 1.52, -12.35, 0.2, 0.46), 0.2)
    t = smin(t, capsule(x, z, 0, -11.2, 0, -9.5, 0.72), 0.5)
  }
  t = smin(t, cone(X, z, 0.45, -9.95, 3.2, -9.0, 0.6, 0.62), 0.9)
  t = smin(t, ellipse(x, z, 0, -6.7, 2.85, 2.75), 1.0)
  t = smin(t, ellipse(x, z, 0, -2.9, 2.35, 2.6), 1.2)
  t = smin(t, ellipse(x, z, 0, -0.15, 2.7, 1.8), 1.0)
  let d = t
  if (X > 2.2 && z < 5) d = Math.min(d, arm(X, z))
  if (z > -2.5) d = smin(d, leg(X, z), 0.5)
  return d
}

function torsoH(x, z) {
  const X = Math.abs(x)
  let h = 0
  if (z < -8.3) {
    h = eDome(x, z, 0, -13.1, 1.55, 1.95, 1.25)
    h = smax(h, eDome(x, z, 0, -11.85, 1.12, 1.0, 1.12, 2.2), 0.3)
    h = smax(h, eDome(X, z, 1.52, -12.35, 0.2, 0.46, 0.42), 0.15)
    h = smax(h, coneDome(x, z, 0, -11.2, 0, -9.5, 0.72, 0.72, 1.1), 0.3)
  }
  h = smax(h, coneDome(X, z, 0.45, -9.95, 3.2, -9.0, 0.6, 0.62, 1.05), 0.35)
  h = smax(h, eDome(x, z, 0, -6.7, 2.85, 2.75, 1.3, 2.6), 0.35)
  h = smax(h, eDome(x, z, 0, -2.9, 2.35, 2.6, 1.12, 2.6), 0.35)
  h = smax(h, eDome(x, z, 0, -0.15, 2.7, 1.8, 1.08, 2.4), 0.35)
  return h
}

function bump(x, z, cx, cz, rx, rz, a) {
  const u = (x - cx) / rx
  const v = (z - cz) / rz
  const q = u * u + v * v
  return q > 9 ? 0 : a * Math.exp(-q)
}

function ridge(x, z, ax, az, bx, bz, w, a) {
  const d = capsule(x, z, ax, az, bx, bz, 0) / w
  return d > 3 ? 0 : a * Math.exp(-d * d)
}

function face(x, z) {
  const X = Math.abs(x)
  let h = ridge(X, z, 0.15, -13.28, 0.85, -13.18, 0.13, 0.1)
  h -= bump(X, z, 0.5, -12.9, 0.3, 0.2, 0.13)
  h += bump(X, z, 0.5, -12.88, 0.22, 0.12, 0.09)
  h += ridge(x, z, 0, -12.95, 0, -12.15, 0.12, 0.2)
  h += bump(x, z, 0, -12.06, 0.17, 0.15, 0.17)
  h += bump(X, z, 0.17, -11.98, 0.1, 0.08, 0.08)
  h += bump(X, z, 0.72, -12.35, 0.34, 0.28, 0.07)
  h += bump(x, z, 0, -11.66, 0.3, 0.08, 0.07)
  h += bump(x, z, 0, -11.44, 0.26, 0.09, 0.09)
  h -= ridge(x, z, -0.28, -11.55, 0.28, -11.55, 0.03, 0.05)
  h += bump(x, z, 0, -11.02, 0.34, 0.2, 0.09)
  h -= bump(X, z, 0.3, -10.75, 0.4, 0.22, 0.05)
  return h
}

export function relief(x, z) {
  const X = Math.abs(x)
  let h = 0
  if (z < -10.5 && X < 1.6) h += face(x, z)
  if (z < 4) {
    h += bump(X, z, 1.35, -7.25, 1.3, 0.85, 0.07)
    h += ridge(X, z, 0.4, -9.3, 2.9, -9.1, 0.14, 0.06)
    h -= ridge(x, z, 0, -9.0, 0, -5.4, 0.18, 0.04)
    for (let k = 0; k < 3; k++) {
      const zz = -4.0 + k * 0.82
      h += bump(X, z, 0.42, zz, 0.36, 0.34, 0.035)
    }
    h -= ridge(x, z, 0, -4.3, 0, -1.6, 0.06, 0.025)
    h -= bump(x, z, 0, -2.75, 0.15, 0.15, 0.09)
    h += bump(X, z, 3.4, -8.45, 0.7, 0.7, 0.06)
    h += bump(X, z, 3.95, -5.9, 0.5, 1.1, 0.06)
    h += bump(X, z, 4.65, -1.6, 0.45, 1.0, 0.05)
  }
  if (z > -1) {
    h += bump(X, z, 1.62, 3.4, 0.6, 1.9, 0.07)
    h += bump(X, z, 1.15, 5.6, 0.45, 1.2, 0.05)
    h += bump(X, z, 1.55, 8.0, 0.36, 0.38, 0.08)
    h += bump(X, z, 1.78, 10.4, 0.5, 1.4, 0.06)
    h += ridge(X, z, 1.45, 11.5, 1.42, 14.4, 0.12, 0.04)
  }
  return h
}

export function edgeK(d) {
  if (d >= 0) return 0
  const k = Math.min(1, -d / 0.14)
  return Math.sqrt(k * (2 - k))
}

function rawHeight(x, z, d) {
  const k = edgeK(d)
  if (k <= 0) return 0
  const X = Math.abs(x)
  let h = torsoH(x, z)
  if (X > 2.2 && z < 5) h = Math.max(h, armH(X, z))
  if (z > -2.5) h = smax(h, legH(X, z), 0.3)
  h = Math.max(h, 0.2)
  return k * (h + relief(x, z))
}

export const GRID = { x0: -7.2, x1: 7.2, z0: -15.7, z1: 17.6, s: 0.05 }
GRID.nx = Math.round((GRID.x1 - GRID.x0) / GRID.s)
GRID.nz = Math.round((GRID.z1 - GRID.z0) / GRID.s)

let cache = null

export function bodyGrid() {
  if (cache) return cache
  const { x0, z0, s, nx, nz } = GRID
  const H = new Float32Array((nx + 1) * (nz + 1))
  const D = new Float32Array((nx + 1) * (nz + 1))
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * s
      const z = z0 + j * s
      const d = bodySdf(x, z)
      const o = j * (nx + 1) + i
      D[o] = d
      H[o] = d < 0 ? rawHeight(x, z, d) : 0
    }
  cache = { H, D }
  return cache
}

function sample(A, x, z) {
  const { x0, z0, s, nx, nz } = GRID
  const fx = (x - x0) / s
  const fz = (z - z0) / s
  if (fx < 0 || fz < 0 || fx >= nx || fz >= nz) return null
  const i = Math.floor(fx)
  const j = Math.floor(fz)
  const tx = fx - i
  const tz = fz - j
  const o = j * (nx + 1) + i
  const a = A[o] + (A[o + 1] - A[o]) * tx
  const b = A[o + nx + 1] + (A[o + nx + 2] - A[o + nx + 1]) * tx
  return a + (b - a) * tz
}

export function boardHeight(x, z) {
  const v = sample(bodyGrid().H, x, z)
  return v === null ? 0 : v
}

export function sdfAt(x, z) {
  const v = sample(bodyGrid().D, x, z)
  return v === null ? 1 : v
}

export const DISTRICTS = [
  { id: 'brain', name: 'Brain HQ', emoji: '🧠', x: 0, z: -14.05, r: 0.95, color: [0.62, 0.48, 0.92], role: 'Mission control. Uses about 20% of all the energy the city makes, every single day.', tip: 'Steady blood sugar, water and sleep keep focus sharp. Big sugar spikes lead to crashes.' },
  { id: 'heart', name: 'Heart Power Station', emoji: '❤️', x: 0.6, z: -6.35, r: 1.0, color: [0.92, 0.2, 0.22], role: 'Sits just left of centre between the lungs and pumps every delivery out onto the highways. Beats faster when the city works harder.', tip: 'Regular cardio trains the station to pump more blood with fewer beats.' },
  { id: 'lungs', name: 'Lung Greenhouses', emoji: '🫁', x: -1.8, z: -6.9, r: 1.05, alt: [1.85, -7.6, 0.65], color: [0.55, 0.85, 0.85], role: 'Two greenhouse districts either side of the heart load fresh oxygen onto the red-cell pods. The left one is smaller to make room for the heart. The turbines spin with your breathing rate.', tip: 'Deep slow breaths and regular movement keep the greenhouses working well.' },
  { id: 'stomach', name: 'Stomach Market', emoji: '🍽️', x: 1.45, z: -3.75, r: 0.72, color: [0.98, 0.72, 0.3], role: 'Every meal arrives here, under the left ribs. Crates are broken down into glucose, protein and fat for delivery.', tip: 'Fibre and protein slow the market down, so energy is released steadily instead of all at once.' },
  { id: 'liver', name: 'Liver Recycling Plant', emoji: '♻️', x: -1.35, z: -3.55, r: 1.0, color: [0.66, 0.3, 0.22], role: 'The biggest plant in the body, under the right ribs. Stores spare glucose as glycogen, cleans the traffic and recycles waste.', tip: 'Go easy on sugary drinks and alcohol. The plant has to process all of it.' },
  { id: 'pancreas', name: 'Insulin Department', emoji: '🚓', x: 0.95, z: -2.7, r: 0.36, color: [0.3, 0.5, 0.95], role: 'Tucked behind the stomach. Sends out insulin vans when blood sugar rises, opening doors so cells can take glucose in.', tip: 'Fast sugar makes it rush out lots of vans at once. Whole foods keep things calm.' },
  { id: 'kidneys', name: 'Kidney Water Works', emoji: '💧', x: -1.55, z: -1.85, r: 0.42, alt: [1.55, -1.85, 0.42], color: [0.35, 0.72, 0.95], role: 'A pair of plants either side of the main artery. They filter the whole bloodstream and balance water and salt. The towers show your hydration.', tip: 'Sip water through the day. Pale-yellow urine means the water works are happy.' },
  { id: 'gut', name: 'Gut Canal', emoji: '🚤', x: 0, z: -0.25, r: 1.05, color: [0.4, 0.75, 0.55], role: 'The small intestine coils through the middle and the colon frames it. Boats carry food the whole way while nutrients are absorbed and friendly microbes get fed.', tip: 'Fibre from veg, fruit, beans and whole grains feeds the good microbes.' },
  { id: 'fat', name: 'Fat Storage Silos', emoji: '🛢️', x: 1.8, z: 0.55, r: 0.45, color: [0.98, 0.84, 0.35], role: 'Spare energy is stored here for later, around the hips and belly. They fill when you eat more than you use.', tip: 'Movement and balanced portions keep the silos from overflowing.' },
  { id: 'armL', name: 'Left Arm Muscle Works', emoji: '💪', x: 4.42, z: -5.55, r: 0.5, color: [0.9, 0.36, 0.32], role: 'Biceps construction site. Crews build new muscle when protein arrives and you train.', tip: 'Protein after exercise plus good sleep gives the crews what they need.' },
  { id: 'armR', name: 'Right Arm Muscle Works', emoji: '💪', x: -4.42, z: -5.55, r: 0.5, color: [0.9, 0.36, 0.32], role: 'Biceps construction site. Crews build new muscle when protein arrives and you train.', tip: 'Protein after exercise plus good sleep gives the crews what they need.' },
  { id: 'legL', name: 'Left Leg Muscle Works', emoji: '🦵', x: 2.05, z: 3.9, r: 0.6, color: [0.9, 0.36, 0.32], role: 'The thigh muscles are the biggest in the body. They power every walk and run.', tip: 'Walking, squats and stairs keep these districts strong.' },
  { id: 'legR', name: 'Right Leg Muscle Works', emoji: '🦵', x: -2.05, z: 3.9, r: 0.6, color: [0.9, 0.36, 0.32], role: 'The thigh muscles are the biggest in the body. They power every walk and run.', tip: 'Walking, squats and stairs keep these districts strong.' },
]

export const DIST = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]))

export const SPOTS = DISTRICTS.flatMap((d) => [{ d, x: d.x, z: d.z, r: d.r }, ...(d.alt ? [{ d, x: d.alt[0], z: d.alt[1], r: d.alt[2] }] : [])])

const N = {
  heart: [0.6, -6.35],
  arch: [0.1, -8.6],
  carL: [0.38, -10.3],
  brainL: [0.55, -14.0],
  carR: [-0.38, -10.3],
  brainR: [-0.55, -14.0],
  lungs: [-1.8, -6.9],
  lungs2: [1.85, -7.6],
  t1: [0.12, -4.45],
  liver: [-1.35, -3.55],
  stomach: [1.45, -3.75],
  t2: [0.05, -1.85],
  pancreas: [0.95, -2.7],
  kidneys: [-1.55, -1.85],
  kidneys2: [1.55, -1.85],
  gut: [0, -0.25],
  pelvis: [0, 1.15],
  fat: [1.8, 0.55],
}

const EDGES = [
  ['heart', 'arch', 0.6, [0.45, -7.7]],
  ['arch', 'carL', 0.3],
  [
    'carL',
    'brainL',
    0.2,
    [
      [0.9, -11.2],
      [1.18, -12.1],
      [1.12, -13.15],
    ],
  ],
  ['arch', 'carR', 0.3],
  [
    'carR',
    'brainR',
    0.2,
    [
      [-0.9, -11.2],
      [-1.18, -12.1],
      [-1.12, -13.15],
    ],
  ],
  ['heart', 'lungs', 0.42, [-0.5, -6.75]],
  ['heart', 'lungs2', 0.36, [1.35, -7.15]],
  ['heart', 't1', 0.6, [0.3, -5.2]],
  ['t1', 'liver', 0.36],
  ['t1', 'stomach', 0.36],
  ['t1', 't2', 0.6, [0.06, -3.1]],
  ['t2', 'pancreas', 0.28],
  ['t2', 'kidneys', 0.34],
  ['t2', 'kidneys2', 0.34],
  ['t2', 'gut', 0.42],
  ['gut', 'pelvis', 0.44],
]

for (const s of [-1, 1]) {
  const k = s > 0 ? 'L' : 'R'
  N['sh' + k] = [s * 3.2, -8.65]
  N['el' + k] = [s * 4.3, -3.25]
  N['wr' + k] = [s * 5.08, 0.85]
  N['hand' + k] = [s * 5.24, 2.4]
  N['hip' + k] = [s * 1.3, 1.75]
  N['kn' + k] = [s * 1.55, 8.15]
  N['an' + k] = [s * 1.6, 14.5]
  N['foot' + k] = [s * 1.76, 16.05]
  EDGES.push(
    ['arch', 'sh' + k, 0.38, [s * 1.7, -9.15]],
    [
      'sh' + k,
      'el' + k,
      0.34,
      [
        [s * 3.33, -6.9],
        [s * 3.62, -5.2],
      ],
    ],
    ['el' + k, 'wr' + k, 0.3, [s * 4.68, -1.4]],
    ['wr' + k, 'hand' + k, 0.22],
    ['pelvis', 'hip' + k, 0.46],
    [
      'hip' + k,
      'kn' + k,
      0.4,
      [
        [s * 1.2, 4.6],
        [s * 1.32, 6.8],
      ],
    ],
    ['kn' + k, 'an' + k, 0.34, [s * 1.58, 11.0]],
    ['an' + k, 'foot' + k, 0.24],
  )
  if (s > 0) EDGES.push(['hipL', 'fat', 0.28])
}

export function catmull(pts, seg = 8) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    for (let k = 0; k < seg; k++) {
      const t = k / seg
      const t2 = t * t
      const t3 = t2 * t
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

function measure(pts) {
  const s = [0]
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return s
}

export const ROADS = EDGES.map(([a, b, w, via], i) => {
  const vias = !via ? [] : Array.isArray(via[0]) ? via : [via]
  const pts = catmull([N[a], ...vias, N[b]], vias.length ? 8 : 6)
  return { id: i, a, b, w: w * 0.78, pts, s: measure(pts), len: 0 }
})
for (const r of ROADS) r.len = r.s[r.s.length - 1]

const parent = {}
const parentEdge = {}
{
  const q = ['heart']
  const seen = new Set(q)
  while (q.length) {
    const n = q.shift()
    for (const r of ROADS) {
      for (const [x, y] of [
        [r.a, r.b],
        [r.b, r.a],
      ]) {
        if (x === n && !seen.has(y)) {
          seen.add(y)
          parent[y] = n
          parentEdge[y] = r
          q.push(y)
        }
      }
    }
  }
}

export function routeTo(node) {
  const chain = []
  let n = node
  while (n !== 'heart') {
    const r = parentEdge[n]
    chain.unshift({ road: r, fwd: r.b === n })
    n = parent[n]
  }
  return chain
}

export const DEST_NODE = {
  brain: ['brainL', 'brainR'],
  heart: ['heart'],
  lungs: ['lungs', 'lungs2'],
  stomach: ['stomach'],
  liver: ['liver'],
  pancreas: ['pancreas'],
  kidneys: ['kidneys', 'kidneys2'],
  gut: ['gut'],
  fat: ['fat'],
  armL: ['elL', 'wrL', 'handL'],
  armR: ['elR', 'wrR', 'handR'],
  legL: ['knL', 'anL', 'footL'],
  legR: ['knR', 'anR', 'footR'],
}

export function pointOn(road, s, fwd, lane) {
  const L = road.len
  let d = fwd ? s : L - s
  d = Math.max(0, Math.min(L, d))
  const S = road.s
  let i = 1
  while (i < S.length - 1 && S[i] < d) i++
  const t = (d - S[i - 1]) / Math.max(1e-6, S[i] - S[i - 1])
  const a = road.pts[i - 1]
  const b = road.pts[i]
  let dx = b[0] - a[0]
  let dz = b[1] - a[1]
  const l = Math.hypot(dx, dz) || 1
  dx /= l
  dz /= l
  if (!fwd) {
    dx = -dx
    dz = -dz
  }
  const x = a[0] + (b[0] - a[0]) * t - dz * lane
  const z = a[1] + (b[1] - a[1]) * t + dx * lane
  return { x, z, dx, dz }
}

export function distToRoads(x, z) {
  let best = Infinity
  for (const r of ROADS) {
    for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1]
      const b = r.pts[i]
      const bx = b[0] - a[0]
      const bz = b[1] - a[1]
      const h = Math.max(0, Math.min(1, ((x - a[0]) * bx + (z - a[1]) * bz) / (bx * bx + bz * bz)))
      const d = Math.hypot(x - a[0] - bx * h, z - a[1] - bz * h) - r.w
      if (d < best) best = d
    }
  }
  return best
}
