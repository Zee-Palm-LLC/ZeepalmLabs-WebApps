export const AREAS = {
  pasture: { x0: -7.8, x1: -1.7, z0: -4.4, z1: 0.7 },
  sheep: { x0: 1.6, x1: 7.4, z0: -4.6, z1: 0.2 },
  run: { x0: 2.5, x1: 6.8, z0: 1.4, z1: 5.3 },
  barnyard: { x0: -6.4, x1: -0.8, z0: -5.6, z1: -5.0 },
}

export const BARN = { x: -3.6, z: -8.4, w: 6.4, d: 5.2, h: 3.4, peak: 5.5 }
export const HOUSE = { x: 5.5, z: -9.8, w: 4.6, d: 3.8, h: 2.8, peak: 4.4 }
export const COOP = { x: 6.0, z: 2.1, w: 1.5, d: 1.2 }
export const POND = { x: -5.0, z: 3.9, rx: 2.15, rz: 1.45 }
export const PATH_X = 0
export const PATH_W = 0.7

export const LANTERNS = [
  { x: 0.95, z: 5.6 },
  { x: -0.95, z: 2.6 },
  { x: 0.95, z: -0.4 },
  { x: -0.95, z: -3.4 },
  { x: -1.9, z: -5.55, wall: true },
  { x: 5.5, z: -7.55, wall: true },
]

export const PUMPKINS = [
  { x: -1.75, z: 3.4, s: 1.0, face: 0, carved: false },
  { x: 1.65, z: 6.1, s: 0.92, face: 1, carved: false },
  { x: -2.55, z: 5.5, s: 0.85, face: 2, carved: false },
  { x: -3.0, z: 2.0, s: 0.5, carved: false },
  { x: -1.25, z: 5.8, s: 0.45, carved: false },
  { x: 2.3, z: 7.3, s: 0.5, carved: false },
  { x: -0.95, z: 7.4, s: 0.42, carved: false },
  { x: -2.1, z: -5.4, s: 0.55, carved: false },
  { x: -5.2, z: -5.45, s: 0.48, carved: false },
  { x: 1.2, z: -6.4, s: 0.46, carved: false },
]

export const HAY = [
  { x: -0.4, z: -6.5, yaw: 0.25, cat: true },
  { x: -7.3, z: -5.7, yaw: -0.3 },
  { x: 1.45, z: -7.0, yaw: 1.2 },
]

export const TREES = [
  { x: -9.8, z: -2.0, kind: 'bare', s: 1.1, seed: 3 },
  { x: 9.6, z: -0.6, kind: 'bare', s: 1.0, seed: 7 },
  { x: 9.0, z: -6.4, kind: 'autumn', s: 1.15, seed: 11 },
  { x: -10.0, z: -8.6, kind: 'autumn', s: 1.2, seed: 5 },
  { x: 1.6, z: -12.4, kind: 'autumn', s: 1.3, seed: 9 },
  { x: -8.3, z: 2.6, kind: 'apple', s: 0.95, seed: 2 },
  { x: 12.5, z: -11, kind: 'bare', s: 1.3, seed: 13 },
  { x: -13, z: -12, kind: 'autumn', s: 1.4, seed: 17 },
]

export const SIGN = { x: 2.15, z: 6.7 }
export const SCARECROW = { x: -1.25, z: 1.25 }

export const inRect = (a, x, z, m = 0) => x > a.x0 + m && x < a.x1 - m && z > a.z0 + m && z < a.z1 - m
