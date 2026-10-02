import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Card, T } from '../ui/prim.jsx'
import { Glyph } from '../ui/icons.jsx'

const G = { cx: 334.0, cy: 214.2, r: 57.5, w: 17.2, inner: 41.1 }
const ANGLE = 63.4

function arc(cx, cy, r, a0, a1) {
  const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy - r * Math.sin((a0 * Math.PI) / 180)]
  const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy - r * Math.sin((a1 * Math.PI) / 180)]
  const large = Math.abs(a0 - a1) > 180 ? 1 : 0
  return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${r} ${r} 0 ${large} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`
}

export function needlePath(cx, cy) {
  const half = 10
  const tip = 34.9
  const t = 1.9
  return `M${cx} ${cy - half}L${cx + tip} ${cy - t}A${t} ${t} 0 0 1 ${cx + tip} ${cy + t}L${cx} ${cy + half}Z`
}

export function CaloriesCard() {
  return (
    <Card x={252.9} y={83.8} w={169.2} h={221.5} className="stat stat-cal" data-s="stat">
      <Glyph n="flame" className="stat-icon" />
      <T x={293.2} b={113.6} s={14} w={500} c="var(--ink2)" data-s="stat-title">
        Calories
      </T>
      <svg className="chart gauge" viewBox="252.9 83.8 169.2 221.5" data-s="gauge">
        <path d={arc(G.cx, G.cy, G.r, 180, 0)} className="gauge-track" strokeWidth={G.w} />
        <path d={arc(G.cx, G.cy, G.r, 180, 0)} className="gauge-fill" strokeWidth={G.w} pathLength="1" data-s="gauge-fill" style={{ strokeDasharray: `${(180 - ANGLE) / 180} 2` }} />
        <path d={arc(G.cx, G.cy, G.inner, 180, 0)} className="gauge-inner" pathLength="1" data-s="gauge-inner" />
        <g className="needle" data-s="needle" transform={`rotate(${-ANGLE} ${G.cx} ${G.cy})`}>
          <path d={needlePath(G.cx, G.cy)} />
          <circle cx={G.cx} cy={G.cy} r="10" />
          <circle cx={G.cx} cy={G.cy} r="5" className="needle-hole" />
        </g>
      </svg>
      <T x={268.9} b={267.8} s={20} w={600} c="var(--ink2)" data-s="stat-value">
        <span className="num" data-count="520">520</span>
        <span className="unit"> kcal</span>
      </T>
      <T x={269.5} b={287.0} s={10} c="var(--gray)" data-s="stat-sub">
        Remaining:
      </T>
      <T x={325.0} b={287.0} s={10} w={500} c="var(--ink2)" data-s="stat-sub">
        480 kcal
      </T>
    </Card>
  )
}

const ECG = [
  [454.2, 196.2], [464.5, 196.2], [473.9, 147.2], [482.8, 217.5], [491.0, 196.2], [508.2, 196.2], [517.6, 147.2], [526.6, 217.5],
  [535.2, 196.2], [552.3, 196.2], [561.3, 147.2], [570.3, 217.5], [578.9, 196.2], [588.3, 196.2],
]

export function HeartCard() {
  const [bpm, setBpm] = useState(110)
  const pulse = useRef(null)
  useEffect(() => {
    const seq = [110, 111, 112, 111, 110, 109, 110, 112, 113, 111]
    let i = 0
    const id = setInterval(() => {
      if (document.documentElement.dataset.film) return
      i = (i + 1) % seq.length
      setBpm(seq[i])
    }, 2600)
    return () => clearInterval(id)
  }, [])
  const d = ECG.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('')
  return (
    <Card x={437.2} y={83.8} w={169.2} h={221.5} className="stat stat-heart" data-s="stat">
      <Glyph n="heart" className="stat-icon" />
      <T x={478.5} b={113.6} s={14} w={500} c="var(--ink2)" data-s="stat-title">
        Heart Rate
      </T>
      <svg className="chart ecg" viewBox="437.2 83.8 169.2 221.5" data-s="ecg">
        <defs>
          <linearGradient id="ecg-sweep" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FFEE72" stopOpacity="0" />
            <stop offset="0.75" stopColor="#FFEE72" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFF7C2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={d} className="ecg-line" pathLength="1" data-s="ecg-line" />
        <path d={d} className="ecg-pulse" pathLength="1" ref={pulse} data-s="ecg-pulse" />
      </svg>
      <T x={453.7} b={267.8} s={20} w={600} c="var(--ink2)" data-s="stat-value">
        <span className="num">{bpm}</span>
        <span className="unit"> bpm</span>
      </T>
      <T x={453.5} b={287.0} s={10} c="var(--gray)" data-s="stat-sub">
        Yesterday:
      </T>
      <T x={506.6} b={287.0} s={10} w={500} c="var(--ink2)" data-s="stat-sub">
        108 bpm
      </T>
    </Card>
  )
}

const STEP_POINTS = [
  [636.8, 180.6], [643.8, 178.7], [663.4, 188.2], [685.5, 166.3], [705.6, 186.7], [728.5, 149.8], [749.6, 171.0], [770.5, 162.2], [776.4, 163.6],
]
const DAYS = [7, 8, 9, 10, 11, 12, 13]
const GRID_X = [642.9, 664.1, 685.4, 706.6, 727.6, 749.1, 770.3]
const STEP_VALUES = [8240, 6120, 9510, 6880, 11380, 7900, 1050]

export function stepsPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const k = (x1 - x0) * 0.5
    d += `C${(x0 + k).toFixed(2)} ${y0}, ${(x1 - k).toFixed(2)} ${y1}, ${x1} ${y1}`
  }
  return d
}

export function StepsCard() {
  const [hover, setHover] = useState(null)
  const path = useRef(null)
  const dot = useRef(null)
  const d = stepsPath(STEP_POINTS)
  const pick = (i) => {
    setHover(i)
    const el = path.current
    if (!el || !dot.current) return
    const x = GRID_X[i]
    let lo = 0
    let hi = el.getTotalLength()
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2
      if (el.getPointAtLength(mid).x < x) lo = mid
      else hi = mid
    }
    const p = el.getPointAtLength(lo)
    gsap.to(dot.current, { attr: { cx: p.x, cy: p.y }, duration: 0.55, ease: 'expo.out' })
  }
  const leave = () => {
    setHover(null)
    gsap.to(dot.current, { attr: { cx: 749.6, cy: 171.0 }, duration: 0.7, ease: 'expo.out' })
  }
  return (
    <Card x={621.9} y={83.8} w={169.2} h={221.5} className="stat stat-steps" data-s="stat">
      <Glyph n="steps" className="stat-icon" />
      <T x={662.6} b={113.6} s={14} w={500} c="var(--ink2)" data-s="stat-title">
        Steps
      </T>
      <svg className="chart steps" viewBox="621.9 83.8 169.2 221.5" data-s="steps" onMouseLeave={leave}>
        {GRID_X.map((x, i) => (
          <line key={x} x1={x} x2={x} y1={141.6} y2={214.2} className="steps-grid" data-s="steps-grid" style={{ '--i': i }} />
        ))}
        <path d={d} ref={path} className="steps-line" pathLength="1" data-s="steps-line" />
        <circle ref={dot} cx={749.6} cy={171.0} r={4.1} className="steps-dot" data-s="steps-dot" />
        {DAYS.map((day, i) => (
          <text key={day} x={GRID_X[i]} y={226.2} className={`steps-day ${hover === i ? 'is-on' : ''}`} data-s="steps-day">
            {day}
          </text>
        ))}
        {GRID_X.map((x, i) => (
          <rect key={`h${x}`} x={x - 10.6} y={136} width={21.2} height={96} className="hit" onMouseEnter={() => pick(i)} />
        ))}
      </svg>
      {hover != null ? (
        <div className="steps-tip" style={{ left: GRID_X[hover] - 621.9 - 30, top: 34 }}>
          <b>{STEP_VALUES[hover].toLocaleString('en-US')}</b> steps
        </div>
      ) : null}
      <T x={637.9} b={267.8} s={20} w={600} c="var(--ink2)" data-s="stat-value">
        <span className="num" data-count="1.050">1.050</span>
        <span className="unit"> steps</span>
      </T>
      <T x={638.1} b={287.0} s={10} c="var(--gray)" data-s="stat-sub">
        Yesterday:
      </T>
      <T x={691.2} b={287.0} s={10} w={500} c="var(--ink2)" data-s="stat-sub">
        978 steps
      </T>
    </Card>
  )
}
