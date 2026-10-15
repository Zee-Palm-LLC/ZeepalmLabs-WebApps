import { MeshBuilder, M } from './mesh.js'

const TINT = [11, 0, 0, 0]
const LIGHT = [12, 0, 0, 0]

function wheels(mb, xs, z, r = 0.035) {
  for (const x of xs) for (const s of [-1, 1]) mb.cylinder(M.mul(M.T(x, r, s * z), M.Rx(Math.PI / 2), M.T(0, -0.012, 0)), r, r, 0.024, 8, [0.12, 0.12, 0.14])
}

export function truckMesh() {
  const mb = new MeshBuilder()
  mb.box(M.T(0.1, 0.08, 0), 0.1, 0.09, 0.11, [0.96, 0.95, 0.92])
  mb.box(M.T(0.14, 0.1, 0), 0.02, 0.04, 0.09, [0.35, 0.55, 0.75])
  mb.box(M.T(-0.05, 0.09, 0), 0.2, 0.11, 0.12, [1, 1, 1], TINT)
  mb.box(M.T(0.02, 0.035, 0), 0.3, 0.025, 0.1, [0.25, 0.25, 0.28])
  wheels(mb, [0.09, -0.1], 0.055)
  const d = mb.build()
  return d
}

export function podMesh() {
  const mb = new MeshBuilder()
  mb.sphere(M.mul(M.T(0, 0.07, 0), M.S(0.11, 0.05, 0.08)), 14, [1, 1, 1], TINT, (p) => {
    const r = Math.hypot(p[0], p[2])
    const dip = 1 - 0.55 * Math.exp(-r * r * 5)
    return { p: [p[0], p[1] * dip, p[2]] }
  })
  return mb.build()
}

export function vanMesh() {
  const mb = new MeshBuilder()
  mb.box(M.T(0, 0.08, 0), 0.22, 0.1, 0.11, [1, 1, 1], TINT)
  mb.box(M.T(0.09, 0.1, 0), 0.04, 0.05, 0.1, [0.3, 0.45, 0.6])
  mb.box(M.T(0, 0.14, 0), 0.05, 0.02, 0.06, [1, 0.6, 0.2], LIGHT)
  wheels(mb, [0.07, -0.07], 0.055, 0.03)
  return mb.build()
}

export function boatMesh() {
  const mb = new MeshBuilder()
  mb.sphere(M.mul(M.T(0, 0.02, 0), M.S(0.12, 0.04, 0.05)), 10, [1, 1, 1], TINT, (p) => (p[1] > 0 ? { p: [p[0], 0, p[2]] } : {}))
  mb.box(M.T(-0.02, 0.04, 0), 0.06, 0.04, 0.05, [0.95, 0.95, 0.92])
  return mb.build()
}

export function bladesMesh() {
  const mb = new MeshBuilder()
  mb.sphere(M.S(0.03), 8, [0.95, 0.95, 0.95])
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    mb.box(M.mul(M.Rz(a), M.T(0, 0.14, 0.01)), 0.025, 0.28, 0.008, [0.97, 0.97, 0.97])
  }
  return mb.build()
}

export function turbineTowerMesh() {
  const mb = new MeshBuilder()
  mb.cylinder(M.I(), 0.025, 0.015, 0.7, 6, [0.95, 0.95, 0.95])
  mb.box(M.T(0, 0.71, 0.0), 0.05, 0.04, 0.08, [0.95, 0.95, 0.95])
  return mb.build()
}

export function jibMesh() {
  const mb = new MeshBuilder()
  mb.box(M.T(0.25, 0, 0), 0.7, 0.03, 0.03, [0.98, 0.75, 0.1])
  mb.box(M.T(-0.15, -0.02, 0), 0.1, 0.06, 0.06, [0.4, 0.4, 0.42])
  mb.box(M.T(0.5, -0.2, 0), 0.006, 0.4, 0.006, [0.2, 0.2, 0.2])
  mb.box(M.T(0.5, -0.42, 0), 0.08, 0.05, 0.08, [1, 1, 1], TINT)
  return mb.build()
}

export function chamberMesh() {
  const mb = new MeshBuilder()
  mb.sphere(M.S(1, 1, 1), 22, [1, 1, 1], TINT)
  return mb.build()
}

export function crateMesh() {
  const mb = new MeshBuilder()
  mb.box(M.T(0, 0.04, 0), 0.08, 0.08, 0.08, [1, 1, 1], TINT)
  mb.box(M.T(0, 0.081, 0), 0.085, 0.006, 0.02, [0.55, 0.38, 0.22])
  return mb.build()
}

export function fillMesh() {
  const mb = new MeshBuilder()
  mb.cylinder(M.I(), 1, 1, 1, 18, [1, 1, 1], TINT)
  return mb.build()
}

export function floorMesh() {
  const mb = new MeshBuilder()
  mb.box(M.T(0, 0.055, 0), 0.5, 0.1, 0.5, [1, 1, 1], TINT)
  mb.box(M.T(0, 0.105, 0), 0.52, 0.012, 0.52, [0.98, 0.9, 0.86])
  for (let k = 0; k < 4; k++) mb.box(M.T(-0.19 + k * 0.125, 0.055, 0.251), 0.03, 0.1, 0.004, [0.98, 0.85, 0.8])
  return mb.build()
}
