import { useEffect, useRef, useState } from 'react'
import { FLAVORS } from '../data/flavors.js'
import { CanAnchor } from '../three/CanLayer.jsx'
import { Fruit, Icon } from '../ui/art.jsx'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import { useStage } from '../lib/fit.js'
import './showcase.css'

const arcOf = (a) => `M ${a.cx - a.r} ${a.cy} A ${a.r} ${a.r} 0 0 1 ${a.cx + a.r} ${a.cy}`
const ARC = arcOf({ cx: 742, cy: 791, r: 640 })
const ARC_M = arcOf({ cx: 215, cy: 400, r: 300 })
const LAYOUT = [
  { l: [80, 424], r: [1142, 222] },
  { l: [80, 552], r: [1142, 364] },
  { l: [80, 356], r: [1142, 708] },
  { l: [80, 276], r: [1142, 612] },
  { l: [80, 536], r: [1142, 332] },
]
const LAYOUT_M = [
  [0.5, 0.31],
  [0.47, 0.36],
  [0.42, 0.52],
  [0.36, 0.5],
  [0.49, 0.33],
]

export default function Showcase() {
  const wrap = useRef(null)
  const stage = useRef(null)
  const can = useRef(null)
  const [i, setI] = useState(0)
  const f = FLAVORS[i]
  const v = useStage(900)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 4.2}`,
      pin: stage.current,
      onUpdate: (self) => {
        const k = Math.min(FLAVORS.length - 1, Math.floor(self.progress * FLAVORS.length * 0.999))
        setI((v) => (v === k ? v : k))
        stage.current.style.setProperty('--p', self.progress)
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    const el = stage.current
    const h = can.current
    const tl = gsap.timeline()
    tl.fromTo(el.querySelectorAll('.arc-ch'), { opacity: 0, rotate: -14, y: 40 }, { opacity: 1, rotate: 0, y: 0, duration: 0.7, ease: 'back.out(2)', stagger: { each: 0.025 } }, 0)
    tl.fromTo(el.querySelectorAll('.sc-photo'), { y: 80, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.05)
    tl.fromTo(el.querySelectorAll('.sc-swap'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, 0.1)
    tl.fromTo(el.querySelector('.sc-badge'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.2)' }, 0.25)
    if (h) tl.fromTo(h, { rotY: -Math.PI * 1.2, dy: 60, scale: 0.85 }, { rotY: 0, dy: 0, scale: 1, duration: 1.1, ease: 'expo.out' }, 0)
    return () => tl.kill()
  }, [i])

  const word = (w, k) =>
    [...w.toUpperCase()].map((c, j) => (
      <tspan key={`${k}${j}`} className={`arc-ch ${k ? 'hot' : ''}`}>
        {c}
      </tspan>
    ))

  const pos = v.m ? { l: [16, Math.round(v.H * LAYOUT_M[i][0])], r: [302, Math.round(v.H * LAYOUT_M[i][1])] } : LAYOUT[i]
  const tf = { width: v.W, height: v.H, transform: `translate(${v.ox}px, ${v.oy}px) scale(${v.s})` }
  return (
    <section className={`showcase ${v.m ? 'm' : ''}`} id="showcase" ref={wrap} style={{ '--accent': f.accent, '--H': `${v.H}px` }}>
      <div className="sc-stage" ref={stage}>
        <div className="sc-c" style={tf}>
          <svg className="sc-arc" viewBox={v.m ? '0 0 430 420' : '0 0 1440 600'} aria-label={f.name}>
            <defs>
              <path id="arcpath" d={v.m ? ARC_M : ARC} />
            </defs>
            <text className="arc-text" key={f.id}>
              <textPath href="#arcpath" startOffset="50%" textAnchor="middle">
                {word(f.words[0], 0)}
                <tspan className="arc-ch"> </tspan>
                {word(f.words[1], 1)}
              </textPath>
            </text>
          </svg>
          <CanAnchor flavor={f.id} className="sc-can" init={{ rotZ: -0.24, rotX: 0.14 }} onReady={(h) => (can.current = h)} />
          <figure className="sc-photo" style={{ left: pos.l[0], top: pos.l[1] }} key={`l${f.id}`}>
            <img src={`/img/${f.photos[0]}.webp`} alt="" />
          </figure>
          <figure className="sc-photo" style={{ left: pos.r[0], top: pos.r[1] }} key={`r${f.id}`}>
            <img src={`/img/${f.photos[1]}.webp`} alt="" />
          </figure>
          <div className="sc-copy" key={`c${f.id}`}>
            <div className="sc-icons sc-swap">
              <Icon name="heart" size={34} />
              <Icon name="smile" size={34} />
              <Icon name="pill" size={34} />
            </div>
            <h3 className="serif sc-swap">Good for Any Moment</h3>
            <p className="sc-swap">
              Whether you’re training, studying, or just getting through the day, our{' '}
              <br />
              gummies fit effortlessly into any lifestyle. Designed to surprise and{' '}
              <br />
              energize, they turn daily creatine into a treat you’ll actually enjoy.{' '}
              <br />
              Simple, tasty, and never ordinary.
            </p>
          </div>
          <ol className="sc-dots" aria-hidden="true">
            {FLAVORS.map((x, k) => (
              <li key={x.id} className={k === i ? 'on' : ''} style={{ '--c': x.accent }} />
            ))}
          </ol>
        </div>
        <div className="sc-top" style={tf}>
          <div className="sc-badge" key={`b${f.id}`}>
            <Fruit kind={f.fruit} size={70} />
          </div>
        </div>
      </div>
    </section>
  )
}
