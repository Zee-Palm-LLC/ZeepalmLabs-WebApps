import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'

const GOAL = 24 * 60
const R = 118
const C = 2 * Math.PI * R

function Embers({ run }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const fit = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    const P = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      v: 0.012 + Math.random() * 0.03,
      s: 0.6 + Math.random() * 1.6,
      a: 0.25 + Math.random() * 0.6,
      p: Math.random() * Math.PI * 2,
    }))
    let raf = 0
    let last = performance.now()
    const still = reducedMotion()
    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const q of P) {
        if (run.current && !still) {
          q.y -= q.v * dt
          q.p += dt * 1.4
          if (q.y < -0.02) {
            q.y = 1.02
            q.x = Math.random()
          }
        }
        const x = (q.x + Math.sin(q.p) * 0.006) * w
        const y = q.y * h
        const fade = Math.min(1, q.y * 4, (1 - q.y) * 6)
        ctx.globalAlpha = q.a * fade
        ctx.fillStyle = q.s > 1.6 ? '#ffd28a' : '#ff9a5a'
        ctx.beginPath()
        ctx.arc(x, y, q.s, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [run])
  return <canvas ref={ref} className="embers" aria-hidden="true" />
}

const fmt = (m) => {
  const mm = Math.floor(m / 60)
  const ss = Math.floor(m % 60)
  return [String(mm).padStart(2, '0'), String(ss).padStart(2, '0')]
}

export default function Timer({ active }) {
  const [value, setValue] = useState(0)
  const [paused, setPaused] = useState(false)
  const state = useRef({ v: 0 })
  const tween = useRef(null)
  const run = useRef(true)

  useEffect(() => {
    run.current = !paused
  }, [paused])

  const start = () => {
    tween.current && tween.current.kill()
    state.current.v = 0
    setPaused(false)
    tween.current = gsap.to(state.current, {
      v: GOAL,
      duration: 4.2,
      ease: 'power2.inOut',
      onUpdate: () => setValue(state.current.v),
    })
  }

  useEffect(() => {
    if (active && !tween.current) start()
    else if (tween.current && tween.current.progress() < 1) {
      if (!active || paused) tween.current.pause()
      else tween.current.play()
    }
  }, [active, paused])

  const toggle = () => {
    if (!tween.current) return start()
    if (tween.current.progress() >= 1) return start()
    if (tween.current.paused()) {
      tween.current.play()
      setPaused(false)
    } else {
      tween.current.pause()
      setPaused(true)
    }
  }

  const done = value >= GOAL - 0.5
  const [mm, ss] = fmt(value)
  const p = value / GOAL

  return (
    <button className={`timer ${done ? 'is-done' : ''} ${paused ? 'is-paused' : ''}`} onClick={toggle} data-cursor={done ? 'Again' : paused ? 'Resume' : 'Pause'} aria-label={`Recovery ${mm} hours ${ss} minutes. ${paused ? 'Paused, press to resume' : done ? 'Done, press to restart' : 'Running, press to pause'}`}>
      <Embers run={run} />
      <span className="timer__glow" />
      <svg className="timer__ring" viewBox="-130 -130 260 260" aria-hidden="true">
        <circle r={R} className="timer__track" />
        <circle r={R} className="timer__prog" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90)" />
      </svg>
      <span className="timer__face">
        <small className="timer__k">Recovery</small>
        <strong className="timer__v">
          {mm}
          <em>:</em>
          {ss}
          <sup>h</sup>
        </strong>
        <small className="timer__s">{done ? 'ready to train' : paused ? 'paused' : 'recovering'}</small>
      </span>
    </button>
  )
}
