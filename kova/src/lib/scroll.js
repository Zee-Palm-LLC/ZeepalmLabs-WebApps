import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function startScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  window.__lenis = lenis
  window.__gsap = gsap
  return lenis
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, ...opts })
}

export { gsap, ScrollTrigger }
