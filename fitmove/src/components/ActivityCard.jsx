import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At, SqBg } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { WEEKS } from '../data.js'
import { useUi, setUi } from '../store.js'

export const GRID_Y = [389.25, 431.1, 472.9, 514.7, 556.5]
const LABELS = ['100%', '75%', '50%', '25%', '0%']
export const BAR_X = 312.1
export const BAR_W = 31
export const BAR_STEP = 52.55
export const BASE = 556.5
const FULL = BASE - GRID_Y[0]

export function barTop(p) {
  return BASE - (FULL * p) / 100
}

export function barPath(x, top) {
  const r = BAR_W / 2
  const h = BASE - top
  if (h <= 0.01) return `M${x} ${BASE}h${BAR_W}v0h${-BAR_W}Z`
  if (h < r) {
    const k = h / r
    return `M${x} ${BASE}V${BASE - h * 0.4}C${x} ${top} ${x + r * (1 - k * 0.2)} ${top} ${x + r} ${top}C${x + r + r * k * 0.8} ${top} ${x + BAR_W} ${top} ${x + BAR_W} ${BASE - h * 0.4}V${BASE}Z`
  }
  return `M${x} ${BASE}V${top + r}A${r} ${r} 0 0 1 ${x + BAR_W} ${top + r}V${BASE}Z`
}

export function tipOffset(i, h) {
  const cx = BAR_X + i * BAR_STEP + BAR_W / 2
  const top = barTop(h)
  let x = cx + 0.3
  const y = Math.max(top - 53.3, 333)
  let ty = y
  if (x + 142.7 > 775.7) x = cx - 0.3 - 142.7
  if (x + 142.7 > 618 && ty < 371) ty = 371
  return { x: x - 252.9, y: ty - 320.8 }
}

export default function ActivityCard() {
  const weekIndex = useUi((s) => s.week)
  const hover = useUi((s) => s.bar)
  const menu = useUi((s) => s.menu)
  const week = WEEKS[weekIndex]
  const active = hover ?? week.focus
  const day = week.days[active]
  const tipRef = useRef(null)
  const bars = useRef([])
  const heights = useRef(week.days.map((d) => d.h))
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    week.days.forEach((d, i) => {
      const el = bars.current[i]
      if (!el) return
      const proxy = { h: heights.current[i] }
      gsap.to(proxy, {
        h: d.h,
        duration: 0.95,
        delay: i * 0.04,
        ease: 'expo.out',
        onUpdate: () => {
          heights.current[i] = proxy.h
          el.setAttribute('d', barPath(BAR_X + i * BAR_STEP, barTop(proxy.h)))
        },
      })
    })
  }, [weekIndex, week])

  useLayoutEffect(() => {
    if (!tipRef.current || first.current) return
    const o = tipOffset(active, week.days[active].h)
    gsap.to(tipRef.current, { x: o.x, y: o.y, duration: 0.6, ease: 'expo.out', overwrite: 'auto' })
  }, [active, week])

  const o0 = tipOffset(week.focus, week.days[week.focus].h)

  return (
    <Card x={252.9} y={320.8} w={538.2} h={283.2} className="activity" data-s="activity">
      <T x={269} b={358.8} s={16} w={500} c="var(--ink)" data-s="title">
        Activity
      </T>
      <At
        as="button"
        x={622}
        y={336.9}
        w={152.8}
        h={29.8}
        className={`chip chip-gray ${menu === 'week' ? 'is-open' : ''}`}
        data-s="chip"
        onClick={() => setUi({ menu: menu === 'week' ? null : 'week' })}
      >
        <Glyph n="date" className="chip-lead" ox={622} oy={336.9} />
        <span className="chip-label" style={{ left: 30.6, top: 19.7 - 0.85 * 11 }}>
          {week.label}
        </span>
        <Icon name="down" size={14} className="chip-caret" style={{ left: 128.9, top: 7.9 }} />
      </At>
      {menu === 'week' ? (
        <div className="pop week-pop" style={{ left: 622 - 252.9 + 153.3 - 196, top: 52 }}>
          {WEEKS.map((w, i) => (
            <button key={w.id} className={`pop-row ${i === weekIndex ? 'is-on' : ''}`} onClick={() => setUi({ week: i, menu: null, bar: null })}>
              <Icon name="date" size={14} />
              <span className="pop-label">{w.label}</span>
            </button>
          ))}
        </div>
      ) : null}
      <svg className={`chart bars ${hover != null ? 'is-hover' : ''}`} viewBox="252.9 320.8 538.2 283.2" onMouseLeave={() => setUi({ bar: null })}>
        {GRID_Y.map((y, i) => (
          <g key={y}>
            <line x1={301.7} x2={775.7} y1={y} y2={y} className="grid" data-s="grid" />
            <text x={268.9} y={y + 3.95} className="axis" data-s="axis">
              {LABELS[i]}
            </text>
          </g>
        ))}
        {week.days.map((d, i) => {
          const x = BAR_X + i * BAR_STEP
          const on = i === active
          return (
            <g key={i} className={`bar-col ${on ? 'is-on' : ''}`} onMouseEnter={() => setUi({ bar: i })}>
              <rect x={x - 10} y={370} width={BAR_W + 20} height={224} className="hit" />
              <path ref={(el) => (bars.current[i] = el)} d={barPath(x, barTop(heights.current[i] ?? d.h))} className="bar" data-s="bar" data-h={d.h} data-x={x} />
              <text x={x + BAR_W / 2 + 0.6} y={581.2} className="axis axis-x" data-s="axis-x">
                {d.d}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="bar-tip" ref={tipRef} data-s="bar-tip" style={{ transform: `translate(${o0.x}px, ${o0.y}px)` }}>
        <SqBg w={142.7} h={77.7} r={11} sm={0.8} />
        <span className="tip-day">{day.name}</span>
        <span className="tip-k" style={{ top: 34.6 }}>Progress</span>
        <span className="tip-v" style={{ top: 34.6 }}>{day.p}%</span>
        <span className="tip-k" style={{ top: 52.6 }}>Calories</span>
        <span className="tip-v" style={{ top: 52.6 }}>{day.kcal} kcal</span>
      </div>
    </Card>
  )
}
