import { useEffect, useRef } from 'react'
import { gsap, scrollToId } from '../lib/smooth.js'
import './footer.css'

const COLS = [
  ['Product', ['Approach', 'How it works', 'Science', 'Plans']],
  ['Company', ['About', 'Clinicians', 'Careers', 'Press']],
  ['Support', ['Help centre', 'Privacy', 'Terms', 'Contact']],
]
const IDS = { Approach: 'approach', 'How it works': 'how', Science: 'science', Plans: 'plans' }

export default function Footer() {
  const ref = useRef(null)
  const disp = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray('.wm-ch')
      gsap.fromTo(
        letters,
        { yPercent: 60, scaleY: 1.9, skewX: (i) => (i % 2 ? 8 : -8), filter: 'blur(10px)', opacity: 0.2 },
        {
          yPercent: 0,
          scaleY: 1,
          skewX: 0,
          filter: 'blur(0px)',
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: { trigger: '.wordmark', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 },
        }
      )
    }, ref)
    const wm = ref.current.querySelector('.wordmark')
    const st = { s: 0 }
    const melt = () => gsap.to(st, { s: 28, duration: 0.6, ease: 'power2.out', onUpdate: () => disp.current?.setAttribute('scale', st.s) })
    const freeze = () => gsap.to(st, { s: 0, duration: 1.6, ease: 'elastic.out(1, 0.4)', onUpdate: () => disp.current?.setAttribute('scale', st.s) })
    wm.addEventListener('pointerenter', melt)
    wm.addEventListener('pointerleave', freeze)
    return () => {
      ctx.revert()
      wm.removeEventListener('pointerenter', melt)
      wm.removeEventListener('pointerleave', freeze)
    }
  }, [])

  return (
    <footer className="foot" ref={ref}>
      <div className="wrap">
        <div className="crisis pane">
          <span className="mono-s crisis-k">
            <i /> If you’re in crisis
          </span>
          <p>
            THAW isn’t an emergency service. If you are in danger or thinking about harming yourself, call or text <b>988</b> (US) or your local emergency number now. You deserve help today.
          </p>
        </div>

        <div className="foot-grid">
          <div className="foot-cta">
            <h2 className="display">Ready when you are.</h2>
            <button className="btn" onClick={() => scrollToId('begin')}>
              Begin your assessment
              <span className="btn-sq">
                <svg viewBox="0 0 14.4 9.4" aria-hidden="true">
                  <path d="M1.1 0.9V4.7H13.1M9.5 1.1L13.1 4.7L9.5 8.3" />
                </svg>
              </span>
            </button>
          </div>
          {COLS.map(([h, links]) => (
            <nav className="foot-col" key={h} aria-label={h}>
              <span className="mono-s dim">{h}</span>
              {links.map((l) => (
                <a
                  key={l}
                  href={IDS[l] ? `#${IDS[l]}` : '#top'}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(IDS[l] || 'top')
                  }}
                >
                  {l}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <svg width="0" height="0" className="sr-only" aria-hidden="true">
        <filter id="melt">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="4">
            <animate attributeName="baseFrequency" dur="9s" values="0.012 0.05;0.016 0.07;0.012 0.05" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="wordmark display" aria-label="THAW">
        {'THAW'.split('').map((c, i) => (
          <span className="wm-ch" key={i} aria-hidden="true">
            {c}
          </span>
        ))}
      </div>

      <div className="wrap foot-base mono-s dim">
        <span>© 2026 THAW Labs</span>
        <span>Design concept: Kris Anfalova on Dribbble</span>
      </div>
    </footer>
  )
}
