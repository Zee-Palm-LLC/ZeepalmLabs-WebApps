import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LogoMark } from './art.jsx'
import { CanAnchor } from '../three/CanLayer.jsx'
import { stageFor } from '../lib/fit.js'
import './splash.css'

const WORD = 'Creatine Gummies'
const CANS = [
  { id: 'straw', rotZ: -0.2, rotY: 0.24, d: [200, 372, 360], m: [6, 330, 150] },
  { id: 'berry', rotZ: 0.04, rotY: 0, d: [545, 352, 370], m: [140, 312, 152] },
  { id: 'apple', rotZ: 0.2, rotY: -0.28, d: [880, 384, 360], m: [276, 334, 150] },
]

export default function Splash({ onDone }) {
  const root = useRef(null)
  const hs = useRef([])
  const [gone, setGone] = useState(false)
  const [v] = useState(() => stageFor(900, 640))
  const t0 = useRef(performance.now())
  const film = useRef(new URLSearchParams(window.location.search).has('film'))
  const rise = (h, k) => {
    hs.current[k] = h
    if (film.current && !window.__filmStart?.started) return
    if (performance.now() - t0.current > 1300) return
    gsap.fromTo(h, { dy: 620, rotY: CANS[k].rotY + 1.2 }, { dy: 0, rotY: CANS[k].rotY, duration: 0.95, ease: 'power3.out', delay: 0.2 + k * 0.08 })
  }

  useEffect(() => {
    const el = root.current
    document.documentElement.classList.add('splashing')
    requestAnimationFrame(() => window.__lenis?.stop())
    const film = new URLSearchParams(window.location.search).has('film')
    const tl = gsap.timeline({
      paused: film,
      onComplete: () => {
        window.__lenis?.start()
        document.documentElement.classList.remove('splashing')
        setGone(true)
      },
    })
    tl.fromTo(el.querySelector('.sp-mark'), { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(2)' }, 0.05)
    tl.fromTo(el.querySelectorAll('.sp-word span'), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.02 }, 0.2)
    tl.add(() => {
      hs.current.forEach((h, k) => h && gsap.to(h, { dy: 820, duration: 0.45, ease: 'power3.in', delay: k * 0.04, overwrite: true }))
    }, 1.2)
    tl.to(el.querySelector('.sp-in'), { y: -40, opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.3)
    tl.add(() => onDone?.(), 1.72)
    tl.to(el, { opacity: 0, duration: 0.2, ease: 'none' }, 1.75)
    if (film)
      window.__filmStart = () => {
        window.__filmStart.started = true
        t0.current = performance.now()
        hs.current.forEach((h, k) => h && rise(h, k))
        tl.play(0)
      }
    return () => {
      tl.kill()
      document.documentElement.classList.remove('splashing')
    }
  }, [])

  if (gone) return null
  const tf = { width: v.W, height: v.H, transform: `translate(${v.ox}px, ${v.oy}px) scale(${v.s})` }
  return (
    <div className={`splash ${v.m ? 'm' : ''}`} ref={root} aria-hidden="true">
      <div className="sp-c" style={tf}>
        <div className="sp-in">
          <LogoMark size={v.m ? 48 : 56} className="sp-mark" />
          <p className="sp-word serif">
            {[...WORD].map((c, k) => (
              <span key={k}>{c === ' ' ? ' ' : c}</span>
            ))}
          </p>
        </div>
        {CANS.map((c, k) => {
          const [x, y, w] = v.m ? c.m : c.d
          return (
            <CanAnchor
              key={c.id}
              flavor={c.id}
              className="sp-can"
              style={{ left: x, top: y, width: w, height: w * 1.49 }}
              init={{ rotZ: c.rotZ, rotX: 0.3, rotY: c.rotY, dy: 620 }}
              onReady={(h) => rise(h, k)}
            />
          )
        })}
      </div>
    </div>
  )
}
