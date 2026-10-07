import { useMemo, useState } from 'react'
import './assessment.css'

const SLEEP = [
  ['Well', 0],
  ['Patchy', 1.5],
  ['Poorly', 3],
  ['Barely', 4.5],
]
const AREAS = ['Work', 'Relationships', 'Health', 'Money', 'Something else']
const SESSIONS = {
  sleep: ['Wind Down', '10 min · Sleep'],
  Work: ['Unclench Sunday', '12 min · CBT'],
  Relationships: ['Say It Kindly', '9 min · ACT'],
  Health: ['Body Check-In', '8 min · Mindfulness'],
  Money: ['Worry Window', '10 min · CBT'],
  'Something else': ['Name the Weight', '7 min · ACT'],
  none: ['First Thaw', '6 min · Breathing'],
}
const COLS = 18
const ROWS = 7

export default function Assessment() {
  const [heavy, setHeavy] = useState(6)
  const [sleep, setSleep] = useState(1)
  const [areas, setAreas] = useState(['Work'])
  const [done, setDone] = useState(false)

  const r = useMemo(() => {
    const t = Math.max(-12, Math.min(4, 4 - heavy * 1.15 - SLEEP[sleep][1] - areas.length * 0.6))
    const cold = (4 - t) / 16
    const spot = areas[0] || null
    const key = sleep >= 2 ? 'sleep' : spot || 'none'
    return { t, cold, spot, session: SESSIONS[key] }
  }, [heavy, sleep, areas])

  const toggle = (a) => {
    setDone(false)
    setAreas((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]))
  }

  const lit = Math.round(r.cold * COLS * ROWS)
  const order = useMemo(() => {
    const arr = [...Array(COLS * ROWS).keys()]
    let s = 7
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280
      const j = Math.floor((s / 233280) * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])
  const rank = useMemo(() => {
    const m = new Array(order.length)
    order.forEach((cell, i) => (m[cell] = i))
    return m
  }, [order])

  return (
    <section className="sec assess" id="begin">
      <div className="wrap">
        <div className="eyebrow">
          <span>
            {'// 06 — '}
            <b>Begin your assessment</b>
          </span>
          <span>About 30 seconds</span>
        </div>
        <div className="assess-grid">
          <div className="assess-form">
            <h2 className="display assess-title">Let’s take your temperature.</h2>

            <div className="q">
              <div className="q-head">
                <span className="mono-s">01 · How heavy has this week felt?</span>
                <span className="mono-s q-val">{heavy} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={heavy}
                onChange={(e) => {
                  setDone(false)
                  setHeavy(Number(e.target.value))
                }}
                style={{ '--p': heavy / 10 }}
                aria-label="How heavy has this week felt, from 0 to 10"
              />
              <div className="mono-s q-scale dim">
                <span>Light</span>
                <span>Crushing</span>
              </div>
            </div>

            <div className="q">
              <div className="q-head">
                <span className="mono-s">02 · How have you been sleeping?</span>
              </div>
              <div className="opts">
                {SLEEP.map(([k], i) => (
                  <button
                    key={k}
                    className={`opt ${sleep === i ? 'on' : ''}`}
                    onClick={() => {
                      setDone(false)
                      setSleep(i)
                    }}
                    aria-pressed={sleep === i}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="q">
              <div className="q-head">
                <span className="mono-s">03 · Where does the tension sit?</span>
                <span className="mono-s dim">Pick any</span>
              </div>
              <div className="opts wrap-opts">
                {AREAS.map((a) => (
                  <button key={a} className={`opt ${areas.includes(a) ? 'on' : ''}`} onClick={() => toggle(a)} aria-pressed={areas.includes(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="assess-out pane" style={{ '--cold': r.cold }}>
            <header className="mono-s out-top">
              <span>Your reading</span>
              <span className="dim">Live</span>
            </header>
            <div className="out-temp display">
              <b>{(r.t > 0 ? '+' : r.t < 0 ? '−' : '') + Math.abs(r.t).toFixed(1)}</b>
              <i>°C</i>
            </div>
            <svg className="frost-field" viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`} aria-hidden="true">
              {[...Array(COLS * ROWS)].map((_, i) => (
                <circle key={i} cx={5 + (i % COLS) * 10} cy={5 + Math.floor(i / COLS) * 10} r="1.7" className={rank[i] < lit ? 'on' : ''} style={{ transitionDelay: `${(rank[i] % 40) * 8}ms` }} />
              ))}
            </svg>
            <dl className="out-rows">
              <div>
                <dt className="mono-s dim">Cold spot</dt>
                <dd>{r.spot ? `${r.spot}` : 'Nothing specific yet'}</dd>
              </div>
              <div>
                <dt className="mono-s dim">Sleep</dt>
                <dd>{SLEEP[sleep][0]}</dd>
              </div>
              <div>
                <dt className="mono-s dim">First session</dt>
                <dd>
                  {r.session[0]} <span className="mono-s dim">{r.session[1]}</span>
                </dd>
              </div>
            </dl>
            <button className="btn out-btn" onClick={() => setDone(true)}>
              {done ? 'You’re in. First check-in tonight, 8:00 PM' : 'Start first session'}
              <span className="btn-sq">
                <svg viewBox="0 0 14.4 9.4" aria-hidden="true">
                  <path d={done ? 'M1.5 4.8L5.4 8.4L12.9 1' : 'M1.1 0.9V4.7H13.1M9.5 1.1L13.1 4.7L9.5 8.3'} />
                </svg>
              </span>
            </button>
            <p className="mono-s out-note dim">A reflection, not a diagnosis. Nothing is saved until you create an account.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
