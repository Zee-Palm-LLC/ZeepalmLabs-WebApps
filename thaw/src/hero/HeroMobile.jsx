import { useLayoutEffect, useRef, useState } from 'react'
import { W, H, HEAD } from './layout.js'
import { BARS, SIGNALS } from './data.js'
import { Word, CheckChart, DotMatrix } from './parts.jsx'
import { useHeroMotion } from './useHeroMotion.js'
import './hero-mobile.css'

const NAV_H = 58

function frame(vw) {
  const k = vw / 700
  const stageH = Math.round(vw * 1.28)
  const tx = vw / 2 - (HEAD.x + HEAD.w * 0.5) * k
  const ty = stageH - H * k
  return { k, stageH, tx, ty }
}

export default function HeroMobile() {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const root = useRef(null)
  const [vw, setVw] = useState(() => window.innerWidth)
  const [live] = useState(() => BARS.map(() => 1))

  useLayoutEffect(() => {
    const fit = () => setVw(window.innerWidth)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useHeroMotion(wrap, root, canvas, 'mobile')
  const f = frame(vw)

  return (
    <section className="hero hero-m" ref={wrap} aria-label="THAW introduction">
      <div className="hm" ref={root}>
        <div className="hm-stage" style={{ height: f.stageH + NAV_H }}>
          <div className="hero-canvas hm-canvas" style={{ width: W, height: H, transform: `translate(${f.tx}px, ${f.ty + NAV_H}px) scale(${f.k})` }}>
            <canvas className="hero-gl" ref={canvas} />
          </div>
          <h1 className="sr-only">Clarity begins here. THAW, AI support for anxiety and burnout.</h1>
          <Word text="Clarity" className="w-clarity hm-w" style={{ top: NAV_H + vw * 0.17 }} />
          <Word text="Begins" className="w-begins hm-w" style={{ top: NAV_H + vw * 0.84 }} />
          <Word text="Here" className="w-here hm-w" style={{ top: NAV_H + vw * 1.07 }} />
          <span className="mono hm-drag" data-a="fade">
            Drag the head to turn
          </span>
        </div>

        <div className="hm-cards grp-left">
          <div className="hm-row mono">
            <span className="mute" data-a="fade">
              Hi, Kris
            </span>
            <span className="t-week" data-a="fade">
              This week
            </span>
          </div>

          <div className="panel hm-stats">
            {SIGNALS.map(([k, v]) => (
              <div className="hm-sig" key={k} data-a="row">
                <span className="mono t-key">{k}</span>
                <span className="mono t-val" data-scramble={v}>
                  {v}
                </span>
              </div>
            ))}
            <DotMatrix />
          </div>

          <div className="panel hm-cold">
            <span className="cold-fill" />
            <div className="hm-cold-top mono">
              <span className="mute-2" data-a="fade">
                {'//'}
              </span>
              <span className="t-cold" data-scramble="Cold spot detected">
                Cold spot detected
              </span>
            </div>
            <div className="mono t-pct" data-a="fade">
              <span data-count="50">50</span>%
            </div>
            <div className="dotted" />
            <div className="t-stress">Work-Related Stress</div>
          </div>

          <p className="t-para">
            <span>Anxiety and burnout build up like frost. THAW uses AI to track what’s underneath — and helps it melt, one session at a time.</span>
          </p>

          <div className="panel check hm-check">
            <div className="hm-check-top">
              <div className="t-check">Today’s Check-In</div>
              <div className="mono hm-next">
                <span className="mute-2" data-a="fade">
                  Next
                </span>
                <span className="t-tonight" data-a="fade">
                  Tonight, 8:00 PM
                </span>
              </div>
            </div>
            <CheckChart live={live} />
          </div>

          <a className="start hm-start" href="#begin">
            <span className="start-fill" />
            <span className="start-text">Start First Session</span>
            <span className="start-sq">
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
