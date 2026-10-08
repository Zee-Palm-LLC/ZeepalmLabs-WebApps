import { useEffect, useState } from 'react'
import { CLINICS, DAYS, DOCTORS, LABS, MEDS, SLEEP, VITALS } from '../lib/data.js'
import { Icon } from '../ui/icons.jsx'

function Spark({ data, color, w = 132, h = 40, fill = true }) {
  const lo = Math.min(...data)
  const hi = Math.max(...data)
  const pad = 4
  const pts = data.map((v, i) => [pad + (i * (w - pad * 2)) / (data.length - 1), h - pad - ((v - lo) / (hi - lo || 1)) * (h - pad * 2)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const id = `sg${color.slice(1)}`
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L${pts.at(-1)[0]} ${h} L${pts[0][0]} ${h} Z`} fill={`url(#${id})`} />}
      <path className="spark-line" d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="3.2" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function Head({ icon, title, sub, tone = 'var(--mint-ink)' }) {
  return (
    <div className="cd-head">
      <span className="cd-ic" style={{ color: tone, background: `color-mix(in srgb, ${tone} 14%, #fff)` }}>
        <Icon name={icon} size={17} />
      </span>
      <div>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}

export function VitalsCard() {
  const v = VITALS
  const tiles = [
    { k: 'heart', icon: 'heart', value: v.heart.now, unit: 'bpm', label: 'Resting HR', series: v.heart.series, tone: v.heart.tone, trend: 'down', note: 'Normal' },
    { k: 'bp', icon: 'vitals', value: v.bp.now, unit: 'mmHg', label: 'Blood pressure', series: v.bp.sys, tone: v.bp.tone, trend: 'down', note: 'Slightly high' },
    { k: 'spo2', icon: 'breath', value: v.spo2.now, unit: '%', label: 'Blood oxygen', series: v.spo2.series, tone: v.spo2.tone, trend: 'flat', note: 'Normal' },
    { k: 'steps', icon: 'steps', value: v.steps.now, unit: 'steps', label: 'Activity', series: v.steps.series, tone: v.steps.tone, trend: 'up', note: '93% of goal' },
  ]
  return (
    <div className="card cd-vitals">
      <Head icon="health" title="This week’s vitals" sub="Synced from your watch and cuff · 7 days" />
      <div className="vt-grid">
        {tiles.map((t) => (
          <div className="vt" key={t.k}>
            <div className="vt-top">
              <span style={{ color: t.tone }}>
                <Icon name={t.icon} size={15} />
              </span>
              {t.label}
            </div>
            <div className="vt-val">
              <b>{t.value}</b> <small>{t.unit}</small>
            </div>
            <Spark data={t.series} color={t.tone} />
            <div className={`vt-note ${t.note === 'Slightly high' ? 'warn' : ''}`}>
              <Icon name={t.trend === 'up' ? 'up' : t.trend === 'down' ? 'down' : 'minus'} size={13} /> {t.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LabsCard() {
  return (
    <div className="card cd-labs">
      <Head icon="labs" title="Blood panel · 2 Oct" sub="Northside Lab · 5 markers" tone="#6366f1" />
      <ul className="lb-list">
        {LABS.map((l, i) => {
          const pos = (x) => ((x - l.min) / (l.max - l.min)) * 100
          const flag = l.value < l.low ? 'Low' : l.value > l.high ? 'High' : 'Normal'
          return (
            <li key={l.name} style={{ '--d': `${i * 0.08}s` }}>
              <div className="lb-row">
                <span className="lb-name">{l.name}</span>
                <span className="lb-val">
                  <b>{l.value}</b> {l.unit}
                </span>
                <span className={`lb-flag ${flag.toLowerCase()}`}>{flag}</span>
              </div>
              <div className="lb-bar">
                <span className="lb-ok" style={{ left: `${pos(Math.max(l.low, l.min))}%`, width: `${pos(Math.min(l.high, l.max)) - pos(Math.max(l.low, l.min))}%` }} />
                <span className={`lb-dot ${flag.toLowerCase()}`} style={{ left: `${pos(l.value)}%` }} />
              </div>
              <p>{l.note}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MedsCard() {
  const [meds, setMeds] = useState(MEDS)
  const done = meds.filter((m) => m.taken).length
  return (
    <div className="card cd-meds">
      <Head icon="meds" title="Today’s medications" sub={`${done} of ${meds.length} taken`} tone="#3b82f6" />
      <div className="md-bar">
        <span style={{ width: `${(done / meds.length) * 100}%` }} />
      </div>
      <ul className="md-list">
        {meds.map((m) => (
          <li key={m.id}>
            <button className={`md-item ${m.taken ? 'on' : ''}`} onClick={() => setMeds((all) => all.map((x) => (x.id === m.id ? { ...x, taken: !x.taken } : x)))} aria-pressed={m.taken}>
              <span className="md-check">{m.taken && <Icon name="check" size={14} stroke={2.6} />}</span>
              <span className="md-main">
                <b>
                  {m.name} <i>{m.dose}</i>
                </b>
                <small>{m.why}</small>
              </span>
              <span className="md-time">
                <Icon name="clock" size={13} /> {m.time}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SlotsCard({ onBook }) {
  const [pick, setPick] = useState(null)
  const [booked, setBooked] = useState(null)
  if (booked)
    return (
      <div className="card cd-booked">
        <Head icon="book" title="Appointment confirmed" sub={`${booked.doc.name} · ${booked.doc.role}`} />
        <div className="bk-when">
          <Icon name="clock" size={16} /> {booked.slot} · Video or in person at GreenLeaf Clinic
        </div>
        <p className="bk-note">Added to your calendar. I’ll remind you 1 hour before and share your latest vitals with the doctor.</p>
      </div>
    )
  return (
    <div className="card cd-slots">
      <Head icon="doctor" title="Available doctors" sub="In network · covered by your plan" />
      <ul className="sl-list">
        {DOCTORS.map((d) => (
          <li key={d.id} className="sl-doc">
            <span className="sl-av" style={{ background: `color-mix(in srgb, ${d.tone} 22%, #fff)`, color: `color-mix(in srgb, ${d.tone} 70%, #000)` }}>
              {d.name
                .replace('Dr. ', '')
                .split(' ')
                .map((x) => x[0])
                .join('')}
            </span>
            <div className="sl-info">
              <b>{d.name}</b>
              <small>
                {d.role} · <Icon name="star" size={11} /> {d.rating}
              </small>
            </div>
            <div className="sl-times">
              {d.slots.map((s) => (
                <button key={s} className={`sl-t ${pick?.slot === s && pick?.doc.id === d.id ? 'on' : ''}`} onClick={() => setPick({ doc: d, slot: s })}>
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="sl-foot">
        <span>{pick ? `${pick.doc.name} · ${pick.slot}` : 'Choose a time'}</span>
        <button
          className="btn-mint"
          disabled={!pick}
          onClick={() => {
            setBooked(pick)
            onBook?.(pick)
          }}
        >
          Book visit
        </button>
      </div>
    </div>
  )
}

export function ClinicsCard() {
  return (
    <div className="card cd-clinics">
      <Head icon="pin" title="Care near you" sub="Based on your location · Brooklyn, NY" tone="#0ea5e9" />
      <ul className="cl-list">
        {CLINICS.map((c) => (
          <li key={c.name}>
            <span className={`cl-dot ${c.open ? 'open' : ''}`} />
            <div>
              <b>{c.name}</b>
              <small>
                {c.kind} · {c.dist}
              </small>
            </div>
            <span className="cl-wait">{c.wait}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TriageCard({ b }) {
  const meta = {
    self: { t: 'Self-care at home', c: '#16a34a', i: 'shield' },
    gp: { t: 'See a doctor in 1–3 days', c: '#d97706', i: 'doctor' },
    urgent: { t: 'Get care today', c: '#dc2626', i: 'siren' },
  }[b.level]
  return (
    <div className="card cd-triage" style={{ '--tone': meta.c }}>
      <div className="tr-level">
        <Icon name={meta.i} size={18} />
        <b>{meta.t}</b>
        <span className="tr-meter">
          {['self', 'gp', 'urgent'].map((k) => (
            <i key={k} className={k === b.level ? 'on' : ''} />
          ))}
        </span>
      </div>
      <div className="tr-facts">
        <span>{b.label}</span>
        <span>{b.duration}</span>
        <span>{b.severity}</span>
      </div>
      <ul className="tr-tips">
        {b.tips.map((t) => (
          <li key={t}>
            <Icon name="check" size={14} stroke={2.4} /> {t}
          </li>
        ))}
      </ul>
      <p className="tr-warn">
        <Icon name="siren" size={14} /> Get help right away if you have trouble breathing, chest pain, confusion, a stiff neck with fever, or symptoms that suddenly get worse.
      </p>
    </div>
  )
}

export function EmergencyCard({ b }) {
  return (
    <div className="card cd-emergency">
      <div className="em-top">
        <span className="em-pulse">
          <Icon name="siren" size={20} />
        </span>
        <div>
          <b>{b.mind ? 'Support is available right now' : 'This may be a medical emergency'}</b>
          <small>{b.mind ? 'Free, confidential, 24/7' : 'Call emergency services or go to the nearest ER'}</small>
        </div>
      </div>
      <div className="em-actions">
        {b.mind ? (
          <>
            <a className="em-btn" href="tel:988">
              <Icon name="phone" size={16} /> Call or text 988
            </a>
            <a className="em-btn ghost" href="sms:741741">
              <Icon name="chat" size={16} /> Text HOME to 741741
            </a>
          </>
        ) : (
          <>
            <a className="em-btn" href="tel:911">
              <Icon name="phone" size={16} /> Call 911
            </a>
            <span className="em-btn ghost">
              <Icon name="pin" size={16} /> St. Mary ER · 2.4 mi
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export function SleepCard() {
  const max = 9
  return (
    <div className="card cd-sleep">
      <Head icon="sleep" title={`Sleep · avg ${SLEEP.avg}`} sub={`Sleep score ${SLEEP.score} · last 7 nights`} tone="#6366f1" />
      <div className="sp-bars">
        {SLEEP.nights.map((n, i) => (
          <div key={i} className="sp-col">
            <span className={`sp-bar ${n < 6.5 ? 'short' : ''}`} style={{ height: `${(n / max) * 100}%`, '--d': `${i * 0.05}s` }}>
              <em>{n.toFixed(1)}h</em>
            </span>
            <small>{DAYS[i]}</small>
          </div>
        ))}
        <span className="sp-goal" style={{ bottom: `${(7.5 / max) * 100}%` }}>
          7.5h goal
        </span>
      </div>
      <div className="sp-stages">
        {SLEEP.stages.map((s) => (
          <span key={s.k} style={{ flex: s.v, background: s.c }} title={`${s.k} ${s.v}%`} />
        ))}
      </div>
      <div className="sp-legend">
        {SLEEP.stages.map((s) => (
          <span key={s.k}>
            <i style={{ background: s.c }} /> {s.k} {s.v}%
          </span>
        ))}
      </div>
    </div>
  )
}

export function BreatheCard() {
  const [phase, setPhase] = useState(0)
  const [round, setRound] = useState(1)
  const [run, setRun] = useState(true)
  const PH = [
    { t: 'Breathe in', s: 4 },
    { t: 'Hold', s: 7 },
    { t: 'Breathe out', s: 8 },
  ]
  useEffect(() => {
    if (!run) return
    const id = setTimeout(() => {
      setPhase((p) => {
        if (p === 2) {
          setRound((r) => {
            if (r >= 3) setRun(false)
            return r >= 3 ? r : r + 1
          })
          return 0
        }
        return p + 1
      })
    }, PH[phase].s * 1000)
    return () => clearTimeout(id)
  }, [phase, run])
  return (
    <div className="card cd-breathe">
      <div className={`br-orb ph${phase} ${run ? '' : 'done'}`} style={{ '--s': `${PH[phase].s}s` }}>
        <span />
        <b>{run ? PH[phase].t : 'Nicely done'}</b>
      </div>
      <div className="br-side">
        <b>4-7-8 breathing</b>
        <small>{run ? `Round ${round} of 3` : '3 rounds complete'}</small>
        <button
          className="btn-soft"
          onClick={() => {
            setPhase(0)
            setRound(1)
            setRun(true)
          }}
        >
          <Icon name="retry" size={14} /> Restart
        </button>
      </div>
    </div>
  )
}

export function PlateCard() {
  const parts = [
    { k: 'Vegetables', v: 50, c: '#22c55e' },
    { k: 'Whole grains', v: 25, c: '#f59e0b' },
    { k: 'Lean protein', v: 25, c: '#ef4b5f' },
  ]
  let acc = 0
  const arcs = parts.map((p) => {
    const a0 = (acc / 100) * Math.PI * 2 - Math.PI / 2
    acc += p.v
    const a1 = (acc / 100) * Math.PI * 2 - Math.PI / 2
    const r = 46
    const large = p.v > 50 ? 1 : 0
    return { ...p, d: `M60 60 L${60 + r * Math.cos(a0)} ${60 + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${60 + r * Math.cos(a1)} ${60 + r * Math.sin(a1)} Z` }
  })
  return (
    <div className="card cd-plate">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#f6f6f6" />
        {arcs.map((a) => (
          <path key={a.k} d={a.d} fill={a.c} stroke="#fff" strokeWidth="3" />
        ))}
        <circle cx="60" cy="60" r="16" fill="#fff" />
      </svg>
      <div className="pl-side">
        {parts.map((p) => (
          <div key={p.k} className="pl-row">
            <i style={{ background: p.c }} />
            <b>{p.v}%</b> {p.k}
          </div>
        ))}
        <p>Water: 8 glasses · Salt under 5 g · Swap red meat for fish twice a week.</p>
      </div>
    </div>
  )
}

export function CheckinCard() {
  const items = [
    { i: 'heart', t: 'Resting HR', v: '64 bpm', ok: true },
    { i: 'vitals', t: 'Blood pressure', v: '128/82', ok: false },
    { i: 'sleep', t: 'Sleep', v: '7h 12m', ok: true },
    { i: 'meds', t: 'Medications', v: '1 of 3', ok: false },
  ]
  return (
    <div className="card cd-checkin">
      <Head icon="checkin" title="Daily check-in" sub="Thursday, 8 Oct" />
      <div className="ci-grid">
        {items.map((x) => (
          <div key={x.t} className={`ci ${x.ok ? 'ok' : 'warn'}`}>
            <Icon name={x.i} size={16} />
            <small>{x.t}</small>
            <b>{x.v}</b>
          </div>
        ))}
      </div>
      <div className="ci-mood">
        <span>How are you feeling?</span>
        {['😣', '😕', '🙂', '😄'].map((m) => (
          <button key={m} className="ci-face" aria-label={`Mood ${m}`}>
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ListCard({ items }) {
  return (
    <ol className="card cd-list">
      {items.map((t, i) => (
        <li key={t} style={{ '--d': `${i * 0.06}s` }}>
          <span>{i + 1}</span>
          {t}
        </li>
      ))}
    </ol>
  )
}

export function DoneCard({ label }) {
  return (
    <div className="card cd-done">
      <span className="dn-ic">
        <Icon name="check" size={16} stroke={2.6} />
      </span>
      {label}
    </div>
  )
}

export function ContactCard() {
  return (
    <div className="card cd-contact">
      <Head icon="doctor" title="Nurse line · 24/7" sub="Average wait under 3 minutes" />
      <div className="em-actions">
        <a className="em-btn mint" href="tel:18005550199">
          <Icon name="phone" size={16} /> Call a nurse
        </a>
        <span className="em-btn ghost">
          <Icon name="chat" size={16} /> Start chat
        </span>
      </div>
    </div>
  )
}

export function Block({ b, onBook }) {
  switch (b.type) {
    case 'vitals':
      return <VitalsCard />
    case 'labs':
      return <LabsCard />
    case 'meds':
      return <MedsCard />
    case 'slots':
      return <SlotsCard onBook={onBook} />
    case 'clinics':
      return <ClinicsCard />
    case 'triage':
      return <TriageCard b={b} />
    case 'emergency':
      return <EmergencyCard b={b} />
    case 'sleep':
      return <SleepCard />
    case 'breathe':
      return <BreatheCard />
    case 'plate':
      return <PlateCard />
    case 'checkin':
      return <CheckinCard />
    case 'list':
      return <ListCard items={b.items} />
    case 'done':
      return <DoneCard label={b.label} />
    case 'contact':
      return <ContactCard />
    default:
      return null
  }
}
