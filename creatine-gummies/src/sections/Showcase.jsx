import { useEffect, useRef, useState } from 'react'
import { FLAVORS } from '../data/flavors.js'
import { CanAnchor } from '../three/CanLayer.jsx'
import { Fruit, Icon } from '../ui/art.jsx'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import { useStage } from '../lib/fit.js'
import './showcase.css'

const arcOf = (a) => `M ${a.cx - a.r} ${a.cy} A ${a.r} ${a.r} 0 0 1 ${a.cx + a.r} ${a.cy}`
const A_D = { cx: 742, cy: 791, r: 640 }
const A_M = { cx: 215, cy: 400, r: 300 }
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
const STEP = 150
const N = FLAVORS.length
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (t) => t * t * (3 - 2 * t)
const still = new URLSearchParams(window.location.search).has('still')

export default function Showcase() {
  const wrap = useRef(null)
  const stage = useRef(null)
  const cans = useRef([])
  const st = useRef({ p: 0, e: still ? 1 : 0 })
  const [i, setI] = useState(0)
  const v = useStage(900)
  const vr = useRef(v)
  vr.current = v
  const f = FLAVORS[i]
  const arc = v.m ? A_M : A_D

  const apply = () => {
    const el = stage.current
    if (!el) return
    const { p, e } = st.current
    const s = vr.current.s
    const a = vr.current.m ? A_M : A_D
    const x = p * (N - 1)
    const seg = Math.min(N - 2, Math.floor(x))
    const pos = x >= N - 1 ? N - 1 : seg + smooth(clamp((x - seg - 0.22) / 0.56))
    const lift = 1 - e
    const groups = el.querySelectorAll('.arc-g')
    const photos = el.querySelectorAll('.sc-photo')
    const badges = el.querySelectorAll('.sc-badge')
    for (let k = 0; k < N; k++) {
      const d = k - pos
      const ad = Math.abs(d)
      const g = groups[k]
      if (g) {
        g.setAttribute('transform', `rotate(${d * STEP + lift * 26} ${a.cx} ${a.cy})`)
        g.style.opacity = clamp(1 - (ad - 0.6) * 2.5)
      }
      const vis = clamp(1 - (ad - 0.3) * 1.7)
      for (let j = 0; j < 2; j++) {
        const ph = photos[k * 2 + j]
        if (!ph) continue
        const yy = d * (j ? 640 : 560) + lift * 220
        ph.style.transform = `translate3d(0, ${yy}px, 0)`
        ph.style.opacity = vis * e
        ph.style.filter = ad > 0.04 || e < 1 ? `blur(${Math.min(12, ad * 14 + lift * 10)}px)` : 'none'
      }
      const b = badges[k]
      if (b) b.style.transform = `scale(${clamp(1 - ad * 2.4) * e})`
      const h = cans.current[k]
      if (h) {
        h.dy = (d * 820 + lift * 640) * s
        h.rotZ = (vr.current.m ? -0.32 : -0.4) + d * 0.5
        h.rotY = d * -1.6
        h.opacity = ad < 1.05 ? 1 : 0
      }
    }
    const r = Math.round(pos)
    setI((o) => (o === r ? o : r))
  }

  useEffect(() => {
    const trig = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 4.2}`,
      pin: stage.current,
      onUpdate: (self) => {
        st.current.p = self.progress
        apply()
      },
    })
    const el = stage.current
    let tl = null
    if (!still) {
      gsap.set(el.querySelectorAll('.arc-g:first-of-type .arc-ch'), { fillOpacity: 0 })
      gsap.set(el.querySelectorAll('.sc-swap'), { opacity: 0 })
    }
    const enter = still
      ? null
      : ScrollTrigger.create({
          trigger: wrap.current,
          start: 'top 72%',
          once: true,
          onEnter: () => {
            tl = gsap.timeline()
            tl.to(st.current, { e: 1, duration: 1.5, ease: 'power3.out', onUpdate: apply }, 0)
            tl.fromTo(el.querySelectorAll('.arc-g:first-of-type .arc-ch'), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.45, stagger: 0.045, ease: 'power1.out' }, 0.05)
            tl.fromTo(el.querySelectorAll('.sc-swap'), { opacity: 0, filter: 'blur(10px)', y: 16 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0.45)
          },
        })
    apply()
    return () => {
      trig.kill()
      enter?.kill()
      tl?.kill()
    }
  }, [])

  useEffect(() => {
    apply()
  }, [v.m, v.s])

  const word = (w, k, hot = 1) =>
    [...w.toUpperCase()].map((c, j) => (
      <tspan key={`${k}${j}`} className={`arc-ch ${k === hot ? 'hot' : ''}`}>
        {c}
      </tspan>
    ))

  const tf = { width: v.W, height: v.H, transform: `translate(${v.ox}px, ${v.oy}px) scale(${v.s})` }
  const pos = (k) => (v.m ? { l: [16, Math.round(v.H * LAYOUT_M[k][0])], r: [302, Math.round(v.H * LAYOUT_M[k][1])] } : LAYOUT[k])

  return (
    <section className={`showcase ${v.m ? 'm' : ''}`} id="showcase" ref={wrap} style={{ '--accent': f.accent, '--H': `${v.H}px` }}>
      <div className="sc-stage" ref={stage}>
        <div className="sc-c" style={tf}>
          <svg className="sc-arc" viewBox={v.m ? '0 0 430 420' : '0 0 1440 600'} aria-label={f.name}>
            <defs>
              <path id="arcpath" d={arcOf(arc)} />
            </defs>
            {FLAVORS.map((x) => (
              <g className="arc-g" key={x.id} style={{ '--hot': x.accent }}>
                <text className="arc-text">
                  <textPath href="#arcpath" startOffset="50%" textAnchor="middle">
                    {word(x.words[0], 0, x.hot ?? 1)}
                    <tspan className="arc-ch"> </tspan>
                    {word(x.words[1], 1, x.hot ?? 1)}
                  </textPath>
                </text>
              </g>
            ))}
          </svg>
          {FLAVORS.map((x, k) => (
            <CanAnchor key={x.id} flavor={x.id} className="sc-can" init={{ rotZ: -0.4, rotX: 0.1, opacity: k ? 0 : 1, dy: still ? 0 : 900 }} onReady={(h) => ((cans.current[k] = h), apply())} />
          ))}
          {FLAVORS.map((x, k) => [
            <figure className="sc-photo" style={{ left: pos(k).l[0], top: pos(k).l[1] }} key={`l${x.id}`}>
              <img src={`/img/${x.photos[0]}.webp`} alt="" />
            </figure>,
            <figure className="sc-photo" style={{ left: pos(k).r[0], top: pos(k).r[1] }} key={`r${x.id}`}>
              <img src={`/img/${x.photos[1]}.webp`} alt="" />
            </figure>,
          ])}
          <div className="sc-copy">
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
          {FLAVORS.map((x) => (
            <div className="sc-badge" key={x.id}>
              <Fruit kind={x.fruit} size={v.m ? 46 : 70} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
