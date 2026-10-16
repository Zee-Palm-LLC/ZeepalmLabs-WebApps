import * as THREE from 'three'

export const CAN_R = 0.38
export const BODY_H = 1.9

function shade(hex, k) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, k)
  return `#${c.getHexString()}`
}

export function labelTexture(f, maxAniso = 8) {
  const W = 2048
  const H = 1024
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')
  const grad = g.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, shade(f.body, 0.06))
  grad.addColorStop(0.55, f.body)
  grad.addColorStop(1, shade(f.body, -0.08))
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)
  g.globalAlpha = 0.08
  g.fillStyle = '#fff'
  for (let k = -6; k < 30; k++) {
    g.beginPath()
    g.moveTo(k * 90, 0)
    g.lineTo(k * 90 + 40, 0)
    g.lineTo(k * 90 - 260, H)
    g.lineTo(k * 90 - 300, H)
    g.fill()
  }
  g.globalAlpha = 1
  const front = W * 0.25
  g.save()
  g.translate(front, H / 2)
  g.rotate(-Math.PI / 2)
  g.font = '400 300px "Bowlby One"'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.transform(1, 0, -0.22, 1, 0, 0)
  g.lineWidth = 10
  g.strokeStyle = f.accent
  g.strokeText('KOVA', 0, 10)
  g.fillStyle = f.ink
  g.fillText('KOVA', 0, 10)
  g.restore()
  g.save()
  g.translate(front + 230, H / 2)
  g.rotate(-Math.PI / 2)
  g.textAlign = 'center'
  g.fillStyle = f.ink
  g.font = '400 54px "Bowlby One"'
  g.fillText('HYDRATION', 0, 0)
  g.font = '500 30px "DM Mono"'
  g.fillStyle = f.accent
  g.fillText(f.name.toUpperCase(), 0, 52)
  g.restore()
  g.fillStyle = f.accent
  g.fillRect(front - 260, 70, 6, H - 140)
  g.fillRect(front + 330, 70, 6, H - 140)
  const back = W * 0.75
  g.textAlign = 'left'
  g.fillStyle = f.ink
  g.font = '400 64px "Bowlby One"'
  g.fillText('ELECTROLYTE', back - 300, 220)
  g.fillText('HYDRATION', back - 300, 290)
  g.font = '500 30px "DM Mono"'
  g.fillStyle = f.accent
  const rows = ['ZERO SUGAR', 'SODIUM · POTASSIUM · MAGNESIUM', 'B3 · B6 · B12', 'NATURAL FLAVOURS', 'VEGAN · GLUTEN FREE']
  rows.forEach((r, i) => g.fillText(r, back - 300, 370 + i * 56))
  g.strokeStyle = f.ink
  g.globalAlpha = 0.5
  g.lineWidth = 3
  g.strokeRect(back - 300, 680, 600, 170)
  g.globalAlpha = 1
  g.font = '500 26px "DM Mono"'
  g.fillStyle = f.ink
  g.fillText('PER CAN 330 ML', back - 280, 724)
  g.fillText('ENERGY  8 KCAL', back - 280, 764)
  g.fillText('SUGARS  0 G', back - 280, 804)
  g.fillText('SODIUM  300 MG', back - 40, 764)
  g.fillText('POTASS. 150 MG', back - 40, 804)
  for (let k = 0; k < 34; k++) g.fillRect(back + 120 + k * 7, 880, k % 3 ? 3 : 5, 70)
  g.font = '500 24px "DM Mono"'
  g.fillText('330 ML', back - 300, 930)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = maxAniso
  tex.wrapS = THREE.RepeatWrapping
  tex.offset.x = 0.0
  return tex
}

export function canGeometries() {
  const body = new THREE.CylinderGeometry(CAN_R, CAN_R, BODY_H, 96, 1, true)
  const top = []
  const h = BODY_H / 2
  const add = (arr, r, y) => arr.push(new THREE.Vector2(r, y))
  add(top, CAN_R, h - 0.002)
  add(top, CAN_R * 0.995, h + 0.03)
  add(top, CAN_R * 0.96, h + 0.07)
  add(top, CAN_R * 0.9, h + 0.11)
  add(top, CAN_R * 0.86, h + 0.135)
  add(top, CAN_R * 0.865, h + 0.16)
  add(top, CAN_R * 0.88, h + 0.175)
  add(top, CAN_R * 0.865, h + 0.19)
  add(top, CAN_R * 0.83, h + 0.185)
  add(top, CAN_R * 0.8, h + 0.155)
  add(top, CAN_R * 0.78, h + 0.15)
  add(top, 0.0, h + 0.15)
  const bottom = []
  add(bottom, 0.0, -h - 0.06)
  add(bottom, CAN_R * 0.55, -h - 0.075)
  add(bottom, CAN_R * 0.8, -h - 0.11)
  add(bottom, CAN_R * 0.86, -h - 0.12)
  add(bottom, CAN_R * 0.92, -h - 0.1)
  add(bottom, CAN_R * 0.98, -h - 0.05)
  add(bottom, CAN_R, -h + 0.002)
  const topG = new THREE.LatheGeometry(top, 96)
  const botG = new THREE.LatheGeometry(bottom, 96)
  const tab = new THREE.CapsuleGeometry(0.06, 0.16, 4, 12)
  tab.rotateZ(Math.PI / 2)
  tab.scale(1, 0.18, 1)
  tab.translate(0.04, h + 0.165, 0.05)
  return { body, top: topG, bottom: botG, tab }
}
