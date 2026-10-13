import { useEffect, useMemo, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'

const N = 44

export default function Aha({ active }) {
  const root = useRef(null)
  const played = useRef(false)
  const rays = useMemo(() => {
    let s = 7
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    return Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 + rnd() * 0.08
      const r0 = 120 + rnd() * 50
      const r1 = r0 + 90 + rnd() * 230
      return { a, r0, r1, w: rnd() > 0.8 ? 1.5 : 0.9, o: 0.12 + rnd() * 0.26 }
    })
  }, [])

  const burst = () => {
    const el = root.current
    if (!el) return
    const lines = el.querySelectorAll('.aha__ray')
    const tl = gsap.timeline()
    tl.fromTo(lines, { scale: 0.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: { each: 0.012, from: 'random' } }, 0)
      .fromTo(el.querySelector('.aha__word'), { scale: 0.7, opacity: 0, filter: 'blur(18px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, 0.08)
      .fromTo(el.querySelector('.aha__flash'), { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 1.3, ease: 'power2.out' }, 0)
    return tl
  }

  useEffect(() => {
    const el = root.current
    gsap.set(el.querySelectorAll('.aha__ray'), { scale: 0.15, opacity: 0, svgOrigin: '0 0' })
    gsap.set(el.querySelector('.aha__word'), { opacity: 0 })
    if (reducedMotion()) return
    const spin = gsap.to(el.querySelector('.aha__rays'), { rotation: 360, duration: 160, repeat: -1, ease: 'none', svgOrigin: '0 0' })
    return () => spin.kill()
  }, [])

  useEffect(() => {
    if (active && !played.current) {
      played.current = true
      burst()
    }
  }, [active])

  const pulse = () => {
    const el = root.current
    gsap.fromTo(el.querySelectorAll('.aha__ray'), { scale: 1 }, { scale: 1.12, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut', stagger: { each: 0.004, from: 'random' } })
  }

  return (
    <button className="aha" ref={root} onClick={burst} onPointerEnter={pulse} data-cursor="Again" aria-label="Replay the personal record moment">
      <svg className="aha__svg" viewBox="-400 -280 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="ahaRay" cx="0" cy="0" r="420" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#ffd2b8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="aha__rays">
          {rays.map((r, i) => (
            <line
              key={i}
              className="aha__ray"
              x1={Math.cos(r.a) * r.r0}
              y1={Math.sin(r.a) * r.r0}
              x2={Math.cos(r.a) * r.r1}
              y2={Math.sin(r.a) * r.r1}
              stroke="url(#ahaRay)"
              strokeWidth={r.w}
              strokeOpacity={r.o}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
      <span className="aha__flash" />
      <span className="aha__word">PR.</span>
    </button>
  )
}
