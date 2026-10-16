import { useCallback, useEffect, useRef, useState } from 'react'
import Scene from './three/Scene.jsx'
import { FLAVORS, FEATURES, FAQ, HERO, FAQ_CATS, FAQ_CAT } from './data.js'
import { HeroHud, FeatureViz, Lab, Marquee, Compare, Athletes, Stats, Loader, Cursor, FooterBig } from './sections/Extra.jsx'
import { store, mod, smooth, clamp } from './store.js'
import { startScroll, scrollTo, ScrollTrigger } from './lib/scroll.js'
import { setSound, scrollTone, whoosh, tick } from './lib/audio.js'

const SECTIONS = [
  { id: 'hero', label: 'Flavours' },
  { id: 'dive', label: 'Benefits' },
  { id: 'lab', label: 'Sweat lab' },
  { id: 'lineup', label: 'The range' },
  { id: 'compare', label: 'Compare' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'faq', label: 'FAQ' },
  { id: 'join', label: 'Join the crew' },
]

function Nav({ sound, setSoundOn, onMenu, onShop, bag }) {
  return (
    <header className="nav">
      <div className="nav__line">
        <i className="nav__prog" />
      </div>
      <button className="nav__sound" onClick={() => setSoundOn(!sound)} aria-label="Toggle sound">
        <span className={`eq${sound ? ' is-on' : ''}`}>
          <i />
          <i />
          <i />
          <i />
        </span>
        Sound <b>{sound ? 'on' : 'off'}</b>
      </button>
      <a className="logo" href="#hero" onClick={(e) => (e.preventDefault(), scrollTo(0))}>
        <span className="logo__ring" />
        <b>KOVA</b>
        <small>HYDRATION</small>
      </a>
      <div className="nav__right">
        <button className="nav__menu" onClick={onMenu}>
          <span className="dots">
            <i />
            <i />
            <i />
            <i />
          </span>
          Menu
        </button>
        <button className="nav__shop" onClick={onShop}>
          Shop{bag > 0 && <em>{bag}</em>}
        </button>
      </div>
      <i className="crop crop--tl" />
      <i className="crop crop--tr" />
      <i className="crop crop--bl" />
      <i className="crop crop--br" />
    </header>
  )
}

function HeroUI({ active, go, onAdd }) {
  const f = FLAVORS[mod(active)]
  return (
    <div className="hero-ui">
      <HeroHud active={active} onAdd={onAdd} />
      <div className="lamp">
        <i className="lamp__cone" />
        <i className="lamp__disc" />
        <i className="lamp__ring" />
        <i className="lamp__core" />
      </div>
      <button className="arrow arrow--l" onClick={() => go(-1)} aria-label="Previous flavour">
        ‹
      </button>
      <button className="arrow arrow--r" onClick={() => go(1)} aria-label="Next flavour">
        ›
      </button>
      <div className="pedestal">
        <i className="pedestal__top" />
        <i className="pedestal__side" />
        <h2 key={f.id} className="flavname">
          {f.short.split('\n').map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
      </div>
      <div className="dots8">
        {FLAVORS.map((q, i) => (
          <button key={q.id} className={i === mod(active) ? 'is-on' : ''} style={{ '--c': q.glow }} onClick={() => go(i - mod(active))} aria-label={q.name} />
        ))}
      </div>
      <div className="rainbow" style={{ '--g': f.glow }} />
      <p className="hero-ui__cue">
        <span>Scroll</span>
        <i />
      </p>
      <p className="hero-ui__tag">
        Electrolyte hydration · Zero sugar
        <br />
        <b>{f.name}</b>
      </p>
    </div>
  )
}

function Dive({ active, step, intro }) {
  const f = FLAVORS[mod(active)]
  return (
    <section id="dive" className="s-dive">
      <div className="sticky">
        <div className={`dive-intro${intro ? ' is-on' : ''}`}>
          <p className="kicker">Flavour {String(mod(active) + 1).padStart(2, '0')} / 08</p>
          <h3>
            {f.short.split('\n').map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h3>
          <p className="body">{f.note}</p>
        </div>
        {FEATURES.map((ft, i) => (
          <div key={ft.id} className={`feature${step === i ? ' is-on' : ''}`}>
            <p className="feature__tag">
              <i />
              {ft.label}
            </p>
            <h3>
              {ft.title.split('\n').map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h3>
            <p className="body">{ft.text}</p>
            <FeatureViz id={ft.id} on={step === i} color={f.glow} />
          </div>
        ))}
        <p className="dive-num" aria-hidden="true">
          {step >= 0 ? String(step + 1).padStart(2, '0') : String(mod(active) + 1).padStart(2, '0')}
        </p>
        <p className="dive-tick">
          330 ML · 8 KCAL · 0 G SUGAR · PH 3.4 · <b>{f.name.toUpperCase()}</b> · BATCH 0426
        </p>
        <nav className="side">
          {FEATURES.map((ft, i) => (
            <button key={ft.id} className={step === i ? 'is-on' : ''} onClick={() => scrollToFeature(i)} aria-label={ft.label}>
              <span>{ft.icon}</span>
            </button>
          ))}
        </nav>
        <p className="dive-count">
          <b>{step >= 0 ? String(step + 1).padStart(2, '0') : '00'}</b> / 04
        </p>
      </div>
    </section>
  )
}

function scrollToFeature(i) {
  const el = document.getElementById('dive')
  const top = el.offsetTop
  const h = el.offsetHeight - window.innerHeight
  scrollTo(top + h * (0.44 + i * 0.145))
}

function Zero({ on }) {
  return (
    <section id="zero" className="s-zero">
      <div className="sticky">
        <div className={`zero${on ? ' is-on' : ''}`}>
          <h2>
            <span>Zero</span>
            <span>sugar.</span>
          </h2>
          <p>All of the flavour. None of the crash.</p>
        </div>
        <div className={`zchips${on ? ' is-on' : ''}`}>
          <span style={{ '--d': '0ms' }}>
            <b>0 g</b> sugar
          </span>
          <span style={{ '--d': '120ms' }}>
            <b>0</b> artificial sweeteners
          </span>
          <span style={{ '--d': '240ms' }}>
            <b>8</b> kcal per can
          </span>
          <span style={{ '--d': '360ms' }}>
            <b>100%</b> of the flavour
          </span>
        </div>
      </div>
    </section>
  )
}

function Lineup({ idx }) {
  return (
    <section id="lineup" className="s-line">
      <div className="sticky">
        <div className="line-head">
          <p className="kicker">The range</p>
          <h2>
            <span>Eight flavours.</span>
            <span>One mission.</span>
          </h2>
        </div>
        <div className="line-card" key={idx} style={{ '--c': FLAVORS[idx].glow }}>
          <p className="kicker">
            {String(idx + 1).padStart(2, '0')} / 08 · {FLAVORS[idx].name}
          </p>
          <p>{FLAVORS[idx].note}</p>
        </div>
        <ul className="line-names">
          {FLAVORS.map((f, i) => (
            <li key={f.id} className={i === idx ? 'is-on' : ''} style={{ '--c': f.glow }}>
              <i />
              {f.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  const [cat, setCat] = useState('All')
  const list = FAQ.map((q, i) => ({ ...q, i, cat: FAQ_CAT[i] })).filter((q) => cat === 'All' || q.cat === cat)
  return (
    <section id="faq" className="s-faq">
      <h2 className="mega">
        <span data-t="GOT ANY">GOT ANY</span>
        <span data-t="QUESTIONS?">QUESTIONS?</span>
      </h2>
      <div className="faq__grid">
        <aside className="faq__side">
          <div className="faq__cats">
            {FAQ_CATS.map((c) => (
              <button key={c} className={cat === c ? 'is-on' : ''} onClick={() => (tick(), setCat(c), setOpen(-1))}>
                {c}
                <small>{c === 'All' ? FAQ.length : FAQ_CAT.filter((x) => x === c).length}</small>
              </button>
            ))}
          </div>
          <div className="faq__card">
            <p className="kicker">Still thirsty?</p>
            <p>Our team of sports nutritionists replies within a day.</p>
            <a href="#join" onClick={(e) => (e.preventDefault(), scrollTo('#join'))}>
              Ask a nutritionist →
            </a>
          </div>
        </aside>
      <div className="acc">
        {list.map(({ i, ...q }) => (
          <div key={q.q} className={`acc__item${open === i ? ' is-open' : ''}`}>
            <button
              onClick={() => {
                tick()
                setOpen(open === i ? -1 : i)
              }}
            >
              <span>{q.q}</span>
              <i />
            </button>
            <div className="acc__a">
              <p>{q.a}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}

function Join() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return (
    <section id="join" className="s-join">
      <div className="join">
        <p className="kicker">Members get 15% off their first box</p>
        <h2 className="mega mega--sm">
          <span data-t="JOIN THE">JOIN THE</span>
          <span data-t="CREW">CREW</span>
        </h2>
        <p className="body">New flavours, training tips from our athletes and early access to drops. No spam, ever.</p>
        <ul className="perks">
          <li>
            <b>15%</b> off your first box
          </li>
          <li>
            <b>48 h</b> early access to drops
          </li>
          <li>
            <b>Weekly</b> training plans
          </li>
        </ul>
        <form
          className={`join__form${sent ? ' is-sent' : ''}`}
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) {
              setSent(true)
              whoosh()
            }
          }}
        >
          <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={sent} aria-label="Email address" />
          <button type="submit" disabled={!ok || sent}>
            {sent ? 'You are in ✓' : 'Join'}
          </button>
        </form>
        <p className="members">
          <span className="avs">
            {FLAVORS.slice(0, 5).map((f) => (
              <i key={f.id} style={{ background: `linear-gradient(140deg, ${f.glow}, ${f.body})` }} />
            ))}
          </span>
          Join 12,840 members training with KOVA
        </p>
      </div>
      <FooterBig />
      <footer className="foot">
        <div className="foot__links">
          <a href="#hero" onClick={(e) => (e.preventDefault(), scrollTo(0))}>
            Flavours
          </a>
          <a href="#faq" onClick={(e) => (e.preventDefault(), scrollTo('#faq'))}>
            FAQ
          </a>
          <a href="#join">Stockists</a>
          <a href="#join">Athletes</a>
          <a href="#join">Contact</a>
        </div>
        <p>© 2026 KOVA Hydration. A Zeepalm Labs concept. Drink responsibly and stay hydrated.</p>
      </footer>
    </section>
  )
}

function Menu({ open, close }) {
  return (
    <div className={`menu${open ? ' is-open' : ''}`} onClick={close}>
      <nav onClick={(e) => e.stopPropagation()}>
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            style={{ '--i': i }}
            onClick={() => {
              close()
              scrollTo(s.id === 'hero' ? 0 : `#${s.id}`)
            }}
          >
            <small>{String(i + 1).padStart(2, '0')}</small>
            {s.label}
          </button>
        ))}
      </nav>
      <button className="menu__x" onClick={close} aria-label="Close menu">
        ×
      </button>
    </div>
  )
}

function Shop({ open, close, bag, setBag }) {
  const [pack, setPack] = useState(12)
  const price = pack === 12 ? 29 : 52
  const items = Object.entries(bag).filter(([, n]) => n > 0)
  const count = items.reduce((a, [, n]) => a + n, 0)
  return (
    <aside className={`shop${open ? ' is-open' : ''}`}>
      <div className="shop__head">
        <h3>Build your box</h3>
        <button onClick={close} aria-label="Close shop">
          ×
        </button>
      </div>
      <div className="shop__pack">
        {[12, 24].map((p) => (
          <button key={p} className={pack === p ? 'is-on' : ''} onClick={() => setPack(p)}>
            <b>{p} cans</b>
            <small>£{p === 12 ? 29 : 52}</small>
          </button>
        ))}
      </div>
      <ul className="shop__list">
        {FLAVORS.map((f) => (
          <li key={f.id}>
            <i style={{ background: `linear-gradient(160deg, ${f.glow}, ${f.body})` }} />
            <span>{f.name}</span>
            <div className="step">
              <button onClick={() => setBag((b) => ({ ...b, [f.id]: Math.max(0, (b[f.id] || 0) - 1) }))}>−</button>
              <b>{bag[f.id] || 0}</b>
              <button
                onClick={() => {
                  tick()
                  setBag((b) => ({ ...b, [f.id]: (b[f.id] || 0) + 1 }))
                }}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="shop__foot">
        <p>
          {count} {count === 1 ? 'box' : 'boxes'} · {pack} cans each
        </p>
        <b>£{count * price}</b>
        <button disabled={!count}>Checkout (demo)</button>
      </div>
    </aside>
  )
}

export default function App() {
  const [active, setActive] = useState(HERO)
  const [step, setStep] = useState(-1)
  const [intro, setIntro] = useState(false)
  const [zeroOn, setZeroOn] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  const [sound, setSoundOn] = useState(false)
  const [menu, setMenu] = useState(false)
  const [shop, setShop] = useState(false)
  const [bag, setBag] = useState({})
  const [ready, setReady] = useState(false)
  const addBox = useCallback((id, n = 1) => {
    tick()
    setBag((b) => ({ ...b, [id]: (b[id] || 0) + n }))
    setShop(true)
  }, [])
  const rootRef = useRef(null)

  const go = useCallback((d) => {
    if (!d) return
    whoosh(d > 0)
    setActive((a) => a + d)
  }, [])

  useEffect(() => {
    store.active = active
  }, [active])

  useEffect(() => {
    store.onPick = (v) => {
      whoosh(v > store.active)
      setActive(v)
    }
  }, [])

  useEffect(() => {
    setSound(sound)
  }, [sound])

  useEffect(() => {
    const lenis = startScroll()
    const root = document.documentElement.style
    const mk = (id, key, start, end, cb) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start,
        end,
        onUpdate: (s) => {
          store[key] = s.progress
          cb?.(s.progress)
        },
        onLeave: () => {
          store[key] = 1
          cb?.(1)
        },
        onLeaveBack: () => {
          store[key] = 0
          cb?.(0)
        },
      })
    const ts = [
      mk('dive', 'dive', 'top top', 'bottom bottom', (p) => {
        setIntro(p > 0.08 && p < 0.4)
        setStep(p < 0.4 ? -1 : Math.min(3, Math.floor((p - 0.4) / 0.15)))
        root.setProperty('--o-hero', (1 - smooth(0, 0.08, p)).toFixed(3))
      }),
      mk('zero', 'smoke', 'top top', 'bottom bottom', (p) => setZeroOn(p > 0.22 && p < 0.9)),
      mk('lab', 'lab', 'top bottom', 'top top'),
      mk('lineup', 'line', 'top top', 'bottom bottom', (p) => setLineIdx(Math.min(7, Math.max(0, Math.round(p * 7))))),
      mk('mid', 'mid', 'top bottom', 'top top'),
      mk('faq', 'faq', 'top bottom', 'top top'),
      mk('join', 'join', 'top 85%', 'top top'),
      ScrollTrigger.create({ trigger: '.bigfoot', start: 'top 95%', end: 'top 35%', onUpdate: (s) => (store.foot = s.progress), onLeave: () => (store.foot = 1), onLeaveBack: () => (store.foot = 0) }),
    ]
    const prog = (e) => {
      const p = e.progress ?? 0
      root.setProperty('--scroll', p.toFixed(4))
      scrollTone(p)
    }
    lenis.on('scroll', prog)
    const mm = (e) => {
      store.mouse[0] = (e.clientX / window.innerWidth) * 2 - 1
      store.mouse[1] = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', mm)
    const key = (e) => {
      if (e.target.closest('input')) return
      if (store.dive > 0.02) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', key)
    return () => {
      ts.forEach((t) => t.kill())
      lenis.off('scroll', prog)
      window.removeEventListener('pointermove', mm)
      window.removeEventListener('keydown', key)
    }
  }, [go])

  useEffect(() => {
    let sx = null
    let moved = 0
    const down = (e) => {
      if (store.dive > 0.02 || e.target.closest('button, a, input, .shop, .menu')) return
      sx = e.clientX
      moved = 0
    }
    const move = (e) => {
      if (sx === null) return
      const dx = e.clientX - sx
      store.activeF = store.active - dx / (window.innerWidth * 0.18)
      moved = dx
    }
    const up = () => {
      if (sx === null) return
      const d = Math.round(-moved / (window.innerWidth * 0.18))
      sx = null
      if (d) go(clamp(d, -3, 3))
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [go])

  const bagCount = Object.values(bag).reduce((a, b) => a + b, 0)

  return (
    <div className={`app${ready ? ' is-ready' : ''}`} ref={rootRef}>
      <div className="bg">
        <i className="bg__hero" />
        <i className="bg__flav" />
        <i className="bg__beam" />
        <i className="bg__grain" />
      </div>
      <Scene />
      <Nav sound={sound} setSoundOn={setSoundOn} onMenu={() => setMenu(true)} onShop={() => setShop(true)} bag={bagCount} />
      <HeroUI active={active} go={go} onAdd={addBox} />
      <main className="page">
        <section id="hero" className="s-hero" />
        <Dive active={active} step={step} intro={intro} />
        <Zero on={zeroOn} />
        <Lab onAdd={addBox} />
        <Lineup idx={lineIdx} />
        <div id="mid" className="mid">
          <Marquee />
          <Compare />
          <Athletes />
          <Stats />
        </div>
        <Faq />
        <Join />
      </main>
      <Cursor />
      <Loader done={() => setReady(true)} />
      <Menu open={menu} close={() => setMenu(false)} />
      <Shop open={shop} close={() => setShop(false)} bag={bag} setBag={setBag} />
      {shop && <div className="scrim" onClick={() => setShop(false)} />}
    </div>
  )
}
