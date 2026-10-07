import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './cursor.css'

const DARK = '.mf-card, .bn-photo, .fn-foot, .pg-select, .sc-photo'

function dark(el) {
  if (!el || !el.closest) return false
  if (el.closest(DARK)) return true
  const card = el.closest('.pg-card')
  if (card) return card.classList.contains('on') && card.classList.contains('dark-ink')
  let n = el
  while (n && n !== document.documentElement) {
    const c = getComputedStyle(n).backgroundColor
    const m = c.match(/[\d.]+/g)
    if (m && (m.length < 4 || +m[3] > 0.5)) {
      const [r, g, b] = m.map(Number)
      return 0.299 * r + 0.587 * g + 0.114 * b < 120
    }
    n = n.parentElement
  }
  return false
}

export default function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    document.documentElement.classList.add('cc')
    const x = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' })
    let last = null
    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
      el.classList.add('on')
      const t = e.target
      el.classList.toggle('light', dark(t))
      if (t === last) return
      last = t
      el.classList.toggle('hot', !!t.closest?.('a, button, input, label, [role="button"]'))
    }
    const leave = () => el.classList.remove('on')
    const down = () => el.classList.add('down')
    const up = () => el.classList.remove('down')
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('cc')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path d="M5 3.2 L20.5 12 L5 20.8 Z" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
