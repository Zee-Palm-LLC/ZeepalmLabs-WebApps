import { useEffect, useRef, useState } from 'react'
import { STAGES } from '../lib/data'
import { gsap, ScrollTrigger, scrollToTarget, reducedMotion } from '../lib/scroll'

const Y0 = 370
const LOOPS = [
  { cx: 137, rx: 85, ry: 174, dir: 'up', sub: 'name', nameAt: 'top' },
  { cx: 387.5, rx: 165.5, ry: 274, dir: 'down', sub: 'loop', nameAt: 'bottom' },
  { cx: 696.5, rx: 143.5, ry: 400, dir: 'both', sub: 'loop', nameAt: 'top' },
  { cx: 1015, rx: 175, ry: 287, dir: 'down', sub: 'loop', nameAt: 'bottom' },
  { cx: 1279, rx: 89, ry: 191, dir: 'up', sub: 'name', nameAt: 'top' },
]

const pt = (l, deg) => {
  const a = (deg * Math.PI) / 180
  return [l.cx + l.rx * Math.cos(a), Y0 + l.ry * Math.sin(a)]
}

const arc = (l, from, to, sweep) => {
  const [x1, y1] = pt(l, from)
  const [x2, y2] = pt(l, to)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${l.rx} ${l.ry} 0 0 ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function paths(l) {
  const up = arc(l, 180, 360, 1)
  const down = arc(l, 180, 0, 0)
  if (l.dir === 'up') return { lit: [up], ghost: [down] }
  if (l.dir === 'down') return { lit: [down], ghost: [up] }
  return { lit: [up, arc(l, 180, 118, 0), arc(l, 0, 62, 1)], ghost: [] }
}

const crossings = [...new Set(LOOPS.flatMap((l) => [l.cx - l.rx, l.cx + l.rx]).map((v) => Math.round(v)))]

function Desktop({ active, setHover, onPick }) {
  return (
    <div className="process__frame">
      <div className="process__word" aria-hidden="true">
        Process
      </div>
      <svg className="process__svg" viewBox="0 0 1440 740" aria-hidden="true">
        <defs>
          {LOOPS.map((l, i) => {
            const top = l.dir === 'down' ? Y0 + l.ry : Y0 - l.ry
            return (
              <linearGradient key={i} id={`lg${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={Y0} x2="0" y2={top}>
                <stop offset="0" stopColor="#fff7ee" />
                <stop offset="0.5" stopColor="#ffe0a0" />
                <stop offset="0.85" stopColor="#ffb54e" />
                <stop offset="1" stopColor="#ff8a3d" />
              </linearGradient>
            )
          })}
          <linearGradient id="lgL" gradientUnits="userSpaceOnUse" x1="0" y1="-30" x2="0" y2="770">
            <stop offset="0" stopColor="#ff9a48" />
            <stop offset="0.3" stopColor="#ffe3a8" />
            <stop offset="0.5" stopColor="#fff7ee" />
            <stop offset="0.75" stopColor="#ffdca0" />
            <stop offset="1" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>
        <line className="process__axis" x1="0" y1={Y0} x2="1440" y2={Y0} />
        {LOOPS.map((l, i) => {
          const p = paths(l)
          return (
            <g
              key={i}
              className={`loop ${active === i ? 'is-active' : ''}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(-1)}
              onClick={() => onPick(i)}
              data-cursor="Open"
            >
              {p.ghost.map((d, k) => (
                <path key={`g${k}`} className="loop__ghost" d={d} />
              ))}
              {p.lit.map((d, k) => (
                <path key={`l${k}`} className="loop__lit" d={d} stroke={`url(#${l.dir === 'both' ? 'lgL' : `lg${i}`})`} />
              ))}
              {p.lit.map((d, k) => (
                <path key={`h${k}`} className="loop__hit" d={d} />
              ))}
              {l.dir !== 'both' && (
                <g className="loop__badge" transform={`translate(${l.cx} ${Y0 - l.ry + 42})`}>
                  <circle r="9.5" />
                  <text y="3.6">{i + 1}</text>
                </g>
              )}
            </g>
          )
        })}
        {crossings.map((x) => (
          <circle key={x} className="process__node" cx={x} cy={Y0} r="3.6" />
        ))}
        <circle className="process__spark" r="5" cx="-20" cy="-20" />
      </svg>

      {LOOPS.map((l, i) => {
        const s = STAGES[i]
        const style =
          l.nameAt === 'top'
            ? { left: `${(l.cx + 18) / 16}rem`, top: `${(Y0 - (i === 0 ? 38 : i === 2 ? 21 : 13)) / 16}rem` }
            : { left: `${(l.cx + 18) / 16}rem`, bottom: `${(740 - Y0 - 18) / 16}rem` }
        return (
          <button
            key={s.id}
            className={`pname ${l.nameAt === 'bottom' ? 'pname--up' : ''} ${active === i ? 'is-active' : ''}`}
            style={style}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(-1)}
            onClick={() => onPick(i)}
            data-cursor="Open"
          >
            <span className="pname__v">{s.name}</span>
            {l.sub === 'name' && <small>({s.hint})</small>}
          </button>
        )
      })}
      {LOOPS.map((l, i) =>
        l.sub === 'loop' ? (
          <small
            key={`s${i}`}
            className={`psub ${active === i ? 'is-active' : ''}`}
            style={{ left: `${l.cx / 16}rem`, top: `${(Y0 + (l.dir === 'both' ? 336 : l.ry - 44)) / 16}rem` }}
          >
            ({STAGES[i].hint})
          </small>
        ) : null,
      )}
    </div>
  )
}

const MW = 390
const MX = 195
const MA = 0.62
const MK = 0.41
const MTOP = 74
const MH = Math.round(MTOP * 2 + 1316 * MA)

const mloops = LOOPS.map((l) => {
  const cy = MTOP + (l.cx - 52) * MA
  const v = l.rx * MA
  const h = l.ry * MK
  const top = [MX, cy - v]
  const bot = [MX, cy + v]
  const at = (deg) => {
    const t = (deg * Math.PI) / 180
    return [MX - h * Math.sin(t), cy - v * Math.cos(t)]
  }
  const f = (q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`
  const right = `M${f(top)}A${h} ${v} 0 0 1 ${f(bot)}`
  const left = `M${f(top)}A${h} ${v} 0 0 0 ${f(bot)}`
  let lit
  let ghost = []
  if (l.dir === 'up') {
    lit = [right]
    ghost = [left]
  } else if (l.dir === 'down') {
    lit = [left]
    ghost = [right]
  } else lit = [right, `M${f(top)}A${h} ${v} 0 0 0 ${f(at(62))}`, `M${f(at(118))}A${h} ${v} 0 0 0 ${f(bot)}`]
  const side = l.dir === 'up' ? 'left' : 'right'
  return { cy, v, h, lit, ghost, side, out: l.dir === 'down' ? MX - h : MX + h }
})

const mcross = [...new Set(mloops.flatMap((m) => [m.cy - m.v, m.cy + m.v]).map((v) => Math.round(v)))]

function Mobile({ active, onPick }) {
  return (
    <div className="mproc" style={{ aspectRatio: `${MW} / ${MH}` }}>
      <div className="process__word process__word--v" aria-hidden="true">
        Process
      </div>
      <svg className="mproc__svg" viewBox={`0 0 ${MW} ${MH}`} aria-hidden="true">
        <defs>
          {mloops.map((m, i) => (
            <linearGradient key={i} id={`mg${i}`} gradientUnits="userSpaceOnUse" x1={MX} y1="0" x2={m.out} y2="0">
              <stop offset="0" stopColor="#fff7ee" />
              <stop offset="0.5" stopColor="#ffe0a0" />
              <stop offset="0.85" stopColor="#ffb54e" />
              <stop offset="1" stopColor="#ff8a3d" />
            </linearGradient>
          ))}
          <linearGradient id="mgL" gradientUnits="userSpaceOnUse" x1={MX - mloops[2].h} y1="0" x2={MX + mloops[2].h} y2="0">
            <stop offset="0" stopColor="#ff9a48" />
            <stop offset="0.3" stopColor="#ffe3a8" />
            <stop offset="0.5" stopColor="#fff7ee" />
            <stop offset="0.75" stopColor="#ffdca0" />
            <stop offset="1" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>
        <line className="process__axis" x1={MX} y1="0" x2={MX} y2={MH} />
        {mloops.map((m, i) => (
          <g key={i} className={`loop ${active === i ? 'is-active' : ''}`} onClick={() => onPick(i)}>
            {m.ghost.map((d, k) => (
              <path key={`g${k}`} className="loop__ghost" d={d} />
            ))}
            {m.lit.map((d, k) => (
              <path key={`l${k}`} className="loop__lit" d={d} stroke={`url(#${LOOPS[i].dir === 'both' ? 'mgL' : `mg${i}`})`} />
            ))}
            {m.lit.map((d, k) => (
              <path key={`h${k}`} className="loop__hit" d={d} />
            ))}
          </g>
        ))}
        {mcross.map((y) => (
          <circle key={y} className="process__node" cx={MX} cy={y} r="3.2" />
        ))}
        <circle className="process__spark" r="4.5" cx="-20" cy="-20" />
      </svg>
      {mloops.map((m, i) => {
        const s = STAGES[i]
        return (
          <button
            key={s.id}
            className={`pname pname--h pname--${m.side} ${active === i ? 'is-active' : ''}`}
            style={{ top: `${(m.cy / MH) * 100}%` }}
            onClick={() => onPick(i)}
          >
            <span className="pname__n">0{i + 1}</span>
            <span className="pname__v">{s.name}</span>
            <small>({s.hint})</small>
          </button>
        )
      })}
    </div>
  )
}

export default function Process() {
  const root = useRef(null)
  const [scrollActive, setScrollActive] = useState(0)
  const [hover, setHover] = useState(-1)
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches)
  const active = hover >= 0 ? hover : scrollActive

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)')
    const on = () => setMobile(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const still = reducedMotion()
      const groups = gsap.utils.toArray('.loop')
      const draw = gsap.timeline({
        scrollTrigger: mobile ? { trigger: el, start: 'top 80%', end: 'bottom 85%', scrub: 0.8 } : { trigger: el, start: 'top 88%', end: 'top 8%', scrub: 0.8 },
      })
      groups.forEach((g, i) => {
        const lit = g.querySelectorAll('.loop__lit')
        lit.forEach((p) => {
          const len = p.getTotalLength()
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        })
        draw.to(lit, { strokeDashoffset: 0, duration: 1, ease: 'none' }, i * 0.55)
        const badge = g.querySelector('.loop__badge circle')
        if (badge) draw.fromTo(badge.parentNode, { opacity: 0 }, { opacity: 1, duration: 0.3 }, i * 0.55 + 0.6)
      })
      draw.fromTo('.process__node', { opacity: 0, scale: 0, transformOrigin: 'center' }, { opacity: 1, scale: 1, stagger: 0.25, duration: 0.3 }, 0)
      draw.fromTo('.pname', { opacity: 0, y: mobile ? 0 : 24, x: mobile ? 16 : 0 }, { opacity: 1, y: 0, x: 0, stagger: 0.55, duration: 0.6 }, mobile ? 0.3 : 0.4)
      if (!mobile) draw.fromTo('.psub', { opacity: 0 }, { opacity: 1, stagger: 0.5, duration: 0.6 }, 0.9)
      draw.fromTo('.process__axis', mobile ? { scaleY: 0, transformOrigin: 'center top' } : { scaleX: 0, transformOrigin: 'left center' }, mobile ? { scaleY: 1, duration: 2.6, ease: 'none' } : { scaleX: 1, duration: 2.4, ease: 'none' }, 0)
      gsap.fromTo(
        '.process__word',
        mobile ? { xPercent: -50, yPercent: -54 } : { xPercent: 6 },
        { ...(mobile ? { xPercent: -50, yPercent: -46 } : { xPercent: -6 }), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      ScrollTrigger.create({
        trigger: el,
        start: mobile ? 'top 40%' : 'top 45%',
        end: mobile ? 'bottom 60%' : 'bottom 55%',
        onUpdate: (self) => setScrollActive(Math.min(4, Math.floor(self.progress * 5))),
      })

      if (!still) {
        const spark = el.querySelector('.process__spark')
        let t = 0
        const tick = (time, dt) => {
          const g = el.querySelectorAll('.loop')[activeRef.current]
          const p = g && g.querySelector('.loop__lit')
          if (!p) return
          const len = p.getTotalLength()
          t = (t + dt / 2600) % 1
          const q = p.getPointAtLength(len * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)))
          spark.setAttribute('cx', q.x)
          spark.setAttribute('cy', q.y)
        }
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
      }
    }, el)
    return () => ctx.revert()
  }, [mobile])

  const activeRef = useRef(active)
  activeRef.current = active

  const onPick = (i) => scrollToTarget(`#stage-${STAGES[i].id}`)

  return (
    <section id="process" className="process" ref={root} data-mood="process" data-section="process" aria-labelledby="process-title">
      <h2 id="process-title" className="sr-only">
        Your training journey in five stages
      </h2>
      {mobile ? <Mobile active={active} onPick={onPick} /> : <Desktop active={active} setHover={setHover} onPick={onPick} />}
    </section>
  )
}
