import { BY_ID } from '../data/foods.js'
import { em } from './hooks.js'
import { grade, verdict } from './score.js'
import { rank } from '../data/orders.js'

const W = 1080
const H = 1350
const URL_TEXT = 'zeepalm-plated.vercel.app'
const cache = new Map()

function img(id) {
  if (!cache.has(id)) {
    cache.set(
      id,
      new Promise((res) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = () => res(null)
        i.src = em(id)
      }),
    )
  }
  return cache.get(id)
}

function hueColor(v, l = 42) {
  const h = Math.round(Math.max(0, Math.min(1, (v - 20) / 70)) * 128)
  return `hsl(${h} 62% ${l}%)`
}

function cloth(ctx) {
  ctx.fillStyle = '#efe7da'
  ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(120,96,60,0.05)' : 'rgba(255,255,255,0.18)'
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
  }
  ctx.globalAlpha = 0.05
  ctx.fillStyle = '#8a6a44'
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 1)
  for (let x = 0; x < W; x += 6) ctx.fillRect(x, 0, 1, H)
  ctx.globalAlpha = 1
  const g = ctx.createRadialGradient(W * 0.3, H * 0.15, 80, W * 0.5, H * 0.5, W * 0.95)
  g.addColorStop(0, 'rgba(255,248,232,0.55)')
  g.addColorStop(1, 'rgba(90,64,36,0.22)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function plateDisc(ctx, cx, cy, R) {
  ctx.save()
  ctx.shadowColor = 'rgba(70,48,24,0.32)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetX = 22
  ctx.shadowOffsetY = 34
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fillStyle = '#f7f4ee'
  ctx.fill()
  ctx.restore()
  const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.1, cx, cy, R)
  g.addColorStop(0, '#fffefb')
  g.addColorStop(0.7, '#f6f2ea')
  g.addColorStop(0.78, '#ffffff')
  g.addColorStop(0.9, '#f3eee6')
  g.addColorStop(1, '#e4dccf')
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = 'rgba(176,140,100,0.55)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(150,120,90,0.14)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.76, 0, Math.PI * 2)
  ctx.stroke()
}

async function drawItem(ctx, it, cx, cy, R) {
  const im = await img(it.food)
  if (!im) return
  const s = it.s * 2 * R
  ctx.save()
  ctx.translate(cx + it.x * R, cy + it.y * R)
  ctx.rotate((it.rot * Math.PI) / 180)
  ctx.shadowColor = 'rgba(70,46,20,0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetX = 8
  ctx.shadowOffsetY = 14
  ctx.drawImage(im, -s / 2, -s / 2, s, s)
  ctx.restore()
}

function wrap(ctx, text, x, y, max, lh) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (ctx.measureText(t).width > max && line) {
      ctx.fillText(line, x, y)
      line = w
      y += lh
    } else line = t
  }
  ctx.fillText(line, x, y)
  return y
}

function brand(ctx) {
  ctx.fillStyle = '#1f1a14'
  ctx.font = '800 64px "Bricolage Grotesque Variable", sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Plated.', 72, 118)
  ctx.font = '500 24px "Inter Variable", sans-serif'
  ctx.fillStyle = 'rgba(31,26,20,0.6)'
  ctx.textAlign = 'right'
  ctx.fillText(URL_TEXT, W - 72, 112)
  ctx.textAlign = 'left'
}

export async function renderPlateCard({ plate, result, goal, line }) {
  await document.fonts.ready
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  cloth(ctx)
  brand(ctx)

  const cx = 540
  const cy = 560
  const R = 370
  plateDisc(ctx, cx, cy, R)
  const items = [...plate.items].sort((a, b) => a.y - b.y)
  for (const it of items) await drawItem(ctx, it, cx, cy, R)

  if (plate.drink) {
    const im = await img(plate.drink)
    if (im) {
      ctx.save()
      ctx.shadowColor = 'rgba(70,46,20,0.3)'
      ctx.shadowBlur = 16
      ctx.shadowOffsetX = 6
      ctx.shadowOffsetY = 12
      ctx.drawImage(im, W - 230, 820, 150, 150)
      ctx.restore()
    }
  }
  let sx = 92
  for (const it of plate.side.slice(0, 3)) {
    const im = await img(it.food)
    if (im) ctx.drawImage(im, sx, 840, 110, 110)
    sx += 90
  }

  ctx.fillStyle = 'rgba(255,253,248,0.92)'
  ctx.beginPath()
  ctx.roundRect(56, 1010, W - 112, 280, 36)
  ctx.fill()

  const v = result.total
  ctx.lineWidth = 18
  ctx.strokeStyle = 'rgba(31,26,20,0.08)'
  ctx.beginPath()
  ctx.arc(200, 1150, 88, 0.75 * Math.PI, 2.25 * Math.PI)
  ctx.stroke()
  ctx.strokeStyle = hueColor(v)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(200, 1150, 88, 0.75 * Math.PI, 0.75 * Math.PI + 1.5 * Math.PI * (v / 100))
  ctx.stroke()
  ctx.fillStyle = '#1f1a14'
  ctx.textAlign = 'center'
  ctx.font = '800 76px "Bricolage Grotesque Variable", sans-serif'
  ctx.fillText(String(v), 200, 1170)
  ctx.font = '700 15px "Inter Variable", sans-serif'
  ctx.fillStyle = 'rgba(31,26,20,0.55)'
  ctx.fillText('PLATE SCORE', 200, 1236)
  ctx.textAlign = 'left'

  ctx.fillStyle = hueColor(v, 36)
  ctx.font = '800 58px "Bricolage Grotesque Variable", sans-serif'
  ctx.fillText(`${grade(v)} · ${verdict(v)}`, 330, 1100)
  ctx.fillStyle = '#1f1a14'
  ctx.font = 'italic 500 28px "Inter Variable", sans-serif'
  wrap(ctx, `“${line}” — Chef Remy`, 330, 1150, 650, 36)
  const t = result.t
  ctx.font = '600 22px "Inter Variable", sans-serif'
  ctx.fillStyle = 'rgba(31,26,20,0.6)'
  ctx.fillText(
    `${Math.round(t.kcal)} kcal · ${Math.round(t.p)} g protein · ${Math.round(t.fi)} g fibre · ${goal.name}`,
    330,
    1250,
  )

  return await new Promise((res) => c.toBlob(res, 'image/png'))
}

export async function renderRushCard({ results }) {
  await document.fonts.ready
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  cloth(ctx)
  brand(ctx)
  const stars = results.reduce((a, r) => a + r.stars, 0)
  const [title, mood] = rank(stars)
  const m = await img(mood)
  if (m) ctx.drawImage(m, W / 2 - 110, 190, 220, 220)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(31,26,20,0.55)'
  ctx.font = '600 26px "Inter Variable", sans-serif'
  ctx.fillText('LUNCH RUSH RESULT', W / 2, 470)
  ctx.fillStyle = '#1f1a14'
  ctx.font = '800 104px "Bricolage Grotesque Variable", sans-serif'
  ctx.fillText(title, W / 2, 580)
  ctx.font = '700 40px "Inter Variable", sans-serif'
  ctx.fillText(`${stars} / ${results.length * 3} stars`, W / 2, 650)
  ctx.textAlign = 'left'
  const star = await img('star')
  let y = 720
  for (const r of results) {
    ctx.fillStyle = 'rgba(255,253,248,0.9)'
    ctx.beginPath()
    ctx.roundRect(110, y, W - 220, 100, 24)
    ctx.fill()
    const a = await img(r.order.em)
    if (a) ctx.drawImage(a, 130, y + 14, 72, 72)
    ctx.fillStyle = '#1f1a14'
    ctx.font = '700 32px "Inter Variable", sans-serif'
    ctx.fillText(r.order.name, 222, y + 48)
    ctx.font = '500 22px "Inter Variable", sans-serif'
    ctx.fillStyle = 'rgba(31,26,20,0.55)'
    ctx.fillText(`${r.met}/3 requests · plate score ${r.score}`, 222, y + 80)
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < r.stars ? 1 : 0.18
      if (star) ctx.drawImage(star, W - 330 + i * 62, y + 22, 56, 56)
    }
    ctx.globalAlpha = 1
    y += 116
  }
  return await new Promise((res) => c.toBlob(res, 'image/png'))
}

export const foodName = (id) => BY_ID[id]?.name || id
