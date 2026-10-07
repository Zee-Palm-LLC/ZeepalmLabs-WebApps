import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { byId } from '../data/flavors.js'
import { CanAnchor } from '../three/CanLayer.jsx'
import { Fruit } from '../ui/art.jsx'
import './products.css'

const ROWS = [
  ['apple', 'straw'],
  ['berry', 'lemon'],
  ['choco', 'select'],
]
const SELECT_DOODLES = [
  ['apple', 84, 88, 200, 12],
  ['strawberry', 5, 212, 165, -18],
  ['blueberry', 93, 560, 150, 10],
  ['lemon', 7.6, 725, 160, -8],
]

function Watermark({ f, on }) {
  const id = `wm-${f.id}`
  const ch = [...f.name.toUpperCase()]
  return (
    <svg className="pg-wm" viewBox="0 0 1600 1100" aria-hidden="true">
      <defs>
        <path id={id} d="M 80 1095 A 720 720 0 0 1 1520 1095" />
      </defs>
      <text style={{ fill: f.wm }}>
        <textPath href={`#${id}`} startOffset={on ? '50%' : '42%'} textAnchor="middle" className="pg-wm-path">
          {ch.map((c, k) => (
            <tspan key={k} style={{ transitionDelay: `${on ? 0.12 + k * 0.025 : 0}s` }} className={on ? 'on' : ''}>
              {c}
            </tspan>
          ))}
        </textPath>
      </text>
    </svg>
  )
}

function FlavorCard({ f, on, onEnter, onAdd }) {
  const can = useRef(null)
  const first = useRef(true)
  useEffect(() => {
    const h = can.current
    if (!h) return
    if (first.current) {
      first.current = false
      return
    }
    if (on) {
      gsap.to(h, { rotY: `+=${Math.PI * 2}`, duration: 1.4, ease: 'expo.out', overwrite: 'auto' })
      gsap.fromTo(h, { dy: 0 }, { dy: -14, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 })
    }
  }, [on])
  return (
    <article
      className={`pg-card ${on ? 'on' : ''} ${f.onDark ? 'dark-ink' : ''}`}
      style={{ '--card': f.card, '--acc': f.accent }}
      onMouseEnter={onEnter}
      onClick={onEnter}
      data-clip
    >
      <div className="pg-bg" />
      <Watermark f={f} on={on} />
      {f.doodles.map(([x, y, s, r], k) => (
        <span key={k} className="pg-doodle" style={{ left: `${x}%`, top: `calc(${y} * var(--u))`, width: `calc(${s} * var(--u))`, '--r': `${r}deg`, transitionDelay: on ? `${0.1 + k * 0.08}s` : '0s' }}>
          <Fruit kind={f.fruit} size={s} />
        </span>
      ))}
      <span className="pg-shadow" />
      <CanAnchor flavor={f.id} className="pg-can" init={{ rotZ: 0, rotX: 0.08 }} onReady={(h) => (can.current = h)} />
      <div className="pg-info">
        <h3 className="display">{f.name}</h3>
        <p>{f.blurb}</p>
      </div>
      <button
        className="pg-buy"
        onClick={(e) => {
          e.stopPropagation()
          onAdd(f, e.currentTarget)
        }}
      >
        Shop Now - $5
      </button>
    </article>
  )
}

function SelectCard({ on, onEnter }) {
  return (
    <article className={`pg-card pg-select ${on ? 'on' : ''}`} onMouseEnter={onEnter} onClick={onEnter}>
      {SELECT_DOODLES.map(([kind, x, y, s, r], k) => (
        <span key={kind} className="pg-doodle stay" style={{ left: `${x}%`, top: `calc(${y} * var(--u))`, width: `calc(${s} * var(--u))`, '--r': `${r}deg`, '--d': `${k * 0.7}s` }}>
          <Fruit kind={kind} size={s} />
        </span>
      ))}
      <div className="pg-tags display">
        <span className="t1">Select</span>
        <span className="t2">Your Favorite</span>
        <span className="t3">Flavor</span>
      </div>
      <a className="pg-all" href="#flavours">
        Shop All
      </a>
    </article>
  )
}

export default function Products({ onAdd }) {
  const [hot, setHot] = useState([null, null, null])
  const root = useRef(null)
  const set = (r, v) => setHot((h) => h.map((x, k) => (k === r ? v : x)))

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.pg-row').forEach((row) => {
        gsap.fromTo(
          row.querySelectorAll('.pg-info, .pg-buy, .pg-tags span, .pg-all'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 75%' } },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="products" id="flavours" ref={root} aria-label="Flavours">
      {ROWS.map((ids, r) => (
        <div className="pg-row" key={r} onMouseLeave={() => set(r, null)}>
          {ids.map((id, c) =>
            id === 'select' ? (
              <SelectCard key={id} on={hot[r] === c} onEnter={() => set(r, c)} />
            ) : (
              <FlavorCard key={id} f={byId[id]} on={hot[r] === c} onEnter={() => set(r, c)} onAdd={onAdd} />
            ),
          )}
        </div>
      ))}
    </section>
  )
}
