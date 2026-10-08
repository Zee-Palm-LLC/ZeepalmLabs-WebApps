import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DAYS, MEDS, SLEEP, USER, VITALS } from '../lib/data.js'
import { Icon } from '../ui/icons.jsx'
import './pages.css'

function Ring({ value, max, color, size = 120, label, sub }) {
  const r = (size - 14) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0ef" strokeWidth="12" />
        <circle className="ring-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} style={{ '--off': c * (1 - value / max), '--c': c }} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in">
        <b>{label}</b>
        <small>{sub}</small>
      </div>
    </div>
  )
}

export default function Dashboard({ onAsk }) {
  const root = useRef(null)
  useEffect(() => {
    gsap.fromTo(root.current.querySelectorAll('.tile'), { opacity: 0, y: 24, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.06, ease: 'power3.out', clearProps: 'all' })
  }, [])
  const steps = VITALS.steps.series
  const maxSteps = Math.max(...steps, VITALS.steps.goal)
  const taken = MEDS.filter((m) => m.taken).length
  return (
    <div className="page" ref={root}>
      <div className="page-head">
        <div>
          <h1>Good morning, {USER.name.split(' ')[0]}</h1>
          <p>Here’s how your body is doing this week.</p>
        </div>
        <button className="btn-mint" onClick={() => onAsk('Start my daily check-in')}>
          <Icon name="checkin" size={16} /> Start check-in
        </button>
      </div>
      <div className="dash">
        <section className="tile t-score">
          <Ring value={86} max={100} color="#28f6ae" size={150} label="86" sub="Health score" />
          <div>
            <h2>You’re on track</h2>
            <p>Blood pressure is trending down, sleep is steady and you hit your step goal 4 of 7 days.</p>
            <button className="link" onClick={() => onAsk('Show my vitals for this week')}>
              Ask Sana why <Icon name="sparkles" size={14} />
            </button>
          </div>
        </section>
        {[
          { k: 'heart', i: 'heart', t: 'Resting HR', v: `${VITALS.heart.now}`, u: 'bpm', c: VITALS.heart.tone },
          { k: 'bp', i: 'vitals', t: 'Blood pressure', v: VITALS.bp.now, u: 'mmHg', c: VITALS.bp.tone },
          { k: 'spo2', i: 'breath', t: 'Blood oxygen', v: `${VITALS.spo2.now}`, u: '%', c: VITALS.spo2.tone },
        ].map((x) => (
          <section key={x.k} className="tile t-vital">
            <span className="tv-ic" style={{ color: x.c, background: `color-mix(in srgb, ${x.c} 12%, #fff)` }}>
              <Icon name={x.i} size={18} />
            </span>
            <small>{x.t}</small>
            <b>
              {x.v} <i>{x.u}</i>
            </b>
          </section>
        ))}
        <section className="tile t-steps">
          <div className="tile-h">
            <h3>Activity</h3>
            <span>Goal {VITALS.steps.goal.toLocaleString()} steps</span>
          </div>
          <div className="bars">
            {steps.map((s, i) => (
              <div key={i} className="bar-col">
                <span className={s >= VITALS.steps.goal ? 'hit' : ''} style={{ height: `${(s / maxSteps) * 100}%`, '--d': `${i * 0.05}s` }} />
                <small>{DAYS[i]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="tile t-meds">
          <div className="tile-h">
            <h3>Medications</h3>
            <span>
              {taken}/{MEDS.length} today
            </span>
          </div>
          <Ring value={taken} max={MEDS.length} color="#3b82f6" size={104} label={`${Math.round((taken / MEDS.length) * 100)}%`} sub="taken" />
          <ul>
            {MEDS.map((m) => (
              <li key={m.id}>
                <i className={m.taken ? 'on' : ''} /> {m.name} <small>{m.time}</small>
              </li>
            ))}
          </ul>
        </section>
        <section className="tile t-sleep">
          <div className="tile-h">
            <h3>Sleep</h3>
            <span>avg {SLEEP.avg}</span>
          </div>
          <div className="mini-sleep">
            {SLEEP.nights.map((n, i) => (
              <span key={i} style={{ height: `${(n / 9) * 100}%`, '--d': `${i * 0.05}s` }} />
            ))}
          </div>
        </section>
        <section className="tile t-appt">
          <div className="tile-h">
            <h3>Next visit</h3>
            <span>Family medicine</span>
          </div>
          <div className="appt">
            <span className="appt-date">
              <b>14</b>
              <small>Oct</small>
            </span>
            <div>
              <b>Dr. Mia Chen</b>
              <small>Blood pressure follow-up · 09:15</small>
            </div>
          </div>
          <button className="btn-soft" onClick={() => onAsk('Book a visit with a doctor')}>
            <Icon name="book" size={15} /> Reschedule
          </button>
        </section>
      </div>
    </div>
  )
}
