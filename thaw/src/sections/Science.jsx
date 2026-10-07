import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth.js'
import ThawText from '../ui/ThawText.jsx'
import './science.css'

const METHODS = [
  ['CBT', 'Cognitive behavioural therapy', 'Spot the thought, test it, and try a kinder, more accurate one.'],
  ['ACT', 'Acceptance & commitment', 'Make room for hard feelings while moving toward what matters.'],
  ['MBSR', 'Mindfulness-based stress reduction', 'Short practices that bring attention back to the body and breath.'],
  ['BA', 'Behavioural activation', 'Small, scheduled actions that rebuild energy and momentum.'],
]

const STATS = [
  ['60', 'sec', 'Daily check-in'],
  ['12', 'min', 'Average session'],
  ['24', '/7', 'Always available'],
  ['0', '', 'Data sold. Ever.'],
]

const CURVE = [82, 79, 84, 76, 78, 70, 73, 64, 66, 60, 63, 55, 52, 56, 49, 46, 48, 42, 40, 43, 37, 35, 36, 31]
const COLD = [2, 8, 13, 19]

export default function Science() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count)
        const st = { v: 0 }
        gsap.to(st, {
          v: to,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => (el.textContent = Math.round(st.v)),
        })
      })
      gsap.from('.method', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.methods', start: 'top 82%' } })
      const line = ref.current.querySelector('.curve-line')
      const marker = ref.current.querySelector('.curve-now')
      const label = ref.current.querySelector('.curve-read')
      const len = line.getTotalLength()
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.curve',
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: 0.6,
          onUpdate: (self) => {
            const p = line.getPointAtLength(len * self.progress)
            marker.setAttribute('transform', `translate(${p.x} ${p.y})`)
            const i = Math.min(CURVE.length - 1, Math.round(self.progress * (CURVE.length - 1)))
            label.textContent = `Week ${Math.floor(i / 3) + 1} · Signal ${CURVE[i]}`
          },
        },
      })
      gsap.from('.cold-mark', { opacity: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box', stagger: 0.25, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: '.curve', start: 'top 60%' } })
    }, ref)
    return () => ctx.revert()
  }, [])

  const W = 1000
  const H = 260
  const pts = CURVE.map((v, i) => [(i / (CURVE.length - 1)) * W, H - (v / 100) * H])
  const d = pts.map(([x, y], i) => (i ? `L${x.toFixed(1)} ${y.toFixed(1)}` : `M${x} ${y}`)).join(' ')

  return (
    <section className="sec science" id="science" ref={ref}>
      <div className="wrap">
        <div className="eyebrow">
          <span>
            {'// 04 — '}
            <b>Science</b>
          </span>
          <span>Clinician-reviewed</span>
        </div>
        <ThawText as="h2" className="display science-title" text="Grounded in evidence. Built with *care." />

        <div className="methods">
          {METHODS.map(([k, name, body]) => (
            <article className="method pane" key={k}>
              <span className="display method-k">{k}</span>
              <span className="mono-s dim">{name}</span>
              <p>{body}</p>
            </article>
          ))}
        </div>

        <div className="stats">
          {STATS.map(([v, unit, label]) => (
            <div className="stat" key={label}>
              <div className="display stat-v">
                <span data-count={v}>0</span>
                <i>{unit}</i>
              </div>
              <span className="mono-s dim">{label}</span>
            </div>
          ))}
        </div>

        <figure className="curve pane">
          <figcaption className="mono-s curve-head">
            <span>Example thaw curve · 8 weeks</span>
            <span className="curve-read">Week 1 · Signal 82</span>
          </figcaption>
          <svg viewBox={`-10 -20 ${W + 20} ${H + 50}`} className="curve-svg" aria-label="Example: anxiety signal falling from 82 to 31 over eight weeks">
            {[0, 1, 2, 3, 4].map((k) => (
              <line key={k} className="curve-grid" x1="0" x2={W} y1={(k * H) / 4} y2={(k * H) / 4} />
            ))}
            {[...Array(8)].map((_, k) => (
              <text key={k} className="curve-x" x={(k / 7) * W} y={H + 22} textAnchor="middle">
                W{k + 1}
              </text>
            ))}
            <path className="curve-area" d={`${d} L${W} ${H} L0 ${H} Z`} />
            <path className="curve-line" d={d} />
            {COLD.map((i) => (
              <g key={i} className="cold-mark" transform={`translate(${pts[i][0]} ${pts[i][1]})`}>
                <rect x="-5" y="-5" width="10" height="10" />
              </g>
            ))}
            <g className="curve-now" transform={`translate(${pts[0][0]} ${pts[0][1]})`}>
              <circle r="12" className="halo" />
              <circle r="4.5" />
            </g>
          </svg>
          <div className="mono-s curve-legend dim">
            <span>
              <i className="lg-line" /> Anxiety signal
            </span>
            <span>
              <i className="lg-cold" /> Cold spot worked through
            </span>
            <span>Illustrative data, not a clinical result</span>
          </div>
        </figure>

        <div className="trust">
          <div className="trust-item">
            <b>Private by design</b>
            <p>Your check-ins are encrypted on your device. Export or delete everything in one tap.</p>
          </div>
          <div className="trust-item">
            <b>Reviewed by clinicians</b>
            <p>Every session in the library is written with, and reviewed by, licensed therapists.</p>
          </div>
          <div className="trust-item">
            <b>Knows its limits</b>
            <p>THAW is support, not a diagnosis. It points you to a human when that’s what you need.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
