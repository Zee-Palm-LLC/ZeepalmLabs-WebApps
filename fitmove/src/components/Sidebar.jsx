import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { NAV } from '../data.js'
import { useUi } from '../store.js'
import { matchRoute, NAV_PATHS } from '../routes.js'
import { goto } from '../nav.js'

const ROW0 = 127.9
const STEP = 48

export default function Sidebar({ H = 1290 }) {
  const route = useUi((s) => s.route)
  const active = matchRoute(route).nav
  const pill = useRef(null)
  const first = useRef(true)
  const index = Math.max(0, NAV.findIndex((n) => n.id === active))

  useLayoutEffect(() => {
    const y = index * STEP
    if (first.current) {
      gsap.set(pill.current, { y })
      first.current = false
      return
    }
    gsap.to(pill.current, { y, duration: 0.75, ease: 'expo.out' })
    gsap.fromTo(pill.current, { scaleX: 0.94 }, { scaleX: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)' })
  }, [index])

  return (
    <Card x={15.9} y={15.9} w={221.1} h={H - 31.6} className="sidebar" data-s="sidebar">
      <Glyph n="logo" className="brand-mark" data-s="logo" />
      <T x={77.8} b={73.4} s={20} w={600} c="var(--ink)" className="brand-name" data-s="brand">
        FitMove
      </T>
      <At x={31.9} y={107.9} w={189.2} h={40} className="nav-pill" data-s="pill" ref={pill} />
      <nav className="nav" aria-label="Main">
        {NAV.map((n, i) => {
          const cy = ROW0 + i * STEP
          const on = n.id === active
          return (
            <At
              as="button"
              key={n.id}
              x={31.9}
              y={cy - 20}
              w={189.2}
              h={40}
              className={`nav-item ${on ? 'is-on' : ''}`}
              data-s="nav"
              onClick={() => goto(NAV_PATHS[n.id])}
              aria-current={on ? 'page' : undefined}
            >
              <Glyph n={n.icon} className="nav-icon" ox={31.9} oy={cy - 20} />
              <span className="nav-label" style={{ left: 48.6, top: 26.3 - 0.85 * 14 }}>
                {n.label}
              </span>
              {n.badge ? (
                <span className="nav-badge" style={{ left: 162.2, top: 11 }}>
                  {n.badge}
                </span>
              ) : null}
            </At>
          )
        })}
      </nav>
      <Upgrade y={H - 370} />
      <At as="button" x={31.9} y={H - 89.5} w={189.2} h={40} className="nav-item logout" data-s="logout">
        <Icon name="logout" size={20} className="nav-icon" style={{ left: 16, top: 10 }} />
        <span className="nav-label" style={{ left: 48.6, top: 26.3 - 0.85 * 14 }}>
          Logout
        </span>
      </At>
    </Card>
  )
}

function Upgrade({ y }) {
  return (
    <At x={31.9} y={y} w={189.2} h={258} sq={[21, 1]} className="upgrade" data-s="upgrade">
      <Glyph n="mark" ox={31.9} oy={920} className="upgrade-mark" data-s="upgrade-mark" />
      <div className="upgrade-head" data-s="upgrade-head">
        <span>Track.</span>
        <span>Analyze.</span>
        <span>Succeed.</span>
      </div>
      <p className="upgrade-copy" data-s="upgrade-copy">
        Monitor progress, set goals, and
        <br />
        achieve results faster!
      </p>
      <button className="upgrade-btn" data-s="upgrade-btn">
        <span className="shine" />
        <span className="label">Upgrade FitMove 3.2</span>
      </button>
    </At>
  )
}
