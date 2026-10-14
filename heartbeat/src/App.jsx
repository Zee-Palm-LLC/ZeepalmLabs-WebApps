import { useEffect, useRef, useState } from 'react'
import { MODES, MAX_HR, strokeVolume, zoneOf, ecg } from './lib/cardio.js'
import HeartAudio from './lib/audio.js'

const LABELS = [
  { id: 'ra', name: 'Right atrium', short: 'RA', side: -1 },
  { id: 'la', name: 'Left atrium', short: 'LA', side: 1 },
  { id: 'rv', name: 'Right ventricle', short: 'RV', side: -1 },
  { id: 'lv', name: 'Left ventricle', short: 'LV', side: 1 },
  { id: 'apex', name: 'Apex', short: 'Apex', side: 1 },
]

function Slider({ label, value, min, max, step, fmt, onChange }) {
  const p = ((value - min) / (max - min)) * 100
  return (
    <label className="slider">
      <span className="slider__head">
        <span>{label}</span>
        <b>{fmt ? fmt(value) : value}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ '--p': `${p}%` }} />
    </label>
  )
}

export default function App() {
  const host = useRef(null)
  const canvas = useRef(null)
  const engine = useRef(null)
  const audio = useRef(null)
  const bpmEl = useRef(null)
  const ecgPath = useRef(null)
  const ring = useRef(null)
  const labelEls = useRef({})
  const [bpm, setBpm] = useState(62)
  const [firmness, setFirmness] = useState(0.45)
  const [damping, setDamping] = useState(0.45)
  const [paused, setPaused] = useState(false)
  const [mesh, setMesh] = useState(false)
  const [slow, setSlow] = useState(false)
  const [labels, setLabels] = useState(true)
  const [sound, setSound] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [holding, setHolding] = useState(false)
  const [touched, setTouched] = useState(false)
  const [failed, setFailed] = useState(false)
  const [toast, setToast] = useState(null)
  const [joined, setJoined] = useState(false)
  const live = useRef({})
  live.current = { bpm, firmness, damping, paused, mesh, slow, holding, labels }

  const sv = strokeVolume(bpm)
  const co = ((bpm * sv) / 1000).toFixed(1)
  const zone = zoneOf(bpm)
  const mode = MODES.reduce((b, m) => (Math.abs(m.bpm - bpm) < Math.abs(b.bpm - bpm) ? m : b), MODES[0])
  const exact = MODES.find((m) => m.bpm === bpm)

  useEffect(() => {
    audio.current = new HeartAudio()
    let alive = true
    let s = null
    let off = null
    const boot = async () => {
      try {
        const { default: GpuHeart } = await import('./heart/GpuHeart.js')
        if (!navigator.gpu) throw new Error('no webgpu')
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) throw new Error('no adapter')
        const device = await adapter.requestDevice()
        if (!alive) {
          device.destroy()
          return
        }
        s = new GpuHeart(canvas.current, device)
      } catch {
        if (alive) setFailed(true)
        return
      }
      const c = live.current
      s.setBpm(c.bpm)
      s.body.firmness = c.firmness
      s.body.damping = c.damping
      s.setPaused(c.paused)
      s.setShowMesh(c.mesh)
      s.setSlow(c.slow)
      off = s.on((type) => {
        if (type === 'grab') return
        if (type === 'lub' || type === 'dub') audio.current.thump(type)
        if (type === 'lub') {
          const el = bpmEl.current
          if (el) {
            el.classList.remove('is-beat')
            void el.offsetWidth
            el.classList.add('is-beat')
          }
          if (live.current.holding) {
            if (navigator.vibrate) navigator.vibrate(28)
            const r = ring.current
            if (r) {
              r.classList.remove('is-beat')
              void r.offsetWidth
              r.classList.add('is-beat')
            }
          }
        }
      })
      const offGrab = s.on((type, val) => {
        if (type === 'grab') {
          setHolding(val)
          if (val) setTouched(true)
        }
      })
      const prevOff = off
      off = () => {
        prevOff()
        offGrab()
      }
      engine.current = s
      window.__heart = s
    }
    boot()
    return () => {
      alive = false
      off && off()
      s && s.dispose()
      engine.current = null
    }
  }, [])

  useEffect(() => {
    let raf = 0
    const hist = []
    const W = 300
    const span = 3
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const s = engine.current
      if (!s) return
      const t = s.time
      if (!hist.length || t > hist[hist.length - 1][0] + 0.004) hist.push([t, ecg(s.phase, s.bpm)])
      while (hist.length && hist[0][0] < t - span) hist.shift()
      if (ecgPath.current && hist.length > 1) {
        let d = ''
        for (let i = 0; i < hist.length; i++) {
          const x = ((hist[i][0] - (t - span)) / span) * W
          const y = 40 - hist[i][1] * 30
          d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
        }
        ecgPath.current.setAttribute('d', d)
      }
      if (live.current.labels) {
        const pts = s.labels()
        for (const L of LABELS) {
          const el = labelEls.current[L.id]
          const p = pts[L.id]
          if (!el || !p) continue
          el.style.transform = `translate(${p.x}px, ${p.y}px)`
          el.style.opacity = p.front ? '1' : '0'
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (engine.current) engine.current.setBpm(bpm)
  }, [bpm])
  useEffect(() => {
    if (engine.current) engine.current.body.firmness = firmness
  }, [firmness])
  useEffect(() => {
    if (engine.current) engine.current.body.damping = damping
  }, [damping])
  useEffect(() => {
    if (engine.current) engine.current.setPaused(paused)
  }, [paused])
  useEffect(() => {
    if (engine.current) engine.current.setShowMesh(mesh)
  }, [mesh])
  useEffect(() => {
    if (engine.current) engine.current.setSlow(slow)
  }, [slow])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const move = (e) => {
      if (ring.current) ring.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
    }
  }, [])

  const toggleSound = (on) => {
    setSound(on)
    if (on) audio.current.enable()
    else audio.current.disable()
  }

  const squeeze = () => engine.current && engine.current.squeeze()
  const reset = () => {
    if (engine.current) engine.current.reset()
    setFirmness(0.45)
    setDamping(0.45)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select')) return
      if (e.code === 'Space') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 's' || e.key === 'S') squeeze()
      else if (e.key === 'r' || e.key === 'R') reset()
      else if (e.key >= '1' && e.key <= '3') setBpm(MODES[Number(e.key) - 1].bpm)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (failed)
    return (
      <div className="nogpu">
        <p className="eyebrow">Cardio studies / No. 011</p>
        <h1>This heart needs WebGPU.</h1>
        <p>Open this page in a recent Chrome, Edge or Safari to hold a beating heart in your browser.</p>
      </div>
    )

  return (
    <div className={`app ${holding ? 'is-holding' : ''}`} ref={host}>
      <div className="stage">
        <canvas ref={canvas} aria-label="3D beating heart. Drag to squeeze and stretch it." />
      </div>

      <div className={`labels ${labels ? '' : 'is-off'}`} aria-hidden="true">
        {LABELS.map((L) => (
          <div key={L.id} className={`lbl lbl--${L.side > 0 ? 'r' : 'l'}`} ref={(el) => (labelEls.current[L.id] = el)}>
            <i />
            <span>
              <em className="full">{L.name}</em>
              <em className="short">{L.short}</em>
            </span>
          </div>
        ))}
      </div>

      <div className="ring" ref={ring} aria-hidden="true" />

      <header className="title">
        <p className="eyebrow">Cardio studies / No. 011</p>
        <h1>
          <span>Heart</span>
          <span className="indent">Beat.</span>
        </h1>
        <p className="lede">A living heart you can hold. Pick a pace, squeeze it, and feel the pulse.</p>
      </header>

      <button
        className={`cta ${joined ? 'is-on' : ''}`}
        onClick={() => {
          setJoined(true)
          setToast('You are on the list. We will email you at launch.')
        }}
      >
        {joined ? 'On the list' : 'Join the beta'}
      </button>

      <section className="readout" aria-live="polite">
        <div className="readout__top">
          <b ref={bpmEl}>{bpm}</b>
          <span>
            bpm
            <em>{zone.name}</em>
          </span>
        </div>
        <svg className="ecg" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
          <path ref={ecgPath} d="" />
        </svg>
      </section>

      <p className={`hint ${touched ? 'is-done' : ''}`}>
        <i />
        Grab. Squeeze. Feel the pulse.
      </p>

      <button className="sheet-toggle" onClick={() => setSheet((v) => !v)} aria-expanded={sheet} aria-controls="panel">
        {sheet ? 'Close' : 'Controls'}
      </button>

      <aside id="panel" className={`panel ${sheet ? 'is-open' : ''}`} aria-label="Heart controls">
        <p className="label">Pace</p>
        <div className="modes" role="radiogroup" aria-label="Pace">
          {MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={exact === m} className={`mode ${exact === m ? 'is-on' : ''}`} onClick={() => setBpm(m.bpm)}>
              <b>{m.name}</b>
              <small>{m.bpm} bpm</small>
            </button>
          ))}
        </div>
        <Slider label="Heart rate" value={bpm} min={40} max={MAX_HR} step={1} fmt={(v) => `${v} bpm`} onChange={(v) => setBpm(Math.round(v))} />

        <div className="stats" key={zone.n}>
          <p>
            <span>Stroke volume</span>
            <b>{sv} ml</b>
          </p>
          <p>
            <span>Cardiac output</span>
            <b>{co} L/min</b>
          </p>
          <p>
            <span>Of max HR</span>
            <b>{Math.round((bpm / MAX_HR) * 100)}%</b>
          </p>
          <p className="zones" aria-label={`Zone ${zone.name}`}>
            {[0, 1, 2, 3, 4, 5].map((z) => (
              <i key={z} className={z <= zone.n ? 'on' : ''} />
            ))}
          </p>
          <p className="stats__note">{exact ? exact.note : mode.note}</p>
        </div>

        <hr />
        <Slider label="Tissue firmness" value={firmness} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} onChange={setFirmness} />
        <Slider label="Internal damping" value={damping} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} onChange={setDamping} />
        <hr />

        <button className="btn" onClick={squeeze}>
          Give it a squeeze
        </button>
        <div className="btn-row">
          <button className="btn btn--dark" onClick={reset}>
            Reset
          </button>
          <button className="btn" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div className="checks">
          <label>
            <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
            <span>Labels</span>
          </label>
          <label>
            <input type="checkbox" checked={sound} onChange={(e) => toggleSound(e.target.checked)} />
            <span>Sound</span>
          </label>
          <label>
            <input type="checkbox" checked={mesh} onChange={(e) => setMesh(e.target.checked)} />
            <span>Show mesh</span>
          </label>
          <label>
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
            <span>¼ speed</span>
          </label>
        </div>
        <p className="disclaimer">Illustrative model, not medical advice.</p>
      </aside>

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status">
        {toast}
      </div>
    </div>
  )
}
