import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LABS } from '../lib/data.js'
import { Icon } from '../ui/icons.jsx'
import './pages.css'

const HISTORY = {
  HbA1c: [5.7, 5.6, 5.5, 5.4],
  'LDL cholesterol': [156, 150, 147, 142],
  'HDL cholesterol': [47, 49, 50, 52],
  'Vitamin D': [16, 18, 19, 21],
  TSH: [2.4, 2.2, 2.0, 2.1],
}
const DATES = ['Jan', 'Apr', 'Jul', 'Oct']

function Trend({ data, color }) {
  const w = 220
  const h = 70
  const lo = Math.min(...data) * 0.97
  const hi = Math.max(...data) * 1.03
  const pts = data.map((v, i) => [12 + (i * (w - 24)) / (data.length - 1), h - 10 - ((v - lo) / (hi - lo)) * (h - 22)])
  return (
    <svg width="100%" height={h + 16} viewBox={`0 0 ${w} ${h + 16}`} aria-hidden="true">
      <path className="spark-line" pathLength="1" d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={h + 12} textAnchor="middle" fontSize="10" fill="#8a8a8a">
            {DATES[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function Labs({ onAsk }) {
  const [sel, setSel] = useState(LABS[1].name)
  const root = useRef(null)
  useEffect(() => {
    gsap.fromTo(root.current.querySelectorAll('.lab-row'), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'all' })
  }, [])
  const lab = LABS.find((l) => l.name === sel)
  const flag = (l) => (l.value < l.low ? 'low' : l.value > l.high ? 'high' : 'normal')
  return (
    <div className="page" ref={root}>
      <div className="page-head">
        <div>
          <h1>Lab results</h1>
          <p>Blood panel · Northside Lab · 2 Oct 2026</p>
        </div>
        <button className="btn-mint" onClick={() => onAsk('Explain my latest lab results')}>
          <Icon name="sparkles" size={16} /> Explain with Sana
        </button>
      </div>
      <div className="labs">
        <section className="tile lab-table">
          {LABS.map((l) => (
            <button key={l.name} className={`lab-row ${sel === l.name ? 'on' : ''}`} onClick={() => setSel(l.name)}>
              <span className="lr-name">{l.name}</span>
              <span className="lr-val">
                <b>{l.value}</b> {l.unit}
              </span>
              <span className="lr-range">
                {l.low}–{l.high}
              </span>
              <span className={`lb-flag ${flag(l)}`}>{flag(l) === 'normal' ? 'Normal' : flag(l) === 'high' ? 'High' : 'Low'}</span>
            </button>
          ))}
        </section>
        <section className="tile lab-detail" key={sel}>
          <div className="tile-h">
            <h3>{lab.name}</h3>
            <span>Last 4 tests</span>
          </div>
          <Trend data={HISTORY[lab.name]} color={flag(lab) === 'normal' ? '#1fd998' : '#f5a524'} />
          <p>{lab.note}</p>
          <button className="btn-soft" onClick={() => onAsk(lab.name.includes('LDL') ? 'How do I lower LDL?' : lab.name === 'Vitamin D' ? 'Should I take vitamin D?' : 'Explain my latest lab results')}>
            <Icon name="chat" size={15} /> Ask about {lab.name}
          </button>
        </section>
      </div>
    </div>
  )
}
