import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CLINICS, HISTORY, MENU, NAV, USER } from './lib/data.js'
import { Icon, LogoMark } from './ui/icons.jsx'
import Chat from './chat/Chat.jsx'
import { respond } from './chat/engine.js'
import Dashboard from './pages/Dashboard.jsx'
import Labs from './pages/Labs.jsx'
import Help from './pages/Help.jsx'
import './styles/shell.css'
import './styles/mobile.css'

const BASE_W = 1440
const BASE_H = 979
const MOBILE = 900

function useFit() {
  const calc = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (vw < MOBILE) return { s: 1, w: vw, h: vh, m: true }
    const s = Math.max(0.72, Math.min(vw / BASE_W, vh / BASE_H))
    return { s, w: vw / s, h: vh / s, m: false }
  }
  const [f, setF] = useState(calc)
  useLayoutEffect(() => {
    const on = () => setF(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return f
}

let uid = 0
const nid = () => `m${++uid}`

function hydrate(h) {
  const out = []
  let flow = null
  for (const m of h.messages) {
    if (m.role === 'user') out.push({ id: nid(), role: 'user', text: m.text })
    else {
      const r = respond(out.at(-1).text, { flow })
      flow = r.flow ?? null
      out.push({ id: nid(), role: 'bot', ...r, stream: false })
    }
  }
  return out
}

export default function App() {
  const fit = useFit()
  const [view, setView] = useState('AI Chatbot')
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [mode, setMode] = useState('Auto')
  const [history, setHistory] = useState(HISTORY)
  const [active, setActive] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [pop, setPop] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [chatKey, setChatKey] = useState(0)
  const flow = useRef(null)
  const timer = useRef(0)

  useEffect(() => {
    if (!pop) return
    const off = (e) => !e.target.closest('.hpop, [data-hpop]') && setPop(null)
    window.addEventListener('pointerdown', off)
    return () => window.removeEventListener('pointerdown', off)
  }, [pop])

  const send = useCallback(
    (text, file) => {
      setView('AI Chatbot')
      setDrawer(false)
      const q = file ? `${text} (attached ${file})` : text
      setMessages((ms) => {
        const next = ms.map((m) => (m.quick ? { ...m, used: true } : m))
        return [...next, { id: nid(), role: 'user', text, file }]
      })
      if (!active) {
        const id = `c${Date.now()}`
        setActive(id)
        setHistory((h) => [{ id, title: text, today: true, messages: [] }, ...h])
      }
      setTyping(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(
        () => {
          const r = respond(file ? `lab report ${q}` : q, { flow: flow.current })
          flow.current = r.flow ?? null
          setTyping(false)
          setMessages((ms) => [...ms, { id: nid(), role: 'bot', ...r, mode, stream: true }])
        },
        650 + Math.random() * 450
      )
    },
    [active, mode]
  )

  const reset = () => {
    clearTimeout(timer.current)
    flow.current = null
    setMessages([])
    setTyping(false)
    setActive(null)
    setView('AI Chatbot')
    setDrawer(false)
    setChatKey((k) => k + 1)
  }

  const open = (h) => {
    clearTimeout(timer.current)
    flow.current = null
    setTyping(false)
    setActive(h.id)
    setView('AI Chatbot')
    setDrawer(false)
    if (h.messages.length) setMessages(hydrate(h))
  }

  const onStreamDone = (id) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, stream: false } : m)))
  const onBook = (p) => setMessages((ms) => [...ms, { id: nid(), role: 'bot', text: `You’re booked with ${p.doc.name} on ${p.slot}. Anything you’d like me to add to the visit notes?`, quick: ['Add my headache symptoms', 'No, that’s all'], mode, stream: true }])

  const today = history.filter((h) => h.today)
  const older = history.filter((h) => !h.today)

  const sidebar = (
    <aside className={`side ${drawer ? 'open' : ''}`} aria-label="Sidebar">
      {fit.m && (
        <div className="side-head">
          <LogoMark size={34} />
          <b>Sana-AI</b>
          <button className="side-close" onClick={() => setDrawer(false)} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>
      )}
      <button className="new-chat" onClick={reset}>
        <Icon name="pen" size={20} /> New Chat
      </button>
      <p className="side-label">Menu</p>
      <nav className="side-menu">
        {MENU.map((m) => (
          <button key={m.id} className="side-item" onClick={() => send(m.prompt)}>
            <Icon name={m.icon} size={20} /> {m.label}
          </button>
        ))}
      </nav>
      <hr className="side-rule" />
      <div className="side-hist">
        {today.length > 0 && (
          <>
            <p className="side-label">Today</p>
            {today.map((h) => (
              <button key={h.id} className={`hist ${active === h.id ? 'on' : ''}`} onClick={() => open(h)}>
                {h.title}
              </button>
            ))}
          </>
        )}
        <p className="side-label">Yesterday</p>
        {older.map((h) => (
          <button key={h.id} className={`hist ${active === h.id ? 'on' : ''}`} onClick={() => open(h)}>
            {h.title}
          </button>
        ))}
      </div>
      <div className="side-glow" />
      <button className="user-card" data-hpop onClick={() => setPop(pop === 'user' ? null : 'user')}>
        <img src="/img/avatar.webp" alt="" />
        <span>
          <b>{USER.name}</b>
          <small>{USER.email}</small>
        </span>
        <Icon name="chevron" size={20} />
      </button>
    </aside>
  )

  return (
    <div className={`fit ${fit.m ? 'is-m' : ''}`} style={fit.m ? undefined : { zoom: fit.s, width: fit.w, height: fit.h }}>
      <div className={`app ${collapsed ? 'collapsed' : ''}`}>
        <header className="top">
          {fit.m && (
            <button className="burger" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Icon name="menu" size={22} />
            </button>
          )}
          <a className="brand" href="/" onClick={(e) => (e.preventDefault(), reset())}>
            <LogoMark size={fit.m ? 38 : 58} />
            <span>Sana-AI</span>
          </a>
          {!fit.m && (
            <button className="collapse" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
              <Icon name="window" size={26} stroke={1.7} />
            </button>
          )}
          {!fit.m && (
            <nav className="tabs" aria-label="Sections">
              {NAV.map((n) => (
                <button key={n} className={view === n ? 'on' : ''} onClick={() => setView(n)}>
                  {n}
                </button>
              ))}
            </nav>
          )}
          <div className="top-right">
            <button className="radar" data-hpop onClick={() => setPop(pop === 'radar' ? null : 'radar')}>
              <Icon name="compass" size={19} /> Health Radar
            </button>
            <button className="mrn" data-hpop onClick={() => setPop(pop === 'user' ? null : 'user')}>
              <img src="/img/avatar.webp" alt="" />
              {USER.mrn}
            </button>
          </div>
          {pop === 'radar' && (
            <div className={`hpop pop-radar ${fit.m ? 'sheet' : ''}`}>
              {fit.m && <span className="sheet-grip" />}
              <b>Health Radar</b>
              <small>Care near Brooklyn, NY</small>
              <ul>
                {CLINICS.map((c) => (
                  <li key={c.name}>
                    <span className={`cl-dot ${c.open ? 'open' : ''}`} />
                    <div>
                      <b>{c.name}</b>
                      <small>
                        {c.kind} · {c.dist}
                      </small>
                    </div>
                    <span className="cl-wait">{c.wait}</span>
                  </li>
                ))}
              </ul>
              <div className="radar-alert">
                <Icon name="sparkles" size={15} /> Pollen is high today. Keep your antihistamine handy.
              </div>
            </div>
          )}
          {pop === 'user' && (
            <div className={`hpop pop-user ${fit.m ? 'sheet' : ''}`}>
              {fit.m && <span className="sheet-grip" />}
              <div className="pu-head">
                <img src="/img/avatar.webp" alt="" />
                <div>
                  <b>{USER.name}</b>
                  <small>
                    {USER.age} yrs · {USER.mrn}
                  </small>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Blood type</dt>
                  <dd>{USER.blood}</dd>
                </div>
                <div>
                  <dt>Height</dt>
                  <dd>{USER.height}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{USER.weight}</dd>
                </div>
                <div>
                  <dt>Allergies</dt>
                  <dd>{USER.allergies.join(', ')}</dd>
                </div>
                <div>
                  <dt>Conditions</dt>
                  <dd>{USER.conditions.join(', ')}</dd>
                </div>
              </dl>
              <button className="btn-soft" onClick={() => (setPop(null), send('Show my vitals for this week'))}>
                <Icon name="health" size={15} /> Open my health summary
              </button>
            </div>
          )}
        </header>
        {sidebar}
        {fit.m && drawer && <button className="scrim" onClick={() => setDrawer(false)} aria-label="Close menu" />}
        {fit.m && pop && <button className="scrim sheet-scrim" onClick={() => setPop(null)} aria-label="Close" />}
        <main className="main">
          {view === 'AI Chatbot' && <Chat key={chatKey} m={fit.m} messages={messages} typing={typing} onSend={send} onQuick={(q) => send(q)} onBook={onBook} mode={mode} setMode={setMode} onStreamDone={onStreamDone} intro />}
          {view === 'Dashboard' && <Dashboard onAsk={send} />}
          {view === 'Labs' && <Labs onAsk={send} />}
          {view === 'Help' && <Help onAsk={send} />}
        </main>
        {fit.m && (
          <nav className="bnav" aria-label="Sections">
            {NAV.map((n) => (
              <button key={n} className={view === n ? 'on' : ''} onClick={() => setView(n)} aria-current={view === n ? 'page' : undefined}>
                <span className="bnav-ic">
                  <Icon name={{ Dashboard: 'grid', 'AI Chatbot': 'chatbot', Help: 'help', Labs: 'labs' }[n]} size={21} stroke={view === n ? 2 : 1.7} />
                </span>
                {n === 'AI Chatbot' ? 'Chat' : n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
