import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { BY_ID, GROUPS } from '../data/foods.js'
import { arcPath, SECTORS } from '../lib/layout.js'
import { em } from '../lib/hooks.js'

const GUIDE = [
  ['veg', 210, 'Veg'],
  ['fruit', 120, 'Fruit'],
  ['protein', -45, 'Protein'],
  ['grain', 45, 'Grains'],
]

function Item({ it, pos, scale = 1, onRemove, onLanded, kind }) {
  const fly = useRef(null)
  const from = useRef(it.from)
  const landed = useRef(onLanded)
  const self = useRef(it)
  const [leaving, setLeaving] = useState(false)
  const f = BY_ID[it.food]

  useLayoutEffect(() => {
    const src = from.current
    const el = fly.current
    if (!src || !el) return
    const r = el.getBoundingClientRect()
    const dx = src.x - (r.left + r.width / 2)
    const dy = src.y - (r.top + r.height / 2)
    const k = Math.max(0.4, Math.min(2.2, src.w / Math.max(1, r.width)))
    const lift = Math.min(160, 50 + Math.hypot(dx, dy) * 0.22)
    const a = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${k})`, offset: 0 },
        { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - lift}px) scale(${(k + 1.25) / 2})`, offset: 0.45 },
        { transform: 'translate(0px, 0px) scale(1.04)', offset: 0.8, easing: 'ease-out' },
        { transform: 'translate(0px, 0px) scale(1.12, 0.88)', offset: 0.88 },
        { transform: 'translate(0px, 0px) scale(0.97, 1.03)', offset: 0.95 },
        { transform: 'translate(0px, 0px) scale(1)', offset: 1 },
      ],
      { duration: 640, easing: 'cubic-bezier(.45,.05,.35,1)' },
    )
    a.onfinish = () => landed.current?.(self.current)
  }, [])

  const remove = (e) => {
    e.stopPropagation()
    if (leaving || !onRemove) return
    setLeaving(true)
    const a = fly.current.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(0,-46px) scale(1.25)', opacity: 0 },
      ],
      { duration: 260, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' },
    )
    a.onfinish = () => onRemove(kind, it.id)
  }

  const p = pos || it
  return (
    <div
      className={`pi pi--${f.g}${leaving ? ' is-leaving' : ''}`}
      style={{
        left: `${50 + p.x * 50}%`,
        top: `${50 + p.y * 50}%`,
        width: `${it.s * 100}%`,
        zIndex: Math.round((p.y + 1) * 100),
        '--cx': `${p.x * 260}px`,
        '--cy': `${p.y * 260 + 30}px`,
      }}
      onClick={remove}
    >
      <div className="pi__fly" ref={fly}>
        <div className="pi__body" style={{ transform: `rotate(${it.rot}deg) scale(${scale})` }}>
          <img src={em(f.id)} alt={f.name} draggable="false" />
        </div>
        {f.hot && (
          <i className="steam" aria-hidden="true">
            <b />
            <b />
            <b />
          </i>
        )}
      </div>
      <span className="pi__tip">
        <b>{f.name}</b>
        {f.kcal} kcal · {f.p} g protein
        <em>Click to remove</em>
      </span>
    </div>
  )
}

function DrinkItem({ id, from, onLanded, onRemove }) {
  const fly = useRef(null)
  const src = useRef(from)
  const landed = useRef(onLanded)
  const f = BY_ID[id]
  useLayoutEffect(() => {
    const s = src.current
    const el = fly.current
    if (!s || !el) return
    const r = el.getBoundingClientRect()
    const dx = s.x - (r.left + r.width / 2)
    const dy = s.y - (r.top + r.height / 2)
    const a = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.8)` },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 90}px) scale(1.2)` },
        { transform: 'translate(0,0) scale(1)' },
      ],
      { duration: 600, easing: 'cubic-bezier(.45,.05,.35,1)' },
    )
    a.onfinish = () => landed.current?.({ food: f.id })
  }, [f.id])
  return (
    <button className="drink__item" ref={fly} onClick={onRemove} aria-label={`Remove ${f.name}`}>
      <img src={em(id)} alt="" draggable="false" />
      <span className="pi__tip">
        <b>{f.name}</b>
        {f.kcal} kcal · {f.su} g sugar
        <em>Click to remove</em>
      </span>
    </button>
  )
}

const Table = forwardRef(function Table(
  { plate, view, pie, sectors, ideal, goal, dragGroup, clearing, onRemove, onLanded, plateKey, served },
  ref,
) {
  const xray = view === 'xray'
  return (
    <div className="table" ref={ref}>
      <div className="napkin" aria-hidden="true">
        <img src={em('fork')} alt="" />
      </div>

      <div className={`plate-wrap${served ? ' is-out' : ''}`} key={plateKey}>
        <div className={`plate${clearing ? ' is-clearing' : ''}${xray ? ' is-xray' : ''}`} data-drag={dragGroup || ''}>
          <div className="plate__well" />
          <svg className="plate__guides" viewBox="-1 -1 2 2" aria-hidden="true">
            {Object.entries(SECTORS).map(([g, [a0, a1]]) => (
              <path
                key={g}
                className={`guide guide--${g}${dragGroup === g ? ' is-hot' : ''}`}
                d={arcPath(0, 0, 0.04, 0.76, a0 + 1.2, a1 - 1.2)}
              />
            ))}
            {GUIDE.map(([g, a, label]) => (
              <text
                key={g}
                className={`guide__label${dragGroup === g ? ' is-hot' : ''}${
                  plate.items.some((it) => BY_ID[it.food].g === g) ? ' is-used' : ''
                }`}
                x={Math.cos((a * Math.PI) / 180) * 0.5}
                y={Math.sin((a * Math.PI) / 180) * 0.5}
              >
                {label}
              </text>
            ))}
          </svg>

          <svg className="plate__pie" viewBox="-1 -1 2 2" aria-hidden="true">
            {sectors.map((s) => (
              <path key={s.g} d={arcPath(0, 0, 0, 0.76, s.a0, s.a1)} fill={GROUPS[s.g].color} className="pie" />
            ))}
            {ideal.map((s) => (
              <path key={s.g} d={arcPath(0, 0, 0.865, 0.925, s.a0 + 0.8, s.a1 - 0.8)} fill={GROUPS[s.g].color} className="pie__ideal" />
            ))}
            {sectors.map((s) => {
              const m = (((s.a0 + s.a1) / 2) * Math.PI) / 180
              return (
                <g key={s.g} className="pie__lbl" transform={`translate(${Math.cos(m) * 0.81} ${Math.sin(m) * 0.81})`}>
                  <text y="-0.005">{GROUPS[s.g].short}</text>
                  <text y="0.055" className="pie__pct">
                    {Math.round(s.share * 100)}%
                    {goal.ideal[s.g] != null ? ` / ${Math.round(goal.ideal[s.g] * 100)}` : ''}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="plate__items">
            {plate.items.map((it) => (
              <Item
                key={it.id}
                it={it}
                kind="items"
                pos={xray ? pie[it.id] : null}
                scale={xray && pie[it.id] ? pie[it.id].scale : 1}
                onRemove={onRemove}
                onLanded={onLanded}
              />
            ))}
          </div>
          <div className="plate__gloss" />
        </div>

        <div className={`saucer${dragGroup === 'dairy' ? ' is-hot' : ''}`}>
          {plate.side.length === 0 && <span className="slot__hint">Sides</span>}
          {plate.side.map((it) => (
            <Item key={it.id} it={it} kind="side" onRemove={onRemove} onLanded={onLanded} />
          ))}
        </div>

        <div className={`coaster${dragGroup === 'drink' ? ' is-hot' : ''}`}>
          {!plate.drink && <span className="slot__hint">Drink</span>}
          {plate.drink && (
            <DrinkItem
              key={plate.drink + plate.drinkKey}
              id={plate.drink}
              from={plate.drinkFrom}
              onLanded={onLanded}
              onRemove={() => onRemove('drink')}
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default Table
