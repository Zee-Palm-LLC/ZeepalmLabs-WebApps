import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Odometer } from '../components/Odometer.jsx'
import { FitBox } from '../components/FitBox.jsx'
import { PageHeader, Segmented } from '../layout/Shell.jsx'
import { useLiveIndex } from './useLive.js'

const fmt = (n) => n.toLocaleString('en-US')
const pace = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const snapshots = [
  { athletes: 75413, completion: 86, pace: 312, enrolled: 438, enrolledFill: 0.72, prs: 546, calories: 12875, minutes: 4312, sessions: 1287 },
  { athletes: 75896, completion: 88, pace: 306, enrolled: 514, enrolledFill: 0.84, prs: 612, calories: 13420, minutes: 4598, sessions: 1342 },
]

// Diagram stage, in design pixels.
const STAGE_W = 830
const STAGE_H = 650
const L1_X = 314
const L2_X = 622
const NODE_W = 196
const H1 = 60
const H2 = 63
const ROOT_PORT = [209, 328]

const level1 = [
  { id: 'cardio', title: 'Cardio base', sub: 'Endurance', tone: 'green', top: 122 },
  { id: 'strength', title: 'Strength block', sub: 'Strength', tone: 'blue', top: 208 },
  { id: 'mobility', title: 'Mobility', sub: 'Recovery', tone: 'plain', top: 298 },
  { id: 'rest', title: 'Rest days', sub: 'Recovery', tone: 'muted', top: 386 },
  { id: 'nutrition', title: 'Nutrition plan', sub: 'Diet', tone: 'red', top: 473 },
]

const level2 = [
  { id: 'easy', title: 'Easy runs', sub: 'Zone 2', tone: 'plain', top: 8, from: 'cardio' },
  { id: 'intervals', title: 'Intervals', sub: 'Speed', tone: 'plain', top: 104, from: 'cardio' },
  { id: 'long', title: 'Long run', sub: 'Endurance', tone: 'plain', top: 200, from: 'cardio' },
  { id: 'yoga', title: 'Yoga flow', sub: 'Recovery', tone: 'plain', top: 298, from: 'mobility' },
  { id: 'meal', title: 'Meal prep', sub: 'Diet', tone: 'red', top: 389, from: 'nutrition' },
  { id: 'protein', title: 'Protein goals', sub: 'Diet', tone: 'green', top: 484, from: 'nutrition' },
  { id: 'hydration', title: 'Hydration', sub: 'Diet', tone: 'plain', top: 579, from: 'nutrition' },
]

const curve = (x1, y1, x2, y2) => {
  const dx = (x2 - x1) * 0.55
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
}

const edges = [
  ...level1.map((n) => ({ id: `p-${n.id}`, to: n.id, d: curve(...ROOT_PORT, L1_X, n.top + H1 / 2) })),
  ...level2.map((n) => {
    const parent = level1.find((p) => p.id === n.from)
    return { id: `${n.from}-${n.id}`, from: n.from, to: n.id, d: curve(L1_X + NODE_W, parent.top + H1 / 2, L2_X, n.top + H2 / 2) }
  }),
]

function Node({ node, level, x, h, active, onEnter, onLeave, onClick }) {
  return (
    <div className={`node-wrap l${level}`}>
      <button
        className={`node tone-${node.tone} ${active ? 'is-active' : ''}`}
        style={{ left: x, top: node.top, width: NODE_W, height: h }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onClick}
      >
        <span className="pin">+</span>
        <span className="node-title">{node.title}</span>
        <span className="node-sub">{node.sub}</span>
        <span className="node-more">···</span>
        <span className="port left" />
        <span className="port right" />
      </button>
    </div>
  )
}

function MiniLines() {
  return (
    <svg className="mini-lines" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path className="line purple" pathLength="1" d="M0,52 C20,50 30,30 52,24 C72,18 80,6 98,8 C116,10 124,30 140,36 C156,42 170,26 186,30 L200,34" />
      <path className="line orange" pathLength="1" d="M0,56 C18,46 30,14 50,14 C70,14 78,40 98,44 C118,48 128,24 146,22 C164,20 176,40 200,44" />
    </svg>
  )
}

function Delta({ value }) {
  return (
    <span className="delta up">
      <i />
      {value}
    </span>
  )
}

export function NetworkPage({ intro, live }) {
  const root = useRef(null)
  const [ready, setReady] = useState(!intro)
  const [tab, setTab] = useState(1)
  const [focus, setFocus] = useState(null)
  const [pinned, setPinned] = useState(null)
  const index = useLiveIndex(snapshots.length, live && ready, 3600)
  const data = snapshots[index]
  const lit = pinned ?? focus

  const litNodes = new Set()
  if (lit) {
    litNodes.add(lit)
    const n2 = level2.find((n) => n.id === lit)
    if (n2) litNodes.add(n2.from)
  }
  const edgeLit = (e) => lit && litNodes.has(e.to) && (!e.from || litNodes.has(e.from))

  useLayoutEffect(() => {
    if (!intro) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: () => setReady(true) })
        .from('.anim-rise', { y: 14, opacity: 0, stagger: 0.05, duration: 0.6 }, 0.05)
        .from('.np-left > *', { y: 22, opacity: 0, stagger: 0.07, duration: 0.7 }, 0.2)
        .from('.mini-lines .line', { strokeDashoffset: 1, duration: 1.1, ease: 'power2.inOut', stagger: 0.12 }, 0.45)
        .from('.release-card', { x: -20, opacity: 0, duration: 0.7 }, 0.35)
        .from('.edge.l1', { strokeDashoffset: 1, duration: 0.7, stagger: 0.06, ease: 'power2.inOut' }, 0.65)
        .from('.node-wrap.l1', { x: -14, opacity: 0, stagger: 0.07, duration: 0.55 }, 0.8)
        .from('.edge.l2', { strokeDashoffset: 1, duration: 0.7, stagger: 0.05, ease: 'power2.inOut' }, 1.1)
        .from('.node-wrap.l2', { x: -14, opacity: 0, stagger: 0.06, duration: 0.55 }, 1.25)
    }, root)
    return () => ctx.revert()
  }, [intro])

  const delay = intro && !ready ? 200 : 0
  const toggle = (id) => setPinned((p) => (p === id ? null : id))

  return (
    <div className="page network-page" ref={root}>
      <PageHeader eyebrow="Marathon prep · 16-week program" title="Coaching flow">
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input placeholder="Search athletes, sessions…" aria-label="Search" />
        </label>
        <Segmented options={['Programs', 'Overview', 'Reports']} value={tab} onChange={setTab} />
      </PageHeader>

      <div className="np-grid">
        <aside className="np-left" aria-label="Program totals">
          <article className="card">
            <MiniLines />
            <div className="card-label" style={{ marginTop: 10 }}>Calories this week</div>
            <div className="card-value" style={{ fontSize: 16, fontWeight: 600 }}>
              <Odometer value={data.calories} format={fmt} delay={delay} />
              <span className="unit">kcal</span>
              <Delta value="10%" />
            </div>
            <div className="compare">Compared to 11,490 kcal last week</div>
            {[
              ['Cardio', '#7B6CF0', 0.72],
              ['Strength', '#F25F7C', 0.58],
              ['Mobility', '#F4B55E', 0.64],
            ].map(([name, color, fill]) => (
              <div key={name} className="nl-row">
                <span className="ring-dot" style={{ borderColor: color }} />
                <span className="nl-name">{name}</span>
                <span className="track" style={{ flex: 1 }}>
                  <span style={{ width: `${fill * 100}%`, background: color }} />
                </span>
              </div>
            ))}
          </article>

          <div className="nl-plain">
            <div className="f-label">Active minutes</div>
            <div className="f-value">
              <Odometer value={data.minutes} format={fmt} delay={delay + 60} />
              <span className="unit">min</span>
              <Delta value="7%" />
            </div>
            <div className="compare">Across every athlete in the program</div>
          </div>

          <article className="card">
            <div className="card-label">Sessions completed</div>
            <div className="card-value">
              <Odometer value={data.sessions} format={fmt} delay={delay + 120} />
              <Delta value="4%" />
            </div>
            <div className="compare">Compared to 1,236 last week</div>
          </article>

          <article className="card">
            <div className="card-label">Training load</div>
            <div className="card-value">
              <Odometer value={612} delay={delay + 180} />
              <span className="unit">AU</span>
              <Delta value="6%" />
            </div>
            <div className="compare">Acute to chronic ratio 1.12</div>
            {[
              ['Week 1', '#7B6CF0', 0.66, 540],
              ['Week 2', '#F25F7C', 0.78, 588],
              ['Week 3', '#F4B55E', 0.84, 612],
            ].map(([name, color, fill, v]) => (
              <div key={name} className="month">
                <div className="m-head">
                  <span>{name}</span>
                  <span className="m-val">{v}</span>
                </div>
                <div className="track">
                  <span style={{ width: `${fill * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </article>
        </aside>

        <section className="np-main">
          <div className="np-head anim-rise">
            <div>
              <div className="label-row">
                <span className="label-strong">Athletes enrolled</span>
                <span className="tiny-link">DETAIL ›</span>
              </div>
              <Odometer className="big-number" value={data.athletes} delay={delay} />
            </div>
            <div className="kpi-pair">
              <div className="kpi">
                <b><Odometer value={data.completion} delay={delay + 80} />%</b>
                <span>Plan completion</span>
              </div>
              <div className="kpi">
                <b><Odometer value={data.pace} format={pace} delay={delay + 120} /> /km</b>
                <span>Avg easy pace</span>
              </div>
            </div>
          </div>

          <FitBox width={STAGE_W} height={STAGE_H} className="np-diagram" minScale={0.62} maxScale={1.35} bottomGap={56}>
            <svg className="net-edges" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
              {edges.map((e) => (
                <path
                  key={e.id}
                  id={`edge-${e.id}`}
                  className={`edge ${e.from ? 'l2' : 'l1'} ${edgeLit(e) ? 'is-lit' : ''} ${lit && !edgeLit(e) ? 'is-dim' : ''}`}
                  d={e.d}
                  pathLength="1"
                />
              ))}
              {ready &&
                edges.map((e, i) => (
                  <circle key={`pulse-${e.id}`} r="3" className="pulse">
                    <animateMotion dur={`${2.4 + (i % 4) * 0.35}s`} begin={`${(i * 0.37) % 2.4}s`} repeatCount="indefinite">
                      <mpath href={`#edge-${e.id}`} />
                    </animateMotion>
                  </circle>
                ))}
              <circle cx={ROOT_PORT[0]} cy={ROOT_PORT[1]} r="3.5" className="port-dot" />
            </svg>

            <article className="card release-card" style={{ left: 9, top: 227, width: 192, height: 223 }}>
              <span className="pin grey">+</span>
              <div className="rc-title">Marathon prep</div>
              <div className="rc-sub">Program</div>
              <span className="node-more">···</span>
              <div className="rc-divider" />
              <div className="rc-label" style={{ top: 82 }}>Enrolled athletes</div>
              <div className="rc-metric" style={{ top: 104 }}>
                <Odometer value={data.enrolled} delay={delay} />
                <span className="rc-track">
                  <span style={{ width: `${data.enrolledFill * 100}%`, background: '#7B6CF0' }} />
                </span>
                <span className="rc-plus">+76</span>
              </div>
              <div className="rc-label" style={{ top: 150 }}>Projected PRs</div>
              <div className="rc-metric" style={{ top: 172 }}>
                <Odometer value={data.prs} delay={delay + 60} />
                <span className="rc-track split">
                  <span style={{ width: '46%', background: '#F25F7C' }} />
                  <span style={{ width: '30%', background: '#7B6CF0' }} />
                </span>
              </div>
            </article>

            {level1.map((n) => (
              <Node
                key={n.id}
                node={n}
                level={1}
                x={L1_X}
                h={H1}
                active={litNodes.has(n.id)}
                onEnter={() => setFocus(n.id)}
                onLeave={() => setFocus(null)}
                onClick={() => toggle(n.id)}
              />
            ))}
            {level2.map((n) => (
              <Node
                key={n.id}
                node={n}
                level={2}
                x={L2_X}
                h={H2}
                active={litNodes.has(n.id)}
                onEnter={() => setFocus(n.id)}
                onLeave={() => setFocus(null)}
                onClick={() => toggle(n.id)}
              />
            ))}
          </FitBox>
        </section>
      </div>
    </div>
  )
}
