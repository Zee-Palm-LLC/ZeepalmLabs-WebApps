const PAD = 14
const GAP = 14

function textBox(el) {
  const r = document.createRange()
  r.selectNodeContents(el)
  const rects = Array.from(r.getClientRects())
  if (!rects.length) return null
  const host = el.getBoundingClientRect()
  let x0 = Infinity
  let x1 = -Infinity
  for (const q of rects) {
    x0 = Math.min(x0, q.left)
    x1 = Math.max(x1, q.right)
  }
  const k = el.offsetWidth / (host.width || 1)
  return { dx: (x0 - host.left) * k, w: (x1 - x0) * k }
}

function remember(el) {
  if (el.dataset.ox == null) {
    el.dataset.ox = el.style.left ? parseFloat(el.style.left) : el.offsetLeft
    el.dataset.oy = el.style.top ? parseFloat(el.style.top) : el.offsetTop
    el.dataset.ow = el.style.width || ''
    el.dataset.oh = el.style.height || ''
  }
}

function boxOf(el) {
  remember(el)
  const x = parseFloat(el.dataset.ox)
  const y = el.dataset.y != null ? parseFloat(el.dataset.y) : parseFloat(el.dataset.oy)
  const w = el.dataset.ow ? parseFloat(el.dataset.ow) : el.offsetWidth
  const h = el.dataset.oh ? parseFloat(el.dataset.oh) : el.offsetHeight
  if (el.dataset.y != null) el.dataset.oy = y
  let bx = x
  let bw = w
  if (el.classList.contains('t') && w >= 590) {
    const tb = textBox(el)
    if (tb) {
      bx = x + tb.dx
      bw = tb.w
    }
  }
  return { el, x: bx, y, w: bw, h, ox: x, oy: y }
}

function restore(el) {
  if (el.dataset.ox == null) return
  el.style.left = `${el.dataset.ox}px`
  el.style.top = `${el.dataset.oy}px`
  el.style.width = el.dataset.ow
  el.style.height = el.dataset.oh
  el.style.zoom = ''
  el.classList.remove('exploded')
  for (const k of ['ox', 'oy', 'ow', 'oh']) delete el.dataset[k]
}

export function resetReflow(page) {
  if (!page) return
  page.querySelectorAll('[data-ox]').forEach(restore)
}

function canExplode(el) {
  if (!el.classList.contains('card')) return false
  const subs = Array.from(el.children).filter((c) => c.querySelector(':scope > .sq-bg') && c.offsetWidth > 120 && c.offsetHeight > 60)
  return subs.length >= 2
}

const usable = (el) => el.offsetParent && !el.classList.contains('footer') && !el.classList.contains('pop') && !el.classList.contains('sq-bg') && getComputedStyle(el).position === 'absolute'

function groupsOf(container, isPage) {
  const items = Array.from(container.children).filter(usable).map(boxOf).filter((b) => b.w > 0 && b.h > 0)
  const isBlock = (b) => !b.el.hasAttribute('data-free') && (b.el.classList.contains('card') || (b.w > 150 && b.h > 60))
  const blocks = items.filter(isBlock).map((b) => ({ ...b, members: [b], top: b.el.hasAttribute('data-top') }))
  const loose = items.filter((b) => !isBlock(b))
  const free = []
  for (const a of loose) {
    if (a.el.hasAttribute('data-free')) {
      free.push(a)
      continue
    }
    const cx = a.x + a.w / 2
    let best = null
    for (const g of blocks) {
      const inside = a.x >= g.x - 4 && a.x + a.w <= g.x + g.w + 4 && a.y >= g.y - 4 && a.y + a.h <= g.y + g.h + 4
      const above = cx >= g.x - 20 && cx <= g.x + g.w + 20 && a.y + a.h <= g.y + 12 && g.y - (a.y + a.h) < 70
      if (inside || above) {
        const d = inside ? 0 : g.y - (a.y + a.h)
        if (!best || d < best.d) best = { g, d }
      }
    }
    if (best) best.g.members.push(a)
    else free.push(a)
  }
  const clusters = []
  for (const a of free) {
    const c = clusters.find((k) => a.y < k.y + k.h + 30 && a.y + a.h > k.y - 30 && a.x < k.x + k.w + 260 && a.x + a.w > k.x - 260)
    if (c) {
      c.members.push(a)
      const x1 = Math.max(c.x + c.w, a.x + a.w)
      const y1 = Math.max(c.y + c.h, a.y + a.h)
      c.x = Math.min(c.x, a.x)
      c.y = Math.min(c.y, a.y)
      c.w = x1 - c.x
      c.h = y1 - c.y
    } else clusters.push({ x: a.x, y: a.y, w: a.w, h: a.h, members: [a], top: isPage && a.y < 70 })
  }
  return [...blocks, ...clusters].map((g) => {
    const x0 = Math.min(...g.members.map((m) => m.x))
    const y0 = Math.min(...g.members.map((m) => m.y))
    const x1 = Math.max(...g.members.map((m) => m.x + m.w))
    const y1 = Math.max(...g.members.map((m) => m.y + m.h))
    return { members: g.members, x: x0, y: y0, w: x1 - x0, h: y1 - y0, top: g.top }
  })
}

function columnsOf(groups) {
  const cols = []
  for (const g of [...groups].sort((a, b) => a.x - b.x)) cols.push({ x0: g.x, x1: g.x + g.w, items: [g] })
  const overlap = (a, b) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < cols.length && !merged; i++)
      for (let j = i + 1; j < cols.length && !merged; j++) {
        const a = cols[i]
        const b = cols[j]
        const o = overlap(a, b)
        if (o > 0.4 * Math.min(a.x1 - a.x0, b.x1 - b.x0) || o > 60) {
          a.x0 = Math.min(a.x0, b.x0)
          a.x1 = Math.max(a.x1, b.x1)
          a.items.push(...b.items)
          cols.splice(j, 1)
          merged = true
        }
      }
  }
  return cols.sort((a, b) => a.x0 - b.x0)
}

const hits = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 2 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 2

function stacksOf(groups) {
  const list = groups.map((g) => ({ ...g, members: [...g.members] }))
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < list.length && !merged; i++)
      for (let j = i + 1; j < list.length && !merged; j++) {
        const a = list[i]
        const b = list[j]
        if (!hits(a, b)) continue
        const x1 = Math.max(a.x + a.w, b.x + b.w)
        const y1 = Math.max(a.y + a.h, b.y + b.h)
        a.x = Math.min(a.x, b.x)
        a.y = Math.min(a.y, b.y)
        a.w = x1 - a.x
        a.h = y1 - a.y
        a.members.push(...b.members)
        a.top = a.top || b.top
        list.splice(j, 1)
        merged = true
      }
  }
  return list.sort((a, b) => (Math.abs(a.y - b.y) < 8 ? a.x - b.x : a.y - b.y))
}

const isText = (g) => g.members.every((m) => !m.el.classList.contains('card') && (m.el.hasAttribute('data-free') || m.h < 60))

function place(m, x, y, z) {
  m.el.style.zoom = z === 1 ? '' : String(z)
  m.el.style.left = `${x / z}px`
  m.el.style.top = `${y / z}px`
}

const ZSOLO = 2.05
const ZBAND = 1.75

function bandCost(units, avail) {
  const sum = units.reduce((a, u) => a + u.w, 0)
  let z = (avail - GAP * (units.length - 1)) / sum
  const target = avail < 600 ? 1.5 : 1.05
  const limit = units.length === 1 ? ZSOLO : ZBAND
  let cost = 0
  if (z > limit) {
    cost += 4 + (z - limit)
    z = limit
  }
  const l = Math.log(z / target)
  cost += l < 0 ? 2 * l * l : l * l
  if (units.length > 1) {
    const ws = units.map((u) => u.w)
    const hs = units.map((u) => u.h)
    cost += 0.4 * Math.log(Math.max(...ws) / Math.min(...ws)) ** 2 + 0.15 * Math.log(Math.max(...hs) / Math.min(...hs)) ** 2
  }
  return { z, cost }
}

function uniform(run, avail, most) {
  let k = 1
  let best = Infinity
  for (let c = 1; c <= Math.min(most, run.length); c++) {
    const rows = Math.ceil(run.length / c)
    const left = (rows * c - run.length) / c
    const cost = bandCost(run.slice(0, c), avail).cost * rows + left * rows * 0.6
    if (cost < best) {
      best = cost
      k = c
    }
  }
  const z = bandCost(run.slice(0, k), avail).z
  const bands = []
  for (let i = 0; i < run.length; i += k) bands.push({ units: run.slice(i, i + k), z })
  return bands
}

function pack(run, avail) {
  const n = run.length
  const most = avail < 600 ? 3 : 5
  if (n >= 3 && run.every((u) => Math.abs(u.w - run[0].w) < 3)) return uniform(run, avail, most)
  const best = new Array(n + 1).fill(Infinity)
  const cut = new Array(n + 1).fill(0)
  best[0] = 0
  for (let i = 1; i <= n; i++)
    for (let j = Math.max(0, i - most); j < i; j++) {
      const c = best[j] + bandCost(run.slice(j, i), avail).cost + 0.01
      if (c < best[i]) {
        best[i] = c
        cut[i] = j
      }
    }
  const bands = []
  for (let i = n; i > 0; i = cut[i]) bands.unshift(run.slice(cut[i], i))
  return bands.map((b) => ({ units: b, z: bandCost(b, avail).z }))
}

function layout(container, avail, isPage) {
  const groups = groupsOf(container, isPage)
  const units = []
  const tops = groups.filter((g) => g.top).sort((a, b) => a.x - b.x)
  for (const g of tops) units.push({ kind: isText(g) ? 'text' : 'solo', w: g.w, h: g.h, x0: g.x, y0: g.y, items: [g], fixed: isText(g) })
  const rest = groups.filter((g) => !g.top)
  for (const c of isPage ? columnsOf(rest) : [{ items: rest }]) {
    for (const g of stacksOf(c.items)) {
      const unit = { w: g.w, h: g.h, x0: g.x, y0: g.y, items: [g] }
      const cardEl = g.members.find((m) => m.el.classList.contains('card') && m.w === g.w && m.h === g.h)
      if (isText(g)) units.push({ ...unit, kind: 'text' })
      else if (g.w > avail && cardEl && canExplode(cardEl.el)) units.push({ ...unit, kind: 'explode', card: cardEl, group: g, w: avail })
      else units.push({ ...unit, kind: g.w >= avail * 0.75 ? 'solo' : 'pack' })
    }
  }
  const bands = []
  let run = []
  const flushRun = () => {
    if (run.length) bands.push(...pack(run, avail))
    run = []
  }
  for (const u of units) {
    if (u.kind === 'pack') {
      run.push(u)
      continue
    }
    flushRun()
    if (u.kind === 'explode') bands.push({ units: [u], z: 1 })
    else if (u.kind === 'text') bands.push({ units: [u], z: null })
    else bands.push({ units: [u], z: Math.min(ZSOLO, avail / u.w) })
  }
  flushRun()
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i]
    if (b.z != null) continue
    const u = b.units[0]
    const next = bands.slice(i + 1).find((n) => n.z != null && n.units[0].kind !== 'explode')
    const base = u.fixed || !next ? 1 : Math.min(next.z, 1.6)
    b.z = Math.min(base, avail / u.w)
  }
  const x0 = isPage ? PAD : 14
  let y = isPage ? PAD : 14
  for (const b of bands) {
    let x = x0
    let bh = 0
    for (const u of b.units) {
      if (u.kind === 'explode') {
        const card = u.card
        const inner = layout(card.el, u.w - 28, false)
        card.el.classList.add('exploded')
        card.el.style.zoom = ''
        card.el.style.left = `${x}px`
        card.el.style.top = `${y}px`
        card.el.style.width = `${u.w}px`
        card.el.style.height = `${inner}px`
        for (const m of u.group.members) if (m !== card) place(m, x + (m.ox - card.ox), y + (m.oy - card.oy), 1)
        bh = Math.max(bh, inner)
        x += u.w + GAP
        continue
      }
      const z = b.z
      for (const g of u.items) for (const m of g.members) place(m, x + (m.ox - u.x0) * z, y + (m.oy - u.y0) * z, z)
      bh = Math.max(bh, u.h * z)
      x += u.w * z + GAP
    }
    y += bh + (b.units[0].kind === 'text' ? 8 : GAP)
  }
  return y + (isPage ? PAD - GAP : 14 - GAP + 14)
}

export function reflow(page, width) {
  if (!page) return 0
  return layout(page, width - PAD * 2, true)
}
