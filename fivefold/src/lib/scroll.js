import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
const listeners = new Set()

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.15, smoothWheel: !reducedMotion(), wheelMultiplier: 0.9 })
  lenis.on('scroll', (e) => {
    ScrollTrigger.update()
    listeners.forEach((fn) => fn(e))
  })
  gsap.ticker.add((t) => lenis && lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  window.__lenis = lenis
  window.__gsap = gsap
  return lenis
}

export function stopScroll() {
  if (!lenis) return
  lenis.destroy()
  lenis = null
}

export function onScroll(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function lockScroll(locked) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  const offset = opts.offset ?? 0
  if (lenis) lenis.scrollTo(el, { offset, duration: opts.duration ?? 1.6, immediate: reducedMotion() })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
