import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'

export default function Cursor() {
  const ring = useRef(null)
  const dot = useRef(null)
  const [label, setLabel] = useState('')
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    setEnabled(fine.matches)
    const onChange = () => setEnabled(fine.matches)
    fine.addEventListener('change', onChange)
    return () => fine.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const cur = { x: pos.x, y: pos.y }
    let shown = false
    const setRing = { x: gsap.quickSetter(ring.current, 'x', 'px'), y: gsap.quickSetter(ring.current, 'y', 'px') }
    const setDot = { x: gsap.quickSetter(dot.current, 'x', 'px'), y: gsap.quickSetter(dot.current, 'y', 'px') }

    const move = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!shown) {
        shown = true
        cur.x = pos.x
        cur.y = pos.y
        gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3 })
      }
      setDot.x(pos.x)
      setDot.y(pos.y)
    }
    const tick = (time, dt) => {
      const k = 1 - Math.exp(-(dt / 1000) * 14)
      cur.x += (pos.x - cur.x) * k
      cur.y += (pos.y - cur.y) * k
      setRing.x(cur.x)
      setRing.y(cur.y)
    }
    gsap.ticker.add(tick)

    const over = (e) => {
      const t = e.target.closest('[data-cursor], a, button, input, textarea, label')
      if (!t) {
        ring.current.classList.remove('is-hover', 'is-text')
        setLabel('')
        return
      }
      const kind = t.getAttribute('data-cursor') || ''
      const isText = t.matches('input, textarea')
      ring.current.classList.toggle('is-text', isText)
      ring.current.classList.toggle('is-hover', !isText)
      setLabel(kind && kind !== 'hover' ? kind : '')
    }
    const leave = () => gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.3 })
    const enter = () => shown && gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3 })
    const down = () => ring.current.classList.add('is-down')
    const up = () => ring.current.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.addEventListener('pointerenter', enter)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.removeEventListener('pointerenter', enter)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ring} className="cursor" aria-hidden="true">
        <span className="cursor__label">{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
