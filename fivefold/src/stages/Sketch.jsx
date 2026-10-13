import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'

function loopPath() {
  let s = 11
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const pts = []
  const n = 26
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = Math.PI + t * Math.PI * 2 * 1.02
    const wob = 1 + (rnd() - 0.5) * 0.06
    const rx = 100 * wob
    const ry = 120 * wob
    pts.push([Math.cos(a) * rx + (t > 0.9 ? (t - 0.9) * 120 : 0), Math.sin(a) * ry * (a > Math.PI * 1.5 && a < Math.PI * 2.5 ? 1.02 : 0.98)])
  }
  pts.push([pts[pts.length - 1][0] + 10, pts[pts.length - 1][1] + 14])
  pts.push([pts[pts.length - 1][0] - 4, pts[pts.length - 1][1] + 18])
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

const STEPS = ['Week 1', 'Week 3', 'Week 6', 'Week 9', 'Week 12']

export default function Sketch() {
  const root = useRef(null)
  const path = useRef(null)
  const tip = useRef(null)
  const [pct, setPct] = useState(0)
  const d = useMemo(loopPath, [])

  useEffect(() => {
    const p = path.current
    const len = p.getTotalLength()
    const state = { v: 0 }
    const render = () => {
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len * (1 - state.v)}`
      const q = p.getPointAtLength(len * state.v)
      tip.current.setAttribute('cx', q.x)
      tip.current.setAttribute('cy', q.y)
      tip.current.style.opacity = state.v > 0.002 && state.v < 0.998 ? 1 : 0
      setPct(Math.round(state.v * 100))
    }
    render()
    const section = root.current.closest('.stage')
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      end: 'center 45%',
      scrub: 0.8,
      onUpdate: (self) => {
        state.v = self.progress
        render()
      },
    })
    root.current.__replay = () => {
      gsap.fromTo(state, { v: 0 }, { v: 1, duration: 2.2, ease: 'power2.inOut', onUpdate: render })
    }
    return () => st.kill()
  }, [])

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))]

  return (
    <button className={`sketch ${pct >= 100 ? 'is-done' : ''}`} ref={root} onClick={() => root.current.__replay && root.current.__replay()} data-cursor="Again" aria-label="Replay the habit streak">
      <svg className="sketch__svg" viewBox="-200 -170 400 340" aria-hidden="true">
        <path ref={path} d={d} className="sketch__line" />
        <circle ref={tip} r="4" className="sketch__tip" />
      </svg>
      <span className="sketch__bar">
        <span className="sketch__k">{pct >= 100 ? 'Habit locked in' : step}</span>
        <span className="sketch__track">
          <i style={{ transform: `scaleX(${pct / 100})` }} />
        </span>
        <span className="sketch__v">{pct}%</span>
      </span>
    </button>
  )
}
