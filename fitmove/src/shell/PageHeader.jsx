import { useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At } from '../ui/prim.jsx'
import { Glyph, Icon, glyphBox } from '../ui/icons.jsx'
import { useUi, setUi } from '../store.js'
import { goto } from '../nav.js'
import { NOTIFICATIONS } from '../data.js'
import Palette from './Palette.jsx'

export function PageTitle({ title, sub, back, center }) {
  if (back) {
    return (
      <>
        <At as="button" x={256} y={16} w={200} h={20} className="back-link" data-pi data-free onClick={() => goto(back.to)}>
          <Icon name="left" size={14} sw={1.6} className="back-ico" />
          <span>{back.label}</span>
        </At>
        <T x={257} b={62.3} s={24} w={500} c="var(--ink)" data-pi className="page-title" data-free>
          {title}
        </T>
      </>
    )
  }
  if (center) {
    return (
      <T x={257} b={51} s={24} w={500} c="var(--ink)" data-pi className="page-title" data-free>
        {title}
      </T>
    )
  }
  return (
    <>
      <T x={257} b={39.1} s={24} w={500} c="var(--ink)" data-pi className="page-title" data-free>
        {title}
      </T>
      {sub ? (
        <T x={256.7} b={61.4} s={12} c="var(--gray)" data-pi className="page-sub" data-free>
          {sub}
        </T>
      ) : null}
    </>
  )
}

export function UserPill({ x = 1102, w = 322.1, search = true }) {
  const menu = useUi((s) => s.menu)
  const bell = useRef(null)
  const sb = glyphBox('search')
  const bb = glyphBox('bell')
  const c0 = x + 7.5
  const c1 = search ? x + 52 : x + 7.5
  const c2 = search ? x + 96 : x + 52
  const ring = () => {
    gsap.fromTo(bell.current, { rotate: 0 }, { keyframes: { rotate: [0, 16, -12, 8, -4, 0] }, duration: 0.8, ease: 'none', transformOrigin: '50% 25%' })
    setUi({ menu: menu === 'pill-bell' ? null : 'pill-bell' })
  }
  return (
    <Card x={x} y={15.9} w={w} h={52} r={26} sm={0} className="user-pill" data-pi>
      {search ? (
        <At as="button" x={c0} y={23.4} w={36.5} h={36.5} className="pill-circle" aria-label="Search" data-menu onClick={() => setUi({ menu: menu === 'palette' ? null : 'palette' })}>
          <Glyph n="search" x={c0 + 18.25 - sb.w / 2} y={23.4 + 18.25 - sb.h / 2} ox={c0} oy={23.4} className="pill-ico" />
        </At>
      ) : null}
      <At as="button" x={c1} y={23.4} w={36.5} h={36.5} className="pill-circle" aria-label="Notifications" data-menu onClick={ring}>
        <span ref={bell} className="bell-glyph">
          <Glyph n="bell" x={c1 + (bb.x - 1024.1) + 0.25} y={23.4 + (bb.y - 23.9) + 0.25} ox={c1} oy={23.4} />
        </span>
        <span className="bell-dot" style={{ left: 19.6, top: 7.0 }} />
      </At>
      <At as="button" x={c2} y={23.4} w={x + w - c2 - 12} h={36.5} className="pill-user" data-menu onClick={() => setUi({ menu: menu === 'pill-user' ? null : 'pill-user' })}>
        <span className="pill-avatar">
          <img src="/img/avatar-round.jpg" alt="" draggable="false" />
        </span>
        <span className="pill-name" style={{ left: 49.5, top: 48.2 - 23.4 - 0.85 * 16 }}>
          Kalendra Wingman
        </span>
        <Icon name="down" size={24} sw={1.5} className="pill-caret" style={{ left: x + w - 36.1 - c2, top: 6.1 }} />
      </At>
      {menu === 'pill-bell' ? (
        <div className="pop bell-pop" style={{ right: 0, top: 60 }}>
          <div className="pop-title">Notifications</div>
          {NOTIFICATIONS.map((n) => (
            <div key={n.title} className="pop-note">
              <span className="pop-dot" />
              <span className="pop-label">{n.title}</span>
              <span className="pop-hint">{n.time}</span>
            </div>
          ))}
        </div>
      ) : null}
      {menu === 'pill-user' ? (
        <div className="pop user-pop" style={{ right: 0, top: 60 }}>
          {[
            ['Dashboard', '/'],
            ['My Statistics', '/statistics'],
            ['Messages', '/messages'],
            ['Meal Plan', '/meal-plan'],
          ].map(([l, to]) => (
            <button key={l} className="pop-row" onClick={() => goto(to)}>
              <span className="pop-label">{l}</span>
            </button>
          ))}
        </div>
      ) : null}
      {menu === 'palette' ? <Palette /> : null}
    </Card>
  )
}
