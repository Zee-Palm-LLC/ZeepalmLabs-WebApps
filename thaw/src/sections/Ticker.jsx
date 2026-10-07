import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/smooth.js'

const ITEMS = [
  ['Cold spot', 'Work-related stress'],
  ['Mood stability', 'Improving'],
  ['Sleep quality', 'Stable'],
  ['Anxiety signals', 'Moderate'],
  ['Check-ins this week', '6 / 7'],
  ['Next session', 'Tonight, 8:00 PM'],
  ['Thaw progress', '+2.4°'],
]

export default function Ticker() {
  const track = useRef(null)

  useEffect(() => {
    const el = track.current
    let x = 0
    let dir = -1
    let boost = 0
    const half = () => el.scrollWidth / 2
    let st = null
    const tick = (time, dt) => {
      const v = st ? st.getVelocity() : 0
      boost += (Math.min(Math.abs(v) / 300, 14) - boost) * 0.08
      x += dir * (0.6 + boost) * (dt / 16.6)
      const h = half()
      if (x < -h) x += h
      if (x > 0) x -= h
      el.style.transform = `translate3d(${x}px,0,0)`
    }
    st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        dir = self.direction === 1 ? -1 : 1
      },
    })
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      st.kill()
    }
  }, [])

  const row = (k) =>
    ITEMS.map(([a, b], i) => (
      <span className="tick" key={`${k}-${i}`}>
        <i />
        {a}
        <b>{b}</b>
      </span>
    ))

  return (
    <div className="ticker" aria-label="Live signals">
      <div className="ticker-track" ref={track}>
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
