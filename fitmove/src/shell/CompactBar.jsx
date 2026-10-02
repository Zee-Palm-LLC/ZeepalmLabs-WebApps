import { useEffect, useState } from 'react'
import { Icon, Glyph, glyphBox } from '../ui/icons.jsx'
import { NAV } from '../data.js'
import { matchRoute, NAV_PATHS } from '../routes.js'
import { goto } from '../nav.js'
import { setUi, useUi } from '../store.js'
import Palette from './Palette.jsx'

export default function CompactBar({ route, title }) {
  const [open, setOpen] = useState(false)
  const menu = useUi((s) => s.menu)
  const active = matchRoute(route).nav
  useEffect(() => {
    setOpen(false)
  }, [route])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])
  return (
    <>
      <header className="cbar">
        <button className="cbar-logo" onClick={() => goto('/')} aria-label="FitMove home">
          <Glyph n="logo" ox={glyphBox('logo').x} oy={glyphBox('logo').y} style={{ position: 'relative' }} />
          <span>FitMove</span>
        </button>
        <span className="cbar-title">{title}</span>
        <button className="cbar-btn" aria-label="Search" onClick={() => setUi({ menu: 'palette' })} data-menu>
          <Icon name="search" size={19} sw={1.7} />
        </button>
        <button className={`cbar-btn burger ${open ? 'is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <i />
          <i />
          <i />
        </button>
      </header>
      {menu === 'palette' && route === '/' ? <Palette /> : null}
      <div className={`cdrawer ${open ? 'is-open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <nav className="cdrawer-panel" aria-label="Main">
          {NAV.map((n, i) => (
            <button key={n.id} className={`cnav ${n.id === active ? 'is-on' : ''}`} style={{ transitionDelay: open ? `${60 + i * 35}ms` : '0ms' }} onClick={() => goto(NAV_PATHS[n.id])}>
              <span className="cnav-ic">
                <Glyph n={n.icon} ox={glyphBox(n.icon).x} oy={glyphBox(n.icon).y} style={{ position: 'relative' }} />
              </span>
              <span>{n.label}</span>
              {n.badge ? <em>{n.badge}</em> : null}
            </button>
          ))}
          <div className="cdrawer-up">
            <b>Track. Analyze. Succeed.</b>
            <span>Monitor progress, set goals, and achieve results faster!</span>
            <button className="btn-green">Upgrade FitMove 3.2</button>
          </div>
        </nav>
      </div>
    </>
  )
}
