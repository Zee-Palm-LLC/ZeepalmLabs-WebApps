import { useEffect, useRef, useState } from 'react'
import { STAGES } from '../lib/data'
import { gsap, ScrollTrigger, reducedMotion } from '../lib/scroll'
import { setState } from '../lib/store'
import Board from '../stages/Board'
import Timer from '../stages/Timer'
import Aha from '../stages/Aha'
import Scores from '../stages/Scores'
import Sketch from '../stages/Sketch'

const VISUALS = { board: Board, timer: Timer, aha: Aha, scores: Scores, sketch: Sketch }
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·()&'

function scramble(el, text, duration = 0.9) {
  const state = { p: 0 }
  return gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const n = Math.floor(state.p * text.length)
      let out = text.slice(0, n)
      for (let i = n; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      el.textContent = out
    },
    onComplete: () => {
      el.textContent = text
    },
  })
}

function Words({ text }) {
  return text.split(' ').map((w, i, a) => (
    <span key={i} className="mask">
      <span className="w">
        {w}
        {i < a.length - 1 ? ' ' : ''}
      </span>
    </span>
  ))
}

function Stage({ s, index }) {
  const root = useRef(null)
  const [active, setActive] = useState(false)
  const Visual = VISUALS[s.mood]

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const still = reducedMotion()
      const eyebrow = el.querySelector('.eyebrow')
      const tl = gsap.timeline({ paused: true })
      tl.fromTo('.stage__n .d', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08 }, 0)
        .add(() => scramble(eyebrow, s.eyebrow.toUpperCase()), 0.15)
        .fromTo('.stage__title .w', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.05 }, 0.15)
        .fromTo('.stage__body', { y: 26, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 0.4)
        .fromTo('.stage__tilt', { y: 70, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: 'expo.out' }, 0.05)
      if (still) tl.progress(1)

      ScrollTrigger.create({
        trigger: el,
        start: 'top 72%',
        once: true,
        onEnter: () => tl.play(),
      })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        end: 'bottom 35%',
        onToggle: (self) => setActive(self.isActive),
      })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setState({ stage: index }),
        onEnterBack: () => setState({ stage: index }),
        onLeaveBack: () => index === 0 && setState({ stage: -1 }),
      })
      gsap.fromTo('.stage__card', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [index, s])

  useEffect(() => {
    const card = root.current.querySelector('.stage__tilt')
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reducedMotion()) return
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    const move = (e) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      rx(-y * 5)
      ry(x * 6)
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    card.addEventListener('pointermove', move)
    card.addEventListener('pointerleave', leave)
    return () => {
      card.removeEventListener('pointermove', move)
      card.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <section id={`stage-${s.id}`} ref={root} className={`stage stage--${s.mood} ${active ? 'is-active' : ''}`} data-mood={s.mood} data-section="stages" aria-labelledby={`st-${s.id}`}>
      <div className="stage__frame">
        <div className="stage__text">
          <div className="stage__n" aria-hidden="true">
            {s.n.split('').map((d, i) => (
              <span className="mask" key={i}>
                <span className="d">{d}</span>
              </span>
            ))}
          </div>
          <p className="eyebrow" aria-label={s.eyebrow}>
            {s.eyebrow.toUpperCase()}
          </p>
          <h3 className="stage__title" id={`st-${s.id}`}>
            <span className="sr-only">
              Stage {s.n}, {s.name}:{' '}
            </span>
            <Words text={s.title} />
          </h3>
          <p className="stage__body">{s.body}</p>
        </div>
        <div className="stage__card">
          <div className="stage__tilt">
            <Visual active={active} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Stages() {
  return (
    <div id="stages" className="stages">
      {STAGES.map((s, i) => (
        <Stage key={s.id} s={s} index={i} />
      ))}
    </div>
  )
}
