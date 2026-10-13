import { useEffect, useState } from 'react'
import { NAV, STAGES } from '../lib/data'
import { lockScroll, onScroll, scrollToTarget } from '../lib/scroll'
import { useStore } from '../lib/store'

export function Dots({ value = -1, className = '' }) {
  return (
    <span className={`dots ${className}`} aria-hidden="true">
      {STAGES.map((s, i) => (
        <i key={s.id} className={i <= value ? 'on' : ''} />
      ))}
    </span>
  )
}

export default function Nav() {
  const stage = useStore((s) => s.stage)
  const section = useStore((s) => s.section)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => onScroll((e) => setScrolled(e.scroll > 24)), [])

  useEffect(() => {
    lockScroll(open)
    document.documentElement.classList.toggle('menu-open', open)
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    requestAnimationFrame(() => scrollToTarget(href))
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} data-intro="nav">
      <a href="#top" className="nav__logo" onClick={(e) => go(e, '#top')} aria-label="Fivefold, back to top">
        <span>Fivefold</span>
        <Dots value={stage} />
      </a>
      <nav className="nav__links" aria-label="Main">
        {NAV.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className={section === l.href.slice(1) ? 'is-active' : ''}>
            {l.label}
          </a>
        ))}
      </nav>
      <a href="#contact" className="pill pill--mint nav__cta" onClick={(e) => go(e, '#contact')}>
        Book<span className="nav__cta-x">&nbsp;a session</span>
      </a>
      <button className={`nav__burger ${open ? 'is-open' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'}>
        <i />
        <i />
      </button>
      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <ol>
          {NAV.map((l, i) => (
            <li key={l.href} style={{ '--i': i }}>
              <a href={l.href} onClick={(e) => go(e, l.href)} tabIndex={open ? 0 : -1}>
                <small>0{i + 1}</small>
                {l.label}
              </a>
            </li>
          ))}
        </ol>
        <a href="#contact" className="pill pill--mint" onClick={(e) => go(e, '#contact')} tabIndex={open ? 0 : -1}>
          Book a session
        </a>
      </div>
    </header>
  )
}
