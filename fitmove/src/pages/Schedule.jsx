import { useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { goto } from '../nav.js'
import { useUi, setUi } from '../store.js'

export const H = 1024

const CAT = {
  cardio: { label: 'Cardio Workouts', fill: '#CEE9FF', icon: 'runner' },
  strength: { label: 'Strength Training', fill: '#E4F3FF', icon: 'dumbbellsm' },
  flex: { label: 'Flexibility & Mobility', fill: '#DAF17E', icon: 'yoga' },
  core: { label: 'Core Training', fill: '#EAF7B7', icon: 'star' },
  mind: { label: 'Mind & Body', fill: '#FFF080', icon: 'mind', k: 1 },
  recovery: { label: 'Recovery & Relaxation', fill: '#FFF7B8', icon: 'recovery', k: 1 },
}
const CHIPS = [
  ['cardio', 269, 129],
  ['strength', 410.5, 131],
  ['flex', 553.5, 147],
  ['core', 712, 110.5],
  ['mind', 834.5, 106.5],
  ['recovery', 953, 158.5],
]
const COL_X = [354.2, 506.5, 658.8, 811.1, 963.4]
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM']
const LINE_Y = (i) => 379 + i * 65.56

export const EVENTS = [
  { id: 'fst', d: 0, y: 392, h: 86.5, cat: 'strength', title: ['Functional Strength', 'Training'], time: '6:30 AM', who: 'Jordan Reed', dur: 45, part: 12, level: 'Beginner' },
  { id: 'hiit', d: 2, y: 372, h: 73.5, cat: 'cardio', title: ['HIIT Power Session'], time: '6:00 AM', who: 'Chris Williams', dur: 30, part: 20, level: 'Advanced' },
  { id: 'ahiit', d: 3, y: 396, h: 72.5, cat: 'cardio', title: ['Advanced HIIT'], time: '6:45 AM', who: 'Chris Williams', dur: 40, part: 16, level: 'Advanced' },
  { id: 'core', d: 1, y: 472, h: 72.5, cat: 'core', title: ['Core Stability'], time: '9:00 AM', who: 'Alex Morgan', dur: 45, part: 10, level: 'Beginner' },
  { id: 'fcore', d: 4, y: 472, h: 72.5, cat: 'core', title: ['Functional Core'], time: '8:30 AM', who: 'Alex Morgan', dur: 45, part: 14, level: 'Intermediate' },
  { id: 'fbs', d: 2, y: 553.5, h: 73.5, cat: 'strength', title: ['Full-Body Strength'], time: '11:30 AM', who: 'Jordan Reed', dur: 60, part: 15, level: 'Intermediate', date: 'August 5, 11:30 AM' },
  { id: 'circuit', d: 0, y: 569, h: 73, cat: 'strength', title: ['Strength Circuit'], time: '12:00 PM', who: 'Jordan Reed', dur: 45, part: 18, level: 'Intermediate' },
  { id: 'lower', d: 3, y: 602, h: 72.5, cat: 'strength', title: ['Lower Body Strength'], time: '1:00 PM', who: 'Jordan Reed', dur: 50, part: 12, level: 'Intermediate' },
  { id: 'pilates', d: 1, y: 733, h: 73, cat: 'flex', title: ['Pilates Stretch'], time: '5:00 PM', who: 'Sarah Lee', dur: 40, part: 14, level: 'Beginner' },
  { id: 'yoga', d: 0, y: 797, h: 73, cat: 'flex', title: ['Yoga Flow'], time: '7:00 PM', who: 'Sarah Lee', dur: 45, part: 16, level: 'Beginner' },
  { id: 'gentle', d: 3, y: 797, h: 73, cat: 'recovery', title: ['Gentle Yoga'], time: '7:00 PM', who: 'Sarah Lee', dur: 40, part: 9, level: 'Beginner' },
  { id: 'mind', d: 2, y: 813, h: 73, cat: 'mind', title: ['Mindfulness Meditation'], time: '7:30 PM', who: 'Emily Thompson', dur: 30, part: 22, level: 'Beginner' },
]

const DATES = [3, 4, 5, 6, 7]

function Summary({ x, tone, glyph, label, value, unit }) {
  return (
    <Card x={x} y={83.8} w={281.3} h={76.5} r={20.5} className="sum-card">
      <At x={x + 16.1} y={99.5} w={44.5} h={44.5} sq={[12, 1]} className={`sum-ico fill-${tone}`}>
        <Glyph n={glyph} cx={x + 16.1 + 22.25} cy={99.5 + 22.25} k={1.15} ox={x + 16.1} oy={99.5} />
      </At>
      <T x={x + 73.6} b={113.3} s={12} c="var(--gray)">
        {label}
      </T>
      <T x={x + 73.4} b={138.4} s={24} w={600} c="var(--ink)">
        {value}
        {unit ? <span className="sum-unit">{unit}</span> : null}
      </T>
      <At as="button" x={x + 235.5} y={109.8} w={24} h={24} className="dots-v" aria-label={`${label} options`}>
        <Icon name="vdots" size={24} />
      </At>
    </Card>
  )
}

export default function Schedule() {
  const sel = useUi((s) => s.schedSel ?? 'fbs')
  const filter = useUi((s) => s.schedCats)
  const [view, setView] = useState('Week')
  const [week, setWeek] = useState(1)
  const ev = EVENTS.find((e) => e.id === sel) || EVENTS[5]
  const toggleCat = (c) => {
    const cur = filter || []
    setUi({ schedCats: cur.includes(c) ? cur.filter((v) => v !== c) : [...cur, c] })
  }
  const active = (c) => !filter || !filter.length || filter.includes(c)
  return (
    <>
      <PageTitle title="Schedule" center />
      <UserPill x={805.5} />
      <Summary x={252.9} tone="blue" glyph="classes" label="Total Classes" value="12" />
      <Summary x={549.8} tone="yellow" glyph="clockmd" label="Total Duration" value="10" unit="hours" />
      <Summary x={846.7} tone="green" glyph="flamemd" label="Total Calories" value="5,400" unit="cal" />

      <Card x={252.9} y={175.8} w={875.1} h={797.5} className="sched-card" data-s="sched-card">
        <T x={268.8} b={212.6} s={14} w={500} c="var(--ink)">
          August 2028
        </T>
        <Icon name="down" size={14} sw={1.7} className="ink2" style={{ left: 355 - 252.9, top: 199.4 - 175.8 }} />
        <At as="button" x={380} y={192} w={30} h={30} className="cal-circle outline" aria-label="Previous week" onClick={() => setWeek((w) => Math.max(1, w - 1))}>
          <Icon name="left" size={14} sw={1.7} />
        </At>
        <At x={420} y={192} w={55} h={30} className="pill-gray">
          <span className="pill-text">Week {week}</span>
        </At>
        <At as="button" x={485} y={192} w={30} h={30} className="cal-circle" aria-label="Next week" onClick={() => setWeek((w) => Math.min(5, w + 1))}>
          <Icon name="right" size={14} sw={1.7} />
        </At>
        <At as="button" x={828.5} y={192} w={108} h={30} className="pill-gray" data-menu onClick={() => setUi({ schedCats: null })}>
          <span className="pill-text" style={{ left: 12 }}>
            All Categories
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 86, top: 8 }} />
        </At>
        <At x={946.5} y={192} w={165} h={30} className="seg">
          {['Day', 'Week', 'Month'].map((v, i) => (
            <button key={v} className={`seg-item ${view === v ? 'is-on' : ''}`} style={{ left: [6, 56, 110][i], width: [48, 52, 50][i] }} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </At>
        <At x={268.5} y={237.6} w={843.5} h={1} className="hline" />
        {CHIPS.map(([c, x, w]) => (
          <At as="button" key={c} x={x} y={253.5} w={w} h={27} className={`cat-chip ${active(c) ? '' : 'is-off'}`} style={{ background: CAT[c].fill }} onClick={() => toggleCat(c)}>
            <Glyph n={CAT[c].icon} cx={x + 15.2} cy={267.2} k={CAT[c].k ?? 0.68} ox={x} oy={253.5} className="cat-ico" />
            <span className="cat-text">{CAT[c].label}</span>
          </At>
        ))}
        <At x={269} y={296} w={841.5} h={660} className="grid-box" />
        {[349, 501.5, 654, 806.3, 958.6].map((x) => (
          <At key={x} x={x} y={296} w={1} h={660} className="vline" />
        ))}
        {TIMES.map((t, i) => (
          <div key={t}>
            <At x={349} y={LINE_Y(i)} w={761.5} h={1} className="hline" />
            <T cx={308.4} b={LINE_Y(i) + 4.4} s={12.5} c="var(--ink2)">
              {t}
            </T>
          </div>
        ))}
        <At x={275} y={302} w={69} h={32} className="day-pill">
          <span>UTC +1</span>
        </At>
        {DAYS.map((d, i) => (
          <At key={d} x={COL_X[i] + 1.8} y={302} w={140.5} h={32} className="day-pill">
            <span>
              {d}, <b>{DATES[i] + (week - 1) * 7}</b>
            </span>
          </At>
        ))}
        {EVENTS.filter((e) => active(e.cat)).map((e) => (
          <At
            as="button"
            key={e.id}
            x={COL_X[e.d]}
            y={e.y}
            w={144.5}
            h={e.h}
            className={`event ${sel === e.id ? 'is-sel' : ''}`}
            style={{ background: CAT[e.cat].fill }}
            onClick={() => setUi({ schedSel: e.id })}
            data-ev
          >
            <Glyph n={CAT[e.cat].icon} cx={COL_X[e.d] + 15} cy={e.y + 15.3} k={CAT[e.cat].k ?? 0.68} ox={COL_X[e.d]} oy={e.y} className="ev-ico" />
            <span className="ev-title" style={{ top: 41.5 - 0.85 * 12 - (e.title.length - 1) * 0 }}>
              {e.title.map((l, k) => (
                <span key={k}>{l}</span>
              ))}
            </span>
            <span className="ev-sub" style={{ top: e.h - 9.6 - 0.85 * 10.5 }}>
              {e.time} <i>•</i> {e.who}
            </span>
          </At>
        ))}
      </Card>

      <Card x={1143.2} y={15.9} w={280.9} h={992.4} className="detail-panel" data-s="detail">
        <T x={1159.8} b={53.4} s={16} w={500} c="var(--ink)">
          Schedule Detail
        </T>
        <At as="button" x={1381.2} y={34.8} w={24} h={24} className="x-btn" aria-label="Close" onClick={() => setUi({ schedSel: null })}>
          <Icon name="close" size={24} sw={1.6} />
        </At>
        <T x={1159} b={93.3} s={12} c="var(--gray)">
          Time
        </T>
        <T x={1159} b={115.6} s={14.5} w={500} c="var(--ink)">
          {ev.date || `August ${DATES[ev.d]}, ${ev.time}`}
        </T>
        <T x={1159.5} b={151.4} s={12} c="var(--gray)">
          Duration
        </T>
        <T x={1159.5} b={173.4} s={14.5} w={500} c="var(--ink)">
          {ev.dur} minutes
        </T>
        <T x={1159.5} b={209.4} s={12} c="var(--gray)">
          Class Info
        </T>
        <Layer x={1160} y={222} w={248} h={301} sq={[16, 1]} className="sub-card">
          <At x={1166.5} y={229} w={235} h={143} clip={[12, 1]} className="sub-photo">
            <img src="/img/sched-class.jpg" alt="" draggable="false" />
          </At>
          <T x={1171.5} b={397.4} s={16} w={500} c="var(--ink)">
            {ev.title.join(' ')}
          </T>
          <T x={1171.5} b={414.7} s={12} c="var(--gray)">
            {CAT[ev.cat].label}
          </T>
          <At x={1167} y={427.2} w={234} h={1} className="hline" />
          <T x={1171.5} b={446.6} s={12} c="var(--gray)">
            Level
          </T>
          <T r={1397} b={446.6} s={12.5} c="var(--ink2)">
            {ev.level}
          </T>
          <T x={1171.5} b={468.7} s={12} c="var(--gray)">
            Participants
          </T>
          <T r={1396.6} b={469} s={12.5} c="var(--ink2)">
            {ev.part}
          </T>
          <At as="button" x={1167} y={480.5} w={234.5} h={37.5} className="btn-green" onClick={() => goto('/classes')}>
            See Class
          </At>
        </Layer>
        <T x={1159} b={556.6} s={12} c="var(--gray)">
          Trainer Info
        </T>
        <Layer x={1160} y={569} w={248} h={180} sq={[16, 1]} className="sub-card">
          <At x={1259.5} y={584.5} w={49.5} h={49.5} className="sub-avatar">
            <img src="/img/jordan-sm.jpg" alt="" draggable="false" />
          </At>
          <T cx={1284} b={665.4} s={18} w={500} c="var(--ink)">
            {ev.who}
          </T>
          <T cx={1284.3} b={686.8} s={12} c="var(--gray)">
            Available
          </T>
          <At as="button" x={1167} y={704.5} w={234.5} h={37.5} className="btn-green" onClick={() => goto('/trainers/jordan-reed')}>
            See Details
          </At>
        </Layer>
      </Card>
    </>
  )
}
