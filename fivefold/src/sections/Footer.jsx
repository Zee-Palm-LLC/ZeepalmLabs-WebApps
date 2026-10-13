import { useEffect, useRef } from 'react'
import { NAV } from '../lib/data'
import { gsap, scrollToTarget } from '../lib/scroll'
import { Dots } from '../ui/Nav'
import { useStore } from '../lib/store'

export default function Footer() {
  const root = useRef(null)
  const stage = useStore((s) => s.stage)

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom bottom', scrub: 0.8 } })
      tl.fromTo('.ft__word .ch', { yPercent: 105 }, { yPercent: 0, ease: 'power3.out', stagger: 0.08 }, 0)
        .fromTo('.ft__rule', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, ease: 'none' }, 0)
        .fromTo('.ft__row > *', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.3)
    }, el)
    return () => ctx.revert()
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    scrollToTarget(href)
  }

  return (
    <footer className="ft" ref={root} data-mood="footer">
      <div className="ft__word" aria-label="Fivefold">
        {'FIVEFOLD'.split('').map((c, i) => (
          <span className="mask" key={i} aria-hidden="true">
            <span className="ch">{c}</span>
          </span>
        ))}
      </div>
      <div className="ft__rule" />
      <div className="ft__row">
        <Dots value={stage} />
        <nav aria-label="Footer">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="ft__top" onClick={(e) => go(e, '#top')}>
          © {new Date().getFullYear()} Fivefold · Back to top ↑
        </a>
      </div>
    </footer>
  )
}
