import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FLAVORS } from '../data/flavors.js'
import { CanAnchor } from '../three/CanLayer.jsx'
import { LogoMark, Star, Fruit, Doodle, Icon } from '../ui/art.jsx'
import { scrollToId } from '../lib/smooth.js'
import { stageFor } from '../lib/fit.js'
import './hero.css'

const H = 900
const HERO_ORDER = ['apple', 'straw', 'berry', 'lemon', 'choco']
const fit = () => stageFor(H, 640, 760)

export default function Hero({ cart, intro, go }) {
  const root = useRef(null)
  const can = useRef(null)
  const [view, setView] = useState(fit)
  const params = new URLSearchParams(window.location.search)
  const still = params.has('still')
  const [i, setI] = useState(() => Math.max(0, HERO_ORDER.indexOf(params.get('hero'))))
  const f = FLAVORS.find((x) => x.id === HERO_ORDER[i])

  useLayoutEffect(() => {
    const on = () => setView(fit())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const played = useRef(false)
  const entering = intro && !still

  useLayoutEffect(() => {
    if (!entering) return
    const el = root.current
    gsap.set(el.querySelectorAll('.hn > *, .eyebrow, .h-line, .h-copy, .h-btn, .h-doodle'), { opacity: 0 })
    gsap.set(el.querySelector('.h-floor'), { yPercent: 100 })
  }, [])

  useEffect(() => {
    if (!entering || !go) return
    const el = root.current
    const tl = gsap.timeline({ onComplete: () => (played.current = true) })
    tl.fromTo(el.querySelector('.h-title'), { scale: 1.28, y: 70 }, { scale: 1, y: 0, duration: 1.5, ease: 'expo.out' }, 0)
    tl.fromTo(el.querySelectorAll('.h-line'), { opacity: 0, filter: 'blur(18px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out', stagger: 0.18 }, 0)
    tl.fromTo(el.querySelectorAll('.hn > *'), { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, 0.55)
    tl.fromTo(el.querySelectorAll('.eyebrow, .h-copy, .h-btn, .h-doodle'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.7)
    tl.fromTo(el.querySelector('.h-floor'), { yPercent: 100 }, { yPercent: 0, duration: 1.3, ease: 'expo.out' }, 0.8)
    tl.add(() => {
      const h = can.current
      if (h) gsap.fromTo(h, { opacity: 1, dy: -760, rotZ: -1.8, rotY: -2.6, scale: 0.86 }, { dy: 0, rotZ: -0.62, rotY: 0, scale: 1, duration: 1.4, ease: 'back.out(1.1)' })
    }, 0.45)
    return () => tl.kill()
  }, [go])

  useEffect(() => {
    if (!entering || !go) return
    const id = setInterval(() => setI((v) => (v + 1) % HERO_ORDER.length), 3400)
    return () => clearInterval(id)
  }, [go])

  useEffect(() => {
    const h = can.current
    if (!h) return
    if (entering && !played.current) return
    gsap.killTweensOf(h)
    if (still) return
    gsap.fromTo(h, { dy: -520, rotZ: -1.6, rotY: -2.4, scale: 0.86 }, { dy: 0, rotZ: -0.62, rotY: 0, scale: 1, duration: 1.25, ease: 'back.out(1.1)' })
    const el = root.current
    gsap.fromTo(el.querySelectorAll('.hero-swap'), { yPercent: 40, opacity: 0, rotate: -12 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.05 })
  }, [i, still])

  return (
    <section className={`hero ${view.m ? 'm' : ''}`} style={{ '--accent': f.accent, '--glow': f.glow, '--H': `${view.H}px`, height: view.h }} aria-label="Creatine Gummies">
      <div className="hero-bleed" />
      <div className="hero-c" ref={root} style={{ width: view.W, height: view.H, transform: `translate(${view.ox}px, 0) scale(${view.s})` }}>
        <nav className="hn" aria-label="Primary">
          <a className="hn-link" href="#flavours" onClick={(e) => (e.preventDefault(), scrollToId('flavours'))} data-hi>
            Shop All
          </a>
          <a className="hn-link" href="#bundles" onClick={(e) => (e.preventDefault(), scrollToId('bundles'))} style={{ left: 214 }} data-hi>
            Bundle &amp; Save
          </a>
          <a className="hn-link" href="#faq" onClick={(e) => (e.preventDefault(), scrollToId('faq'))} style={{ left: 392 }} data-hi>
            FAQ
          </a>
          <a className="hn-logo" href="#top" aria-label="Creatine Gummies home" data-hi>
            <LogoMark size={40} className="hn-mark" />
            <span className="serif">Creatine Gummies</span>
          </a>
          <button className="hn-cart" aria-label={`Cart, ${cart} items`} data-hi>
            <Icon name="cart" size={24} />
            <b key={cart}>{cart}</b>
          </button>
          <a className="hn-shop" href="#flavours" onClick={(e) => (e.preventDefault(), scrollToId('flavours'))} data-hi>
            Shop Now
          </a>
        </nav>

        <p className="eyebrow serif" data-hi>
          <Star size={12} /> Strength You Can Taste <Star size={12} />
        </p>
        <h1 className="h-title display" data-hi>
          <span className="h-line">
            <span className="h-icon hero-swap" key={`i${i}`}>
              <Fruit kind={f.fruit} size={62} />
            </span>
            Boost <em>Your Day</em>
          </span>
          <span className="h-line">One Gummy at a Time</span>
        </h1>
        <Doodle className="h-doodle" />
        <p className="h-copy" data-hi>
          Creatine Gummies offer an easy, enjoyable way to get your{' '}
          <br />
          daily creatine – no powders, no mixing, no hassle.
        </p>
        <a className="pill h-btn" href="#flavours" onClick={(e) => (e.preventDefault(), scrollToId('flavours'))} data-hi>
          Shop Now
        </a>
        <CanAnchor flavor={f.id} className="h-can" init={{ rotZ: -0.62, rotX: 0.12, opacity: entering ? 0 : 1 }} onReady={(h) => (can.current = h)} />
        <div className="h-floor">
          {view.m ? (
            <svg viewBox="0 0 430 120" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 120 L0 104 C 70 50 140 30 178 28 C 186 28 188 30 189 36 A 26 26 0 0 0 241 36 C 242 30 244 28 252 28 C 290 30 360 50 430 104 L430 120 Z" fill="#fff" />
            </svg>
          ) : (
            <svg viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 170 L0 150 C 300 70 520 40 646 36 C 668 35 676 38 680 48 A 40 40 0 0 0 760 48 C 764 38 772 35 794 36 C 920 40 1140 70 1440 150 L1440 170 Z" fill="#fff" />
            </svg>
          )}
          <button className="h-scroll" onClick={() => scrollToId('showcase')} aria-label="Scroll to flavours">
            <Icon name="mouse" size={26} />
          </button>
        </div>
      </div>
    </section>
  )
}
