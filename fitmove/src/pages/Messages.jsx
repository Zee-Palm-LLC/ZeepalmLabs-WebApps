import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { useUi, setUi } from '../store.js'

export const H = 1045

export const CHATS = [
  { id: 'jordan-reed', name: 'Jordan Reed', trainer: true, time: '3:15 PM', unread: 1, preview: 'Hi Kalendra, great job in today’s Strength Circuit!', day: 0 },
  { id: 'emily-thompson', name: 'Emily Thompson', trainer: true, time: '2:50 PM', unread: 0, preview: 'Thank you, Emily! Looking forward to it!', day: 0 },
  { id: 'chris-williams', name: 'Chris Williams', trainer: true, time: '1:45 PM', unread: 2, preview: 'Hey Kalendra, don’t forget to hydrate after HIIT.', day: 0 },
  { id: 'louis-hansen', name: 'Louis Hansen', trainer: true, time: '9:30 AM', unread: 0, preview: 'Ok I got it, thanks for your help in last session!', day: 0 },
  { id: 'alex-morgan', name: 'Alex Morgan', trainer: true, time: '11:00 AM', unread: 3, preview: 'Kalendra, awesome work on your core routine this week.', day: 1 },
  { id: 'support', name: 'FitMove Support', trainer: false, time: '10:30 AM', unread: 1, preview: 'Hi Kalendra, we’ve just rolled out a new update.', day: 1 },
  { id: 'sarah-lee', name: 'Sarah Lee', trainer: true, time: '08:20 AM', unread: 2, preview: 'Kalendra, I’m seeing great improvement in your flexibility.', day: 1 },
  { id: 'nutritionist', name: 'FitMove Nutritionist', trainer: false, time: 'Aug 27, 2028', unread: 1, preview: 'Kalendra, based on your recent workouts I’d suggest…', day: 1 },
  { id: 'jordan-blake', name: 'Jordan Blake', trainer: true, time: 'Aug 26, 2028', unread: 0, preview: 'Kalendra, it’s been great seeing your progress lately.', day: 1 },
]

const SEED = {
  'emily-thompson': [
    { me: false, text: ['I noticed your last few cardio sessions were shorter. How are you feeling? We can', 'adjust your routine.'], t: '2:30 PM' },
    { me: true, text: ['Hi Emily, thanks for noticing! I feel like my stamina has improved, but I’m', 'hitting a bit of a plateau.'], t: '2:35 PM' },
    { me: false, text: ['That’s great to hear about your stamina! Plateaus are common, so we can', 'definitely make some changes.'], t: '2:38 PM' },
    { me: true, text: ['Awesome! What do you suggest? I’m open to trying something new to', 'push past this.'], t: '2:40 PM' },
    { me: false, text: ['How about we increase the intensity of your sessions? We can add some', 'interval sprints or mix in a different type of cardio like cycling or rowing.'], t: '2:43 PM' },
    { me: true, text: ['Interval sprints sound like a good challenge! Let’s go with that. Should I', 'start with my next session?'], t: '2:45 PM' },
    { me: false, text: ['Perfect! Yes, start with your next session. I’ll send you a modified plan', 'with the intervals included. Let’s break that plateau!'], t: '2:47 PM' },
    { me: true, text: ['Thank you, Emily! Looking forward to it!'], t: '2:50 PM' },
  ],
}

const REPLIES = [
  'Love that energy! I’ll update your plan tonight.',
  'Great question. Let’s review it in our next session.',
  'Noted! Keep hydrating and get some good sleep.',
  'You’ve got this. Small steps every day add up!',
]

const LINE = 21

function seedFor(c) {
  return SEED[c.id] || [{ me: false, text: [c.preview], t: c.time.includes('PM') || c.time.includes('AM') ? c.time : '9:00 AM' }]
}

function wrap(text, max = 66) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur.trim())
      cur = w
    } else cur += ' ' + w
  }
  if (cur.trim()) lines.push(cur.trim())
  return lines
}

function nowLabel(extra = 0) {
  const m = 50 + extra
  return `${2 + Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} PM`
}

export default function Messages() {
  const sel = useUi((s) => s.chat ?? 'emily-thompson')
  const store = useUi((s) => s.chatLog)
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [read, setRead] = useState({ 'emily-thompson': true })
  const body = useRef(null)
  const chat = CHATS.find((c) => c.id === sel) || CHATS[1]
  const log = (store && store[sel]) || seedFor(chat)
  const list = useMemo(() => CHATS.filter((c) => `${c.name} ${c.preview}`.toLowerCase().includes(q.toLowerCase())), [q])
  const today = list.filter((c) => c.day === 0)
  const yesterday = list.filter((c) => c.day === 1)

  const layout = useMemo(() => {
    let y = 0
    return log.map((m) => {
      const h = 17 + m.text.length * LINE
      const top = y
      y += h + 37.4
      return { ...m, top, h }
    })
  }, [log])
  const lastB = layout.length ? layout[layout.length - 1].top + layout[layout.length - 1].h : 0
  const total = lastB + 37.4
  const offset = Math.min(0, 648.6 - lastB - (typing ? 77 : 0))

  useLayoutEffect(() => {
    if (!body.current) return
    const last = body.current.querySelector('.bubble-wrap:last-child')
    if (last && last.dataset.fresh) {
      gsap.fromTo(last, { y: 18, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)', transformOrigin: last.dataset.me ? '100% 100%' : '0% 100%' })
    }
  }, [log.length])

  useEffect(() => {
    if (!typing) return
    const id = setTimeout(() => {
      const cur = (getStore() && getStore()[sel]) || seedFor(chat)
      const reply = REPLIES[cur.length % REPLIES.length]
      pushLog(sel, [...cur, { me: false, text: wrap(reply), t: nowLabel(cur.length), fresh: true }])
      setTyping(false)
    }, 1600)
    return () => clearTimeout(id)
  }, [typing, sel])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    pushLog(sel, [...log, { me: true, text: wrap(text), t: nowLabel(log.length), fresh: true }])
    setDraft('')
    setTyping(true)
  }

  const pick = (id) => {
    setUi({ chat: id })
    setRead((r) => ({ ...r, [id]: true }))
    setTyping(false)
  }

  return (
    <>
      <PageTitle title="Messages" sub="Welcome and Let’s do some workout today!" />
      <UserPill />
      <Card x={252.9} y={83.8} w={1171.2} h={907.7} className="msg-card">
        <At x={268} y={100.5} w={364.5} h={55.5} className="msg-search">
          <Icon name="search" size={16} sw={1.6} style={{ left: 17, top: 19.75 }} />
          <input value={q} placeholder="Search name, chat, etc" onChange={(e) => setQ(e.target.value)} aria-label="Search messages" />
          <span className="msg-filter">
            <Icon name="sliders" size={16} sw={1.6} style={{ left: 9.5, top: 9.5 }} />
          </span>
        </At>
        <Group title="Today" n={today.length} y={175} items={today} sel={sel} read={read} pick={pick} top={204} />
        <Group title="Yesterday" n={yesterday.length} y={519.5} items={yesterday} sel={sel} read={read} pick={pick} top={549.5} />
        <At as="button" x={268} y={935} w={364.5} h={39.5} className="btn-green msg-new" onClick={() => setQ('')}>
          New Message
        </At>

        <Layer x={649.1} y={100.5} w={757.8} h={875.4} sq={[20, 1]} className="chat">
          <At x={649.1} y={100.5} w={757.8} h={790} className="chat-body-bg" />
          <div className="chat-scroll" style={{ left: 0, top: 80, width: 757.8, height: 722 }} ref={body}>
            <div className="chat-track" style={{ transform: `translateY(${offset}px)` }}>
              {layout.map((m, i) => (
                <div key={i} className="bubble-wrap" data-fresh={m.fresh ? '1' : undefined} data-me={m.me ? '1' : undefined} style={{ top: m.top + 18, left: 0, right: 0 }}>
                  {!m.me ? (
                    <span className="b-av">
                      <img src={`/img/msg-${chat.id === 'emily-thompson' ? 'emily-thompson' : chat.id}.jpg`} alt="" draggable="false" />
                    </span>
                  ) : null}
                  <div className={`bubble ${m.me ? 'me' : 'them'}`} style={m.me ? { right: 18.5, height: m.h } : { left: 66.5, height: m.h }}>
                    {m.text.map((l, k) => (
                      <span key={k}>{l}</span>
                    ))}
                  </div>
                  <span className={`b-time ${m.me ? 'me' : ''}`} style={{ top: m.h + 10 }}>
                    {m.t}
                    {m.me ? <Icon name="tick" size={12} sw={1.8} className="b-tick" /> : null}
                  </span>
                </div>
              ))}
              {typing ? (
                <div className="bubble-wrap typing-row" style={{ top: total + 18, left: 0, right: 0 }}>
                  <span className="b-av">
                    <img src={`/img/msg-${chat.id}.jpg`} alt="" draggable="false" />
                  </span>
                  <div className="bubble them typing" style={{ left: 66.5, height: 40 }}>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <At x={649.1} y={100.5} w={757.8} h={80} className="chat-head" />
          <At x={664} y={116.5} w={47} h={47} className="chat-av">
            <img src={chat.id === 'emily-thompson' ? '/img/msg-emily-lg.jpg' : `/img/msg-${chat.id}.jpg`} alt="" draggable="false" />
          </At>
          <T x={724.5} b={140} s={18} w={500} c="var(--ink)">
            {chat.name}
          </T>
          <T x={724} b={156} s={13.5} c="var(--gray)">
            {typing ? 'typing…' : 'last seen recently'}
          </T>
          {[
            ['call', 1218.5],
            ['videocam', 1264.5],
            ['panel', 1310.5],
          ].map(([ic, x]) => (
            <At as="button" key={ic} x={x} y={121} w={35} h={35} className="chat-btn" aria-label={ic}>
              <Icon name={ic} size={17} sw={1.6} style={{ left: 9, top: 9 }} />
            </At>
          ))}
          <At as="button" x={1362} y={126.5} w={24} h={24} className="dots-btn static" aria-label="Chat options">
            <Icon name="dots" size={24} sw={1.5} />
          </At>
          <At x={665} y={903} w={727} h={55} className="chat-input">
            <Icon name="smile" size={17} sw={1.6} style={{ left: 17, top: 19 }} />
            <input
              value={draft}
              placeholder="Type a message.."
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              aria-label="Type a message"
              data-s="chat-input"
            />
            <Icon name="attach" size={17} sw={1.6} style={{ left: 600, top: 19 }} />
            <button className="send-btn" onClick={send} data-s="send">
              Send
              <Icon name="send" size={16} sw={1.7} className="send-ic" />
            </button>
          </At>
        </Layer>
      </Card>
    </>
  )
}

let _store = null
function getStore() {
  return _store
}
function pushLog(id, msgs) {
  _store = { ...(_store || {}), [id]: msgs }
  setUi({ chatLog: _store })
}

function Group({ title, n, y, items, sel, read, pick, top }) {
  if (!items.length) return null
  const step = title === 'Today' ? 74.3 : 73.6
  return (
    <>
      <T x={271.5} b={y + 13.5} s={14.5} w={500} c="var(--ink)">
        {title} <span className="msg-count">({n} messages)</span>
      </T>
      <At x={268} y={top} w={364.5} h={items.length * step + 2} sq={[18, 1]} className="msg-group" />
      {items.map((c, i) => {
        const y0 = top + i * step
        const on = c.id === sel
        const unread = !read[c.id] && c.unread
        return (
          <At as="button" key={c.id} x={268.6} y={y0 + 0.6} w={363.3} h={step} className={`msg-item ${on ? 'is-on' : ''} ${i ? 'sep' : ''} ${i === items.length - 1 ? 'last' : ''} ${i === 0 ? 'first' : ''}`} onClick={() => pick(c.id)}>
            <span className="mi-av">
              <img src={`/img/msg-${c.id}.jpg`} alt="" draggable="false" />
            </span>
            <span className="mi-name">
              {c.name}
              {c.trainer ? <em>Trainer</em> : null}
            </span>
            <span className="mi-time">{c.time}</span>
            <span className="mi-prev">{c.preview}</span>
            {unread ? <span className="mi-badge">{c.unread}</span> : null}
          </At>
        )
      })}
    </>
  )
}
