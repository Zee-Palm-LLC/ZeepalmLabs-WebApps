import gsap from 'gsap'
import { barPath, barTop } from './components/ActivityCard.jsx'
import { waveHand } from './components/Header.jsx'

const NUM = /\d[\d.,]*/g

function textNode(el) {
  for (const n of el.childNodes) if (n.nodeType === 3 && /\d/.test(n.nodeValue)) return n
  return null
}

function parseToken(tok) {
  const thousands = /^\d{1,3}([.,]\d{3})+$/.test(tok)
  if (thousands) return { value: Number(tok.replace(/[.,]/g, '')), sep: tok.match(/[.,]/)[0], dec: 0 }
  const clean = tok.replace(/,/g, '')
  const dot = clean.indexOf('.')
  return { value: Number(clean), sep: '', dec: dot > -1 ? clean.length - dot - 1 : 0 }
}

function formatToken(v, t) {
  if (t.sep) return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, t.sep)
  return v.toFixed(t.dec)
}

export function countUp(el, duration = 1.2, ease = 'power3.out') {
  const node = textNode(el)
  if (!node) return gsap.timeline()
  const template = node.nodeValue
  const tokens = template.match(NUM) || []
  const parsed = tokens.map(parseToken)
  const proxy = { k: 0 }
  return gsap.to(proxy, {
    k: 1,
    duration,
    ease,
    onUpdate: () => {
      let i = 0
      node.nodeValue = template.replace(NUM, () => {
        const t = parsed[i++]
        return formatToken(t.value * proxy.k, t)
      })
    },
    onComplete: () => {
      node.nodeValue = template
    },
  })
}

const q = (root, sel) => Array.from(root.querySelectorAll(sel))
const one = (root, sel) => root.querySelector(sel)

export function playIntro(root) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  const all = (sel) => q(root, sel)

  const sidebar = one(root, '[data-s="sidebar"]')
  const logo = one(root, '[data-s="logo"]')
  const petals = logo ? q(logo, '.gp') : []
  const brand = one(root, '[data-s="brand"]')
  const pill = one(root, '[data-s="pill"]')
  const navs = all('[data-s="nav"]')
  const hello = all('.hello .ch')
  const wave = one(root, '[data-s="wave"]')
  const welcome = one(root, '[data-s="welcome"]')
  const search = one(root, '[data-s="search"]')
  const stats = all('[data-s="stat"]')
  const activity = one(root, '[data-s="activity"]')
  const progress = one(root, '[data-s="progress"]')
  const today = one(root, '[data-s="today"]')
  const panel = one(root, '[data-s="panel"]')
  const meals = all('[data-s="meal"]')
  const classes = all('[data-s="class"]')
  const sections = all('[data-s="section"]')
  const upgrade = one(root, '[data-s="upgrade"]')
  const footer = one(root, '[data-s="footer"]')
  const logout = one(root, '[data-s="logout"]')

  const cardsIn = (els, at, opts = {}) =>
    tl.fromTo(
      els,
      { autoAlpha: 0, y: opts.y ?? 34, scale: opts.scale ?? 0.965, filter: 'blur(6px)' },
      { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: opts.d ?? 1.15, stagger: opts.stagger ?? 0.08, ease: 'expo.out', clearProps: 'filter' },
      at
    )

  tl.set(root, { autoAlpha: 1 })

  tl.fromTo(sidebar, { autoAlpha: 0, x: -36 }, { autoAlpha: 1, x: 0, duration: 1.1 }, 0)
  tl.fromTo(
    petals,
    { scale: 0, rotation: -120, transformOrigin: '50% 50%', autoAlpha: 0 },
    { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.1, stagger: 0.09, ease: 'back.out(1.8)' },
    0.12
  )
  tl.fromTo(brand, { autoAlpha: 0, x: -10, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.9 }, 0.35)
  tl.fromTo(pill, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1.0, ease: 'expo.inOut' }, 0.4)
  tl.fromTo(navs, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.045 }, 0.45)
  tl.fromTo(logout, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.0)

  tl.fromTo(hello, { yPercent: 110, autoAlpha: 0, rotate: 8 }, { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.9, stagger: 0.025 }, 0.45)
  tl.fromTo(wave, { scale: 0, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(2.4)' }, 0.85)
  tl.add(() => waveHand(wave), 1.35)
  tl.fromTo(welcome, { autoAlpha: 0, y: 8, letterSpacing: '0.06em' }, { autoAlpha: 1, y: 0, letterSpacing: '0em', duration: 1.0 }, 0.7)
  tl.fromTo(search, { autoAlpha: 0, scaleX: 0.6, transformOrigin: '100% 50%' }, { autoAlpha: 1, scaleX: 1, duration: 1.0 }, 0.55)
  tl.fromTo(one(root, '.search-field'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.85)
  tl.fromTo(one(root, '.bell'), { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(2.6)' }, 0.95)
  tl.fromTo(
    one(root, '.bell-glyph'),
    { rotate: 0 },
    { keyframes: { rotate: [0, 16, -12, 8, -4, 0] }, duration: 0.9, ease: 'none', transformOrigin: '50% 30%' },
    1.25
  )

  cardsIn(stats, 0.75, { stagger: 0.09 })
  const gaugeFill = one(root, '[data-s="gauge-fill"]')
  if (gaugeFill) {
    const target = gaugeFill.style.strokeDasharray
    tl.fromTo(gaugeFill, { strokeDasharray: '0 2' }, { strokeDasharray: target, duration: 1.4, ease: 'power3.inOut' }, 1.0)
  }
  tl.fromTo(one(root, '[data-s="gauge-inner"]'), { strokeDasharray: '0 1' }, { strokeDasharray: '1 1', duration: 1.2, ease: 'power2.inOut' }, 0.95)
  tl.fromTo(
    one(root, '[data-s="needle"]'),
    { rotation: -180, svgOrigin: '334 214.2' },
    { rotation: -63.4, svgOrigin: '334 214.2', duration: 1.6, ease: 'elastic.out(1, 0.55)' },
    1.05
  )
  const ecg = one(root, '[data-s="ecg-line"]')
  tl.fromTo(ecg, { strokeDasharray: '0 1' }, { strokeDasharray: '1 1', duration: 1.3, ease: 'power2.inOut' }, 1.05)
  tl.fromTo(all('[data-s="steps-grid"]'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.8, stagger: 0.04 }, 1.1)
  tl.fromTo(one(root, '[data-s="steps-line"]'), { strokeDasharray: '0 1' }, { strokeDasharray: '1 1', duration: 1.3, ease: 'power2.inOut' }, 1.2)
  tl.fromTo(all('[data-s="steps-day"]'), { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04 }, 1.25)
  tl.fromTo(one(root, '[data-s="steps-dot"]'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.7, ease: 'back.out(3)' }, 2.25)
  all('.stat .num').forEach((el, i) => {
    if (el.dataset.count) tl.add(countUp(el, 1.4), 1.05 + i * 0.1)
  })
  tl.fromTo(all('[data-s="stat-sub"]'), { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.04 }, 1.45)

  cardsIn(activity, 1.25)
  tl.fromTo(all('[data-s="grid"]'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.0, stagger: 0.05, ease: 'expo.inOut' }, 1.4)
  tl.fromTo(all('[data-s="axis"]'), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.05 }, 1.5)
  tl.fromTo(all('[data-s="axis-x"]'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.035 }, 1.6)
  all('[data-s="bar"]').forEach((el, i) => {
    const h = Number(el.dataset.h)
    const x = Number(el.dataset.x)
    const proxy = { h: 0 }
    el.setAttribute('d', barPath(x, barTop(0)))
    tl.to(
      proxy,
      {
        h,
        duration: 1.25,
        ease: 'elastic.out(1, 0.75)',
        onUpdate: () => el.setAttribute('d', barPath(x, barTop(Math.max(0, proxy.h)))),
      },
      1.6 + i * 0.06
    )
  })
  const focusBar = one(root, '.bar-col.is-on .bar')
  if (focusBar) tl.fromTo(focusBar, { fill: '#CEE9FF' }, { fill: '#FFF080', duration: 0.6, ease: 'power2.out', clearProps: 'fill' }, 2.45)
  const tip = one(root, '[data-s="bar-tip"]')
  tl.fromTo(tip, { autoAlpha: 0, scale: 0.6, transformOrigin: '0% 100%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' }, 2.55)
  tl.fromTo(one(root, '[data-s="activity"] [data-s="chip"]'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 1.55)

  cardsIn(progress, 1.35)
  tl.fromTo(one(root, '[data-s="progress"] [data-s="chip"]'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 1.6)
  tl.fromTo(all('[data-s="ring-track"]'), { autoAlpha: 0, scale: 0.85, svgOrigin: '937.9 308.05' }, { autoAlpha: 1, scale: 1, svgOrigin: '937.9 308.05', duration: 1.0, stagger: 0.08 }, 1.5)
  all('[data-s="ring-arc"]').forEach((el, i) => {
    const v = Number(el.dataset.v) / 100
    tl.fromTo(el, { strokeDasharray: '0 1' }, { strokeDasharray: `${v} 1`, duration: 1.5, ease: 'expo.inOut' }, 1.65 + i * 0.14)
  })
  const total = one(root, '[data-s="progress"] [data-count]')
  if (total) tl.add(countUp(total, 1.6), 1.65)
  tl.fromTo(all('[data-s="legend"]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 2.0)
  tl.fromTo(all('.legend-dot'), { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.09, ease: 'back.out(3)' }, 2.15)

  tl.fromTo(panel, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 0.9)
  tl.fromTo(one(root, '[data-s="avatar"]'), { scale: 0.4, rotate: -14, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(2)' }, 1.15)
  tl.fromTo([one(root, '[data-s="p-name"]'), ...all('[data-s="p-meta"]')], { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.05 }, 1.25)
  tl.fromTo(one(root, '[data-s="p-band"]'), { autoAlpha: 0, scaleX: 0.8 }, { autoAlpha: 1, scaleX: 1, duration: 0.9 }, 1.3)
  all('[data-s="p-band"] [data-count]').forEach((el, i) => tl.add(countUp(el, 1.1), 1.4 + i * 0.08))
  tl.fromTo(all('[data-s="c-title"], [data-s="c-nav"]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, 1.4)
  tl.fromTo(all('[data-s="c-head"]'), { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.03 }, 1.5)
  const days = all('.day')
  tl.fromTo(
    days,
    { autoAlpha: 0, scale: 0.4 },
    {
      autoAlpha: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(2)',
      stagger: (i, el) => (Number(el.dataset.col) + Number(el.dataset.row)) * 0.045,
    },
    1.55
  )
  const marks = all('.day.mark-blue .day-bg, .day.mark-yellow .day-bg')
  tl.fromTo(marks, { scale: 0 }, { scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(2.6)', clearProps: 'transform' }, 2.25)

  tl.fromTo(all('[data-s="s-title"], [data-s="s-add"]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, 1.9)
  tl.fromTo(all('[data-s="sched"]'), { autoAlpha: 0, x: 22 }, { autoAlpha: 1, x: 0, duration: 0.9, stagger: 0.09 }, 2.0)
  const tick = one(root, '.sched.is-done .check-mark path')
  if (tick) tl.fromTo(tick, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', clearProps: 'strokeDashoffset' }, 2.45)

  const recent = one(root, '[data-s="recent"]')
  tl.fromTo(recent, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.0 }, 2.15)
  tl.fromTo(all('[data-s="r-item"]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 2.35)
  tl.fromTo(all('[data-s="r-ico"]'), { scale: 0 }, { scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(2.6)' }, 2.4)
  tl.fromTo(one(root, '.r-line'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power3.inOut' }, 2.8)

  cardsIn(today, 2.0)
  tl.fromTo(one(root, '[data-s="today"] [data-s="chip"]'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 2.25)
  const mapImg = one(root, '[data-s="map-img"]')
  tl.fromTo(mapImg, { clipPath: 'circle(0px at 65px 78.5px)', scale: 1.15 }, { clipPath: 'circle(330px at 65px 78.5px)', scale: 1, duration: 1.6, ease: 'power3.inOut', clearProps: 'clipPath,transform' }, 2.2)
  tl.fromTo(one(root, '[data-s="marker"]'), { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(2.4)' }, 2.35)
  tl.fromTo(one(root, '[data-s="route"]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 2.65)
  tl.fromTo(all('[data-s="today-time"], [data-s="today-title"], [data-s="divider"]'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.07 }, 2.35)
  tl.fromTo(all('[data-s="today-row"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 2.5)
  all('[data-s="today-row"] [data-count]').forEach((el, i) => tl.add(countUp(el, 1.4), 2.55 + i * 0.07))

  tl.fromTo(sections, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 2.4)
  cardsIn(meals, 2.5, { stagger: 0.12 })
  tl.fromTo(all('[data-s="meal-photo"] img'), { scale: 1.35, rotate: 6 }, { scale: 1, rotate: 0, duration: 1.6, stagger: 0.12, ease: 'expo.out' }, 2.55)
  tl.fromTo(all('[data-s="meal-tag"]'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2.4)' }, 2.85)

  tl.fromTo(classes, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 1.1, stagger: 0.1 }, 2.65)
  tl.fromTo(all('[data-s="class-ico"]'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(2)' }, 2.85)
  tl.fromTo(all('[data-s="class-level"]'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2.4)' }, 3.0)

  tl.fromTo(upgrade, { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2 }, 2.7)
  tl.fromTo(one(root, '[data-s="upgrade-mark"]'), { rotate: -180, scale: 0, transformOrigin: '50% 50%' }, { rotate: 0, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 2.9)
  tl.fromTo(all('.upgrade-head span'), { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.1 }, 3.0)
  tl.fromTo([one(root, '[data-s="upgrade-copy"]'), one(root, '[data-s="upgrade-btn"]')], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 3.2)
  tl.add(() => shine(root), 3.6)
  tl.fromTo(footer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0 }, 3.2)
  tl.add(() => settle(root))

  return tl
}

export function settle(root) {
  const els = Array.from(root.querySelectorAll('*')).filter(
    (el) => el instanceof HTMLElement && !el.closest('.bar-tip') && (el.style.transform || el.style.opacity || el.style.visibility || el.style.filter || el.style.letterSpacing)
  )
  gsap.set(els, { clearProps: 'transform,opacity,visibility,filter,letterSpacing' })
  const brand = root.querySelector('[data-s="brand"]')
  if (brand) gsap.set(brand, { clearProps: 'clipPath' })
  const tip = root.querySelector('.bar-tip')
  if (tip) gsap.set(tip, { clearProps: 'opacity,visibility' })
}

function shine(root) {
  const el = root.querySelector('.upgrade-btn .shine')
  if (!el) return
  gsap.fromTo(el, { left: '-60%' }, { left: '130%', duration: 1.1, ease: 'power2.inOut' })
}

export function startIdle(root) {
  const tls = []
  const ecgPulse = root.querySelector('[data-s="ecg-pulse"]')
  if (ecgPulse) {
    const t = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
    t.set(ecgPulse, { opacity: 1, strokeDasharray: '0.14 1.2', strokeDashoffset: 0.14 })
    t.to(ecgPulse, { strokeDashoffset: -1.06, duration: 1.5, ease: 'none' })
    t.set(ecgPulse, { opacity: 0 })
    tls.push(t)
  }
  const heart = root.querySelector('.stat-heart .stat-icon')
  if (heart) {
    const t = gsap.timeline({ repeat: -1, repeatDelay: 1.15 })
    t.to(heart, { scale: 1.18, duration: 0.14, ease: 'power2.out', transformOrigin: '50% 55%' })
    t.to(heart, { scale: 1, duration: 0.3, ease: 'power2.in' })
    t.to(heart, { scale: 1.1, duration: 0.12, ease: 'power2.out' })
    t.to(heart, { scale: 1, duration: 0.3, ease: 'power2.in' })
    tls.push(t)
  }
  const dot = root.querySelector('[data-s="steps-dot"]')
  if (dot) tls.push(gsap.to(dot, { attr: { r: 5 }, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
  const wave = root.querySelector('[data-s="wave"]')
  const bell = root.querySelector('.bell-glyph')
  const loop = gsap.timeline({ repeat: -1, repeatDelay: 0 })
  loop.add(() => waveHand(wave), 6)
  loop.add(() => shine(root), 7.5)
  loop.fromTo(
    bell,
    { rotate: 0 },
    { keyframes: { rotate: [0, 16, -12, 8, -4, 0] }, duration: 0.9, ease: 'none', transformOrigin: '50% 30%', immediateRender: false },
    10
  )
  loop.add(() => {}, 12)
  tls.push(loop)
  const runner = root.querySelector('[data-s="runner-dot"]')
  const route = root.querySelector('[data-s="route"]')
  if (runner && route) {
    const len = route.getTotalLength()
    const p = { t: 0 }
    const t = gsap.timeline({ repeat: -1, repeatDelay: 2.5 })
    t.set(runner, { opacity: 0 })
    t.to(runner, { opacity: 1, duration: 0.3 })
    t.to(
      p,
      {
        t: 1,
        duration: 6,
        ease: 'none',
        onUpdate: () => {
          const pt = route.getPointAtLength(p.t * len)
          runner.setAttribute('cx', pt.x)
          runner.setAttribute('cy', pt.y)
        },
      },
      0
    )
    t.to(runner, { opacity: 0, duration: 0.4 }, 5.6)
    tls.push(t)
  }
  return () => tls.forEach((t) => t.kill())
}
