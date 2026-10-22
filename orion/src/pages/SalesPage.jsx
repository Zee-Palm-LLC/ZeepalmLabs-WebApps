import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Odometer } from '../components/Odometer.jsx'
import { PageHeader, Segmented } from '../layout/Shell.jsx'
import { useLiveIndex } from './useLive.js'

const plain = (n) => n.toLocaleString('en-US')
const kg = (n) => n.toFixed(1)

const snapshots = [
  {
    week: 8097, year: 312134, activities: [261192, 192054, 168140],
    resting: 58, peak: 186, zones: [261, 192, 168],
    sleep: [[1.6, 3.6, 1.8], [1.4, 3.9, 1.6], [1.8, 3.4, 2.0], [1.2, 4.1, 1.4], [1.7, 3.5, 1.9], [2.0, 3.8, 2.1], [1.9, 3.6, 1.8]],
    weight: 72.4, fat: 18.2, muscle: 34.1,
  },
  {
    week: 9418, year: 356780, activities: [236416, 214887, 189392],
    resting: 56, peak: 181, zones: [284, 205, 159],
    sleep: [[1.8, 3.5, 1.9], [1.6, 3.8, 1.8], [1.9, 3.6, 2.1], [1.5, 4.0, 1.6], [1.8, 3.6, 2.0], [2.1, 3.7, 2.2], [2.0, 3.5, 1.9]],
    weight: 71.9, fat: 17.6, muscle: 34.5,
  },
]

const AXES = ['Strength', 'Endurance', 'Speed', 'Power', 'Mobility', 'Balance', 'Recovery', 'Agility']
// Ten control points per shape: a five-armed star with uneven arms.
const RADAR = [
  [1, 0.42, 0.98, 0.5, 0.86, 0.46, 0.92, 0.4, 0.8, 0.44],
  [0.88, 0.5, 0.82, 0.42, 1, 0.52, 0.78, 0.38, 0.96, 0.48],
]
const LINES = [
  { green: [0.42, 0.44, 0.46, 0.52, 0.62, 0.86, 0.94, 0.8, 0.6, 0.5, 0.48, 0.47], grey: [0.36, 0.37, 0.4, 0.46, 0.54, 0.66, 0.7, 0.62, 0.5, 0.42, 0.4, 0.39] },
  { green: [0.4, 0.46, 0.58, 0.7, 0.8, 0.92, 0.84, 0.7, 0.62, 0.58, 0.52, 0.5], grey: [0.34, 0.38, 0.46, 0.52, 0.6, 0.64, 0.6, 0.54, 0.48, 0.44, 0.4, 0.38] },
]

const closedSpline = (pts) => {
  const n = pts.length
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += ` C${p1[0] + (p2[0] - p0[0]) * 0.2},${p1[1] + (p2[1] - p0[1]) * 0.2} ${p2[0] - (p3[0] - p1[0]) * 0.2},${p2[1] - (p3[1] - p1[1]) * 0.2} ${p2[0]},${p2[1]}`
  }
  return `${d}Z`
}
const openSpline = (pts) => {
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
const radarPath = (values, cx, cy, r) =>
  closedSpline(values.map((v, i) => {
    const a = -Math.PI / 2 + (i / values.length) * Math.PI * 2
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v]
  }))

function useMorph(target, duration = 1.4) {
  const [values, setValues] = useState(target)
  const current = useRef(target)
  useLayoutEffect(() => {
    const from = [...current.current]
    const state = { t: 0 }
    const tween = gsap.to(state, {
      t: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const next = from.map((v, i) => v + (target[i] - v) * state.t)
        current.current = next
        setValues(next)
      },
    })
    return () => tween.kill()
  }, [target, duration])
  return values
}

function Totals({ left, right, rows, delay }) {
  return (
    <div className="sr-totals">
      <div className="sr-grid">
        {[left, right].map((s, i) => (
          <div key={s.label}>
            <span className={`sr-key ${i ? 'yearly' : ''}`}>
              <i className={i ? 'coin' : 'diamond'} />
              {s.label}
            </span>
            <div className="sr-value">
              <Odometer className="mono" value={s.value} format={s.format ?? plain} delay={delay + i * 80} />
              {s.unit && <span className="unit">{s.unit}</span>}
            </div>
            <div className="sr-delta">
              <b>{s.delta}</b> {s.sub}
            </div>
          </div>
        ))}
      </div>
      <ul className="sr-rows">
        {rows.map((r, i) => (
          <li key={r.name}>
            <span>{r.name}</span>
            <span>
              <Odometer className="mono" value={r.value} format={r.format ?? plain} delay={delay + 120 + i * 60} />
              {r.unit && <span className="unit">{r.unit}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProfileCard({ data, shape, delay }) {
  const values = useMorph(RADAR[shape])
  const cx = 240
  const cy = 210
  const r = 150
  return (
    <article className="card fr-card">
      <div className="fr-head">
        <h2 className="sr-title">Fitness profile</h2>
        <span className="fr-badge">Score 82</span>
      </div>
      <svg className="radar" viewBox="30 20 420 382" aria-label="Fitness profile radar chart">
        <defs>
          <radialGradient id="radarFill">
            <stop offset="0" stopColor="#8b6cf6" stopOpacity="0.28" />
            <stop offset="1" stopColor="#8b6cf6" stopOpacity="0.04" />
          </radialGradient>
          <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} className="radar-ring" />
        <circle cx={cx} cy={cy} r={r * 0.62} className="radar-ring faint" />
        <circle cx={cx} cy={cy} r={30} className="radar-ring" />
        {AXES.map((l, i) => {
          const a = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2
          return (
            <g key={l}>
              <line x1={cx + Math.cos(a) * 30} y1={cy + Math.sin(a) * 30} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} className="radar-spoke" />
              <text x={cx + Math.cos(a) * (r + 30)} y={cy + Math.sin(a) * (r + 22) + 4} className="radar-label">
                {l}
              </text>
            </g>
          )
        })}
        <path d={radarPath(values, cx, cy, r * 0.94)} fill="#8b6cf6" opacity="0.35" filter="url(#radarGlow)" />
        <path d={radarPath(values, cx, cy, r * 0.94)} fill="url(#radarFill)" className="radar-shape" />
        <g transform={`translate(${cx - 12} ${cy - 12})`} className="radar-gem">
          <path d="M12 3.5c-2.5-2.5-7.5-1.5-7.5 3.5 0 5 7.5 10 7.5 10s7.5-5 7.5-10c0-5-5-6-7.5-3.5z" />
        </g>
      </svg>
      <Totals
        delay={delay}
        left={{ label: 'This week', value: data.week, unit: 'kcal', delta: '↑19.6%', sub: '6,770 kcal before' }}
        right={{ label: 'This year', value: data.year, unit: 'kcal', delta: '↑2.5%', sub: '301,002 kcal' }}
        rows={[
          { name: 'Running', value: data.activities[0], unit: 'kcal' },
          { name: 'Cycling', value: data.activities[1], unit: 'kcal' },
          { name: 'Swimming', value: data.activities[2], unit: 'kcal' },
        ]}
      />
    </article>
  )
}

function HeartCard({ data, shape, delay }) {
  const green = useMorph(LINES[shape].green)
  const grey = useMorph(LINES[shape].grey)
  const toPts = (vals) => vals.map((v, i) => [i * (480 / (vals.length - 1)), 330 - v * 280])
  const g = openSpline(toPts(green))
  const s = openSpline(toPts(grey))
  return (
    <article className="card fr-card">
      <div className="fr-head">
        <h2 className="sr-title">Heart rate</h2>
        <span className="fr-badge green">Zone 2 focus</span>
      </div>
      <svg className="area-chart" viewBox="0 0 480 420" preserveAspectRatio="none" aria-label="Heart rate trend chart">
        <defs>
          <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3ccb5a" stopOpacity="0.22" />
            <stop offset="1" stopColor="#3ccb5a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="greyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9b9bab" stopOpacity="0.22" />
            <stop offset="1" stopColor="#9b9bab" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${g} L480,360 L0,360Z`} fill="url(#greenArea)" />
        <path d={`${s} L480,360 L0,360Z`} fill="url(#greyArea)" />
        <path d={s} className="area-line grey" pathLength="1" />
        <path d={g} className="area-line green" pathLength="1" />
        <line x1="34" x2="446" y1="368" y2="368" className="area-axis" />
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => (
          <text key={l} x={46 + i * 64.5} y={400} className="radar-label">
            {l}
          </text>
        ))}
      </svg>
      <Totals
        delay={delay}
        left={{ label: 'Resting', value: data.resting, unit: 'bpm', delta: '↓3.1%', sub: '60 bpm last week' }}
        right={{ label: 'Peak', value: data.peak, unit: 'bpm', delta: '↑1.2%', sub: 'Saturday intervals' }}
        rows={[
          { name: 'Zone 2 · easy', value: data.zones[0], unit: 'min' },
          { name: 'Zone 3 · tempo', value: data.zones[1], unit: 'min' },
          { name: 'Zone 4 · threshold', value: data.zones[2], unit: 'min' },
        ]}
      />
    </article>
  )
}

function SleepCard({ data, delay }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const max = 8.5
  const avg = data.sleep.reduce((a, n) => a + n[0] + n[1] + n[2], 0) / 7
  const h = Math.floor(avg)
  const m = Math.round((avg - h) * 60)
  return (
    <article className="card fr-card">
      <div className="fr-head">
        <h2 className="sr-title">Sleep</h2>
        <span className="fr-badge blue">Consistent</span>
      </div>
      <div className="sleep-bars" aria-label="Sleep per night this week">
        {data.sleep.map(([deep, light, rem], i) => (
          <div key={i} className="sleep-col">
            <div className="sleep-stack" style={{ height: `${((deep + light + rem) / max) * 100}%` }}>
              <span style={{ flexGrow: rem, background: '#4cb6f3' }} />
              <span style={{ flexGrow: light, background: '#a99ff5' }} />
              <span style={{ flexGrow: deep, background: '#5b4fe0' }} />
            </div>
            <em>{days[i]}</em>
          </div>
        ))}
      </div>
      <div className="stage-legend" style={{ gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'start', gap: 16 }}>
        <span><i style={{ background: '#5b4fe0' }} />Deep</span>
        <span><i style={{ background: '#a99ff5' }} />Light</span>
        <span><i style={{ background: '#4cb6f3' }} />REM</span>
      </div>
      <Totals
        delay={delay}
        left={{ label: 'Avg night', value: h * 100 + m, format: (n) => `${Math.floor(n / 100)}h ${String(n % 100).padStart(2, '0')}m`, delta: '↑4%', sub: '7h 06m before' }}
        right={{ label: 'Sleep score', value: 88, unit: '/100', delta: '↑6', sub: 'Best this month' }}
        rows={[
          { name: 'Bedtime', value: 2312, format: (n) => `${Math.floor(n / 100)}:${String(n % 100).padStart(2, '0')}` },
          { name: 'Wake up', value: 641, format: (n) => `0${Math.floor(n / 100)}:${String(n % 100).padStart(2, '0')}` },
          { name: 'Resting HRV', value: 64, unit: 'ms' },
        ]}
      />
    </article>
  )
}

function BodyCard({ data, delay }) {
  const metrics = [
    { name: 'Weight', value: data.weight, unit: 'kg', fill: 0.62, color: '#7b6cf0', delta: '−0.5 kg' },
    { name: 'Body fat', value: data.fat, unit: '%', fill: data.fat / 35, color: '#f25f7c', delta: '−0.6%' },
    { name: 'Muscle mass', value: data.muscle, unit: 'kg', fill: 0.71, color: '#2bb45e', delta: '+0.4 kg' },
  ]
  return (
    <article className="card fr-card">
      <div className="fr-head">
        <h2 className="sr-title">Body</h2>
        <span className="fr-badge">8-week trend</span>
      </div>
      <svg className="weight-spark" viewBox="0 0 300 90" preserveAspectRatio="none" aria-label="Weight over eight weeks">
        <path className="area-line purple-line" pathLength="1" d={openSpline([[0, 20], [42, 26], [85, 24], [128, 38], [171, 44], [214, 52], [257, 58], [300, 66]])} />
      </svg>
      <div className="body-metrics">
        {metrics.map((m, i) => (
          <div key={m.name} className="body-metric">
            <div className="bm-head">
              <span>{m.name}</span>
              <b>
                <Odometer className="mono" value={m.value} format={kg} delay={delay + i * 60} />
                <span className="unit">{m.unit}</span>
              </b>
            </div>
            <div className="track">
              <span style={{ width: `${m.fill * 100}%`, background: m.color }} />
            </div>
            <span className="bm-delta">{m.delta} this month</span>
          </div>
        ))}
      </div>
      <ul className="sr-rows">
        <li><span>BMI</span><span className="mono">22.8</span></li>
        <li><span>Resting metabolic rate</span><span className="mono">1,640 kcal</span></li>
        <li><span>Visceral fat</span><span className="mono">6 / 12</span></li>
        <li><span>Hydration</span><span className="mono">2.4 L/day</span></li>
        <li><span>Protein</span><span className="mono">128 g/day</span></li>
      </ul>
    </article>
  )
}

export function SalesPage({ intro, live }) {
  const root = useRef(null)
  const [ready, setReady] = useState(!intro)
  const [range, setRange] = useState(0)
  const index = useLiveIndex(snapshots.length, live && ready, 3400)
  const shape = (index + range) % snapshots.length
  const data = snapshots[shape]

  useLayoutEffect(() => {
    if (!intro) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: () => setReady(true) })
        .from('.anim-rise', { y: 14, opacity: 0, duration: 0.6 }, 0.05)
        .from('.fr-card', { y: 40, opacity: 0, stagger: 0.1, duration: 0.8 }, 0.1)
        .from('.radar', { scale: 0.7, opacity: 0, rotate: -30, transformOrigin: '50% 50%', duration: 1.1, ease: 'expo.out' }, 0.3)
        .from('.area-line', { strokeDashoffset: 1, duration: 1.3, stagger: 0.15, ease: 'power2.inOut' }, 0.4)
        .from('.sleep-stack', { scaleY: 0, transformOrigin: 'bottom', stagger: 0.05, duration: 0.7 }, 0.5)
        .from('.track > span', { scaleX: 0, transformOrigin: 'left', stagger: 0.08, duration: 0.8 }, 0.6)
        .from('.sr-rows li', { y: 10, opacity: 0, stagger: 0.03, duration: 0.4 }, 0.6)
    }, root)
    return () => ctx.revert()
  }, [intro])

  const delay = intro && !ready ? 300 : 0
  return (
    <div className="page report-page" ref={root}>
      <PageHeader eyebrow="Weekly report · 22–28 June" title="Fitness report">
        <Segmented options={['Week', 'Month', 'Year']} value={range} onChange={setRange} />
      </PageHeader>
      <div className="fr-grid">
        <ProfileCard data={data} shape={shape} delay={delay} />
        <HeartCard data={data} shape={shape} delay={delay + 100} />
        <SleepCard data={data} delay={delay + 150} />
        <BodyCard data={data} delay={delay + 200} />
      </div>
    </div>
  )
}
