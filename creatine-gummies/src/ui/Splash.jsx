import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LogoMark, Fruit } from './art.jsx'
import './splash.css'

const WORD = 'Creatine Gummies'
const FRUITS = ['strawberry', 'berry', 'apple', 'lemon', 'hazelnut']

export default function Splash({ onDone }) {
  const root = useRef(null)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const el = root.current
    requestAnimationFrame(() => window.__lenis?.stop())
    const tl = gsap.timeline({
      onComplete: () => {
        window.__lenis?.start()
        setGone(true)
      },
    })
    tl.fromTo(el.querySelector('.sp-mark'), { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2)' }, 0.1)
    tl.fromTo(el.querySelectorAll('.sp-word span'), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.025 }, 0.3)
    tl.fromTo(el.querySelectorAll('.sp-fruits span'), { y: 40, scale: 0, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.06 }, 0.45)
    tl.to(el.querySelectorAll('.sp-fruits span'), { y: -14, duration: 0.35, ease: 'power2.out', stagger: { each: 0.05, yoyo: true, repeat: 1 } }, 0.95)
    tl.add(() => onDone?.(), 1.25)
    tl.to(el.querySelector('.sp-in'), { y: -60, opacity: 0, duration: 0.5, ease: 'power3.in' }, 1.25)
    tl.to(el, { clipPath: 'inset(0 0 100% 0 round 0 0 40px 40px)', duration: 0.9, ease: 'expo.inOut' }, 1.3)
    return () => tl.kill()
  }, [])
  if (gone) return null
  return (
    <div className="splash" ref={root} aria-hidden="true">
      <div className="sp-in">
        <LogoMark size={56} className="sp-mark" />
        <p className="sp-word serif">
          {[...WORD].map((c, k) => (
            <span key={k}>{c === ' ' ? ' ' : c}</span>
          ))}
        </p>
        <div className="sp-fruits">
          {FRUITS.map((f) => (
            <span key={f}>
              <Fruit kind={f} size={34} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
