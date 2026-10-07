import { useEffect, useState } from 'react'
import Mark from './Mark.jsx'
import { L, W, fitView } from '../hero/layout.js'
import { scrollToId } from '../lib/smooth.js'
import './nav.css'

const LINKS = [
  ['Approach', 'approach'],
  ['How it works', 'how'],
  ['Science', 'science'],
]

export default function Nav() {
  const [view, setView] = useState(() => fitView(window.innerWidth, window.innerHeight))
  const [docked, setDocked] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fit = () => setView(fitView(window.innerWidth, window.innerHeight))
    const onScroll = () => setDocked(window.scrollY > 40)
    window.addEventListener('resize', fit)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header className={`nav ${docked ? 'is-docked' : ''} ${open ? 'is-open' : ''}`} style={{ '--s': view.s }}>
      <span className="nav-glass" />
      <div className="nav-inner" style={{ width: W, left: view.ox, transform: `scale(${view.s})` }}>
        <a className="nav-logo" href="#top" onClick={go('top')} style={{ left: L.logo.x, top: L.logo.y, fontSize: L.logo.size }} aria-label="THAW home" data-a="nav">
          THAW
        </a>
        <Mark className="nav-mark" style={{ left: L.mark.cx - 14, top: L.mark.cy - 14 }} />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([label, id], i) => (
            <a key={id} className="mono nav-link" href={`#${id}`} onClick={go(id)} style={{ left: L.links.xs[i], top: L.links.y, fontSize: L.links.size }} data-a="nav">
              <span className="nav-link-in" data-text={label}>
                {label}
              </span>
            </a>
          ))}
        </nav>
        <a className="mono nav-cta" href="#begin" onClick={go('begin')} style={{ right: W - L.begin.r, top: L.begin.y, fontSize: L.begin.size, letterSpacing: `${L.begin.ls}em` }} data-a="nav">
          <span className="nav-link-in" data-text="Begin your assessment">
            Begin your assessment
          </span>
        </a>
        <button className="nav-burger" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          <i />
          <i />
        </button>
      </div>
      <div className="nav-sheet" aria-hidden={!open}>
        {LINKS.map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={go(id)}>
            {label}
          </a>
        ))}
        <a href="#begin" onClick={go('begin')} className="nav-sheet-cta">
          Begin your assessment
        </a>
      </div>
    </header>
  )
}
