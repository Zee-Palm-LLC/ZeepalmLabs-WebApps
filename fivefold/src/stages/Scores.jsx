import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IDEAS, SCORE_KEYS, SCORE_NAMES } from '../lib/data'
import { gsap } from '../lib/scroll'

const best = IDEAS.reduce((b, x, i) => (x.scores.reduce((a, c) => a + c, 0) > IDEAS[b].scores.reduce((a, c) => a + c, 0) ? i : b), 0)

export default function Scores({ active }) {
  const root = useRef(null)
  const frame = useRef(null)
  const [chosen, setChosen] = useState(-1)
  const [counts, setCounts] = useState(() => IDEAS.map((x) => x.scores.map(() => 0)))
  const played = useRef(false)

  const place = (i, animate = true) => {
    const col = root.current.querySelectorAll('.idea')[i]
    if (!col) return
    const vars = { x: col.offsetLeft, y: col.offsetTop, width: col.offsetWidth, height: col.offsetHeight }
    if (animate) gsap.to(frame.current, { ...vars, opacity: 1, duration: 0.7, ease: 'expo.out' })
    else gsap.set(frame.current, vars)
  }

  useLayoutEffect(() => {
    gsap.set(root.current.querySelectorAll('.bar__fill'), { scaleY: 0, transformOrigin: '50% 100%' })
    gsap.set(frame.current, { opacity: 0 })
  }, [])

  useEffect(() => {
    if (!active || played.current) return
    played.current = true
    const fills = root.current.querySelectorAll('.bar__fill')
    const state = { p: 0 }
    const tl = gsap.timeline()
    tl.to(fills, { scaleY: 1, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, 0)
      .to(state, { p: 1, duration: 1.4, ease: 'expo.out', onUpdate: () => setCounts(IDEAS.map((x) => x.scores.map((v) => Math.round(v * state.p)))) }, 0)
      .add(() => place(0), 1.0)
      .add(() => place(1), 1.35)
      .add(() => place(2), 1.7)
      .add(() => {
        place(best)
        setChosen(best)
      }, 2.05)
  }, [active])

  useEffect(() => {
    const onResize = () => chosen >= 0 && place(chosen, false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [chosen])

  const choose = (i) => {
    setChosen(i)
    place(i)
    const fills = root.current.querySelectorAll('.idea')[i].querySelectorAll('.bar__fill')
    gsap.fromTo(fills, { scaleY: 0.85 }, { scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', stagger: 0.05 })
  }

  return (
    <div className="scores" ref={root}>
      {IDEAS.map((idea, i) => {
        const total = idea.scores.reduce((a, c) => a + c, 0)
        return (
          <button key={idea.id} className={`idea ${chosen === i ? 'is-chosen' : ''}`} onClick={() => choose(i)} data-cursor="Choose" aria-pressed={chosen === i} aria-label={`${idea.name} program: ${idea.scores.map((v, k) => `${SCORE_NAMES[k]} ${v}`).join(', ')}. Total ${total}`}>
            <span className="idea__head">
              <b>{idea.name}</b>
              <small>Total {counts[i].reduce((a, c) => a + c, 0)}</small>
            </span>
            <span className="idea__bars">
              {idea.scores.map((v, k) => (
                <span className="bar" key={k}>
                  <span className="bar__v">{counts[i][k]}</span>
                  <span className="bar__track" style={{ height: `${v}%` }}>
                    <span className="bar__fill" />
                  </span>
                  <span className="bar__k">{SCORE_KEYS[k]}</span>
                </span>
              ))}
            </span>
          </button>
        )
      })}
      <span className="scores__frame" ref={frame} aria-hidden="true">
        <span className="scores__tag">Chosen</span>
      </span>
    </div>
  )
}
