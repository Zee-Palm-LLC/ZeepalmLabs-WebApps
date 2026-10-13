import { useEffect, useRef } from 'react'
import { STAGES } from '../lib/data'
import { gsap, ScrollTrigger, scrollToTarget, reducedMotion } from '../lib/scroll'
import { introTo } from '../gl/mood'
import { setState } from '../lib/store'

const CARDS = [
  { x: 6.25, y: 17.5, r: 14, z: 1, depth: 1.2 },
  { x: 15, y: 30.625, r: -4, z: 2, depth: 0.7 },
  { x: 35.75, y: 31.25, r: 0, z: 2, depth: 0.5 },
  { x: 54.6875, y: 30.625, r: 4, z: 2, depth: 0.7 },
  { x: 65.3125, y: 22.8125, r: -7, z: 3, depth: 1.1 },
]

const ROW = { y: 21, x0: 2.375, gap: 1.6 }

function Letters({ text }) {
  return text.split('').map((c, i) => (
    <span className="mask" key={i}>
      <span className="ch">{c}</span>
    </span>
  ))
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export default function Hero() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.hcard')
      const floats = gsap.utils.toArray('.hcard__float')
      const still = reducedMotion()

      const intro = gsap.timeline({ delay: 0.15, onComplete: () => setState({ ready: true }) })
      intro
        .to(document.querySelector('.veil'), { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0)
        .add(() => introTo(1, 2.2), 0)
        .fromTo(document.querySelectorAll('[data-intro="nav"] > :not(.menu)'), { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out' }, 0.25)
        .fromTo('.hero__title .l1 .ch', { yPercent: 108 }, { yPercent: 0, duration: 1.1, stagger: 0.045, ease: 'power4.out' }, 0.35)
        .fromTo('.hero__title .l2 .ch', { yPercent: 108 }, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'power4.out' }, 0.62)
        .fromTo(floats, { y: () => window.innerHeight * 0.6, rotation: (i) => (i % 2 ? 9 : -9), opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1.5, stagger: { each: 0.08, from: 'center' }, ease: 'expo.out' }, 0.55)
        .fromTo('.hero__lede, .hero__more', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }, 1.1)
      if (still) intro.progress(1)

      if (!still) {
        floats.forEach((f, i) => {
          gsap.to(f.querySelector('.hcard__body'), {
            y: i % 2 ? -7 : 7,
            rotation: i % 2 ? 0.6 : -0.6,
            duration: 3.2 + i * 0.37,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        })
      }

      const qx = floats.map((f) => gsap.quickTo(f, 'x', { duration: 1.1, ease: 'power3.out' }))
      const qy = floats.map((f) => gsap.quickTo(f, 'y', { duration: 1.1, ease: 'power3.out' }))
      const onMove = (e) => {
        if (window.scrollY > window.innerHeight * 0.6) return
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        CARDS.forEach((c, i) => {
          qx[i](nx * 26 * c.depth)
          qy[i](ny * 18 * c.depth)
        })
      }
      if (!still) window.addEventListener('pointermove', onMove, { passive: true })

      const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
        })
        cards.forEach((card, i) => {
          tl.to(
            card,
            {
              rotation: 0,
              x: () => {
                const r = rem()
                const w = 18 * r
                const span = (window.innerWidth - ROW.x0 * 2 * r - w) / 4
                return ROW.x0 * r + i * span - CARDS[i].x * r
              },
              y: () => (ROW.y - CARDS[i].y) * rem(),
              ease: 'none',
            },
            0,
          )
        })
        tl.to('.hero__title', { yPercent: -28, opacity: 0.35, ease: 'none' }, 0)
          .to('.hero__lede, .hero__more', { opacity: 0, y: -40, ease: 'none' }, 0)
      })

      ScrollTrigger.refresh()
      return () => {
        window.removeEventListener('pointermove', onMove)
        mm.revert()
      }
    }, el)
    return () => ctx.revert()
  }, [])

  const open = (id) => scrollToTarget(`#stage-${id}`)

  return (
    <section id="top" className="hero" ref={root} data-mood="hero" data-section="top">
      <div className="hero__frame">
        <h1 className="hero__title" aria-label="Training Flow">
          <span className="line l1" aria-hidden="true">
            <Letters text="Training" />
          </span>
          <span className="line l2" aria-hidden="true">
            <Letters text="Flow" />
          </span>
        </h1>

        <div className="hero__cards">
          {STAGES.map((s, i) => {
            const c = CARDS[i]
            return (
              <button
                key={s.id}
                className={`hcard hcard--${i + 1}`}
                style={{ left: `${c.x}rem`, top: `${c.y}rem`, zIndex: c.z, transform: `rotate(${c.r}deg)`, '--f': i - 2, '--i': i }}
                onClick={() => open(s.id)}
                data-cursor="Open"
                aria-label={`${s.name}: ${s.hint}. Jump to stage ${s.n}`}
              >
                <span className="hcard__float">
                  <span className="hcard__body">
                    <span className="hcard__eye">
                      <Eye />
                    </span>
                    <span className="hcard__shine" />
                    <span className="hcard__label">
                      <b>{s.name}</b>
                      <small>({s.hint})</small>
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="hero__lede">
          Coaching that takes your body through all five{' '}
          <br />
          stages — and back again.
        </p>
        <div className="hero__mcta">
          <a
            href="#contact"
            className="pill pill--mint"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#contact')
            }}
          >
            Book a session
          </a>
          <span>Tap a card to open its stage</span>
        </div>
        <a
          href="#process"
          className="hero__more"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#process')
          }}
        >
          See the process
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 1.5v9M2.5 7 6 10.5 9.5 7" />
          </svg>
        </a>
      </div>
    </section>
  )
}
