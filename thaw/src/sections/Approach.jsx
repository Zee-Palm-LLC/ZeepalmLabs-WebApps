import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth.js'
import ThawText from '../ui/ThawText.jsx'
import './approach.css'

const PILLARS = [
  {
    n: '01',
    title: 'Notice',
    tag: 'Daily check-in',
    body: 'A 60-second check-in picks up shifts in mood, sleep and energy before they harden into patterns.',
  },
  {
    n: '02',
    title: 'Understand',
    tag: 'AI signal map',
    body: 'THAW maps what sits underneath: the triggers, the times of day, the thoughts that keep coming back.',
  },
  {
    n: '03',
    title: 'Melt',
    tag: 'Guided sessions',
    body: 'Short sessions grounded in CBT, ACT and mindfulness help you work through it, at your own pace.',
  },
]

function Matrix() {
  const ref = useRef(null)
  useEffect(() => {
    const dots = Array.from(ref.current.querySelectorAll('circle'))
    const id = setInterval(() => {
      for (let k = 0; k < 6; k++) {
        const d = dots[(Math.random() * dots.length) | 0]
        gsap.to(d, { opacity: [0.18, 0.5, 1][(Math.random() * 3) | 0], duration: 0.7, ease: 'power2.out' })
      }
    }, 260)
    return () => clearInterval(id)
  }, [])
  const cells = []
  for (let r = 0; r < 6; r++) for (let c = 0; c < 16; c++) cells.push([c, r])
  return (
    <svg ref={ref} className="pv pv-matrix" viewBox="0 0 160 60" aria-hidden="true">
      {cells.map(([c, r]) => (
        <circle key={`${c}-${r}`} cx={5 + c * 10} cy={5 + r * 10} r="1.6" opacity={[0.18, 0.5, 1][(c * 7 + r * 13) % 3]} />
      ))}
    </svg>
  )
}

function Signal() {
  const pts = [38, 34, 40, 30, 36, 22, 26, 14, 20, 12, 28, 24, 32, 30, 38, 36]
  const d = pts.map((y, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * 160} ${y}`).join(' ')
  return (
    <svg className="pv pv-signal" viewBox="0 0 160 60" aria-hidden="true">
      <rect className="cold-band" x="62" y="0" width="34" height="60" />
      <path className="sig" d={d} pathLength="1" />
      <circle className="sig-dot" cx={(9 / 15) * 160} cy="12" r="2.6" />
      <text x="64" y="56">COLD SPOT</text>
    </svg>
  )
}

function Thermo() {
  return (
    <div className="pv pv-thermo" aria-hidden="true">
      <div className="thermo-scale">
        {[...Array(9)].map((_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="thermo-bar">
        <span />
      </div>
      <div className="thermo-read">
        <b data-temp>-6.0</b>°C
      </div>
    </div>
  )
}

const VISUALS = [Matrix, Signal, Thermo]

export default function Approach() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pillar', {
        y: 70,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.pillars', start: 'top 80%' },
      })
      gsap.fromTo('.pv-signal .sig', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.pillars', start: 'top 70%' } })
      const temp = ref.current.querySelector('[data-temp]')
      const st = { v: -6 }
      gsap.to(st, {
        v: 2.4,
        ease: 'none',
        scrollTrigger: { trigger: '.pillars', start: 'top 75%', end: 'bottom 30%', scrub: 0.8 },
        onUpdate: () => {
          temp.textContent = (st.v > 0 ? '+' : '') + st.v.toFixed(1)
          ref.current.style.setProperty('--temp', (st.v + 6) / 8.4)
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="sec approach" id="approach" ref={ref}>
      <div className="wrap">
        <div className="eyebrow">
          <span>
            {'// 01 — '}
            <b>Approach</b>
          </span>
          <span>Why THAW</span>
        </div>
        <ThawText
          className="display approach-statement"
          text="Anxiety rarely arrives all at once. It settles in, layer by layer, until everything feels *frozen. THAW finds the cold spots and helps them *melt."
        />
        <div className="pillars">
          {PILLARS.map((p, i) => {
            const V = VISUALS[i]
            return (
              <article className="pillar pane" key={p.n}>
                <header className="mono-s pillar-top">
                  <span>{p.n}</span>
                  <span className="dim">{p.tag}</span>
                </header>
                <V />
                <h3 className="display pillar-title">{p.title}</h3>
                <p className="pillar-body">{p.body}</p>
                <span className="pillar-frost" />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
