import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CHIPS, TRACKERS } from '../lib/data.js'
import { Icon, OrbMark } from '../ui/icons.jsx'
import { Block } from './cards.jsx'
import { improvePrompt } from './engine.js'
import './chat.css'

const MODES = [
  { id: 'Auto', note: 'Picks the best mode for you' },
  { id: 'Clinical', note: 'Precise, medical detail' },
  { id: 'Coach', note: 'Friendly habits and motivation' },
  { id: 'Mind', note: 'Calm support for stress' },
]

function Streamed({ text, run, onDone }) {
  const words = text.split(' ')
  const [n, setN] = useState(run ? 0 : words.length)
  useEffect(() => {
    if (!run) return
    let i = 0
    const id = setInterval(() => {
      i += 2
      setN(Math.min(words.length, i))
      if (i >= words.length) {
        clearInterval(id)
        onDone?.()
      }
    }, 38)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="msg-text">
      {words.slice(0, n).join(' ')}
      {n < words.length && <span className="caret" />}
    </p>
  )
}

function BotMessage({ m, mode, onQuick, onBook, onDone }) {
  const [ready, setReady] = useState(!m.stream)
  return (
    <div className="msg bot">
      <span className="msg-av">
        <OrbMark size={20} />
      </span>
      <div className="msg-body">
        <div className="msg-meta">
          Sana <i>· {m.mode || mode}</i>
        </div>
        <Streamed
          text={m.text}
          run={m.stream}
          onDone={() => {
            setReady(true)
            onDone?.()
          }}
        />
        {ready && m.blocks?.map((b, i) => (
          <div className="msg-block" key={i} style={{ '--d': `${i * 0.08}s` }}>
            <Block b={b} onBook={onBook} />
          </div>
        ))}
        {ready && m.quick && (
          <div className="quick">
            {m.quick.map((q, i) => (
              <button key={q} className="quick-b" style={{ '--d': `${0.1 + i * 0.06}s` }} onClick={() => onQuick(q)} disabled={m.used}>
                {q}
              </button>
            ))}
          </div>
        )}
        {ready && (
          <div className="msg-tools">
            <button aria-label="Copy" onClick={() => navigator.clipboard?.writeText(m.text)}>
              <Icon name="copy" size={14} />
            </button>
            <button aria-label="Helpful">
              <Icon name="like" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Composer({ value, setValue, onSend, mode, setMode, file, setFile, compact, m }) {
  const ta = useRef(null)
  const fileRef = useRef(null)
  const [menu, setMenu] = useState(null)
  useLayoutEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(140, el.scrollHeight)}px`
  }, [value])
  useEffect(() => {
    if (!menu) return
    const off = (e) => !e.target.closest('.pop, [data-pop]') && setMenu(null)
    window.addEventListener('pointerdown', off)
    return () => window.removeEventListener('pointerdown', off)
  }, [menu])
  const send = () => {
    if (!value.trim() && !file) return
    onSend(value, file)
  }
  return (
    <div className={`composer ${compact ? 'compact' : ''}`}>
      <div className="cp-card">
        <div className="cp-row">
          <button className="cp-plus" data-pop onClick={() => setMenu(menu === 'plus' ? null : 'plus')} aria-label="Add">
            <Icon name="plus" size={20} />
          </button>
          <div className="cp-field">
            {file && (
              <span className="cp-file">
                <Icon name="labs" size={14} /> {file}
                <button onClick={() => setFile(null)} aria-label="Remove file">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}
            <textarea
              ref={ta}
              rows={1}
              value={value}
              placeholder={m ? 'Ask Sana about your health…' : 'Describe symptoms, understand lab results, track medications and more....'}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              aria-label="Message Sana"
            />
          </div>
        </div>
        <div className="cp-bar">
          <div className="cp-tools">
            <button className="cp-mode" data-pop onClick={() => setMenu(menu === 'mode' ? null : 'mode')}>
              <Icon name="cpu" size={20} /> {mode}
            </button>
            <button className="cp-ic" onClick={() => setValue(improvePrompt(value))} aria-label="Improve my message" title="Improve my message">
              <Icon name="wand" size={19} />
            </button>
            <button className="cp-ic" onClick={() => fileRef.current?.click()} aria-label="Attach a report" title="Attach a lab report">
              <Icon name="file" size={19} />
            </button>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFile(f.name)
                e.target.value = ''
              }}
            />
          </div>
          <button className="cp-send" onClick={send} disabled={!value.trim() && !file}>
            <span>Send</span> <Icon name="send" size={20} />
          </button>
        </div>
      </div>
      {menu === 'mode' && (
        <div className="pop pop-mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={m.id === mode ? 'on' : ''}
              onClick={() => {
                setMode(m.id)
                setMenu(null)
              }}
            >
              <b>{m.id}</b>
              <small>{m.note}</small>
              {m.id === mode && <Icon name="check" size={15} stroke={2.4} />}
            </button>
          ))}
        </div>
      )}
      {menu === 'plus' && (
        <div className="pop pop-plus">
          <button
            onClick={() => {
              setFile('blood-panel-oct.pdf')
              setValue('Can you read my new lab report?')
              setMenu(null)
            }}
          >
            <Icon name="upload" size={16} /> Upload a lab report
          </button>
          <button
            onClick={() => {
              setValue('Share my vitals with my doctor')
              setMenu(null)
            }}
          >
            <Icon name="vitals" size={16} /> Share my vitals
          </button>
          <button
            onClick={() => {
              setValue('Find care near me')
              setMenu(null)
            }}
          >
            <Icon name="pin" size={16} /> Find care near me
          </button>
        </div>
      )}
    </div>
  )
}

export default function Chat({ messages, typing, onSend, onQuick, onBook, mode, setMode, onStreamDone, intro, m }) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState(null)
  const [trackers, setTrackers] = useState(TRACKERS)
  const [toast, setToast] = useState(null)
  const root = useRef(null)
  const thread = useRef(null)
  const empty = messages.length === 0

  const send = (text, f) => {
    onSend(text.trim() || 'Can you read my new lab report?', f)
    setValue('')
    setFile(null)
  }

  useEffect(() => {
    const el = thread.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!thread.current) return
    const obs = new MutationObserver(() => {
      const el = thread.current
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 260) el.scrollTop = el.scrollHeight
    })
    obs.observe(thread.current, { childList: true, subtree: true, characterData: true })
    return () => obs.disconnect()
  }, [empty])

  useLayoutEffect(() => {
    if (!empty || !intro) return
    const el = root.current
    const tl = gsap.timeline({ delay: 0.15 })
    tl.fromTo(el.querySelector('.orb'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.7)' }, 0)
    tl.fromTo(el.querySelectorAll('.hello .w'), { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.05, ease: 'power3.out' }, 0.25)
    tl.fromTo(el.querySelectorAll('.chip'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'transform' }, 0.55)
    tl.fromTo(el.querySelector('.composer'), { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }, 0.7)
    tl.fromTo(el.querySelectorAll('.trk-title, .trk'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.035, ease: 'back.out(2)', clearProps: 'transform' }, 0.9)
    return () => tl.kill()
  }, [])

  const toggleTracker = (t) => {
    setTrackers((all) => all.map((x) => (x.id === t.id ? { ...x, on: !x.on } : x)))
    setToast(`${t.label} ${t.on ? 'disconnected' : 'connected'}`)
    clearTimeout(toggleTracker.t)
    toggleTracker.t = setTimeout(() => setToast(null), 1800)
  }

  const hello = ['Hey,', 'I’m', 'SANA.', 'How', 'can', 'I', 'help', 'you', 'today?']

  return (
    <div className={`chat ${empty ? 'is-home' : 'is-thread'}`} ref={root}>
      <div className="chat-glow" />
      {empty ? (
        <div className="home">
          <div className="orb">
            <span className="orb-ring r3" />
            <span className="orb-ring r2" />
            <span className="orb-ring r1" />
            <span className="orb-core">
              <OrbMark size={42} />
            </span>
          </div>
          <h1 className="hello">
            {hello.map((w, i) => (
              <span key={i} className={`w ${w === 'SANA.' ? 'name' : ''}`}>
                {w === 'SANA.' ? (
                  <>
                    <em>sana</em>.
                  </>
                ) : (
                  w
                )}{' '}
              </span>
            ))}
          </h1>
          <div className="chips">
            {CHIPS.map((c) => (
              <button key={c.id} className="chip" onClick={() => send(c.prompt)}>
                <Icon name={c.icon} size={m ? 20 : 16} /> <span>{c.label}</span>
              </button>
            ))}
          </div>
          <Composer value={value} setValue={setValue} onSend={send} mode={mode} setMode={setMode} file={file} setFile={setFile} m={m} />
          <div className="trackers">
            <h2 className="trk-title">Connected Trackers</h2>
            <div className="trk-row">
              {trackers.map((t) => (
                <button key={t.id} className={`trk ${t.on ? 'on' : ''}`} onClick={() => toggleTracker(t)} style={{ '--c': t.color }} aria-pressed={t.on} title={`${t.label} · ${t.on ? 'connected' : 'not connected'}`}>
                  <Icon name={t.id} size={26} stroke={1.9} />
                  <span className="trk-badge">
                    <Icon name="check" size={9} stroke={3.4} />
                  </span>
                  <span className="trk-tip">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="thread" ref={thread}>
            <div className="thread-in">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div className="msg user" key={m.id}>
                    <div className="bubble">
                      {m.file && (
                        <span className="cp-file in-msg">
                          <Icon name="labs" size={14} /> {m.file}
                        </span>
                      )}
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <BotMessage key={m.id} m={m} mode={mode} onQuick={onQuick} onBook={onBook} onDone={() => onStreamDone(m.id)} />
                )
              )}
              {typing && (
                <div className="msg bot typing">
                  <span className="msg-av">
                    <OrbMark size={20} />
                  </span>
                  <div className="dots">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="thread-foot">
            <Composer value={value} setValue={setValue} onSend={send} mode={mode} setMode={setMode} file={file} setFile={setFile} compact m={m} />
            <p className="disclaimer">
              <Icon name="shield" size={13} /> {m ? 'General information, not a diagnosis. Emergency? Call 911.' : 'Sana gives general health information, not a diagnosis. In an emergency, call 911.'}
            </p>
          </div>
        </>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
