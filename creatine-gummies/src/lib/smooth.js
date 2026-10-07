import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function startSmooth() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  window.__lenis = lenis
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToId(id) {
  const el = id === 'top' ? 0 : document.getElementById(id)
  if (lenis) lenis.scrollTo(el, { duration: 1.5 })
  else if (el === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else el?.scrollIntoView({ behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
