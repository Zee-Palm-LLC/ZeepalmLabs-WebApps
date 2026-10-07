import { useLayoutEffect, useRef, useState } from 'react'
import { W, H, L, fitView } from './layout.js'
import { BARS, SIGNALS } from './data.js'
import { Word, CheckChart, DotMatrix } from './parts.jsx'
import { useHeroMotion } from './useHeroMotion.js'
import HeroMobile from './HeroMobile.jsx'
import './hero.css'

function HeroDesktop() {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const root = useRef(null)
  const [view, setView] = useState(() => fitView(window.innerWidth, window.innerHeight))
  const [live] = useState(() => BARS.map(() => 1))

  useLayoutEffect(() => {
    const fit = () => setView(fitView(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useHeroMotion(wrap, root, canvas, 'desktop')

  return (
    <section className="hero hero-d" ref={wrap} style={{ height: H * view.s }} aria-label="THAW introduction">
      <canvas className="hero-gl hero-gl-full" ref={canvas} />
      <div className="hero-canvas" ref={root} style={{ width: W, height: H, transform: `translate(${view.ox}px, 0) scale(${view.s})` }}>

        <h1 className="sr-only">Clarity begins here. THAW, AI support for anxiety and burnout.</h1>
        <Word text="Clarity" className="w-clarity" style={{ left: L.clarity.x, top: L.clarity.y }} kern={L.clarity.kern} />
        <Word text="Begins" className="w-begins" style={{ left: L.begins.x, top: L.begins.y }} kern={L.begins.kern} sx={L.begins.sx} />
        <Word text="Here" className="w-here" style={{ left: L.here.x, top: L.here.y }} />

        <div className="grp grp-left">
        <div className="mono t-hi mute" style={{ left: L.hi.x, top: L.hi.y }} data-a="fade">
          Hi, Kris
        </div>
        <div className="mono t-week" style={{ right: W - L.week.r, top: L.week.y }} data-a="fade">
          This week
        </div>

        <div className="panel p-stats" style={{ left: L.stats.x, top: L.stats.y, width: L.stats.w, height: L.stats.h }} data-a="panel">
          <span className="panel-sheen" />
        </div>
        {SIGNALS.map(([k, v], i) => (
          <div key={k} className="signal" data-a="row" style={{ top: L.rows.y + i * L.rows.gap }}>
            <span className="mono t-key" style={{ left: L.rows.x }}>
              {k}
            </span>
            <span className="mono t-val" style={{ right: W - L.rows.r }} data-scramble={v}>
              {v}
            </span>
          </div>
        ))}
        <DotMatrix />

        <div className="panel cold" style={{ left: L.cold.x, top: L.cold.y, width: L.cold.w, height: L.cold.h }} data-a="panel">
          <span className="cold-fill" style={{ left: L.cold.w / 2, top: L.cold.band, width: L.cold.w / 2, height: L.cold.h - L.cold.band }} />
          <span className="panel-sheen" />
        </div>
        <div className="dotted" style={{ left: L.cold.x, top: L.cold.line, width: L.cold.w }} data-a="line" />
        <div className="mono t-slash mute-2" style={{ left: L.slash.x, top: L.slash.y }} data-a="fade">
          {'//'}
        </div>
        <div className="mono t-cold" style={{ right: W - L.coldLabel.r, top: L.coldLabel.y }} data-a="fade" data-scramble="Cold spot detected">
          Cold spot detected
        </div>
        <div className="mono t-pct" style={{ left: L.pct.x, top: L.pct.y }} data-a="fade">
          <span data-count="50">50</span>%
        </div>
        <div className="t-stress" style={{ left: L.stress.x, top: L.stress.y, fontSize: L.stress.size }} data-a="rise">
          Work-Related Stress
        </div>

        <p className="t-para" style={{ left: L.para.x, top: L.para.y, fontSize: L.para.size, lineHeight: `${L.para.lh}px`, width: L.para.w }} data-a="para">
          <span>Anxiety and burnout build up like frost. THAW</span>
          <span>uses AI to track what’s underneath — and helps</span>
          <span>it melt, one session at a time.</span>
        </p>
        </div>

        <div className="grp grp-right">
        <div className="panel check" style={{ left: L.check.x, top: L.check.y, width: L.check.w, height: L.check.h }} data-a="panel">
          <span className="panel-sheen" />
          <div className="t-check" style={{ left: L.checkTitle.x - L.check.x, top: L.checkTitle.y - L.check.y, fontSize: L.checkTitle.size }}>
            Today’s Check-In
          </div>
          <CheckChart live={live} />
        </div>

        <div className="mono t-next mute-2" style={{ left: L.next.x, top: L.next.y }} data-a="fade">
          Next
        </div>
        <div className="mono t-tonight" style={{ left: L.tonight.x, top: L.tonight.y, lineHeight: `${L.tonight.lh}px` }} data-a="fade">
          Tonight,
          <br />
          8:00 PM
        </div>

        <a className="start" href="#begin" style={{ left: L.btn.x, top: L.btn.y, width: L.btn.w, height: L.btn.h }} data-a="btn">
          <span className="start-fill" />
          <span className="start-text" style={{ left: L.btnText.x - L.btn.x, top: L.btnText.y - L.btn.y, fontSize: L.btnText.size }}>
            Start First Session
          </span>
          <span className="start-sq" style={{ right: L.btn.inset, top: L.btn.inset, width: L.btn.h - L.btn.inset * 2, height: L.btn.h - L.btn.inset * 2 }}>
            <svg viewBox="0 0 14.4 9.4" aria-hidden="true">
              <path d="M1.1 0.9V4.7H13.1M9.5 1.1L13.1 4.7L9.5 8.3" />
            </svg>
          </span>
        </a>
        </div>
      </div>
    </section>
  )
}

const narrowQuery = '(max-width: 899px)'

export default function Hero() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(narrowQuery).matches)
  useLayoutEffect(() => {
    const mq = window.matchMedia(narrowQuery)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow ? <HeroMobile key="m" /> : <HeroDesktop key="d" />
}
