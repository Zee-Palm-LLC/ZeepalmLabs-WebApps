import { useEffect, useRef, useState } from 'react'
import GpuCity from './city/GpuCity.js'
import { FOODS, CARGO } from './city/sim.js'
import { DISTRICTS, DIST } from './city/body.js'

const rgb = (c) => `rgb(${c.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`
const pct = (v) => `${Math.round(v * 100)}%`

const MODES = [
  { id: 'walk', emoji: '🚶', name: 'Walk', note: '30 min' },
  { id: 'workout', emoji: '🏋️', name: 'Workout', note: '45 min' },
  { id: 'sleep', emoji: '😴', name: 'Sleep', note: '8 h' },
]

const SHORT = { brain: 'Brain HQ', heart: 'Heart Station', lungs: 'Lungs', stomach: 'Stomach Market', liver: 'Liver', pancreas: 'Insulin Dept', kidneys: 'Kidneys', gut: 'Gut Canal', fat: 'Fat Silos', armL: 'Left Arm', armR: 'Right Arm', legL: 'Left Leg', legR: 'Right Leg' }

const LEGEND = ['oxygen', 'glucose', 'protein', 'fat', 'water', 'insulin', 'repair', 'clean']

function clock(min) {
  const h = Math.floor(min / 60) % 24
  const m = Math.floor(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function Toggle({ label, on, set, hint }) {
  return (
    <label className="tog">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      <i />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

function Gauge({ label, value, color, text, warn }) {
  const r = 19
  const c = 2 * Math.PI * r
  return (
    <div className={`gauge${warn ? ' is-warn' : ''}`}>
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} className="gauge__bg" />
        <circle cx="24" cy="24" r={r} className="gauge__fg" style={{ stroke: color, strokeDasharray: `${c * Math.max(0.02, Math.min(1, value))} ${c}` }} />
      </svg>
      <b>{text}</b>
      <span>{label}</span>
    </div>
  )
}

function vitals(s) {
  const mg = Math.round(60 + s.glucose * 140)
  return [
    { id: 'glucose', label: 'Blood sugar', value: s.glucose, color: '#f2b51e', text: mg, warn: s.glucose > 0.66 || s.glucose < 0.24 },
    { id: 'hr', label: 'Heart rate', value: (s.hr - 40) / 140, color: '#e5404a', text: Math.round(s.hr), warn: false },
    { id: 'hydration', label: 'Hydration', value: s.hydration, color: '#4cb3f0', text: pct(s.hydration), warn: s.hydration < 0.35 },
    { id: 'glycogen', label: 'Glycogen', value: s.glycogen, color: '#a8643a', text: pct(s.glycogen), warn: false },
    { id: 'focus', label: 'Focus', value: s.focus, color: '#9b7bea', text: pct(s.focus), warn: s.focus < 0.4 },
    { id: 'muscle', label: 'Muscle', value: s.muscle, color: '#e2554e', text: pct(s.muscle), warn: false },
    { id: 'fat', label: 'Fat stores', value: s.fat, color: '#f0d25a', text: pct(s.fat), warn: s.fat > 0.7 },
    { id: 'sleep', label: 'Rested', value: 1 - s.sleepDebt, color: '#5f7bd8', text: pct(1 - s.sleepDebt), warn: s.sleepDebt > 0.7 },
  ]
}

export default function App() {
  const canvasRef = useRef(null)
  const labelsRef = useRef(null)
  const engine = useRef(null)
  const [status, setStatus] = useState('loading')
  const [s, setS] = useState(null)
  const [news, setNews] = useState([])
  const [district, setDistrict] = useState(null)
  const [hover, setHover] = useState(null)
  const [labels, setLabels] = useState(true)
  const [tilt, setTilt] = useState(true)
  const [paused, setPaused] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [hinted, setHinted] = useState(false)
  const [count, setCount] = useState(0)
  const [pop, setPop] = useState(null)
  const [far, setFar] = useState(true)

  useEffect(() => {
    let alive = true
    let eng = null
    let off = null
    GpuCity.device()
      .then(
        (device) =>
          new Promise((res) => {
            requestAnimationFrame(() => requestAnimationFrame(() => res(device)))
          }),
      )
      .then((device) => {
        if (!alive) {
          device.destroy()
          return
        }
        eng = new GpuCity(canvasRef.current, device)
        engine.current = eng
        window.__city = eng
        setNews(eng.sim.news)
        off = eng.on((type, v) => {
          if (type === 'frame') {
            setS({ ...v })
            setCount(eng.sim.onRoad())
            setFar(eng.cam.dist * eng.fitK > 32)
            const box = labelsRef.current
            if (!box) return
            for (const l of eng.labels()) {
              const el = box.querySelector(`[data-id="${l.id}"]`)
              if (!el) continue
              const vis = l.z < 1 && l.x > -40 && l.x < eng.cssW + 40
              el.style.opacity = vis ? '' : '0'
              el.style.transform = `translate(${l.x}px, ${l.y}px)`
            }
          } else if (type === 'news') setNews([...v])
          else if (type === 'district') setDistrict(v)
          else if (type === 'hover') setHover(v)
          else if (type === 'interact') setHinted(true)
          else if (type === 'mode') setHinted(true)
          else if (type === 'ate') {
            setHinted(true)
            const f = FOODS.find((q) => q.id === v)
            setPop({ k: Date.now(), emoji: f.emoji })
          }
        })
        device.lost.then((info) => {
          if (alive && info.reason !== 'destroyed') setStatus('nogpu')
        })
        setStatus('ready')
      })
      .catch(() => alive && setStatus('nogpu'))
    return () => {
      alive = false
      if (off) off()
      if (eng) eng.dispose()
      engine.current = null
    }
  }, [])

  useEffect(() => {
    if (status !== 'ready') return
    const t = setTimeout(() => setHinted(true), 9000)
    return () => clearTimeout(t)
  }, [status])

  useEffect(() => {
    const e = engine.current
    if (!e) return
    e.tilt = tilt
    e.paused = paused
  }, [tilt, paused, status])

  useEffect(() => {
    const apply = () => {
      const e = engine.current
      if (!e) return
      const desk = window.innerWidth > 760
      e.setInset(desk && !collapsed ? Math.min(390, window.innerWidth * 0.3) : 0)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [collapsed, status])

  useEffect(() => {
    const k = (e) => {
      if (e.target.closest('input')) return
      const eng = engine.current
      if (!eng) return
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 'r' || e.key === 'R') eng.resetView()
      else if (e.key === 'l' || e.key === 'L') setLabels((v) => !v)
      else if (e.key === 't' || e.key === 'T') setTilt((v) => !v)
      else if (e.key === 'w' || e.key === 'W') eng.sim.drink()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const sim = () => engine.current?.sim
  const dist = district ? DIST[district] : null
  const mode = s?.mode || 'rest'

  const panel = (
    <>
      <section className="sec">
        <div className="clock">
          <span className="clock__time">{s ? clock(s.minute) : '07:30'}</span>
          <span className="clock__day">Day {s?.day || 1}</span>
          <span className={`clock__mode clock__mode--${mode}`}>{mode === 'rest' ? 'Resting' : mode === 'walk' ? 'Walking' : mode === 'workout' ? 'Working out' : 'Asleep'}</span>
        </div>
        <div className="gauges">{s && vitals(s).map((g) => <Gauge key={g.id} {...g} />)}</div>
      </section>

      <section className="sec">
        <h3>Feed the city</h3>
        <div className="foods">
          {FOODS.map((f) => (
            <button key={f.id} className={`food${f.speed > 1.2 ? ' food--fast' : ''}`} onClick={() => sim()?.eat(f.id)} title={`${f.carb} g carbs · ${f.prot} g protein · ${f.fat} g fat · ${f.fibre} g fibre`}>
              <span className="food__em">{f.emoji}</span>
              <span className="food__name">{f.name}</span>
            </button>
          ))}
        </div>
        <button className="btn btn--water" onClick={() => sim()?.drink()}>
          💧 Drink a glass of water
        </button>
      </section>

      <section className="sec">
        <h3>Live your day</h3>
        <div className="modes">
          {MODES.map((m) => (
            <button key={m.id} className={`mode${mode === m.id ? ' is-on' : ''}`} onClick={() => sim()?.setMode(m.id)}>
              <span className="mode__em">{m.emoji}</span>
              <b>{mode === m.id ? 'Stop' : m.name}</b>
              <small>{m.note}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="sec">
        <h3>City news</h3>
        <ul className="news">
          {news.slice(0, 4).map((n) => (
            <li key={n.t}>
              <span>{n.icon}</span>
              {n.text.replace(/^\p{Extended_Pictographic}️?\s*/u, '')}
            </li>
          ))}
        </ul>
      </section>

      <section className="sec">
        <h3>Districts</h3>
        <div className="roster">
          {DISTRICTS.map((d) => (
            <button key={d.id} className={`who${district === d.id ? ' is-on' : ''}`} onClick={() => engine.current?.focus(d.id)}>
              <i style={{ background: rgb(d.color) }} />
              {d.emoji} {SHORT[d.id]}
            </button>
          ))}
        </div>
        {dist && (
          <div className="card" key={dist.id}>
            <p className="card__kind">District</p>
            <h4>
              {dist.emoji} {dist.name}
            </h4>
            <p className="card__desc">{dist.role}</p>
            <p className="card__tip">
              <b>Health tip</b>
              {dist.tip}
            </p>
            <div className="card__btns">
              <button className="btn" onClick={() => engine.current?.resetView()}>
                Back to whole city
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="sec">
        <h3>Traffic</h3>
        <div className="legend">
          {LEGEND.map((k) => (
            <span key={k}>
              <i className={`lg lg--${CARGO[k].kind}`} style={{ background: rgb(CARGO[k].color) }} />
              {CARGO[k].name}
            </span>
          ))}
        </div>
        <p className="muted">
          <b>{count}</b> vehicles on the highways. Red lanes carry deliveries out from the heart, blue lanes bring them home.
        </p>
      </section>

      <section className="sec">
        <h3>View</h3>
        <Toggle label="District labels" on={labels} set={setLabels} hint="L" />
        <Toggle label="Tilt-shift lens" on={tilt} set={setTilt} hint="Miniature look · T" />
        <Toggle label="Pause" on={paused} set={setPaused} hint="Space" />
      </section>

      <section className="sec sec--btns">
        <div className="row">
          <button
            className="btn"
            onClick={() => {
              engine.current?.sim.reset()
              setNews([...engine.current.sim.news])
            }}
          >
            New day
          </button>
          <button className="btn" onClick={() => engine.current?.resetView()}>
            Reset view
          </button>
        </div>
        <p className="fine">A playful model of how your body handles food, water, movement and sleep. For fun and learning, not medical advice.</p>
      </section>
    </>
  )

  return (
    <div className={`app${s && s.night > 0.5 ? ' is-night' : ''}`}>
      <main className="main">
        <div className="view">
          <canvas ref={canvasRef} className="cv" />
          <div className={`lbls${labels ? '' : ' is-off'}${far ? ' is-far' : ''}`} ref={labelsRef}>
            {DISTRICTS.map((d) => (
              <button key={d.id} data-id={d.id} className={`lbl${district === d.id ? ' is-on' : ''}${hover === d.id ? ' is-hover' : ''}`} onClick={() => engine.current?.focus(d.id)}>
                <span>{d.emoji}</span>
                <em>{SHORT[d.id]}</em>
              </button>
            ))}
          </div>
          <div className="brand">
            <h1>Body City</h1>
            <p>Your body, as a miniature city that runs on what you eat.</p>
          </div>
          <div className={`gpu gpu--${status}`}>
            <i />
            {status === 'ready' ? 'WebGPU' : status === 'loading' ? 'Starting WebGPU…' : 'WebGPU unavailable'}
          </div>
          {status === 'loading' && (
            <div className="load">
              <span className="load__dot" />
              <p>Paving the arteries, lighting the heart station, waking the brain…</p>
            </div>
          )}
          {status === 'nogpu' && (
            <div className="nogpu">
              <h2>Body City needs WebGPU.</h2>
              <p>Open it in a recent Chrome, Edge or Safari over a secure (https) connection to watch your miniature body run.</p>
            </div>
          )}
          {pop && (
            <div className="pop" key={pop.k}>
              {pop.emoji}
            </div>
          )}
          <div className={`hint${hinted ? ' is-small' : ''}`}>
            <p>Feed it. Move it. Put it to bed. Watch the traffic change.</p>
            <ul>
              <li>
                <b>Tap</b> a district to visit it
              </li>
              <li>
                <b>Try</b> a soda, then watch the aorta jam
              </li>
              <li>
                <b>Drag</b> to orbit · <b>scroll</b> or pinch to zoom
              </li>
            </ul>
          </div>
          <button className="pill" onClick={() => setDrawer(true)}>
            {s ? `${clock(s.minute)} · ${Math.round(s.hr)} bpm` : 'Body City'} · Controls ▴
          </button>
        </div>
        {collapsed && (
          <button className="reopen" onClick={() => setCollapsed(false)}>
            ❤️ {s ? Math.round(s.hr) : 66} bpm · Controls
          </button>
        )}
        <aside className={`panel${drawer ? ' is-open' : ''}${collapsed ? ' is-hidden' : ''}`}>
          <div className="panel__head">
            <h2>Control room</h2>
            <button className="panel__hide" onClick={() => setCollapsed(true)} aria-label="Hide panel">
              Hide →
            </button>
            <button className="panel__close" onClick={() => setDrawer(false)} aria-label="Close">
              ×
            </button>
          </div>
          <div className="panel__body">{panel}</div>
        </aside>
      </main>
    </div>
  )
}
