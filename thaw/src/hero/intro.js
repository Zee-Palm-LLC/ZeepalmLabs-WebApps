import gsap from 'gsap'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+<>'

export function scramble(el, { duration = 0.9, delay = 0 } = {}) {
  const target = el.dataset.scramble || el.textContent
  const st = { p: 0 }
  return gsap.to(st, {
    p: 1,
    duration,
    delay,
    ease: 'none',
    onStart: () => {
      el.style.opacity = 1
    },
    onUpdate: () => {
      const n = Math.floor(st.p * target.length)
      let out = target.slice(0, n)
      for (let i = n; i < target.length; i++) out += target[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      el.textContent = out
    },
    onComplete: () => {
      el.textContent = target
    },
  })
}

export function playIntro(root, stage, nav) {
  const q = (s) => Array.from(root.querySelectorAll(s))
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  const letters = q('.hl-ch')
  const panels = q('.panel')
  const dots = q('.dot')
  const bars = q('.chart .bar')
  const hours = q('.chart .hour')

  stage.state.melt = 0
  gsap.set(letters, { opacity: 0, yPercent: 26, filter: 'blur(14px)', color: '#ffffff' })
  gsap.set(panels, { clipPath: 'inset(0% 0% 100% 0%)' })
  gsap.set(q('[data-a="fade"], [data-a="row"] .t-key, .t-check, .t-stress, .hour-label'), { opacity: 0 })
  gsap.set(q('[data-scramble]'), { opacity: 0 })
  gsap.set(q('.t-para span'), { opacity: 0, yPercent: 70 })
  gsap.set(q('.dotted'), { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(q('.cold-fill'), { scaleX: 0 })
  gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box' })
  gsap.set(bars, { attr: { height: 0, y: (i, el) => el.dataset.base } })
  gsap.set(hours, { strokeDashoffset: 80, opacity: 0 })
  gsap.set(q('.start'), { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(q('.start-sq svg'), { x: -24, opacity: 0 })
  if (nav) gsap.set(nav, { opacity: 0, y: -10 })

  tl.to(stage.state, { melt: 1, duration: 2.8, ease: 'power2.inOut' }, 0.15)
  tl.call(() => stage.turn(), null, 0.35)

  tl.to(letters, {
    opacity: 1,
    yPercent: 0,
    filter: 'blur(0px)',
    duration: 1.2,
    stagger: { each: 0.075 },
    onComplete: () => gsap.set(letters, { clearProps: 'filter' }),
  }, 0.9)
  tl.to(letters, { color: '#c4d9e6', duration: 1.4, ease: 'power2.out', stagger: 0.075 }, 1.15)

  tl.to(panels, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', stagger: 0.12 }, 1.55)
  tl.to(q('[data-a="fade"], [data-a="row"] .t-key'), { opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05 }, 2.1)
  q('[data-scramble]').forEach((el, i) => tl.add(scramble(el, { duration: 0.8 }), 2.2 + i * 0.08))
  tl.to(dots, {
    opacity: (i, el) => ({ 0: 0.22, 1: 0.55, 2: 1 })[el.dataset.v],
    scale: 1,
    duration: 0.5,
    ease: 'back.out(3)',
    stagger: { each: 0.006, from: 'random' },
  }, 2.25)
  tl.to(q('.dotted'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 2.3)
  tl.to(q('.cold-fill'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 2.4)
  const pct = root.querySelector('[data-count]')
  if (pct) {
    const st = { v: 0 }
    tl.to(st, { v: 50, duration: 1.4, ease: 'expo.inOut', onUpdate: () => (pct.textContent = Math.round(st.v)) }, 2.4)
  }
  tl.to(q('.t-stress'), { opacity: 1, duration: 1, ease: 'power2.out' }, 2.6)
  tl.fromTo(q('.t-stress'), { y: 12, filter: 'blur(8px)' }, { y: 0, filter: 'blur(0px)', duration: 1.1, clearProps: 'filter' }, 2.6)
  tl.to(q('.t-para span'), { opacity: 1, yPercent: 0, duration: 1, stagger: 0.09 }, 2.7)
  tl.to(q('.t-check'), { opacity: 1, duration: 0.8, ease: 'power2.out' }, 2.5)
  tl.to(hours, { strokeDashoffset: 0, opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.08 }, 2.6)
  tl.to(bars, { attr: { height: (i, el) => el.dataset.h, y: (i, el) => el.dataset.base - el.dataset.h }, duration: 0.9, ease: 'elastic.out(1, 0.55)', stagger: 0.025 }, 2.7)
  tl.to(q('.hour-label'), { opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 3.0)
  tl.to(q('.start'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 2.8)
  tl.to(q('.start-sq svg'), { x: 0, opacity: 1, duration: 0.9 }, 3.4)
  if (nav) tl.to(nav, { opacity: 1, y: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, 2.4)
  return tl
}

export function startIdle(root) {
  const dots = Array.from(root.querySelectorAll('.dot'))
  const bars = Array.from(root.querySelectorAll('.chart .bar'))
  const level = { 0: 0.22, 1: 0.55, 2: 1 }
  const tick = setInterval(() => {
    for (let k = 0; k < 3; k++) {
      const d = dots[(Math.random() * dots.length) | 0]
      const v = String((Math.random() * 3) | 0)
      d.dataset.v = v
      gsap.to(d, { opacity: level[v], duration: 0.8, ease: 'power2.out' })
    }
  }, 420)
  const last = bars.slice(-3)
  const pulse = gsap.to(last, {
    attr: {
      height: (i, el) => (el._k = 0.55 + Math.random() * 0.6) * el.dataset.h,
      y: (i, el) => el.dataset.base - el._k * el.dataset.h,
    },
    duration: 1.4,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: 0.3,
    repeatRefresh: true,
  })
  return () => {
    clearInterval(tick)
    pulse.kill()
  }
}
