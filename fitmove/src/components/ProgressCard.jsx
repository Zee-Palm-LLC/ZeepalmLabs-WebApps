import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'
import { PROGRESS } from '../data.js'
import { useUi, setUi } from '../store.js'

export const RING = { cx: 937.9, cy: 308.05, w: 11.6, r: [84.6, 58.8, 34.5] }
const TONES = ['blue', 'yellow', 'green']
const TITLES = ['Cardio Training', 'Strength Training', 'Flexibility Training']
const RANGES = [
  ['week', 'This Week'],
  ['month', 'This Month'],
  ['year', 'This Year'],
]

export default function ProgressCard() {
  const range = useUi((s) => s.range)
  const menu = useUi((s) => s.menu)
  const hot = useUi((s) => s.ring)
  const data = PROGRESS[range]
  const arcs = useRef([])
  const total = useRef(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    data.rings.forEach((v, i) => {
      gsap.to(arcs.current[i], { strokeDasharray: `${v / 100} 1`, duration: 1.1, delay: i * 0.08, ease: 'expo.inOut' })
    })
    const proxy = { v: Number(total.current.textContent) || 0 }
    gsap.to(proxy, {
      v: data.total,
      duration: 1.1,
      ease: 'expo.inOut',
      onUpdate: () => {
        total.current.textContent = Math.round(proxy.v)
      },
    })
  }, [range, data])

  const label = RANGES.find((r) => r[0] === range)[1]
  const chipW = { week: 89.5, month: 96.5, year: 86.5 }[range]

  return (
    <Card x={807} y={83.8} w={261.1} h={520.2} r={21.5} className="progress" data-s="progress">
      <T x={823.0} b={122} s={16} w={500} c="var(--ink)" data-s="title">
        Progress
      </T>
      <At
        as="button"
        x={1052.3 - chipW}
        y={99.9}
        w={chipW}
        h={30.6}
        className={`chip chip-green ${menu === 'range' ? 'is-open' : ''}`}
        data-s="chip"
        onClick={() => setUi({ menu: menu === 'range' ? null : 'range' })}
      >
        <span className="chip-label" style={{ left: 12.4, top: 19.8 - 0.85 * 11 }}>
          {label}
        </span>
        <Icon name="down" size={14} className="chip-caret" style={{ left: chipW - 22.3, top: 8.0 }} />
      </At>
      {menu === 'range' ? (
        <div className="pop range-pop" style={{ left: 1052.3 - 807 - 132, top: 52 }}>
          {RANGES.map(([id, l]) => (
            <button key={id} className={`pop-row ${id === range ? 'is-on' : ''}`} onClick={() => setUi({ range: id, menu: null })}>
              <span className="pop-label">{l}</span>
            </button>
          ))}
        </div>
      ) : null}
      <T x={823.2} b={167.5} s={24} w={500} c="var(--ink)" data-s="big">
        <span ref={total} data-count={data.total}>{data.total}</span>%
      </T>
      <T x={822.5} b={185.3} s={11} c="var(--gray)" data-s="sub">
        Goal Completion
      </T>
      <svg className="chart rings" viewBox="807 83.8 261.1 520.2" data-s="rings">
        {RING.r.map((r, i) => (
          <g key={r} className={`ring ring-${TONES[i]} ${hot === i ? 'is-hot' : ''} ${hot != null && hot !== i ? 'is-dim' : ''}`}>
            <circle cx={RING.cx} cy={RING.cy} r={r} className="ring-track" strokeWidth={RING.w} data-s="ring-track" />
            <circle
              ref={(el) => (arcs.current[i] = el)}
              cx={RING.cx}
              cy={RING.cy}
              r={r}
              className="ring-arc"
              strokeWidth={RING.w}
              pathLength="1"
              transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
              style={{ strokeDasharray: `${data.rings[i] / 100} 1` }}
              data-s="ring-arc"
              data-v={data.rings[i]}
            />
          </g>
        ))}
      </svg>
      {TITLES.map((t, i) => {
        const y = 434.1 + i * 55.95
        return (
          <At
            key={t}
            x={815}
            y={y - 14}
            w={245}
            h={44}
            className="legend-row"
            data-s="legend"
            onMouseEnter={() => setUi({ ring: i })}
            onMouseLeave={() => setUi({ ring: null })}
          >
            <span className={`legend-dot dot-${TONES[i]}`} style={{ left: 8, top: 7.85 }} />
            <span className="legend-title" style={{ left: 27.7, top: 19.8 - 0.85 * 14 }}>
              {t}
            </span>
            <span className="legend-pct" style={{ right: 8.1, top: 19.8 - 0.85 * 14 }}>
              {data.rings[i]}%
            </span>
            <span className="legend-sub" style={{ left: 28.0, top: 40.75 - 0.85 * 12 }}>
              {data.subs[i]}
            </span>
          </At>
        )
      })}
    </Card>
  )
}
