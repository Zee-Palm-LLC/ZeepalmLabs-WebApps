import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Globe } from '../components/Globe.jsx'
import { Odometer } from '../components/Odometer.jsx'
import { PageHeader, Segmented } from '../layout/Shell.jsx'
import { calorieBars, fmt, snapshots, workoutRows } from '../data.js'
import { useLiveIndex } from './useLive.js'

const kcal = (n) => fmt(n)
const pct = (n) => `${n}%`

function Delta({ value, down }) {
  return (
    <span className={`delta ${down ? 'down' : 'up'}`}>
      <i />
      {value}
    </span>
  )
}

const spline = (pts) => {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}
const activeLine = spline([[0, 54], [30, 44], [60, 36], [92, 34], [122, 18], [150, 14], [180, 24], [210, 38], [244, 50]])
const restLine = spline([[0, 52], [26, 26], [52, 22], [86, 26], [118, 30], [152, 30], [186, 44], [216, 46], [244, 54]])

function Regions({ data, delay }) {
  const [hover, setHover] = useState(null)
  const total = data.regions.reduce((a, c) => a + c.pct, 0)
  return (
    <>
      <div className="label-strong anim-rise">Workouts by region</div>
      <div className="activity-bar anim-rise">
        {data.regions.map((c, i) => (
          <span key={c.name} className={`seg ${hover !== null && hover !== i ? 'dim' : ''}`} style={{ flexGrow: c.pct / total, background: c.color }} />
        ))}
      </div>
      <ul className="country-list">
        {data.regions.map((c, i) => (
          <li
            key={c.name}
            className={`country anim-rise ${hover === i ? 'is-hover' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="dot" style={{ background: c.color }} />
            <span className="c-name">{c.name}</span>
            <Odometer className="c-value" value={c.value} delay={delay + 120 + i * 50} />
            <Odometer className="c-pct" value={c.pct} format={pct} delay={delay + 160 + i * 50} />
          </li>
        ))}
      </ul>
    </>
  )
}

export function GlobePage({ intro, live }) {
  const root = useRef(null)
  const [ready, setReady] = useState(!intro)
  const [range, setRange] = useState(0)
  const tick = useLiveIndex(snapshots.length, live && ready)
  const data = snapshots[(tick + range) % snapshots.length]
  const r = 36
  const circ = 2 * Math.PI * r
  const s = data.sleep

  useLayoutEffect(() => {
    if (!intro) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: () => setReady(true) })
        .from('.anim-rise', { y: 14, opacity: 0, stagger: 0.035, duration: 0.6 }, 0.05)
        .from('.activity-bar .seg', { scaleX: 0, transformOrigin: 'left', stagger: 0.07, duration: 0.6 }, 0.35)
        .from('.globe-wrap', { scale: 0.86, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
        .from('.globe-chip', { y: 10, opacity: 0, stagger: 0.15, duration: 0.6 }, 1.0)
        .from('.anim-card', { y: 24, opacity: 0, stagger: 0.07, duration: 0.7 }, 0.4)
        .from('.bar-col .bar', { scaleY: 0, stagger: 0.015, duration: 0.6 }, 0.7)
        .from('.trend-chart .line', { strokeDashoffset: 1, duration: 1.2, ease: 'power2.inOut', stagger: 0.15 }, 0.7)
        .from('.ring-fill', { attr: { 'stroke-dashoffset': circ }, duration: 1.3 }, 0.7)
        .from('.track > span, .stage-bar span', { scaleX: 0, transformOrigin: 'left', stagger: 0.06, duration: 0.8 }, 0.8)
    }, root)
    return () => ctx.revert()
  }, [intro, circ])

  const delay = intro && !ready ? 200 : 0

  return (
    <div className="page globe-page" ref={root}>
      <PageHeader eyebrow="Live member activity · June 2026" title="Global activity">
        <Segmented options={['Today', 'Week', 'Month']} value={range} onChange={setRange} />
      </PageHeader>

      <div className="gp-grid">
        <section className="gp-stats" aria-label="Members">
          <div className="anim-rise">
            <div className="label-row">
              <span className="label-strong">Active members</span>
              <span className="tiny-link">DETAIL ›</span>
            </div>
            <Odometer className="big-number" value={data.members} delay={delay} />
          </div>
          <div className="kpi-pair anim-rise">
            <div className="kpi">
              <b><Odometer value={data.avgSession} delay={delay + 80} /> min</b>
              <span>Avg session</span>
            </div>
            <div className="kpi">
              <b><Odometer value={data.streak} delay={delay + 120} /> days</b>
              <span>Median streak</span>
            </div>
          </div>
          <Regions data={data} delay={delay} />
        </section>

        <section className="gp-globe" aria-label="Members around the world">
          <Globe intro={intro} />
          <div className="globe-chip" style={{ left: '8%', top: '16%' }}>
            <i />
            <span><b>London</b> 12.4k runs now</span>
          </div>
          <div className="globe-chip" style={{ right: '4%', top: '58%' }}>
            <i />
            <span><b>Lagos</b> 3.1k classes live</span>
          </div>
        </section>

        <aside className="gp-side" aria-label="Engagement and this week">
          <div className="side-block anim-rise">
            <div className="label-row">
              <span className="label-strong">Most engaged</span>
              <span className="tiny-link">SEE ALL ›</span>
            </div>
            <div className="engaged">
              <span className="tile purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 8.5v7M17.5 8.5v7M4 10.5v3M20 10.5v3M6.5 12h11" />
                </svg>
              </span>
              <div>
                <div className="eng-label">Workouts logged</div>
                <div className="eng-value">
                  <Odometer value={data.workouts} delay={delay} />
                  <Delta value="145" />
                </div>
              </div>
            </div>
            <div className="engaged">
              <span className="tile blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M8 4.5h8v4a4 4 0 01-8 0z" />
                  <path d="M8 6H5.5a2.5 2.5 0 002.7 3.2M16 6h2.5a2.5 2.5 0 01-2.7 3.2M12 12.5V16M9 19.5h6M10 16h4" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <div className="eng-label">New personal records</div>
                <div className="eng-value">
                  <Odometer value={data.prs} delay={delay + 80} />
                </div>
              </div>
            </div>
          </div>

          <div className="side-block anim-rise">
            <div className="label-strong">This week</div>
            <div className="forecast">
              <div className="f-label">Calories burned</div>
              <div className="f-value">
                <Odometer value={data.weekCalories} format={kcal} delay={delay} />
                <span className="unit">kcal</span>
                <Delta value="10%" />
              </div>
              <div className="compare">Compared to 11,490 kcal last week</div>
            </div>
            <div className="forecast">
              <div className="f-label">Active minutes</div>
              <div className="f-value">
                <Odometer value={data.activeMinutes} delay={delay + 80} />
                <span className="unit">min</span>
                <Delta value="12%" />
              </div>
              <div className="compare">Compared to 38,410 min last week</div>
            </div>
          </div>

          <article className="card anim-card">
            <div className="card-label">Training hours</div>
            <div className="card-value">
              <Odometer value={data.trainingHours} delay={delay} />
              <Delta value="11%" />
            </div>
            <div className="compare">Compared to 11,490 h last quarter</div>
            {data.months.map((m, i) => (
              <div key={m.name} className="month">
                <div className="m-head">
                  <span>{m.name}</span>
                  <Odometer value={m.value} delay={delay + i * 60} />
                </div>
                <div className="track">
                  <span style={{ width: `${m.fill * 100}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </article>
        </aside>

        <section className="gp-cards" aria-label="Health summary">
          <article className="card anim-card">
            <div className="card-head">
              <span className="card-label">Calories burned</span>
              <span className="more">···</span>
            </div>
            <div className="card-value">
              <Odometer value={data.calories} format={kcal} delay={delay + 300} />
              <span className="unit">kcal</span>
              <Delta value="10%" />
            </div>
            <div className="bars" aria-hidden="true">
              {calorieBars.map(([a, b], i) => (
                <span key={i} className="bar-col">
                  <i className="bar pink" style={{ height: `${a * 100}%` }} />
                  <i className="bar purple" style={{ height: `${b * 100}%` }} />
                </span>
              ))}
            </div>
            <div className="mini-rows">
              {workoutRows.map((w) => (
                <div key={w.name} className="earn-row">
                  <span className="er-name">{w.name}</span>
                  <span className="er-count">{w.count}</span>
                  <span className="er-value">{fmt(w.value)}</span>
                  <span className={`tri ${w.up ? 'up' : 'down'}`} />
                </div>
              ))}
            </div>
          </article>

          <article className="card anim-card">
            <div className="card-head">
              <span className="card-label">Heart rate</span>
              <span className="card-title">
                <Odometer value={data.heartRate} delay={delay + 350} /> bpm
              </span>
            </div>
            <div className="compare">Average across all workouts</div>
            <svg className="trend-chart" viewBox="0 0 244 60" preserveAspectRatio="none" aria-hidden="true">
              <path className="line orange" d={restLine} pathLength="1" />
              <path className="line purple" d={activeLine} pathLength="1" />
            </svg>
            <div className="legend">
              <span><i style={{ background: '#7f74ee' }} />Active</span>
              <span><i style={{ background: '#f2b45e' }} />Resting</span>
            </div>
          </article>

          <article className="card anim-card">
            <div className="card-label">Weekly goal</div>
            <div className="coverage" style={{ marginTop: 10 }}>
              <div className="ring">
                <svg viewBox="0 0 84 84" aria-hidden="true">
                  <circle cx="42" cy="42" r={r} className="ring-track" />
                  <circle cx="42" cy="42" r={r} className="ring-fill" strokeDasharray={circ} strokeDashoffset={circ * (1 - data.goal / 100)} />
                </svg>
                <span className="ring-text">
                  <Odometer value={data.goal} delay={delay + 400} />
                  <sup>%</sup>
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="card-label">Steps tracked</div>
                <div className="cov-value">
                  <Odometer value={data.steps} delay={delay + 400} />
                </div>
                <div className="compare">of members on track</div>
              </div>
            </div>
          </article>

          <article className="card anim-card">
            <div className="card-head">
              <span className="card-label">Avg sleep</span>
              <Delta value="4%" />
            </div>
            <div className="card-value">
              <Odometer value={s.hours} delay={delay + 420} />
              <span className="unit">h</span>&nbsp;
              <Odometer value={s.minutes} delay={delay + 440} />
              <span className="unit">m</span>
            </div>
            <div className="stage-bar" aria-hidden="true">
              <span style={{ flexGrow: s.deep, background: '#5b4fe0' }} />
              <span style={{ flexGrow: s.light, background: '#a99ff5' }} />
              <span style={{ flexGrow: s.rem, background: '#4cb6f3' }} />
              <span style={{ flexGrow: s.awake, background: '#f4b55e' }} />
            </div>
            <div className="stage-legend">
              <span><i style={{ background: '#5b4fe0' }} />Deep<b>{s.deep}%</b></span>
              <span><i style={{ background: '#a99ff5' }} />Light<b>{s.light}%</b></span>
              <span><i style={{ background: '#4cb6f3' }} />REM<b>{s.rem}%</b></span>
              <span><i style={{ background: '#f4b55e' }} />Awake<b>{s.awake}%</b></span>
            </div>
          </article>

          <article className="card anim-card">
            <div className="card-label">Avg VO₂ max</div>
            <div className="card-value">
              <Odometer value={data.vo2} format={(n) => n.toFixed(1)} delay={delay + 460} />
              <span className="unit">ml/kg/min</span>
            </div>
            <div className="compare">Top 30% for members aged 30–39</div>
            <div className="track" style={{ marginTop: 16, height: 6 }}>
              <span style={{ width: `${((data.vo2 - 20) / 40) * 100}%`, background: 'linear-gradient(90deg, #4cb6f3, #7b6cf0)' }} />
            </div>
            <div className="legend" style={{ justifyContent: 'space-between' }}>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Superior</span>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
