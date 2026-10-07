import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import { useStage } from '../lib/fit.js'
import { Star, Icon } from '../ui/art.jsx'
import './manifesto.css'

const TAGS = [
  { t: 'Bold Flavor', c: 'm1' },
  { t: 'Clean Ingredients', c: 'm2' },
  { t: 'Crafted for Impact', c: 'm3' },
  { t: 'Real Taste', c: 'm4' },
]
const LINES = ['Bold flavor.', 'Clean ingredients.', 'Crafted for impact.', 'Real taste.', 'Strength you can taste.']

export default function Manifesto() {
  const wrap = useRef(null)
  const stage = useRef(null)
  const v = useStage(900)
  const card = v.m ? { x: 12, y: 70, w: 406, h: Math.round(v.H - 140) } : { x: 20, y: 50, w: 1400, h: 800 }
  const py = v.m ? 482 : 818
  const r0 = 38
  const clip0 = `inset(${py - r0 - card.y}px ${card.w / 2 - r0}px ${Math.max(0, card.y + card.h - py - r0)}px ${card.w / 2 - r0}px round ${r0}px)`
  const lift = card.y + card.h / 2 - py
  const tf = { width: v.W, height: v.H, transform: `translate(${v.ox}px, ${v.oy}px) scale(${v.s})` }
  const [play, setPlay] = useState(false)
  const [line, setLine] = useState(0)

  useEffect(() => {
    const el = stage.current
    const q = (s) => el.querySelectorAll(s)
    const ctx = gsap.context(() => {
      gsap.set(q('.mf-tag i'), { rotate: (k) => [1.4, -1.4, 0, -1.6][k] })
      gsap.fromTo(q('.mf-tag i'), { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: wrap.current, start: 'top 70%' } })
      gsap.fromTo(q('.mf-eyebrow span, .mf-play button'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.3, scrollTrigger: { trigger: wrap.current, start: 'top 70%' } })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => `+=${window.innerHeight * 1.6}`, pin: el, scrub: 0.8 },
      })
      tl.to(q('.mf-tag, .mf-eyebrow'), { y: -820, ease: 'none', duration: 0.75 }, 0)
      tl.to(q('.mf-ring'), { scale: 0.4, opacity: 0, duration: 0.15 }, 0)
      tl.fromTo(q('.mf-card'), { clipPath: clip0 }, { clipPath: 'inset(0px 0px 0px 0px round 14px)', ease: 'power2.inOut', duration: 0.9 }, 0.05)
      tl.fromTo(q('.mf-card img'), { scale: 1.45 }, { scale: 1, ease: 'power2.inOut', duration: 0.9 }, 0.05)
      tl.fromTo(q('.mf-play'), { y: 0 }, { y: lift, ease: 'power2.inOut', duration: 0.9 }, 0.05)
    }, el)
    return () => ctx.revert()
  }, [v.m, Math.round(v.H)])

  useEffect(() => {
    if (!play) return
    const id = setInterval(() => setLine((k) => (k + 1) % LINES.length), 1700)
    return () => clearInterval(id)
  }, [play])

  useEffect(() => {
    if (!play) return
    const st = ScrollTrigger.create({ trigger: wrap.current, start: 'top -60%', end: 'bottom 40%', onLeave: () => setPlay(false), onLeaveBack: () => setPlay(false) })
    return () => st.kill()
  }, [play])

  return (
    <section className={`manifesto ${v.m ? 'm' : ''}`} ref={wrap} aria-label="Strength you can taste">
      <div className="mf-stage" ref={stage}>
        <div className="mf-c" style={tf}>
          <div className={`mf-card ${play ? 'playing' : ''}`} style={{ left: card.x, top: card.y, width: card.w, height: card.h, clipPath: clip0 }}>
            <img src="/img/manifesto.webp" alt="Cinnamon Apple jars and pouch with apples and blueberries" />
            <div className="mf-film" aria-hidden={!play}>
              <p className="display" key={line}>
                {LINES[line]}
              </p>
              <span className="mf-bar" style={{ '--n': LINES.length }} />
            </div>
          </div>
          <p className="mf-eyebrow serif">
            <span>
              <Star size={11} /> Strength You Can Taste <Star size={11} />
            </span>
          </p>
          <div className="mf-tags display">
            {TAGS.map((x) => (
              <span key={x.c} className={`mf-tag ${x.c}`}>
                <i>{x.t}</i>
              </span>
            ))}
          </div>
          <div className="mf-play">
            <span className="mf-ring" />
            <button
              className={play ? 'on' : ''}
              onClick={() => {
                setLine(0)
                setPlay((p) => !p)
              }}
              aria-label={play ? 'Pause manifesto' : 'Play manifesto'}
            >
              <Icon name={play ? 'pause' : 'play'} size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
