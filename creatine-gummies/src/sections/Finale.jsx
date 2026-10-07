import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/smooth.js'
import { scrollToId } from '../lib/smooth.js'
import { CanAnchor } from '../three/CanLayer.jsx'
import { Fruit, Icon, LogoMark } from '../ui/art.jsx'
import './finale.css'

const CANS = [
  { id: 'straw', cls: 'fc-1', rotZ: -0.2, rotY: 0.22 },
  { id: 'berry', cls: 'fc-2', rotZ: 0.05, rotY: 0 },
  { id: 'apple', cls: 'fc-3', rotZ: 0.22, rotY: -0.26 },
]
const NAV = [
  ['Home', 'top'],
  ['Flavours', 'flavours'],
  ['Benefits', 'benefits'],
  ['Shop All', 'flavours'],
  ['FAQ', 'faq'],
]
const SOCIAL = ['Instagram', 'Tik Tok', 'Facebook', 'Youtube']
const CLUSTER = [
  ['blueberry', 0, 92, 34, 0],
  ['apple', 42, 34, 82, -12],
  ['blueberry', 106, 6, 32, 0],
  ['strawberry', 136, 36, 50, 14],
  ['blueberry', 116, 92, 30, 0],
  ['strawberry', 160, 74, 44, -10],
  ['blueberry', 174, 30, 30, 0],
  ['strawberry', 196, 0, 46, 18],
  ['lemon', 206, 26, 104, 8],
  ['blueberry', 288, 0, 30, 0],
]

export default function Finale() {
  const root = useRef(null)
  const hs = useRef([])
  const [mail, setMail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.fn-title span, .fn-sub'), { opacity: 0, y: 40, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 70%' } })
      gsap.fromTo(el.querySelectorAll('.fn-foot > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el.querySelector('.fn-foot'), start: 'top 85%' } })
    }, el)
    return () => ctx.revert()
  }, [])

  const ready = (k, h) => {
    hs.current[k] = h
    const c = CANS[k]
    const st = { dy: 520, rotZ: c.rotZ * 3, rotY: c.rotY - 1.4 }
    Object.assign(h, st)
    gsap.to(h, {
      dy: 0,
      rotZ: c.rotZ,
      rotY: c.rotY,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: `top ${85 - k * 6}%`, end: 'top 10%', scrub: 1 },
    })
  }

  useEffect(() => {
    const move = (e) => {
      const x = e.clientX / window.innerWidth - 0.5
      hs.current.forEach((h, k) => h && gsap.to(h, { rotX: 0.3 + (e.clientY / window.innerHeight - 0.5) * 0.12, dx: x * (14 + k * 8), duration: 1.2, ease: 'power3.out', overwrite: 'auto' }))
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section className="finale" ref={root}>
      <h2 className="display fn-title">
        <span>Boost Your Strength,</span>
        <span>
          The <em>Tasty Way</em>
        </span>
      </h2>
      <p className="fn-sub">
        Three bold flavors, one easy daily habit -{' '}
        <br />
        pick yours and taste the difference.
      </p>
      <div className="fn-cans">
        {CANS.map((c, k) => (
          <CanAnchor key={c.id} flavor={c.id} className={`fn-can ${c.cls}`} init={{ rotZ: c.rotZ, rotX: 0.3, rotY: c.rotY }} onReady={(h) => ready(k, h)} />
        ))}
      </div>
      <footer className="fn-foot">
        <a className="fn-logo" href="#top" onClick={(e) => (e.preventDefault(), scrollToId('top'))}>
          <LogoMark size={42} className="fn-mark" />
          <span className="serif">Creatine Gummies</span>
        </a>
        <ul className="fn-links">
          {NAV.map(([t, id]) => (
            <li key={t}>
              <a href={`#${id}`} onClick={(e) => (e.preventDefault(), scrollToId(id))}>
                {t}
              </a>
            </li>
          ))}
        </ul>
        <ul className="fn-links fn-social">
          {SOCIAL.map((t) => (
            <li key={t}>
              <a href="#top" onClick={(e) => e.preventDefault()}>
                {t}
              </a>
            </li>
          ))}
        </ul>
        <form
          className={`fn-news ${sent ? 'sent' : ''}`}
          onSubmit={(e) => {
            e.preventDefault()
            if (/\S+@\S+\.\S+/.test(mail)) setSent(true)
          }}
        >
          <p>Get exclusive early access and stay informed about product updates, events, and more!</p>
          <label>
            <input type="email" value={mail} onChange={(e) => setMail(e.target.value)} placeholder={sent ? 'You’re on the list!' : 'Enter your email'} disabled={sent} aria-label="Email address" />
            <button aria-label="Subscribe">
              <Icon name={sent ? 'smile' : 'arrow'} size={22} />
            </button>
          </label>
        </form>
        <p className="fn-copy">© 2025 Creatine Gummies. All rights reserved.</p>
        <nav className="fn-legal" aria-label="Legal">
          <a href="#top" onClick={(e) => e.preventDefault()}>
            Cookie
          </a>
          <i>•</i>
          <a href="#top" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          <i>•</i>
          <a href="#top" onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>
        </nav>
        <div className="fn-cluster" aria-hidden="true">
          {CLUSTER.map(([kind, x, y, s, r], k) => (
            <span key={k} style={{ left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))`, width: `calc(${s} * var(--u))`, rotate: `${r}deg`, '--d': `${k * 0.18}s` }}>
              <Fruit kind={kind} size={s} />
            </span>
          ))}
        </div>
        <button className="fn-up" onClick={() => scrollToId('top')} aria-label="Back to top">
          <Icon name="up" size={18} />
        </button>
      </footer>
    </section>
  )
}
