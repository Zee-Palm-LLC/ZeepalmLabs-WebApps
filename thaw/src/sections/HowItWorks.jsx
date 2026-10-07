import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import './how.css'

const MOODS = ['Heavy', 'Tense', 'Okay', 'Light']
const SIGNALS = [
  ['Work', 72],
  ['Sleep', 38],
  ['Relationships', 21],
  ['Health', 14],
]
const WEEKS = [74, 70, 72, 61, 58, 51, 47, 49]

function CheckIn() {
  const [pick, setPick] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setPick((p) => (p + 1) % MOODS.length), 1600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="ui ui-check">
      <div className="bubble">How are you arriving today?</div>
      <div className="moods">
        {MOODS.map((m, i) => (
          <button key={m} className={`mood ${pick === i ? 'on' : ''}`} onClick={() => setPick(i)}>
            {m}
          </button>
        ))}
      </div>
      <div className="mono-s ui-foot">
        <span className="rec" /> Voice or text · 60 sec
      </div>
    </div>
  )
}

function ColdSpot() {
  return (
    <div className="ui ui-cold">
      {SIGNALS.map(([k, v], i) => (
        <div className="sig-row" key={k}>
          <span className="mono-s">{k}</span>
          <span className="sig-track">
            <span className={`sig-fill ${i === 0 ? 'hot' : ''}`} style={{ '--v': v / 100 }} />
          </span>
          <span className="mono-s">{v}%</span>
        </div>
      ))}
      <div className="mono-s cold-hit">
        <span className="blink" /> Cold spot detected → Work
      </div>
    </div>
  )
}

function Session() {
  return (
    <div className="ui ui-session">
      <div className="breath">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="core" />
        <span className="mono-s breath-label">Breathe</span>
      </div>
      <div className="session-card">
        <span className="mono-s dim">Session 03 · CBT</span>
        <b>Unclench Sunday</b>
        <span className="mono-s dim">12 min · Guided</span>
      </div>
    </div>
  )
}

function Track() {
  const max = 80
  const pts = WEEKS.map((v, i) => [(i / (WEEKS.length - 1)) * 300, 120 - (v / max) * 110])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  return (
    <div className="ui ui-track">
      <svg viewBox="-6 -6 312 140" className="track-chart" aria-hidden="true">
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1="0" x2="300" y1={10 + k * 36} y2={10 + k * 36} className="grid" />
        ))}
        <path d={`${d} L300 130 L0 130 Z`} className="area" />
        <path d={d} className="line" pathLength="1" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" className="pt" />
        ))}
      </svg>
      <div className="track-meta">
        <div>
          <b>−34%</b>
          <span className="mono-s dim">Anxiety signal vs week 1</span>
        </div>
        <span className="mono-s dim">Example · 8 weeks</span>
      </div>
    </div>
  )
}

const STEPS = [
  { n: '01', title: 'Check in', body: 'Tell THAW how you’re arriving. Voice or text, about a minute, whenever suits you.', UI: CheckIn },
  { n: '02', title: 'Find the cold spot', body: 'Patterns across your check-ins point to what’s actually weighing on you.', UI: ColdSpot },
  { n: '03', title: 'Thaw it', body: 'A short guided session works on that one thing, with techniques that fit you.', UI: Session },
  { n: '04', title: 'Watch it melt', body: 'Week by week you see the signal soften, and you know what helped.', UI: Track },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const track = useRef(null)
  const temp = useRef(null)
  const bar = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const el = track.current
      const dist = () => el.scrollWidth - el.parentElement.clientWidth
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = -12 + self.progress * 16
            temp.current.textContent = (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t).toFixed(1)
            bar.current.style.transform = `scaleX(${self.progress})`
            ref.current.style.setProperty('--warm', self.progress)
          },
        },
      })
      el.querySelectorAll('.step').forEach((step) => {
        gsap.from(step.querySelector('.ui'), {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 85%' },
        })
        const line = step.querySelector('.track-chart .line')
        if (line) gsap.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 70%' } })
        step.querySelectorAll('.sig-fill').forEach((f) =>
          gsap.from(f, { scaleX: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 75%' } })
        )
      })
      return () => tween.kill()
    })
    mm.add('(max-width: 899px)', () => {
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 60%',
        end: 'bottom 60%',
        onUpdate: (self) => {
          const t = -12 + self.progress * 16
          temp.current.textContent = (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t).toFixed(1)
          bar.current.style.transform = `scaleX(${self.progress})`
        },
      })
      return () => st.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="how" id="how" ref={ref}>
      <div className="how-inner">
        <aside className="how-side">
          <div className="eyebrow">
            <span>
              {'// 02 — '}
              <b>How it works</b>
            </span>
          </div>
          <h2 className="display how-title">From frozen to flowing in four steps.</h2>
          <div className="temp">
            <span className="mono-s dim">Inner temperature</span>
            <div className="temp-read">
              <b ref={temp}>−12.0</b>
              <i>°C</i>
            </div>
            <div className="temp-bar">
              <span ref={bar} />
            </div>
            <div className="mono-s temp-scale">
              <span>Frozen</span>
              <span>Thawed</span>
            </div>
          </div>
        </aside>
        <div className="how-viewport">
          <div className="how-track" ref={track}>
            {STEPS.map(({ n, title, body, UI }) => (
              <article className="step pane" key={n}>
                <header className="mono-s step-top">
                  <span>Step {n}</span>
                  <span className="dim">{n} / 04</span>
                </header>
                <UI />
                <div className="step-copy">
                  <h3 className="display">{title}</h3>
                  <p>{body}</p>
                </div>
                <span className="step-n display" aria-hidden="true">
                  {n}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
