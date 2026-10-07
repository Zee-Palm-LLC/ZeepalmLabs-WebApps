import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/smooth.js'
import Mark from '../ui/Mark.jsx'
import './session.css'

const SCRIPT = [
  { who: 'thaw', text: 'You mentioned work three times this week. Want to look at what happens right before the tension starts?', note: ['Theme', 'Work pressure'] },
  { who: 'you', text: 'Mostly Sunday nights. I start replaying everything I didn’t finish.', note: ['Trigger', 'Sunday evening'] },
  { who: 'thaw', text: 'That’s a really common cold spot. Let’s try something small: name it, size it, then decide what’s actually yours to carry.', note: ['Technique', 'Cognitive defusion'] },
  { who: 'you', text: 'Name it: the client deck. Size it… maybe a 7 out of 10.', note: ['Intensity', '7 / 10'] },
  { who: 'thaw', text: 'Thanks for being specific. A 7 is heavy. Which part of the deck can wait until Monday at 10, on purpose?', note: ['Next step', 'Plan, then park it'] },
]

export default function Session() {
  const ref = useRef(null)
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    const timers = []
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 65%',
      onEnter: () => {
        if (started.current) return
        started.current = true
        let t = 200
        SCRIPT.forEach((m, i) => {
          const think = m.who === 'thaw' ? 1300 : 900
          timers.push(setTimeout(() => setTyping(m.who), t))
          t += think
          timers.push(
            setTimeout(() => {
              setTyping(false)
              setShown(i + 1)
            }, t)
          )
          t += 700 + m.text.length * 8
        })
      },
    })
    return () => {
      st.kill()
      timers.forEach(clearTimeout)
    }
  }, [])

  const notes = SCRIPT.slice(0, shown).map((m) => m.note)

  return (
    <section className="sec session" ref={ref}>
      <div className="wrap">
        <div className="eyebrow">
          <span>
            {'// 03 — '}
            <b>Inside a session</b>
          </span>
          <span>12 min · Guided</span>
        </div>
        <div className="session-grid">
          <div className="session-intro">
            <h2 className="display session-title">
              A conversation,
              <br />
              not a questionnaire.
            </h2>
            <p className="lead">THAW listens for the thing underneath, then offers one small, concrete step. No lectures, no streak guilt, nothing you have to perform.</p>
          </div>
          <div className="chat pane" aria-live="polite">
            <header className="chat-head mono-s">
              <span className="chat-id">
                <Mark size={18} className="chat-mark" />
                THAW · Session 03
              </span>
              <span className="dim">Encrypted</span>
            </header>
            <div className="chat-body">
              {SCRIPT.slice(0, shown).map((m, i) => (
                <div key={i} className={`msg ${m.who}`}>
                  <span className="mono-s msg-who">{m.who === 'thaw' ? 'THAW' : 'You'}</span>
                  <p>{m.text}</p>
                </div>
              ))}
              {typing ? (
                <div className={`msg ${typing} typing`}>
                  <span className="mono-s msg-who">{typing === 'thaw' ? 'THAW' : 'You'}</span>
                  <p>
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          <aside className="notes pane">
            <header className="mono-s">
              <span>Session notes</span>
              <span className="dim">{notes.length} / 5</span>
            </header>
            <ul>
              {SCRIPT.map((m, i) => (
                <li key={m.note[0]} className={i < notes.length ? 'on' : ''}>
                  <span className="mono-s dim">{m.note[0]}</span>
                  <b>{i < notes.length ? m.note[1] : '—'}</b>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
