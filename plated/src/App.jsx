import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BY_ID } from './data/foods.js'
import { GOAL_BY_ID } from './data/goals.js'
import { EMPTY_LINES, FOOD_LINES, GROUP_LINES, SCORE_LINES, TIP_LINES, moodFor, pick } from './data/lines.js'
import { ROUND, dealOrders, judge } from './data/orders.js'
import { grade, hue, scorePlate } from './lib/score.js'
import { idealSectors, piePositions, pieSectors, placeOnPlate, placeOnSide } from './lib/layout.js'
import { setSound, sfx, unlock } from './lib/audio.js'
import { em, useMedia } from './lib/hooks.js'
import { renderPlateCard, renderRushCard } from './lib/share.js'
import Table from './ui/Table.jsx'
import Belt from './ui/Belt.jsx'
import Chef from './ui/Chef.jsx'
import Score, { Dial } from './ui/Score.jsx'
import Facts from './ui/Facts.jsx'
import Goals from './ui/Goals.jsx'
import Ambient from './ui/Ambient.jsx'
import { Intro, Stamp, Summary, Ticket } from './ui/Rush.jsx'

const EMPTY = { items: [], side: [], drink: null, drinkFrom: null, drinkKey: 0 }
const MAX_ITEMS = 14
const MAX_SIDE = 3
let uid = 0

const SERVE_LINES = [
  (n) => `${n} sent it straight back. Ouch.`,
  (n) => `${n} has a few notes for the kitchen.`,
  (n) => `Order up! ${n} is happy.`,
  (n) => `Perfect order! ${n} is thrilled.`,
]

export default function App() {
  const [plate, setPlate] = useState(EMPTY)
  const [goalId, setGoalId] = useState('balanced')
  const [tab, setTab] = useState('all')
  const [view, setView] = useState('plate')
  const [sound, setSoundOn] = useState(true)
  const [line, setLine] = useState({ text: EMPTY_LINES[0], k: 0 })
  const [drag, setDrag] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [rush, setRush] = useState(null)
  const [share, setShare] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [plateKey, setPlateKey] = useState(0)
  const mobile = useMedia('(max-width: 760px)')

  const tableRef = useRef(null)
  const ghostRef = useRef(null)
  const plateRef = useRef(plate)
  const rushRef = useRef(rush)
  const timers = useRef([])
  useEffect(() => {
    plateRef.current = plate
  }, [plate])
  useEffect(() => {
    rushRef.current = rush
  }, [rush])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const playing = rush && (rush.phase === 'play' || rush.phase === 'serve')
  const order = playing ? rush.orders[rush.idx] : null
  const goal = GOAL_BY_ID[order ? order.goal : goalId]
  const result = useMemo(() => scorePlate(plate, goal), [plate, goal])
  const mood = moodFor(result.total, plate)
  const sectors = useMemo(() => pieSectors(plate.items), [plate.items])
  const ideal = useMemo(() => idealSectors(goal), [goal])
  const pie = useMemo(() => piePositions(plate.items, sectors), [plate.items, sectors])
  const checks = order ? judge(order, result.t, plate, result.total).checks : []

  const say = useCallback((text) => setLine((l) => ({ text, k: l.k + 1 })), [])

  useEffect(() => {
    if (result.empty) return
    const id = setTimeout(() => {
      const tip = result.tips[0]
      if (result.total >= 82 || !tip) say(pick(SCORE_LINES.find(([m]) => result.total >= m)[1]))
      else say(TIP_LINES[tip])
    }, 2600)
    return () => clearTimeout(id)
  }, [result, say])

  const bump = useCallback((cls = 'plate') => {
    const el = tableRef.current?.querySelector('.' + cls)
    el?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.986)' }, { transform: 'scale(1.004)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'ease-out' },
    )
  }, [])

  const shake = useCallback(() => {
    tableRef.current
      ?.querySelector('.plate')
      ?.animate(
        [{ translate: '0 0' }, { translate: '-10px 0' }, { translate: '9px 0' }, { translate: '-6px 0' }, { translate: '0 0' }],
        { duration: 340 },
      )
  }, [])

  const addFood = useCallback(
    (id, from) => {
      unlock()
      const f = BY_ID[id]
      const p = plateRef.current
      let next
      if (f.g === 'drink') {
        next = { ...p, drink: id, drinkFrom: from, drinkKey: p.drinkKey + 1 }
      } else if (f.g === 'dairy') {
        if (p.side.length >= MAX_SIDE) {
          sfx.nope()
          say('The side plate is full.')
          return
        }
        next = { ...p, side: [...p.side, { id: ++uid, food: id, ...placeOnSide(p.side, id), from }] }
      } else {
        if (p.items.length >= MAX_ITEMS) {
          sfx.nope()
          shake()
          say('That plate is full! Click something to take it off.')
          return
        }
        next = { ...p, items: [...p.items, { id: ++uid, food: id, ...placeOnPlate(p.items, id), from }] }
      }
      plateRef.current = next
      setPlate(next)
      const fl = FOOD_LINES[id]
      say(fl && Math.random() < 0.85 ? pick(fl) : pick(GROUP_LINES[f.g]))
    },
    [say, shake],
  )

  const onLanded = useCallback(
    (it) => {
      const f = BY_ID[it.food]
      if (f.g === 'drink') {
        sfx.clink()
        return
      }
      sfx.plop(Math.max(0.4, f.vol))
      if (f.hot) sfx.sizzle()
      bump(f.g === 'dairy' ? 'saucer' : 'plate')
    },
    [bump],
  )

  const onRemove = useCallback((kind, id) => {
    sfx.pop()
    const p = plateRef.current
    const next =
      kind === 'drink' ? { ...p, drink: null } : { ...p, [kind]: p[kind].filter((i) => i.id !== id) }
    plateRef.current = next
    setPlate(next)
  }, [])

  const freshPlate = useCallback(() => {
    const next = { ...EMPTY, drinkKey: plateRef.current.drinkKey + 1 }
    plateRef.current = next
    setPlate(next)
  }, [])

  const clear = useCallback(() => {
    const p = plateRef.current
    if (!p.items.length && !p.side.length && !p.drink) return
    sfx.whoosh()
    setClearing(true)
    later(() => {
      freshPlate()
      setClearing(false)
      say(pick(EMPTY_LINES))
    }, 460)
  }, [freshPlate, say])

  const press = useCallback(
    (id, e, keyboard) => {
      unlock()
      const el = e.currentTarget.querySelector('img')
      const r = el.getBoundingClientRect()
      const from = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
      if (keyboard) {
        addFood(id, from)
        return
      }
      const sx = e.clientX
      const sy = e.clientY
      let dragging = false
      const move = (ev) => {
        if (!dragging) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 7) return
          dragging = true
          sfx.pick()
          setDrag({ food: id, x: ev.clientX, y: ev.clientY })
        }
        const g = ghostRef.current
        if (g) g.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`
      }
      const done = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
      }
      const up = (ev) => {
        done()
        if (!dragging) {
          addFood(id, from)
          return
        }
        setDrag(null)
        const t = tableRef.current.getBoundingClientRect()
        const inside = ev.clientX >= t.left && ev.clientX <= t.right && ev.clientY >= t.top && ev.clientY <= t.bottom
        if (inside) addFood(id, { x: ev.clientX, y: ev.clientY, w: mobile ? 76 : 104 })
        else sfx.pop()
      }
      const cancel = () => {
        done()
        if (dragging) setDrag(null)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
    },
    [addFood, mobile],
  )

  const serve = useCallback(() => {
    const r = rushRef.current
    if (!r || r.phase !== 'play') return
    const o = r.orders[r.idx]
    const res = scorePlate(plateRef.current, GOAL_BY_ID[o.goal])
    const j = judge(o, res.t, plateRef.current, res.total)
    const entry = { order: o, stars: j.stars, met: j.met, score: res.total }
    sfx.bell()
    later(() => sfx.stars(j.stars), 380)
    const next = { ...r, phase: 'serve', stamp: entry, results: [...r.results, entry] }
    rushRef.current = next
    setRush(next)
    say(SERVE_LINES[j.stars](o.name))
    later(() => sfx.whoosh(), 1100)
    later(() => {
      const cur = rushRef.current
      if (!cur || cur.phase !== 'serve') return
      freshPlate()
      setPlateKey((k) => k + 1)
      let n
      if (cur.idx + 1 >= cur.orders.length) {
        sfx.fanfare()
        n = { ...cur, phase: 'done', stamp: null }
      } else {
        const nx = cur.orders[cur.idx + 1]
        say(`Next up: ${nx.name}. “${nx.quote}”`)
        n = { ...cur, phase: 'play', idx: cur.idx + 1, time: ROUND, stamp: null }
      }
      rushRef.current = n
      setRush(n)
    }, 1900)
  }, [freshPlate, say])

  const phase = rush?.phase
  const round = rush?.idx
  useEffect(() => {
    if (phase !== 'play') return
    const id = setInterval(() => {
      setRush((r) => {
        if (!r || r.phase !== 'play') return r
        return { ...r, time: Math.max(0, r.time - 0.1) }
      })
    }, 100)
    return () => clearInterval(id)
  }, [phase, round])

  const sec = rush?.phase === 'play' ? Math.ceil(rush.time) : null
  useEffect(() => {
    if (sec == null) return
    if (sec <= 0) serve()
    else if (sec <= 5) sfx.tick()
  }, [sec, serve])

  const toFree = useCallback(() => {
    setRush(null)
    freshPlate()
    setPlateKey((k) => k + 1)
    say('Back to the free plate. Build whatever you like.')
  }, [freshPlate, say])

  const toRush = useCallback(() => {
    setView('plate')
    setSheet(false)
    setRush({ phase: 'intro' })
  }, [])

  const startRush = useCallback(() => {
    unlock()
    freshPlate()
    setPlateKey((k) => k + 1)
    const orders = dealOrders(5)
    setRush({ phase: 'play', orders, idx: 0, time: ROUND, results: [], stamp: null })
    sfx.bell()
    say(`Kitchen’s open! First up: ${orders[0].name}. “${orders[0].quote}”`)
  }, [freshPlate, say])

  const openShare = useCallback(async () => {
    unlock()
    const r = rushRef.current
    const blob =
      r && r.phase === 'done'
        ? await renderRushCard({ results: r.results })
        : await renderPlateCard({ plate: plateRef.current, result, goal, line: line.text })
    setShare((old) => {
      if (old) URL.revokeObjectURL(old.url)
      return { blob, url: URL.createObjectURL(blob) }
    })
  }, [result, goal, line])

  const toggleSound = () => {
    const v = !sound
    setSoundOn(v)
    setSound(v)
  }

  useEffect(() => {
    const k = (e) => {
      if (e.target.closest('input, textarea')) return
      if (e.key === 'Enter' && rushRef.current?.phase === 'play') {
        e.preventDefault()
        serve()
      } else if (e.key === 'x' || e.key === 'X') setView((v) => (v === 'plate' ? 'xray' : 'plate'))
      else if (e.key === 'c' || e.key === 'C') clear()
      else if (e.key === 'Escape') {
        setShare(null)
        setSheet(false)
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [serve, clear])

  useEffect(() => {
    window.__plated = { addFood, clear, serve, setView, setGoalId, toRush, startRush, toFree, openShare, plateRef, rushRef }
  }, [addFood, clear, serve, toRush, startRush, toFree, openShare])

  const isEmpty = !plate.items.length && !plate.side.length && !plate.drink
  const dragGroup = drag ? BY_ID[drag.food].g : null

  return (
    <div className={`app${drag ? ' is-dragging' : ''}${playing ? ' is-rush' : ''}`} onPointerDown={unlock}>
      <Ambient />

      <header className="top">
        <a className="brand" href="./" aria-label="Plated home">
          <span className="brand__dot" />
          Plated<i>.</i>
          <small>No. 012</small>
        </a>
        <div className="modes" role="tablist" aria-label="Mode">
          <button role="tab" aria-selected={!rush} className={!rush ? 'is-on' : ''} onClick={toFree}>
            Free plate
          </button>
          <button role="tab" aria-selected={!!rush} className={rush ? 'is-on' : ''} onClick={toRush}>
            <img src={em('bell')} alt="" />
            Lunch rush
          </button>
        </div>
        <div className="top__right">
          <button className={`icon-btn${sound ? ' is-on' : ''}`} onClick={toggleSound} aria-pressed={sound}>
            <SoundIcon on={sound} />
            <span>{sound ? 'Sound on' : 'Sound off'}</span>
          </button>
          <button className="btn btn--ink" onClick={openShare} disabled={isEmpty && !(rush && rush.phase === 'done')}>
            Share my plate
          </button>
        </div>
      </header>

      <aside className="col col--left">
        <Chef line={line} mood={mood} compact={mobile} />
        {order && rush.phase !== 'done' ? (
          <Ticket
            order={order}
            idx={rush.idx}
            total={rush.orders.length}
            time={rush.time}
            checks={checks}
            onServe={serve}
            compact={mobile}
          />
        ) : (
          !mobile && <Goals goalId={goalId} setGoal={(g) => (setGoalId(g), sfx.tick())} />
        )}
      </aside>

      <main className="stage">
        <Table
          ref={tableRef}
          plate={plate}
          view={view}
          pie={pie}
          sectors={sectors}
          ideal={ideal}
          goal={goal}
          dragGroup={dragGroup}
          clearing={clearing}
          onRemove={onRemove}
          onLanded={onLanded}
          plateKey={plateKey}
          served={rush?.phase === 'serve'}
        />
        {rush?.stamp && <Stamp result={rush.stamp} />}
        <div className="stage__bar">
          <div className="seg" role="tablist" aria-label="View">
            <button role="tab" aria-selected={view === 'plate'} className={view === 'plate' ? 'is-on' : ''} onClick={() => setView('plate')}>
              Plate
            </button>
            <button role="tab" aria-selected={view === 'xray'} className={view === 'xray' ? 'is-on' : ''} onClick={() => setView('xray')}>
              Breakdown
            </button>
          </div>
          <p className="stage__hint">
            {view === 'xray'
              ? `Inner pie: your plate. Outer ring: ideal for ${goal.name.toLowerCase()}.`
              : mobile
                ? 'Tap or drag food onto the plate'
                : 'Drag or tap food from the belt. Click food to take it off.'}
          </p>
          <button className="btn btn--ghost btn--sm" onClick={clear} disabled={isEmpty}>
            Clear plate
          </button>
        </div>
      </main>

      <aside className="col col--right">
        <Score result={result} goal={goal} />
        <Facts result={result} goal={goal} plate={plate} />
      </aside>

      {mobile && (
        <button className="strip" onClick={() => setSheet(true)} style={{ '--h': hue(result.total) }}>
          <Dial value={result.total} size={46} />
          <span className="strip__grade">{result.empty ? '–' : grade(result.total)}</span>
          <span className="strip__kcal">
            <b>{Math.round(result.t.kcal)}</b> kcal · <b>{Math.round(result.t.p)}</b> g protein
          </span>
          <span className="strip__more">{order ? 'Details' : goal.name}</span>
        </button>
      )}

      <Belt tab={tab} setTab={setTab} onPress={press} paused={!!drag} />

      {drag && (
        <div className="ghost" ref={ghostRef} style={{ transform: `translate(${drag.x}px, ${drag.y}px)` }}>
          <img src={em(drag.food)} alt="" />
        </div>
      )}

      {mobile && sheet && (
        <div className="sheet" onClick={() => setSheet(false)}>
          <div className="sheet__card" onClick={(e) => e.stopPropagation()}>
            <button className="sheet__close" onClick={() => setSheet(false)} aria-label="Close">
              ×
            </button>
            {!order && <Goals goalId={goalId} setGoal={setGoalId} />}
            <Score result={result} goal={goal} />
            <Facts result={result} goal={goal} plate={plate} />
          </div>
        </div>
      )}

      {rush?.phase === 'intro' && <Intro onStart={startRush} onCancel={toFree} />}
      {rush?.phase === 'done' && (
        <Summary results={rush.results} onAgain={startRush} onFree={toFree} onShare={openShare} />
      )}

      {share && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Share" onClick={() => setShare(null)}>
          <div className="modal__card sharecard" onClick={(e) => e.stopPropagation()}>
            <img src={share.url} alt="Your shareable plate card" />
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setShare(null)}>
                Close
              </button>
              {typeof navigator.canShare === 'function' &&
                navigator.canShare({ files: [new File([share.blob], 'plated.png', { type: 'image/png' })] }) && (
                  <button
                    className="btn btn--ghost"
                    onClick={() =>
                      navigator
                        .share({
                          files: [new File([share.blob], 'plated.png', { type: 'image/png' })],
                          title: 'My Plated score',
                          text: 'Build a better plate: zeepalm-plated.vercel.app',
                        })
                        .catch(() => {})
                    }
                  >
                    Share
                  </button>
                )}
              <a className="btn btn--hot" href={share.url} download="plated.png">
                Download image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SoundIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {on ? (
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  )
}
