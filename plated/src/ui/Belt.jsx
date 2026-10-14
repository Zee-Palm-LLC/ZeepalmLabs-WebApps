import { useMemo } from 'react'
import { FOODS, GROUPS, TABS } from '../data/foods.js'
import { em } from '../lib/hooks.js'

export default function Belt({ tab, setTab, onPress, paused }) {
  const list = useMemo(() => (tab === 'all' ? FOODS : FOODS.filter((f) => f.g === tab)), [tab])
  const loop = useMemo(() => {
    const min = 22
    const reps = Math.max(1, Math.ceil(min / list.length))
    const one = Array.from({ length: reps }, () => list).flat()
    return [...one, ...one]
  }, [list])
  const dur = (loop.length / 2) * 2.6

  return (
    <section className={`belt${paused ? ' is-paused' : ''}`} aria-label="Food conveyor belt">
      <nav className="belt__tabs" aria-label="Food groups">
        {TABS.map((t) => (
          <button key={t} className={`tab${tab === t ? ' is-on' : ''}`} onClick={() => setTab(t)}>
            {t !== 'all' && <i style={{ background: GROUPS[t].color }} />}
            {t === 'all' ? 'Everything' : GROUPS[t].short}
          </button>
        ))}
      </nav>
      <div className="belt__rail">
        <div className="belt__surface" />
        <div className="belt__track" key={tab} style={{ animationDuration: `${dur}s` }}>
          {loop.map((f, i) => (
            <button
              key={i}
              className="dish"
              onPointerDown={(e) => onPress(f.id, e)}
              onClick={(e) => e.preventDefault()}
              aria-label={`Add ${f.name}`}
              tabIndex={i < loop.length / 2 ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPress(f.id, e, true)
                }
              }}
            >
              <span className="dish__plate">
                <img src={em(f.id)} alt="" draggable="false" />
              </span>
              <span className="dish__name">{f.name}</span>
              <span className="dish__kcal">{f.kcal} kcal</span>
            </button>
          ))}
        </div>
        <div className="belt__roller belt__roller--l" />
        <div className="belt__roller belt__roller--r" />
      </div>
    </section>
  )
}
