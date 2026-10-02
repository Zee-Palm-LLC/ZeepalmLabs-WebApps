import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph, glyphBox } from '../ui/icons.jsx'
import { SCHEDULE, RECENT } from '../data.js'
import { useUi, setUi } from '../store.js'

const COLS = [1120.15, 1164.7, 1209.4, 1253.95, 1298.5, 1343.25, 1387.8]
const ROWS = [340.5, 374.4, 408.5, 442.4, 476.4, 510.4]
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MARKS = { '2028-7': { 3: 'blue', 13: 'yellow', 22: 'blue', 25: 'blue' } }

const WEEKDAY_YEAR_SHIFT = -2

function grid(year, month) {
  const y = year + WEEKDAY_YEAR_SHIFT
  const first = new Date(y, month, 1).getDay()
  const days = new Date(y, month + 1, 0).getDate()
  const prev = new Date(y, month, 0).getDate()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const n = i - first + 1
    if (n < 1) cells.push({ n: prev + n, out: true })
    else if (n > days) cells.push({ n: n - days, out: true })
    else cells.push({ n, out: false })
  }
  return cells
}

export default function ProfilePanel() {
  return (
    <Card x={1083.7} y={15.9} w={340.4} h={1258.4} className="panel" data-s="panel">
      <Profile />
      <Calendar />
      <Schedule />
      <Recent />
    </Card>
  )
}

function Profile() {
  const menu = useUi((s) => s.menu)
  return (
    <>
      <T x={1104.0} b={53.4} s={16} w={500} c="var(--ink)" data-s="p-title">
        My Profile
      </T>
      <At
        as="button"
        x={1377.3}
        y={34.9}
        w={24}
        h={24}
        className="dots-btn static"
        aria-label="Profile options"
        onClick={() => setUi({ menu: menu === 'profile' ? null : 'profile' })}
      >
        <Icon name="dots" size={24} sw={1.5} />
      </At>
      {menu === 'profile' ? (
        <div className="pop profile-pop" style={{ left: 340.4 - 190, top: 52 }}>
          {['Edit profile', 'Body metrics', 'Sign out'].map((l) => (
            <button key={l} className="pop-row" onClick={() => setUi({ menu: null })}>
              <span className="pop-label">{l}</span>
            </button>
          ))}
        </div>
      ) : null}
      <At x={1145.6} y={81.8} w={48.3} h={48.5} clip={[18, 1]} className="avatar" data-s="avatar">
        <img src="/img/avatar.jpg" alt="Kalendra Wingman" draggable="false" />
      </At>
      <T x={1209.45} b={102.5} s={18} w={500} c="var(--ink)" data-s="p-name">
        Kalendra Wingman
      </T>
      <Glyph n="medal" className="p-ico" />
      <T x={1227.8} b={123.4} s={12} c="var(--gray)" data-s="p-meta">
        Advanced
      </T>
      <span className="p-sep" style={{ left: 1286.5 - 1083.7, top: 116.8 - 15.9 }} data-s="p-meta" />
      <Glyph n="coin" className="p-ico" />
      <T x={1312.6} b={123.4} s={12} c="var(--gray)" data-s="p-meta">
        14,750
      </T>
      <Layer x={1104.0} y={149.8} w={300} h={60.2} sq={[20, 0.5]} className="p-band" data-s="p-band">
        {[
          ['Weight', '75', 'kg', 1155.2],
          ['Height', '175', 'cm', 1254.45],
          ['Age', '29', 'yrs', 1353.15],
        ].map(([k, v, u, cx]) => (
          <div key={k} className="p-stat" data-s="p-stat">
            <T cx={cx - 0.3} b={172.9} s={11} c="var(--gray)">
              {k}
            </T>
            <T cx={cx - 0.2} b={195.6} s={16} w={500} c="var(--ink)">
              <span data-count={v}>{v}</span> {u}
            </T>
          </div>
        ))}
      </Layer>
    </>
  )
}

function Calendar() {
  const month = useUi((s) => s.month)
  const year = useUi((s) => s.year)
  const selected = useUi((s) => s.selected)
  const cells = grid(year, month)
  const marks = MARKS[`${year}-${month}`] || {}
  const body = useRef(null)
  const dir = useRef(0)
  const first = useRef(true)
  const sel = useRef(null)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const items = body.current.querySelectorAll('.day')
    gsap.fromTo(
      items,
      { opacity: 0, x: dir.current * 14 },
      { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', stagger: { each: 0.008, from: dir.current > 0 ? 'start' : 'end' } }
    )
  }, [month, year])

  const shift = (d) => {
    dir.current = d
    let m = month + d
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    }
    if (m > 11) {
      m = 0
      y += 1
    }
    setUi({ month: m, year: y, selected: null })
  }

  return (
    <>
      <T x={1103.9} b={259.5} s={16} w={500} c="var(--ink)" data-s="c-title">
        {MONTHS[month]} {year}
      </T>
      <At as="button" x={1336.4} y={238.2} w={29.8} h={29.8} className="round-btn" onClick={() => shift(-1)} aria-label="Previous month" data-s="c-nav">
        <Icon name="left" size={14} sw={1.7} />
      </At>
      <At as="button" x={1374.4} y={238.2} w={29.8} h={29.8} className="round-btn" onClick={() => shift(1)} aria-label="Next month" data-s="c-nav">
        <Icon name="right" size={14} sw={1.7} />
      </At>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <T key={i} cx={COLS[i]} b={305.3} s={12} c="var(--gray)" data-s="c-head">
          {d}
        </T>
      ))}
      <div ref={body} className="cal-body">
        {cells.map((c, i) => {
          const col = i % 7
          const row = Math.floor(i / 7)
          const mark = !c.out ? marks[c.n] : null
          const isSel = !c.out && selected === c.n && !mark
          return (
            <button
              key={`${month}-${i}`}
              className={`day ${c.out ? 'is-out' : ''} ${mark ? `mark-${mark}` : ''} ${isSel ? 'is-sel' : ''}`}
              style={{ left: COLS[col] - 15.1 - 1083.7, top: ROWS[row] - 20.4 - 15.9 }}
              onClick={() => !c.out && setUi({ selected: c.n })}
              data-s="day"
              data-col={col}
              data-row={row}
              disabled={c.out}
            >
              <span className="day-bg" ref={isSel ? sel : null} />
              <span className="day-n">{c.n}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function Schedule() {
  const done = useUi((s) => s.schedule)
  const extra = useUi((s) => s.extra)
  const menu = useUi((s) => s.menu)
  const [adding, setAdding] = useState(false)
  const items = [...SCHEDULE, ...extra]
  const toggle = (id, e) => {
    const box = e.currentTarget
    const next = !done[id]
    setUi({ schedule: { ...done, [id]: next } })
    if (next) gsap.fromTo(box, { scale: 0.8 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' })
  }
  return (
    <>
      <T x={1104.0} b={554.3} s={16} w={500} c="var(--ink)" data-s="s-title">
        My Schedule
      </T>
      <T x={1103.4} b={572.3} s={12} c="#868F9B" data-s="s-title">
        Thursday, 13 Aug 28
      </T>
      <At
        as="button"
        x={1374}
        y={541.7}
        w={30.2}
        h={30.2}
        className={`add-btn ${adding ? 'is-open' : ''}`}
        aria-label="Add session"
        onClick={() => setAdding((v) => !v)}
        data-s="s-add"
      >
        <Icon name="plus" size={16} sw={1.7} />
      </At>
      {adding ? (
        <div className="pop add-pop" style={{ left: 340.4 - 230, top: 562 }}>
          <div className="pop-title">Add to Thursday</div>
          {[
            { id: 'stretch', time: '9:00 PM', title: 'Evening Stretch', sub: 'Mobility and Breathing' },
            { id: 'walk', time: '8:00 PM', title: 'Recovery Walk', sub: 'Low-Intensity Steady State' },
          ].map((n) => (
            <button
              key={n.id}
              className="pop-row"
              disabled={extra.some((e) => e.id === n.id)}
              onClick={() => {
                setUi({ extra: [...extra, n] })
                setAdding(false)
              }}
            >
              <span className="pop-kind">{n.time}</span>
              <span className="pop-label">{n.title}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="sched-list">
        {items.slice(-3).map((it, i) => {
          const y = 602.5 + i * 78
          const on = Boolean(done[it.id])
          const open = menu === `sched-${it.id}`
          return (
            <div key={it.id} className={`sched ${on ? 'is-done' : ''}`} data-s="sched">
              <T x={1147.5} b={y + 9} s={11} c="var(--gray)">
                {it.time}
              </T>
              <At as="button" x={1105.9} y={y + 12.3} w={28.2} h={28.2} sq={[9, 1]} className="check" onClick={(e) => toggle(it.id, e)} aria-pressed={on} aria-label={`Mark ${it.title} done`}>
                <svg viewBox="0 0 24 24" width="20" height="20" className="check-mark" aria-hidden="true">
                  <path d="M5 13.2L9.4 17.5L19 7" pathLength="1" />
                </svg>
              </At>
              <T x={1148.0} b={y + 33.1} s={16} w={500} c="var(--ink)" className="sched-title">
                {it.title}
              </T>
              <T x={1147.6} b={y + 52.8} s={12} c="var(--gray)">
                {it.sub}
              </T>
              <At
                as="button"
                x={1378.1}
                y={y + 13.5}
                w={26.2}
                h={26.2}
                className="more-btn"
                aria-label={`${it.title} options`}
                onClick={() => setUi({ menu: open ? null : `sched-${it.id}` })}
              >
                <Icon name="vdots" size={16} />
              </At>
              {open ? (
                <div className="pop sched-pop" style={{ left: 340.4 - 186, top: y - 15.9 + 44 }}>
                  {[on ? 'Mark as not done' : 'Mark as done', 'Reschedule', 'Remove'].map((l) => (
                    <button
                      key={l}
                      className="pop-row"
                      onClick={() => {
                        if (l.startsWith('Mark')) setUi({ schedule: { ...done, [it.id]: !on }, menu: null })
                        else setUi({ menu: null })
                      }}
                    >
                      <span className="pop-label">{l}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

const RECENT_Y = [
  { t: 927.15, title: 948.4, icon: 915.8 },
  { t: 996.4, title: 1018.0, icon: 985.9 },
  { t: 1067.2, title: 1087.6, icon: 1055.7 },
  { t: 1188.9, title: 1209.7, icon: 1178.1 },
]

function Recent() {
  const open = useUi((s) => s.recentOpen)
  const menu = useUi((s) => s.menu)
  const list = useRef(null)
  const openIndex = RECENT.findIndex((r) => r.id === open)
  const rows = RECENT.map((r, i) => {
    const isOpen = open === r.id
    const base = RECENT_Y[i]
    const shift = 66.2 * ((openIndex > -1 && openIndex < i ? 1 : 0) - (i > 2 ? 1 : 0))
    return { ...r, isOpen, top: base.t + shift, titleB: base.title + shift, iconY: base.icon + shift }
  })
  return (
    <Layer x={1104.1} y={850.2} w={300} h={406.9} sq={[19.5, 0.8]} className="recent" data-s="recent">
      <T x={1120.0} b={887.6} s={16} w={500} c="var(--ink)" data-s="r-title">
        Recent Activity
      </T>
      <At
        as="button"
        x={1361.4}
        y={869}
        w={24}
        h={24}
        className="dots-btn static"
        aria-label="Recent activity options"
        onClick={() => setUi({ menu: menu === 'recent' ? null : 'recent' })}
      >
        <Icon name="dots" size={24} sw={1.5} />
      </At>
      {menu === 'recent' ? (
        <div className="pop recent-pop" style={{ left: 300 - 186, top: 46 }}>
          {['Show all activity', 'Export week', 'Clear history'].map((l) => (
            <button key={l} className="pop-row" onClick={() => setUi({ menu: null })}>
              <span className="pop-label">{l}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div ref={list}>
        {rows.map((r) => (
          <RecentItem key={r.id} r={r} />
        ))}
      </div>
    </Layer>
  )
}

function RecentItem({ r }) {
  const toggle = () => setUi((s) => ({ recentOpen: s.recentOpen === r.id ? null : r.id }))
  const b = r.top
  const m = b + (r.title.length - 1) * 16
  return (
    <div className={`r-item ${r.isOpen ? 'is-open' : ''}`} data-s="r-item">
      <At x={1119.6} y={r.iconY} w={36.4} h={36.4} className={`r-ico tone-${r.tone}`} data-s="r-ico">
        <Glyph n={r.icon} x={1119.6 + 18.2 - glyphBox(r.icon).w / 2} y={r.iconY + 18.2 - glyphBox(r.icon).h / 2} ox={1119.6} oy={r.iconY} />
      </At>
      <At as="button" x={1164} y={b - 14} w={232} h={22 + r.title.length * 16} className="r-hit" onClick={toggle} aria-expanded={r.isOpen} aria-label={`${r.title.join(' ')} details`} />
      <div className="r-time" style={{ left: 1170.0 - 1104.1, top: b - 0.85 * 11 - 850.2 }}>
        <span>{r.time}</span>
        {r.isOpen ? null : <Icon name="down" size={12} sw={1.7} className="r-caret" />}
      </div>
      {r.isOpen ? <Icon name="up" size={12} sw={1.7} className="r-caret r-caret-up" style={{ left: 1374.9 - 1104.1, top: b - 10.3 - 850.2 }} /> : null}
      <T x={1170.0} b={r.titleB} s={14} w={500} lh={16} c="var(--ink)" className="r-title">
        {r.title[0]}
        {r.title[1] ? (
          <>
            <br />
            {r.title[1]}
          </>
        ) : null}
      </T>
      {r.isOpen ? (
        <div className="r-more">
          <span className="r-line" style={{ left: 1137.2 - 1104.1, top: m + 30.9 - 850.2 }} />
          <Glyph n="clockmd" y={m + 29.8} className="r-ico-sm" />
          <T x={1191.9} b={m + 42.2} s={12} c="var(--gray)">
            {r.mins}
          </T>
          <Glyph n="flamemd" y={m + 29.4} className="r-ico-sm" />
          <T x={1287.2} b={m + 42.2} s={12} c="var(--gray)">
            {r.cal}
          </T>
          <T x={1170.0} b={m + 64.7} s={12} lh={18.8} c="var(--gray)">
            {r.desc[0]}
            <br />
            {r.desc[1]}
          </T>
        </div>
      ) : null}
    </div>
  )
}
