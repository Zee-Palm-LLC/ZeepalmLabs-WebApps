import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { ACTIVITIES } from '../data.js'
import { useUi, setUi } from '../store.js'

export const MAP = { x: 268.9, y: 682.0, w: 251.4, h: 191.0 }

export const ROUTES = {
  Running: {
    start: [65.0, 78.5],
    pts: [
      [65.0, 78.5],
      [69.82, 69.76],
      [92.43, 27.64],
      [157.99, 58.66],
      [168.29, 85.16],
      [197.4, 99.7],
      [161.92, 162.02],
      [142.96, 144.1],
      [124.45, 142.06],
      [71.88, 115.42],
      [61.9, 103.91],
      [65.0, 78.5],
    ],
  },
  Cycling: {
    start: [150.0, 66.0],
    pts: [
      [150.0, 66.0],
      [136.0, 30.0],
      [150.0, 8.0],
      [205.0, 2.0],
      [236.0, 22.0],
      [238.0, 62.0],
      [212.0, 92.0],
      [174.0, 86.0],
      [150.0, 66.0],
    ],
  },
  Walking: {
    start: [161.92, 162.02],
    pts: [
      [161.92, 162.02],
      [182.0, 126.0],
      [197.4, 99.7],
      [214.0, 70.0],
      [229.0, 42.0],
      [244.0, 14.0],
    ],
  },
}

export function routeD(pts) {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('')
}

const KINDS = ['Running', 'Cycling', 'Walking']

export default function TodayCard() {
  const kind = useUi((s) => s.activity)
  const menu = useUi((s) => s.menu)
  const a = ACTIVITIES[kind]
  const route = ROUTES[kind]
  const line = useRef(null)
  const marker = useRef(null)
  const rows = useRef(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const tl = gsap.timeline()
    tl.fromTo(line.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
    tl.fromTo(marker.current, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, 0)
    tl.fromTo(rows.current.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, 0.05)
  }, [kind])

  return (
    <Card x={252.9} y={619.9} w={538.2} h={269.3} className="today" data-s="today">
      <T x={269} b={657.3} s={16} w={500} c="var(--ink)" data-s="title">
        {"Today's Activity"}
      </T>
      <At
        as="button"
        x={676}
        y={635.6}
        w={99.3}
        h={30.3}
        className={`chip chip-green ${menu === 'kind' ? 'is-open' : ''}`}
        data-s="chip"
        onClick={() => setUi({ menu: menu === 'kind' ? null : 'kind' })}
      >
        <Glyph n="runsm" className="chip-lead" ox={676} oy={635.6} />
        <span className="chip-label" style={{ left: 30.6, top: 20.0 - 0.85 * 11 }}>
          {kind}
        </span>
        <Icon name="down" size={14} className="chip-caret" style={{ left: 75.0, top: 8.3 }} />
      </At>
      {menu === 'kind' ? (
        <div className="pop kind-pop" style={{ left: 775.3 - 252.9 - 140, top: 50 }}>
          {KINDS.map((k) => (
            <button key={k} className={`pop-row ${k === kind ? 'is-on' : ''}`} onClick={() => setUi({ activity: k, menu: null })}>
              <span className="pop-label">{k}</span>
            </button>
          ))}
        </div>
      ) : null}
      <At x={MAP.x} y={MAP.y} w={MAP.w} h={MAP.h} clip={[14, 1]} className="map" data-s="map">
        <img src="/img/map.jpg" alt="Map of the Park Loop Trail around Central Park" draggable="false" data-s="map-img" />
        <span className="map-sheen" data-s="map-sheen" />
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="map-svg">
          <path d={routeD(route.pts)} className="route-ghost" data-s="route-ghost" />
          <path d={routeD(route.pts)} className="route" pathLength="1" ref={line} data-s="route" />
          <circle r="3.2" cx={route.start[0]} cy={route.start[1]} className="runner-dot" data-s="runner-dot" />
        </svg>
        <div className="map-marker" ref={marker} style={{ left: route.start[0] - 15.3, top: route.start[1] - 15.3 }} data-s="marker">
          <span className="halo" />
          <span className="core">
            <Icon name="flag" size={9} className="flag" />
          </span>
        </div>
      </At>
      <Glyph n="clock" className="today-clock" />
      <T x={552.0} b={698.6} s={11} c="var(--gray)" data-s="today-time">
        {a.time}
      </T>
      <T x={536.0} b={722.7} s={16} w={500} c="var(--ink)" data-s="today-title">
        {a.title}
      </T>
      <At x={535.8} y={736.6} w={239.9} h={0.8} className="divider" data-s="divider" />
      <div className="today-rows" ref={rows}>
        {a.rows.map(([k, v], i) => (
          <div key={k} className="today-row" data-s="today-row">
            <T x={536.4} b={760.3 + i * 26.05} s={11} c="var(--gray)">
              {k}
            </T>
            <T r={774.6} b={760.3 + i * 26.05} s={12} w={500} c="var(--ink)" data-count={v}>
              {v}
            </T>
          </div>
        ))}
      </div>
    </Card>
  )
}
