import gsap from 'gsap'
import { getUi, navigate, setUi } from './store.js'

let leaving = false

export function goto(path) {
  if (path === getUi().route || leaving) return
  const root = document.querySelector('[data-page]')
  const items = root ? Array.from(root.querySelectorAll('[data-pi]')) : []
  if (!items.length || document.documentElement.dataset.still) {
    navigate(path)
    return
  }
  leaving = true
  setUi({ menu: null })
  gsap.killTweensOf(items)
  gsap.to(items, {
    autoAlpha: 0,
    y: -14,
    scale: 0.985,
    duration: 0.3,
    ease: 'power2.in',
    stagger: { each: 0.012, from: 'start' },
    onComplete: () => {
      leaving = false
      navigate(path)
      if (document.documentElement.dataset.mode !== 'film') window.scrollTo({ top: 0 })
    },
  })
}

export function pageIn(root, hooks) {
  const items = Array.from(root.querySelectorAll('[data-pi]'))
  const boxes = new Map(items.map((el) => [el, el.getBoundingClientRect()]))
  items.sort((a, b) => {
    const A = boxes.get(a)
    const B = boxes.get(b)
    return A.top + A.left * 0.35 - (B.top + B.left * 0.35)
  })
  const tl = gsap.timeline()
  tl.fromTo(
    items,
    { autoAlpha: 0, y: 28, scale: 0.975, filter: 'blur(5px)' },
    { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out', stagger: 0.045, clearProps: 'filter,transform,opacity,visibility' },
    0
  )
  if (hooks) hooks(root, tl)
  return tl
}
