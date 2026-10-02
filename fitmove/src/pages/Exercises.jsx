import { useMemo, useState } from 'react'
import { Card, T, At } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { useUi, setUi } from '../store.js'

export const H = 1025

export const EXERCISES = [
  { name: 'Squats', icon: 'squat', tone: 'blue', sets: 4, reps: [12, 'repetitions'], rest: [60, 'seconds'], weight: [45, 'kg'], cal: 180, done: true },
  { name: 'Deadlifts', icon: 'lift', tone: 'yellow', sets: 3, reps: [10, 'repetitions'], rest: [90, 'seconds'], weight: [60, 'kg'], cal: 220, done: true },
  { name: 'Bench Press', icon: 'bench', tone: 'green', sets: 3, reps: [8, 'repetitions'], rest: [60, 'seconds'], weight: [40, 'kg'], cal: 150, done: true },
  { name: 'Pull-Ups', icon: 'pullup', tone: 'blue', sets: 4, reps: [8, 'repetitions'], rest: [90, 'seconds'], weight: ['Bodyweight', ''], cal: 120, done: false },
  { name: 'Plank', icon: 'stretch', tone: 'yellow', sets: 3, reps: [60, 'repetitions'], rest: [30, 'seconds'], weight: ['-', ''], cal: 90, done: true },
  { name: 'Running', icon: 'run', tone: 'green', sets: 1, reps: [30, 'minutes'], rest: ['N/A', ''], weight: ['-', ''], cal: 300, done: true },
  { name: 'Lunges', icon: 'squat', tone: 'blue', sets: 3, reps: [15, 'repetitions'], rest: [60, 'seconds'], weight: [20, 'kg'], cal: 160, done: false },
  { name: 'Shoulder Press', icon: 'dumbbellh', tone: 'yellow', sets: 3, reps: [10, 'repetitions'], rest: [60, 'seconds'], weight: [25, 'kg'], cal: 140, done: false },
  { name: 'Bicep Curls', icon: 'lift', tone: 'green', sets: 3, reps: [12, 'repetitions'], rest: [45, 'seconds'], weight: [15, 'kg'], cal: 110, done: false },
  { name: 'Cycling', icon: 'bike', tone: 'blue', sets: 1, reps: [45, 'minutes'], rest: ['N/A', ''], weight: ['-', ''], cal: 350, done: true },
  { name: 'Mountain Climbers', icon: 'kick', tone: 'yellow', sets: 4, reps: [20, 'repetitions'], rest: [30, 'seconds'], weight: ['-', ''], cal: 200, done: false },
  { name: 'Yoga (Stretching)', icon: 'yogapose', tone: 'green', sets: 1, reps: [60, 'minutes'], rest: ['N/A', ''], weight: ['-', ''], cal: 150, done: true },
]

const COLS = [
  ['Exercise Name', 292.6, 'name'],
  ['Sets', 534.4, 'sets'],
  ['Reps', 661.4, 'reps'],
  ['Rest', 836.9, 'rest'],
  ['Weight', 995.1, 'weight'],
  ['Calories', 1155.9, 'cal'],
  ['Status', 1288, 'done'],
]
const ROW = (i) => 204.3 + i * 62.4
const num = (v) => (typeof v === 'number' ? v : -1)
const NEXT = { All: 'Completed', Completed: 'Upcoming', Upcoming: 'All' }

function Val({ x, y, v }) {
  const [n, u] = Array.isArray(v) ? v : [v, '']
  return (
    <T x={x} b={y + 5} s={14} c="var(--ink)" className="ex-val">
      {n}
      {u ? <span className="ex-u"> {u}</span> : null}
    </T>
  )
}

export default function Exercises() {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState(null)
  const status = useUi((s) => s.exStatus ?? 'All')
  const doneMap = useUi((s) => s.exDone)
  const list = useMemo(() => {
    const done = doneMap || {}
    const isDone = (e) => done[e.name] ?? e.done
    let l = EXERCISES.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).map((e) => ({ ...e, d: isDone(e) }))
    if (status !== 'All') l = l.filter((e) => (status === 'Completed') === e.d)
    if (sort) {
      const [k, dir] = sort
      const key = (e) => (k === 'name' ? e.name : k === 'done' ? (e.d ? 1 : 0) : num(Array.isArray(e[k]) ? e[k][0] : e[k]))
      l = [...l].sort((a, b) => (key(a) > key(b) ? dir : key(a) < key(b) ? -dir : 0))
    }
    return l
  }, [q, sort, status, doneMap])
  const toggle = (e) => setUi({ exDone: { ...(doneMap || {}), [e.name]: !e.d } })
  return (
    <>
      <PageTitle title="Exercises" sub="View Your Exercise History and Upcoming Workouts" />
      <UserPill />
      <Card x={252.9} y={83.8} w={1171.2} h={892} className="ex-card">
        <At x={270.4} y={97.5} w={221.7} h={28.5} className="search-mini">
          <Icon name="search" size={14} sw={1.6} style={{ left: 10, top: 7.3 }} />
          <input value={q} placeholder="Search for exercise" onChange={(e) => setQ(e.target.value)} aria-label="Search for exercise" />
        </At>
        <At as="button" x={502.6} y={97.5} w={status === 'All' ? 70.4 : 98} h={28.5} className="pill-gray" onClick={() => setUi({ exStatus: NEXT[status] })}>
          <span className="pill-text" style={{ left: 12 }}>
            {status === 'All' ? 'Status' : status}
          </span>
          <Icon name="down" size={13} sw={1.7} style={{ left: status === 'All' ? 50 : 78, top: 8 }} />
        </At>
        <At as="button" x={status === 'All' ? 583.1 : 610.7} y={97.5} w={88.9} h={28.5} className="pill-gray">
          <span className="pill-text" style={{ left: 12 }}>
            This Week
          </span>
          <Icon name="down" size={13} sw={1.7} style={{ left: 68, top: 8 }} />
        </At>
        <At x={270.4} y={141} w={1137.7} h={32} className="ex-head" />
        {COLS.map(([label, x, k]) => (
          <At
            as="button"
            key={k}
            x={x - 6}
            y={145}
            w={null}
            h={24}
            className={`ex-th ${sort && sort[0] === k ? 'is-on' : ''}`}
            onClick={() => setSort((s) => (s && s[0] === k ? (s[1] === 1 ? [k, -1] : null) : [k, 1]))}
          >
            {label}
            <Icon name="unfold" size={11} sw={1.8} className="ex-sort" />
          </At>
        ))}
        {list.map((e, i) => {
          const y = ROW(i)
          return (
            <div key={e.name} className="ex-row" data-pi>
              <At x={270.4} y={y - 30} w={1137.7} h={61.4} className="ex-hover" />
              <At x={292.6} y={y - 16.25} w={32.5} h={32.5} className={`ex-ico tone-${e.tone}`}>
                <Icon name={e.icon} size={17} sw={1.6} style={{ left: 7.75, top: 7.75 }} />
              </At>
              <T x={338.6} b={y + 5} s={14} c="var(--ink)">
                {e.name}
              </T>
              <Val x={534.4} y={y} v={e.sets} />
              <Val x={661.4} y={y} v={e.reps} />
              <Val x={836.9} y={y} v={e.rest} />
              <Val x={995.1} y={y} v={e.weight} />
              <Val x={1155.9} y={y} v={[e.cal, 'cal']} />
              <At as="button" x={1288} y={y - 13} w={null} h={26} className={`ex-status ${e.d ? 'is-done' : ''}`} onClick={() => toggle(e)}>
                <span className="ex-dot" />
                {e.d ? 'Completed' : 'Upcoming'}
              </At>
              {i < list.length - 1 ? <At x={270.4} y={y + 30.5} w={1137.7} h={1} className="hline soft" /> : null}
            </div>
          )
        })}
        <T x={270.4} b={952} s={12} c="var(--gray)">
          Showing
        </T>
        <At x={325} y={932.5} w={43.5} h={30} className="pill-gray">
          <span className="pill-text" style={{ left: 10 }}>
            {list.length}
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 26, top: 8 }} />
        </At>
        <T x={378.5} b={952} s={12} c="var(--gray)">
          out of 28
        </T>
      </Card>
    </>
  )
}
