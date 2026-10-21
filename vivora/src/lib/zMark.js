import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// VIVORA mark: a bold "V" chevron, defined in a 100×100 box (y down).
// Used for the SVG logo, the loader construction drawing and the outro mark.
export const Z_POINTS = [
  [6, 8], [32, 8], [50, 58], [68, 8], [94, 8], [63, 92], [37, 92],
];

export const zPath = 'M' + Z_POINTS.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';

// three.js Shape centred on the origin, y up, unit height ≈ 1
export function zShape(scale = 1) {
  const s = new THREE.Shape();
  Z_POINTS.forEach(([x, y], i) => {
    const px = ((x - 50) / 88) * scale;
    const py = (-(y - 50) / 88) * scale;
    if (i === 0) s.moveTo(px, py); else s.lineTo(px, py);
  });
  s.closePath();
  return s;
}

export function zGeometry({ depth = 0.28, bevel = 0.035, scale = 1 } = {}) {
  const g = new THREE.ExtrudeGeometry(zShape(scale), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 5, curveSegments: 1,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

// Dumbbell along X, ~1 unit long: knurled handle, collars and stacked plates — merged so the
// glass material renders once (one transmission pass instead of one per part).
export function dumbbellGeometry({ radial = 40, knurl = true } = {}) {
  const parts = [];
  const cyl = (rTop, rBot, len, x, seg = radial) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, len, seg, 1, false);
    g.rotateZ(Math.PI / 2); g.translate(x, 0, 0); parts.push(g);
  };
  cyl(0.034, 0.034, 0.62, 0);                                  // handle
  if (knurl) for (let k = -5; k <= 5; k++) cyl(0.038, 0.038, 0.012, k * 0.042, 24); // knurl rings
  for (const s of [-1, 1]) {
    cyl(0.06, 0.06, 0.035, s * 0.325);                          // collar
    cyl(0.205, 0.205, 0.07, s * 0.38);                          // inner plate
    cyl(0.175, 0.175, 0.055, s * 0.44);                         // middle plate
    cyl(0.135, 0.135, 0.045, s * 0.49);                         // outer plate
    cyl(0.05, 0.05, 0.03, s * 0.525);                           // end cap
  }
  const g = mergeGeometries(parts.map((p) => p.toNonIndexed()));
  g.computeVertexNormals();
  return g;
}
