import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'

const TILES = [
  { k: 'warm', label: 'Energy level' },
  { k: 'type', label: 'Resting heart rate 58 bpm' },
  { k: 'sun', label: 'Sleep and wake time' },
  { k: 'ring', label: 'Daily move goal' },
  { k: 'dusk', label: 'Heart rate trace' },
  { k: 'palette', label: 'Macro split' },
  { k: 'shapes', label: 'Movement screen' },
  { k: 'amber', label: 'Strength score' },
  { k: 'notes', label: 'Baseline numbers' },
]

function Tile({ k }) {
  if (k === 'type')
    return (
      <span className="t-type">
        58<small>bpm</small>
      </span>
    )
  if (k === 'dusk')
    return (
      <svg className="t-ecg" viewBox="0 0 120 40" aria-hidden="true">
        <path pathLength="100" d="M0 24h28l5-9 6 20 7-30 6 25 4-6h22l4-6 5 12 4-6h29" />
      </svg>
    )
  if (k === 'ring') return <span className="t-ring" />
  if (k === 'sun')
    return (
      <span className="t-sun">
        <i />
        <i />
      </span>
    )
  if (k === 'palette')
    return (
      <span className="t-pal">
        <i />
        <i />
        <i />
      </span>
    )
  if (k === 'shapes')
    return (
      <span className="t-shapes">
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <path d="M22 8 40 50H4Z" fill="#ff5a1f" />
          <circle cx="44" cy="36" r="10" fill="none" stroke="#ffc98a" strokeWidth="2.2" />
        </svg>
      </span>
    )
  if (k === 'notes')
    return (
      <span className="t-notes">
        <span>VO₂ max — 42</span>
        <span>Mobility — fair</span>
        <span>Goal — 10k run</span>
      </span>
    )
  return null
}

export default function Board({ active }) {
  const root = useRef(null)
  const played = useRef(false)

  useEffect(() => {
    const el = root.current
    const tiles = [...el.querySelectorAll('.tile')]
    gsap.set(tiles, { opacity: 0, y: 40, rotation: () => gsap.utils.random(-10, 10), scale: 0.86 })
    const cleanups = tiles.map((tile) => {
      let sx = 0
      let sy = 0
      let ox = 0
      let oy = 0
      let dragging = false
      const down = (e) => {
        dragging = true
        tile.setPointerCapture(e.pointerId)
        sx = e.clientX
        sy = e.clientY
        ox = gsap.getProperty(tile, 'x')
        oy = gsap.getProperty(tile, 'y')
        tile.classList.add('is-drag')
        gsap.to(tile, { scale: 1.06, rotation: gsap.utils.random(-4, 4), duration: 0.35, ease: 'power3.out' })
      }
      const move = (e) => {
        if (!dragging) return
        gsap.set(tile, { x: ox + e.clientX - sx, y: oy + e.clientY - sy })
      }
      const up = () => {
        if (!dragging) return
        dragging = false
        tile.classList.remove('is-drag')
        el.classList.add('is-messy')
        gsap.to(tile, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' })
      }
      const dbl = () => gsap.to(tile, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'expo.out' })
      tile.addEventListener('pointerdown', down)
      tile.addEventListener('pointermove', move)
      tile.addEventListener('pointerup', up)
      tile.addEventListener('pointercancel', up)
      tile.addEventListener('dblclick', dbl)
      return () => {
        tile.removeEventListener('pointerdown', down)
        tile.removeEventListener('pointermove', move)
        tile.removeEventListener('pointerup', up)
        tile.removeEventListener('pointercancel', up)
        tile.removeEventListener('dblclick', dbl)
      }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  useEffect(() => {
    if (!active || played.current) return
    played.current = true
    const tiles = root.current.querySelectorAll('.tile')
    gsap.to(tiles, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'expo.out', stagger: { each: 0.07, from: 'random' } })
  }, [active])

  const tidy = () => {
    root.current.classList.remove('is-messy')
    gsap.to(root.current.querySelectorAll('.tile'), { x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 })
  }

  return (
    <div className="board" ref={root}>
      {TILES.map((t, i) => (
        <div key={t.k} className={`tile tile--${t.k}`} data-cursor="Drag" role="img" aria-label={t.label} style={{ '--i': i }}>
          <Tile k={t.k} />
        </div>
      ))}
      <button className="board__tidy" onClick={tidy}>
        Tidy board
      </button>
    </div>
  )
}
