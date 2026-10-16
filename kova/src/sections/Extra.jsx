import { useEffect, useMemo, useRef, useState } from 'react'
import { FLAVORS, PROFILE, PROFILE_KEYS, SPECS, SUGAR_BARS, LYTES, VITS, CLEAN, COMPARE, ATHLETES, STATS, MARQUEE, INTENSITY } from '../data.js'
import { mod, store } from '../store.js'
import { useCount, useInView, useTween } from '../lib/hooks.js'
import { tick } from '../lib/audio.js'

const FL = Object.fromEntries(FLAVORS.map((f) => [f.id, f]))

export function HeroHud({ active, onAdd }) {
  const f = FLAVORS[mod(active)]
  const pr = PROFILE[f.id]
  return (
    <div className="hud">
      <div className="hud__specs">
        <p className="hud__h">
          <span>Per 330 ml can</span>
          <b>{String(mod(active) + 1).padStart(2, '0')}/08</b>
        </p>
        {SPECS.map((s) => (
          <div key={s.k} className="spec">
            <span>{s.k}</span>
            <i>
              <em style={{ width: `${Math.max(2, (s.v / s.max) * 100)}%`, background: f.glow }} />
            </i>
            <b>
              {s.v}
              <small>{s.u}</small>
            </b>
          </div>
        ))}
      </div>
      <div className="hud__taste">
        <p className="hud__h">
          <span>Taste profile</span>
          <b>{f.name}</b>
        </p>
        {PROFILE_KEYS.map((k, i) => (
          <div key={k} className="meter">
            <span>{k}</span>
            <div className="meter__dots">
              {Array.from({ length: 10 }, (_, j) => (
                <i key={j} className={j < Math.round(pr[i] * 10) ? 'is-on' : ''} style={{ '--c': f.glow, '--d': `${j * 25}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="hud__buy">
        <p>
          <b>£29</b>
          <span>12 × 330 ml</span>
          <span>free delivery over £40</span>
        </p>
        <button onClick={() => onAdd(f.id)} style={{ '--c': f.glow }}>
          Add <span className="hud__fl">{f.name}</span> box <i>+</i>
        </button>
      </div>
      <div className="hud__proof">
        <p>
          <b>4.9</b>
          <span className="stars">★★★★★</span>
        </p>
        <span>12,840 reviews</span>
        <span>Batch tested · vegan</span>
      </div>
    </div>
  )
}

export function FeatureViz({ id, on, color }) {
  if (id === 'sugar')
    return (
      <div className={`viz viz--bars${on ? ' is-on' : ''}`}>
        {SUGAR_BARS.map((b, i) => (
          <div key={b.k} className={`vbar${i === 0 ? ' is-us' : ''}`} style={{ '--w': b.v / 35, '--d': `${i * 90}ms`, '--c': color }}>
            <span>{b.k}</span>
            <i>
              <em />
            </i>
            <b>{b.v} g</b>
          </div>
        ))}
        <p className="viz__fine">Sugar per 330 ml, typical values</p>
      </div>
    )
  if (id === 'lytes')
    return (
      <div className={`viz viz--rings${on ? ' is-on' : ''}`}>
        {LYTES.map((l, i) => (
          <div key={l.k} className="vring" style={{ '--p': l.p, '--d': `${i * 120}ms`, '--c': color }}>
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" />
              <circle cx="40" cy="40" r="34" className="fg" />
            </svg>
            <b>
              {l.v}
              <small>mg</small>
            </b>
            <span>{l.k}</span>
          </div>
        ))}
      </div>
    )
  if (id === 'vit')
    return (
      <div className={`viz viz--vits${on ? ' is-on' : ''}`}>
        {VITS.map((v, i) => (
          <div key={v.k} className="vvit" style={{ '--p': v.p, '--d': `${i * 100}ms`, '--c': color }}>
            <span>{v.k}</span>
            <i>
              {Array.from({ length: 20 }, (_, j) => (
                <em key={j} className={j < v.p * 20 ? 'is-on' : ''} style={{ '--j': j }} />
              ))}
            </i>
            <b>{Math.round(v.p * 100)}%</b>
          </div>
        ))}
        <p className="viz__fine">% of daily reference intake per can</p>
      </div>
    )
  return (
    <div className={`viz viz--chips${on ? ' is-on' : ''}`}>
      {CLEAN.map((c, i) => (
        <span key={c} style={{ '--d': `${i * 60}ms`, '--c': color }}>
          <i>✓</i>
          {c}
        </span>
      ))}
    </div>
  )
}

export function Lab({ onAdd }) {
  const [kg, setKg] = useState(72)
  const [min, setMin] = useState(60)
  const [lvl, setLvl] = useState(2)
  const [temp, setTemp] = useState(22)
  const [ref, seen] = useInView()
  const r = useMemo(() => {
    const rate = INTENSITY[lvl].rate * Math.pow(kg / 70, 0.6) * (1 + Math.max(0, temp - 18) * 0.03)
    const loss = (rate * min) / 60
    const na = loss * 900
    const cans = Math.max(1, Math.round((loss * 0.7) / 0.33))
    const every = Math.max(10, Math.round(min / Math.max(1, cans) / 5) * 5)
    return { rate, loss, na, cans, every, drop: (loss / kg) * 100 }
  }, [kg, min, lvl, temp])
  const loss = useTween(seen ? r.loss : 0)
  const na = useTween(seen ? r.na : 0)
  const drop = useTween(seen ? r.drop : 0)
  const marks = Array.from({ length: Math.min(12, r.cans) }, (_, i) => ((i + 0.5) / Math.min(12, r.cans)) * 100)
  return (
    <section id="lab" className="s-lab" ref={ref}>
      <div className="lab">
        <div className="lab__head">
          <p className="kicker">Sweat lab</p>
          <h2>
            <span>How much do</span>
            <span>you really lose?</span>
          </h2>
          <p className="body">Set up your session and we will estimate your sweat loss, the sodium that goes with it and how many cans keep you topped up.</p>
        </div>
        <div className="lab__controls">
          <Slider label="Body weight" v={kg} set={setKg} min={45} max={130} u="kg" />
          <Slider label="Session length" v={min} set={setMin} min={15} max={240} step={5} u="min" />
          <Slider label="Temperature" v={temp} set={setTemp} min={5} max={40} u="°C" />
          <div className="lab__lvl">
            <span>Intensity</span>
            <div>
              {INTENSITY.map((it, i) => (
                <button
                  key={it.id}
                  className={lvl === i ? 'is-on' : ''}
                  onClick={() => {
                    tick()
                    setLvl(i)
                  }}
                >
                  {it.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lab__out">
          <div className="lab__big">
            <span>Sweat loss</span>
            <b>
              {loss.toFixed(2)}
              <small>L</small>
            </b>
          </div>
          <div className="lab__big">
            <span>Sodium lost</span>
            <b>
              {Math.round(na)}
              <small>mg</small>
            </b>
          </div>
          <div className="lab__big">
            <span>Body weight</span>
            <b>
              −{drop.toFixed(1)}
              <small>%</small>
            </b>
          </div>
          <div className="lab__big lab__big--cans">
            <span>Cans to drink</span>
            <b>{r.cans}</b>
          </div>
          <div className="lab__plan">
            <p>
              <span>Your drinking plan</span>
              <b>one can about every {r.every} min</b>
            </p>
            <div className="lab__line">
              <i />
              {marks.map((m, i) => (
                <em key={i} style={{ left: `${m}%`, '--d': `${i * 60}ms` }}>
                  🥫
                </em>
              ))}
              <small style={{ left: 0 }}>0</small>
              <small style={{ right: 0 }}>{min} min</small>
            </div>
          </div>
          <div className={`lab__warn${r.drop > 2 ? ' is-on' : ''}`}>{r.drop > 2 ? 'Losing more than 2% of body weight can hurt performance. Start sipping early.' : 'You are in a comfortable range. Keep sipping steadily.'}</div>
          <button className="lab__cta" onClick={() => onAdd('watermelon', Math.ceil(r.cans / 12))}>
            Add {Math.ceil(r.cans / 12)} box{Math.ceil(r.cans / 12) > 1 ? 'es' : ''} for this plan
          </button>
          <p className="viz__fine">A rough estimate for fun and planning. Sweat rates vary a lot between people. Not medical advice.</p>
        </div>
      </div>
    </section>
  )
}

function Slider({ label, v, set, min, max, step = 1, u }) {
  return (
    <label className="sld" style={{ '--p': (v - min) / (max - min) }}>
      <span>
        {label}
        <b>
          {v}
          <small>{u}</small>
        </b>
      </span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} />
    </label>
  )
}

export function Marquee() {
  const a = useRef(null)
  const b = useRef(null)
  useEffect(() => {
    let raf = 0
    let x = 0
    let skew = 0
    let last = window.__lenis?.scroll || 0
    const run = () => {
      const s = window.__lenis?.scroll || 0
      const vel = s - last
      last = s
      x -= 1.2 + Math.abs(vel) * 0.35
      skew += (Math.max(-14, Math.min(14, vel * 0.4)) - skew) * 0.12
      const w = a.current ? a.current.scrollWidth / 2 : 1
      if (-x > w) x += w
      if (a.current) a.current.style.transform = `translateX(${x}px) skewX(${-skew}deg)`
      if (b.current) b.current.style.transform = `translateX(${-w - x}px) skewX(${skew}deg)`
      raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [])
  const row = [...MARQUEE, ...MARQUEE]
  return (
    <section className="s-marq">
      <div className="marq">
        <div className="marq__row" ref={a}>
          {row.map((w, i) => (
            <span key={i}>
              {w}
              <i style={{ background: FLAVORS[i % 8].glow }} />
            </span>
          ))}
        </div>
        <div className="marq__row marq__row--out" ref={b}>
          {row.map((w, i) => (
            <span key={i}>
              {w}
              <i style={{ background: FLAVORS[(i + 3) % 8].glow }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Compare() {
  const [col, setCol] = useState('sugar')
  const [ref, seen] = useInView()
  const c = COMPARE.cols.find((q) => q.id === col)
  return (
    <section id="compare" className="s-cmp" ref={ref}>
      <div className="cmp__head">
        <p className="kicker">Side by side</p>
        <h2>
          <span>What is really</span>
          <span>in your bottle?</span>
        </h2>
      </div>
      <div className="cmp__tabs">
        {COMPARE.cols.map((q) => (
          <button
            key={q.id}
            className={col === q.id ? 'is-on' : ''}
            onClick={() => {
              tick()
              setCol(q.id)
            }}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="cmp__chart">
        {COMPARE.rows.map((r, i) => (
          <div key={r.id} className={`crow${r.hi ? ' is-us' : ''}`} style={{ '--d': `${i * 80}ms` }}>
            <span>{r.name}</span>
            <div className="crow__track">
              <i style={{ width: seen ? `${Math.max(0.6, (r.v[col] / c.max) * 100)}%` : '0%' }} />
            </div>
            <b>
              {r.v[col]}
              <small>{c.u}</small>
            </b>
          </div>
        ))}
        <div className="cmp__grid">
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <i key={g} style={{ left: `calc(170px + (100% - 270px) * ${g})` }}>
              <small>{Math.round(c.max * g)}</small>
            </i>
          ))}
        </div>
      </div>
      <p className="viz__fine">Per 330 ml serving. Typical values for comparison, varies by brand.</p>
    </section>
  )
}

export function Athletes() {
  const track = useRef(null)
  const sec = useRef(null)
  useEffect(() => {
    let raf = 0
    const run = () => {
      const s = sec.current
      const t = track.current
      if (s && t) {
        const r = s.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, -r.top / Math.max(1, s.offsetHeight - window.innerHeight)))
        const max = t.scrollWidth - window.innerWidth + 80
        t.style.transform = `translateX(${-p * Math.max(0, max)}px)`
        s.style.setProperty('--ap', p.toFixed(3))
      }
      raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <section id="athletes" className="s-ath" ref={sec}>
      <div className="sticky">
        <div className="ath__head">
          <p className="kicker">Fuelled by KOVA</p>
          <h2>
            <span>The crew</span>
          </h2>
          <div className="ath__bar">
            <i />
          </div>
        </div>
        <div className="ath__track" ref={track}>
          {ATHLETES.map((a, i) => {
            const f = FL[a.flavor]
            return (
              <article key={a.name} className="acard" style={{ '--a': f.bg[0], '--b': f.bg[1], '--g': f.glow }}>
                <p className="acard__n">{String(i + 1).padStart(2, '0')}</p>
                <div className="acard__can">
                  <i />
                  <b>KOVA</b>
                </div>
                <p className="acard__sport">{a.sport}</p>
                <h3>{a.name}</h3>
                <p className="acard__stat">
                  <b>{a.stat}</b>
                  <span>{a.statLabel}</span>
                </p>
                <blockquote>“{a.quote}”</blockquote>
                <p className="acard__fl">
                  <i />
                  Drinks {f.name}
                </p>
              </article>
            )
          })}
          <article className="acard acard--end">
            <h3>Your name here?</h3>
            <p>Apply to the KOVA athlete programme and get a season of free fuel.</p>
            <a href="#join" onClick={(e) => (e.preventDefault(), window.__lenis?.scrollTo('#join'))}>
              Apply now →
            </a>
          </article>
        </div>
        <p className="viz__fine ath__fine">Athlete profiles are illustrative for this concept.</p>
      </div>
    </section>
  )
}

function Stat({ s, on }) {
  const v = useCount(s.v, on, 1800, s.d)
  return (
    <div className="stat">
      <b>
        {v}
        <small>{s.suf}</small>
      </b>
      <span>{s.label}</span>
    </div>
  )
}

export function Stats() {
  const [ref, seen] = useInView({ threshold: 0.5 })
  return (
    <section className="s-stats" ref={ref}>
      {STATS.map((s) => (
        <Stat key={s.label} s={s} on={seen} />
      ))}
    </section>
  )
}

export function Loader({ done }) {
  const [p, setP] = useState(0)
  const [gone, setGone] = useState(false)
  const cb = useRef(done)
  cb.current = done
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const run = (now) => {
      const k = Math.min(1, (now - t0) / 1500)
      setP(Math.round((1 - Math.pow(1 - k, 3)) * 100))
      if (k < 1) raf = requestAnimationFrame(run)
      else {
        setTimeout(() => setGone(true), 250)
        cb.current()
      }
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className={`loader${gone ? ' is-gone' : ''}`}>
      <div className="loader__can">
        <i style={{ height: `${p}%` }} />
      </div>
      <p className="loader__brand">KOVA</p>
      <p className="loader__n">{String(p).padStart(3, '0')}%</p>
      <p className="loader__t">Chilling the cans</p>
    </div>
  )
}

export function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return
    let x = innerWidth / 2
    let y = innerHeight / 2
    let cx = x
    let cy = y
    let raf = 0
    const mv = (e) => {
      x = e.clientX
      y = e.clientY
      const el = ref.current
      if (!el) return
      const hot = e.target.closest('button, a, input, label')
      el.classList.toggle('is-hot', !!hot)
      el.classList.toggle('is-drag', !hot && store.dive < 0.02 && !e.target.closest('.shop, .menu'))
      el.classList.toggle('is-can', store.hoverCan >= 0 && store.dive < 0.02)
    }
    const run = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      if (ref.current) ref.current.style.transform = `translate(${cx}px, ${cy}px)`
      raf = requestAnimationFrame(run)
    }
    addEventListener('pointermove', mv)
    raf = requestAnimationFrame(run)
    return () => {
      removeEventListener('pointermove', mv)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="cursor" ref={ref}>
      <i />
      <span>Drag</span>
    </div>
  )
}

export function FooterBig() {
  return (
    <div className="bigfoot">
      <div className="bigfoot__cols">
        <div>
          <h4>Shop</h4>
          <a href="#hero">All flavours</a>
          <a href="#lab">Sweat lab</a>
          <a href="#compare">Compare</a>
          <a href="#join">Gift cards</a>
        </div>
        <div>
          <h4>Learn</h4>
          <a href="#dive">Ingredients</a>
          <a href="#faq">FAQ</a>
          <a href="#athletes">Athletes</a>
          <a href="#join">Hydration guide</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#join">About</a>
          <a href="#join">Stockists</a>
          <a href="#join">Careers</a>
          <a href="#join">Contact</a>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="#join">Instagram</a>
          <a href="#join">TikTok</a>
          <a href="#join">Strava club</a>
          <a href="#join">YouTube</a>
        </div>
      </div>
      <p className="bigfoot__word" aria-hidden="true">
        KOVA
      </p>
    </div>
  )
}
