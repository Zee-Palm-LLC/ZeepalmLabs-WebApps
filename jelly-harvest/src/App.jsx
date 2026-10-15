import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GpuFarm from './farm/GpuFarm.js'
import { PALETTES, ITEMS, herdConfig } from './farm/farmdata.js'
import { setSound, sfx } from './lib/audio.js'
import Basket from './ui/Basket.jsx'

const ROSTER = herdConfig({ cat: () => 0, catAnchor: () => ({ x: 0, y: 0, z: 0 }) }).map((c, i) => ({ i, name: c.name, species: c.species, gives: c.gives, desc: c.desc, color: c.variant.color || c.variant.skin || c.variant.wool }))

const SPECIES = { cow: 'Jelly cow', sheep: 'Jelly sheep', hen: 'Jelly hen', chick: 'Jelly chick', pig: 'Gummy pig', cat: 'Farm cat' }
const NOGIVE = { chick: '♥ cheep!', cat: 'purrr…' }

const rgb = (c) => `rgb(${c.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`

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

function Slider({ label, value, set, left, right }) {
  return (
    <label className="sl">
      <span className="sl__top">
        <span>{label}</span>
        <b>{Math.round(value * 100)}</b>
      </span>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => set(+e.target.value)} />
      <span className="sl__ends">
        <span>{left}</span>
        <span>{right}</span>
      </span>
    </label>
  )
}

export default function App() {
  const canvasRef = useRef(null)
  const viewRef = useRef(null)
  const tagRef = useRef(null)
  const basketRef = useRef(null)
  const engine = useRef(null)
  const [status, setStatus] = useState('loading')
  const [palette, setPalette] = useState(0)
  const [selected, setSelected] = useState(-1)
  const [basket, setBasket] = useState({})
  const [firm, setFirm] = useState(0.45)
  const [wobble, setWobble] = useState(0.55)
  const [glow, setGlow] = useState(true)
  const [sound, setSoundOn] = useState(false)
  const [slow, setSlow] = useState(false)
  const [mesh, setMesh] = useState(false)
  const [paused, setPaused] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [toasts, setToasts] = useState([])
  const [hinted, setHinted] = useState(false)
  const selRef = useRef(-1)
  const tid = useRef(0)

  const addHarvest = useCallback((ev) => {
    const id = ++tid.current
    if (ev.item) {
      setBasket((b) => ({ ...b, [ev.item]: (b[ev.item] || 0) + 1 }))
      sfx('harvest')
    }
    const r = viewRef.current?.getBoundingClientRect()
    const toast = {
      id,
      x: (ev.x ?? r?.width / 2) + (r?.left || 0),
      y: (ev.y ?? r?.height / 2) + (r?.top || 0),
      text: ev.item ? `+1 ${ITEMS[ev.item].name}` : NOGIVE[ev.species] || '♥',
      emoji: ev.item ? ITEMS[ev.item].emoji : '',
      from: ev.from,
      item: ev.item,
    }
    setToasts((t) => [...t.slice(-5), toast])
    setTimeout(() => setToasts((t) => t.filter((q) => q.id !== id)), 1500)
  }, [])

  useEffect(() => {
    let alive = true
    let eng = null
    let off = null
    GpuFarm.device()
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
        eng = new GpuFarm(canvasRef.current, device)
        engine.current = eng
        window.__farm = eng
        off = eng.on((type, v) => {
          if (type === 'select') {
            selRef.current = v
            setSelected(v)
          } else if (type === 'harvest') addHarvest(v)
          else if (type === 'sfx') sfx(v)
          else if (type === 'interact') setHinted(true)
          else if (type === 'palette') setPalette(v)
          else if (type === 'frame') {
            const el = tagRef.current
            const i = selRef.current
            if (!el) return
            const s = i >= 0 ? eng.animalScreen(i) : null
            if (s && s.z < 1) {
              el.style.opacity = '1'
              el.style.transform = `translate(${s.x}px, ${s.y}px)`
            } else el.style.opacity = '0'
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
  }, [addHarvest])

  useEffect(() => {
    const e = engine.current
    if (!e) return
    e.firmness = firm
    e.wobble = wobble
    e.glow = glow
    e.slow = slow
    e.showMesh = mesh
    e.paused = paused
  }, [firm, wobble, glow, slow, mesh, paused, status])

  useEffect(() => {
    engine.current?.setPalette(palette)
  }, [palette, status])

  useEffect(() => {
    const apply = () => {
      const e = engine.current
      if (!e) return
      const desk = window.innerWidth > 760
      e.setInset(desk && !collapsed ? Math.min(380, window.innerWidth * 0.3) : 0)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [collapsed, status])

  useEffect(() => {
    setSound(sound)
  }, [sound])

  useEffect(() => {
    const k = (e) => {
      if (e.target.closest('input')) return
      const eng = engine.current
      if (!eng) return
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 'n' || e.key === 'N') eng.nudge()
      else if (e.key === 'r' || e.key === 'R') eng.resetView()
      else if (e.key === 'm' || e.key === 'M') setMesh((m) => !m)
      else if (['1', '2', '3'].includes(e.key)) setPalette(+e.key - 1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const sel = selected >= 0 ? ROSTER[selected] : null
  const gives = sel?.gives ? ITEMS[sel.gives] : null
  const groups = useMemo(() => {
    const g = []
    for (const r of ROSTER) {
      const last = g[g.length - 1]
      if (last && last.species === r.species) last.items.push(r)
      else g.push({ species: r.species, items: [r] })
    }
    return g
  }, [])

  const panel = (
    <>
      <section className="sec">
        <h3>Light</h3>
        <div className="pals">
          {PALETTES.map((p, i) => (
            <button key={p.id} className={`pal${palette === i ? ' is-on' : ''}`} onClick={() => setPalette(i)}>
              <span className="pal__sw">
                {p.swatch.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
        <p className="muted">{PALETTES[palette].blurb}</p>
      </section>

      <section className="sec">
        <h3>The animals</h3>
        <div className="roster">
          {groups.map((g) => (
            <div key={g.species + g.items[0].i} className="roster__row">
              {g.items.map((r) => (
                <button key={r.i} className={`who${selected === r.i ? ' is-on' : ''}`} onClick={() => engine.current?.focus(r.i)} title={r.name}>
                  <i style={{ background: rgb(r.color) }} />
                  {r.name}
                </button>
              ))}
            </div>
          ))}
        </div>
        {sel && (
          <div className="card" key={sel.i}>
            <p className="card__kind">{SPECIES[sel.species]}</p>
            <h4>{sel.name}</h4>
            <p className="card__desc">{sel.desc}</p>
            {gives ? (
              <div className="gives">
                <span className="gives__em">{gives.emoji}</span>
                <span>
                  <b>Gives {gives.name.toLowerCase()}</b>
                  <small>
                    {gives.protein} g protein
                    {gives.ca ? ` · ${gives.ca}% calcium` : ''}
                    {gives.vd ? ` · ${gives.vd}% vit D` : ''}
                    {gives.fibre ? ` · ${gives.fibre} g fibre` : ''}
                  </small>
                  <em>{gives.note}</em>
                </span>
              </div>
            ) : (
              <p className="muted">No harvest, just good vibes.</p>
            )}
            <div className="card__btns">
              {gives && (
                <button className="btn btn--warm" onClick={() => engine.current?.collect(sel.i)}>
                  Collect {gives.name.toLowerCase()}
                </button>
              )}
              <button className="btn" onClick={() => engine.current?.nudge()}>
                Squish
              </button>
            </div>
          </div>
        )}
      </section>

      <Basket basket={basket} onClear={() => setBasket({})} refEl={basketRef} />

      <section className="sec">
        <h3>Feel</h3>
        <Slider label="Firmness" value={firm} set={setFirm} left="squishy" right="firm" />
        <Slider label="Wobble" value={wobble} set={setWobble} left="calm" right="jiggly" />
      </section>

      <section className="sec">
        <h3>Farm</h3>
        <Toggle label="Lantern glow" on={glow} set={setGlow} hint="Windows and lanterns" />
        <Toggle label="Farm sounds" on={sound} set={setSoundOn} hint="Birdsong, breeze, moos" />
        <Toggle label="¼ speed" on={slow} set={setSlow} />
        <Toggle label="Show physics mesh" on={mesh} set={setMesh} />
        <Toggle label="Pause" on={paused} set={setPaused} hint="Space" />
      </section>

      <section className="sec sec--btns">
        <button className="btn btn--warm" onClick={() => engine.current?.nudge()}>
          Give it a nudge
        </button>
        <div className="row">
          <button
            className="btn"
            onClick={() => {
              engine.current?.resetFarm()
              setSelected(-1)
              selRef.current = -1
            }}
          >
            Reset farm
          </button>
          <button className="btn" onClick={() => engine.current?.resetView()}>
            Reset view
          </button>
        </div>
        <p className="fine">Nutrition values are typical single servings, for fun and learning, not medical advice.</p>
      </section>
    </>
  )

  const count = Object.values(basket).reduce((a, b) => a + b, 0)

  return (
    <div className="app">
      <main className="main">
        <div className="view" ref={viewRef}>
          <canvas ref={canvasRef} className="cv" />
          <div className={`gpu gpu--${status}`}>
            <i />
            {status === 'ready' ? 'WebGPU' : status === 'loading' ? 'Starting WebGPU…' : 'WebGPU unavailable'}
          </div>
          {status === 'loading' && (
            <div className="load">
              <span className="load__moon" />
              <p>Raising the barn, ripening the strawberries, waking the jelly…</p>
            </div>
          )}
          {status === 'nogpu' && (
            <div className="nogpu">
              <h2>This farm needs WebGPU.</h2>
              <p>Open it in a recent Chrome, Edge or Safari over a secure (https) connection to meet the jelly animals and fill your basket.</p>
            </div>
          )}
          <div className="tag" ref={tagRef}>
            {sel && (
              <span>
                <b>{sel.name}</b>
                {sel.gives ? ` · ${ITEMS[sel.gives].emoji}` : ''}
              </span>
            )}
          </div>
          <div className={`hint${hinted ? ' is-small' : ''}`}>
            <p>Grab a gummy. Give it a squish. Fill your basket with real food.</p>
            <ul>
              <li>
                <b>Drag</b> an animal to stretch it
              </li>
              <li>
                <b>Tap</b> pumpkins, strawberries, apples, corn
              </li>
              <li>
                <b>Drag</b> empty space to orbit · <b>scroll</b> or pinch to zoom
              </li>
            </ul>
          </div>
          <button className="pill" onClick={() => setDrawer(true)}>
            🧺 <b>{count}</b> harvested · The farm ▴
          </button>
        </div>
        {collapsed && (
          <button className="reopen" onClick={() => setCollapsed(false)}>
            🧺 <b>{count}</b> · The farm
          </button>
        )}
        <aside className={`panel${drawer ? ' is-open' : ''}${collapsed ? ' is-hidden' : ''}`}>
          <div className="panel__head">
            <h2>The farm</h2>
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

      {toasts.map((t) => (
        <Toast key={t.id} t={t} target={basketRef} />
      ))}
    </div>
  )
}

function Toast({ t, target }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const b = target.current?.getBoundingClientRect()
    const visible = b && b.width > 0 && b.top < window.innerHeight && b.bottom > 0
    const tx = t.item && visible ? b.left + 30 - t.x : 0
    const ty = t.item && visible ? b.top + 20 - t.y : -60
    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
        { transform: 'translate(-50%, -150%) scale(1.08)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%, -150%) scale(1)', opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.5)`, opacity: 0 },
      ],
      { duration: 1400, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' },
    )
  }, [t, target])
  return (
    <div className={`toast${t.item ? '' : ' toast--soft'}`} ref={ref} style={{ left: t.x, top: t.y }}>
      {t.emoji && <span className="toast__em">{t.emoji}</span>}
      {t.text}
    </div>
  )
}
