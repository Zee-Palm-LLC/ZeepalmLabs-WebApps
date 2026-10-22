import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Avatar } from '../components/Avatar.jsx'
import { Odometer } from '../components/Odometer.jsx'
import { PageHeader } from '../layout/Shell.jsx'
import { useLiveIndex } from './useLive.js'

const DAY0 = 5
const DAYS = 26
// Position on the timeline as a percentage, so the chart stretches.
const pct = (day) => ((day - DAY0) / DAYS) * 100
const two = (n) => String(n).padStart(2, '0')

// The today marker and progress step forward on each live tick.
const ticks = [
  { today: 8, baseDone: 4, hyperDone: 22, baseTo: 10, hyperTo: 21.4, completed: 186 },
  { today: 9, baseDone: 4, hyperDone: 23, baseTo: 10, hyperTo: 21.8, completed: 191 },
  { today: 10, baseDone: 5, hyperDone: 24, baseTo: 11, hyperTo: 22.3, completed: 197 },
  { today: 11, baseDone: 5, hyperDone: 25, baseTo: 11, hyperTo: 22.8, completed: 204 },
]

const ic = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const icons = {
  attach: (
    <svg viewBox="0 0 24 24" {...ic} strokeWidth="2">
      <path d="M15.5 7.5l-6.8 6.8a2 2 0 102.8 2.8l7-7a4 4 0 10-5.7-5.6l-7.2 7.2a6 6 0 108.5 8.5l5.6-5.6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" {...ic} strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
    </svg>
  ),
  run: (
    <svg viewBox="0 0 24 24" {...ic}>
      <circle cx="14.5" cy="4.8" r="1.8" />
      <path d="M7 21l3.5-5.5 3 2.5V22M9 11l2.5-3.5 4 2 2 3.5M11.5 7.5l-2 6.5" />
    </svg>
  ),
  dumbbell: (
    <svg viewBox="0 0 24 24" {...ic}>
      <path d="M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" {...ic}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-12 14H5zM5 19l7-7" />
    </svg>
  ),
}

function Task({ from, to, extTo, top, tone, label, children }) {
  return (
    <div className={`task tone-${tone}`} style={{ top }}>
      {extTo != null && (
        <div className="task-ext" style={{ left: `${pct(from)}%`, width: `${pct(extTo) - pct(from)}%` }}>
          {children}
        </div>
      )}
      <div className="task-bar" style={{ left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` }}>
        <span>{label}</span>
      </div>
    </div>
  )
}

function Meta({ attach, done, total, avatars, tone }) {
  return (
    <span className={`task-meta tone-${tone}`}>
      {attach != null && (
        <span className="tm">
          {icons.attach}
          {attach}
        </span>
      )}
      {done != null && (
        <span className="tm">
          {icons.check}
          <span className="tm-count">
            <Odometer value={done} />/{total}
          </span>
        </span>
      )}
      <span className="tm-avatars">
        {avatars.map((s, i) => (
          <Avatar key={i} seed={s} size={24} style={{ marginLeft: i ? -8 : 0 }} />
        ))}
      </span>
    </span>
  )
}

function Squad({ icon, name, count, children }) {
  return (
    <div className="g-row">
      <div className="g-label">
        <span className="g-icon">{icon}</span>
        <b>{name}</b>
        <span>{count} athletes</span>
      </div>
      <div className="g-lane">{children}</div>
    </div>
  )
}

export function RoadmapPage({ intro, live }) {
  const root = useRef(null)
  const [ready, setReady] = useState(!intro)
  const index = useLiveIndex(ticks.length, live && ready, 3200)
  const t = ticks[index]

  useLayoutEffect(() => {
    if (!intro) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: () => setReady(true) })
        .from('.anim-rise', { y: 14, opacity: 0, stagger: 0.05, duration: 0.6 }, 0.05)
        .from('.rm-kpis > *', { y: 14, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.15)
        .from('.g-days span', { y: 8, opacity: 0, stagger: 0.012, duration: 0.4 }, 0.3)
        .from('.g-label', { x: -16, opacity: 0, stagger: 0.1, duration: 0.6 }, 0.35)
        .from('.task-bar', { clipPath: 'inset(0 100% 0 0 round 8px)', stagger: 0.07, duration: 0.9, ease: 'expo.out' }, 0.5)
        .from('.task-ext', { clipPath: 'inset(0 100% 0 0)', stagger: 0.07, duration: 0.9, ease: 'power2.out' }, 0.7)
        .from('.g-today', { scaleY: 0, transformOrigin: 'top', duration: 0.8 }, 0.6)
        .from('.avatar-face', { scale: 0, stagger: 0.025, duration: 0.4, ease: 'back.out(2.5)' }, 0.95)
    }, root)
    return () => ctx.revert()
  }, [intro])

  const delay = intro && !ready ? 250 : 0

  return (
    <div className="page roadmap-page" ref={root}>
      <PageHeader eyebrow="Wednesday, 24 June" title="Training plan · June 2026">
        <span className="rm-show">
          <b>Show:</b> All squads
        </span>
        <span className="rm-avatars">
          <Avatar seed={2} size={30} />
          <Avatar seed={3} size={30} style={{ marginLeft: -9 }} />
          <Avatar seed={0} size={30} style={{ marginLeft: -9 }} />
        </span>
        <button className="rm-add"><span>+</span> Add athlete</button>
        <button className="rm-btn">Save</button>
        <button className="rm-btn">Share</button>
      </PageHeader>

      <div className="rm-kpis">
        <div className="kpi">
          <b><Odometer value={248} delay={delay} /></b>
          <span>Sessions planned</span>
        </div>
        <div className="kpi">
          <b><Odometer value={t.completed} delay={delay + 60} /></b>
          <span>Sessions completed</span>
        </div>
        <div className="kpi">
          <b><Odometer value={42} delay={delay + 120} /></b>
          <span>Athletes on plan</span>
        </div>
        <div className="kpi">
          <b>28 Jun</b>
          <span>Next race · City 10K</span>
        </div>
      </div>

      <div className="gantt-scroll">
        <div className="gantt">
          <div className="g-head">
            <div className="g-corner">Squad</div>
            <div className="g-days">
              {Array.from({ length: DAYS }, (_, i) => DAY0 + i).map((d) => (
                <span key={d} className={d === t.today ? 'is-today' : ''}>
                  {two(d)}
                </span>
              ))}
            </div>
          </div>
          <div className="g-body">
            <div className="g-grid" />
            <div className="g-today-track">
              <div className="g-today" style={{ left: `${pct(t.today + 0.5)}%` }} />
            </div>

            <Squad icon={icons.run} name="Endurance squad" count={14}>
              <Task top={16} from={4.5} to={t.baseTo} extTo={16.6} tone="purple" label="Base building">
                <Meta attach={13} done={t.baseDone} total={5} avatars={[4, 1, 2]} tone="purple" />
              </Task>
              <Task top={80} from={8.7} to={17} tone="grey" label="Long run clinic" />
              <Task top={124} from={5} to={8.2} tone="grey" label="Track session" />
              <Task top={124} from={23} to={28.5} tone="grey" label="Race week taper" />
              <Task top={16} from={17.5} to={22.2} extTo={28.4} tone="orange" label="Tempo block">
                <Meta attach={13} avatars={[0, 3]} tone="orange" />
              </Task>
            </Squad>

            <Squad icon={icons.dumbbell} name="Strength squad" count={16}>
              <Task top={16} from={4.5} to={t.hyperTo} extTo={29.4} tone="red" label="Hypertrophy block">
                <Meta attach={83} done={t.hyperDone} total={28} avatars={[5, 1, 3]} tone="red" />
              </Task>
              <Task top={80} from={4.5} to={10.8} tone="grey" label="Form check" />
              <Task top={80} from={12.6} to={20.8} tone="grey" label="Deload week" />
              <Task top={124} from={9} to={14} tone="grey" label="Mobility primer" />
              <Task top={124} from={22} to={27} tone="grey" label="1RM testing" />
            </Squad>

            <Squad icon={icons.leaf} name="Recovery & nutrition" count={12}>
              <Task top={16} from={11} to={18} extTo={25.5} tone="blue" label="Mobility program">
                <Meta attach={21} done={9} total={14} avatars={[2, 4]} tone="blue" />
              </Task>
              <Task top={80} from={5.5} to={11.5} tone="grey" label="Meal prep workshop" />
              <Task top={80} from={15.5} to={22} tone="grey" label="Sleep coaching" />
              <Task top={124} from={6} to={9.5} tone="grey" label="Sports massage" />
              <Task top={124} from={18} to={24} tone="grey" label="Recovery check-ins" />
            </Squad>
          </div>
        </div>
      </div>
    </div>
  )
}
