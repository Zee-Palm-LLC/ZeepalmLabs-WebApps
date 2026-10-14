import { useEffect, useRef, useState } from 'react'
import JellyScene from './jelly/JellyScene.js'
import { VARIETIES } from './lib/varieties.js'

function SliceIcon({ v }) {
  const segs = 5
  return (
    <svg viewBox="-34 -34 68 36" aria-hidden="true">
      <path d="M-32 0A32 32 0 0 1 32 0Z" fill={v.peel} />
      <path d="M-28.5 0A28.5 28.5 0 0 1 28.5 0Z" fill={v.pith} />
      <path d="M-25.5 0A25.5 25.5 0 0 1 25.5 0Z" fill={v.pulp[0]} />
      {Array.from({ length: segs - 1 }, (_, i) => {
        const a = Math.PI - ((i + 1) / segs) * Math.PI
        return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 25.5} y2={-Math.sin(a) * 25.5} stroke={v.membrane} strokeWidth="1.6" />
      })}
      <circle cx="0" cy="0" r="2.4" fill={v.membrane} />
    </svg>
  )
}

function Slider({ label, value, onChange }) {
  return (
    <label className="slider">
      <span className="slider__head">
        <span>{label}</span>
        <b>{value.toFixed(2)}</b>
      </span>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ '--p': `${value * 100}%` }} />
    </label>
  )
}

export default function App() {
  const host = useRef(null)
  const canvas = useRef(null)
  const scene = useRef(null)
  const [variety, setVariety] = useState(0)
  const [firmness, setFirmness] = useState(0.4)
  const [damping, setDamping] = useState(0.45)
  const [paused, setPaused] = useState(false)
  const [mesh, setMesh] = useState(false)
  const [slow, setSlow] = useState(false)
  const [bag, setBag] = useState(0)
  const [toast, setToast] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [grabbing, setGrabbing] = useState(false)
  const [touched, setTouched] = useState(false)
  const v = VARIETIES[variety]

  useEffect(() => {
    const s = new JellyScene(canvas.current, VARIETIES[0])
    scene.current = s
    const off = s.on((type, val) => {
      if (type === 'grab') {
        setGrabbing(val)
        if (val) setTouched(true)
      }
    })
    window.__jelly = s
    return () => {
      off()
      s.dispose()
      scene.current = null
    }
  }, [])

  useEffect(() => scene.current && scene.current.setFirmness(firmness), [firmness])
  useEffect(() => scene.current && scene.current.setDamping(damping), [damping])
  useEffect(() => scene.current && scene.current.setPaused(paused), [paused])
  useEffect(() => scene.current && scene.current.setShowMesh(mesh), [mesh])
  useEffect(() => scene.current && scene.current.setSlow(slow), [slow])

  useEffect(() => {
    document.documentElement.style.setProperty('--glow', v.glow)
    document.documentElement.style.setProperty('--accent', v.attenuation)
  }, [v])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const pick = (i) => {
    if (i === variety) return
    setVariety(i)
    scene.current && scene.current.setVariety(VARIETIES[i])
  }

  const addToBag = () => {
    setBag((b) => b + 1)
    setToast(`${v.name.replace('\n', ' ')} jar added to your bag`)
  }

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else host.current.requestFullscreen && host.current.requestFullscreen()
  }

  return (
    <div className={`app ${grabbing ? 'is-grabbing' : ''}`} ref={host}>
      <div className="stage">
        <canvas ref={canvas} aria-label={`3D ${v.name.replace('\n', ' ')} vitamin jelly slice. Drag to stretch it.`} />
      </div>

      <header className="title">
        <p className="eyebrow">Nutrition studies / No. 010</p>
        <h1>
          <span>Vitamin</span>
          <span className="indent">Jelly.</span>
        </h1>
        <p className="lede">Sugar-free citrus slices with real fruit and one daily dose each.</p>
      </header>

      <a className="shop" href="#bag" onClick={(e) => (e.preventDefault(), addToBag())}>
        <span>Shop the jar</span>
        <i>$24</i>
        {bag > 0 && <b aria-label={`${bag} in bag`}>{bag}</b>}
      </a>

      <p className={`hint ${touched ? 'is-done' : ''}`}>
        <i />
        Grab. Stretch. Let go.
      </p>

      <button className="sheet-toggle" onClick={() => setSheet((s) => !s)} aria-expanded={sheet} aria-controls="panel">
        {sheet ? 'Close' : 'Controls'}
      </button>

      <aside id="panel" className={`panel ${sheet ? 'is-open' : ''}`} aria-label="Jelly controls">
        <p className="label">Variety</p>
        <div className="vars" role="radiogroup" aria-label="Variety">
          {VARIETIES.map((x, i) => (
            <button key={x.id} role="radio" aria-checked={variety === i} className={`var ${variety === i ? 'is-on' : ''}`} onClick={() => pick(i)}>
              <SliceIcon v={x} />
              <em>{x.name}</em>
            </button>
          ))}
        </div>

        <div className="facts" key={v.id}>
          <p className="facts__top">
            <span>{v.benefit}</span>
            <b>{v.kcal} kcal</b>
          </p>
          {v.nutrients.map(([k, val, dv]) => (
            <p className="facts__row" key={k}>
              <span>{k}</span>
              <span>{val}</span>
              <b>{dv}</b>
            </p>
          ))}
          <p className="facts__note">per slice · % daily value</p>
        </div>

        <hr />
        <Slider label="Firmness" value={firmness} onChange={setFirmness} />
        <Slider label="Internal damping" value={damping} onChange={setDamping} />
        <hr />

        <button className="btn" onClick={() => scene.current && scene.current.nudge(1)}>
          Give it a nudge
        </button>
        <div className="btn-row">
          <button
            className="btn btn--dark"
            onClick={() => {
              scene.current && scene.current.reset()
              setFirmness(0.4)
              setDamping(0.45)
            }}
          >
            Reset
          </button>
          <button className="btn" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div className="checks">
          <label>
            <input type="checkbox" checked={mesh} onChange={(e) => setMesh(e.target.checked)} />
            <span>Show mesh</span>
          </label>
          <label>
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
            <span>¼ speed</span>
          </label>
        </div>
      </aside>

      <button className="fs" onClick={fullscreen} aria-label="Toggle fullscreen">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status">
        {toast}
      </div>
    </div>
  )
}
