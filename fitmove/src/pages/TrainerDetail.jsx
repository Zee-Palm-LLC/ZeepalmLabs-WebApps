import { useMemo, useRef, useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { goto } from '../nav.js'
import { TRAINERS, ACTIVITY_CURVE, TRAINER_SCHEDULE, BUSY_DAYS, TRAINER_REVIEWS } from './trainersData.js'

export const H = 1083

const GY = [153, 194.9, 236.8, 278.7, 320.6]
const DAY_X = (i) => 655 + i * 88.9
const DAYS = ['5 Aug', '6 Aug', '7 Aug', '8 Aug', '9 Aug', '10 Aug', '11 Aug', '12 Aug', '13 Aug']
const WEEKDAYS = ['Wednesday, 5 August', 'Thursday, 6 August', 'Friday, 7 August', 'Saturday, 8 August', 'Sunday, 9 August', 'Monday, 10 August', 'Tuesday, 11 August', 'Wednesday, 12 August', 'Thursday, 13 August']
const CAL_X = (c) => 603 + c * 48.5
const CAL_Y = (r) => 529 + r * 42

function smooth(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += `Q${x0} ${y0} ${mx} ${(y0 + y1) / 2}`
  }
  const l = pts[pts.length - 1]
  return d + `L${l[0]} ${l[1]}`
}

function yAt(x) {
  for (let i = 1; i < ACTIVITY_CURVE.length; i++) {
    const [x0, y0] = ACTIVITY_CURVE[i - 1]
    const [x1, y1] = ACTIVITY_CURVE[i]
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return ACTIVITY_CURVE[ACTIVITY_CURVE.length - 1][1]
}

function hoursAt(y) {
  const h = (320.6 - y) / 41.9
  const hh = Math.floor(h)
  const mm = Math.round(((h - hh) * 60) / 5) * 5
  return mm === 60 ? `${hh + 1} Hours` : `${hh} Hours ${mm} Minutes`
}

export default function TrainerDetail({ param }) {
  const t = TRAINERS.find((x) => x.id === param) || TRAINERS[1]
  const first = t.name.split(' ')[0]
  const [hover, setHover] = useState(2)
  const [month, setMonth] = useState(7)
  const svg = useRef(null)
  const curve = useMemo(() => smooth(ACTIVITY_CURVE), [])
  const area = curve + `L1411 320.6L612 320.6Z`
  const hx = DAY_X(hover) + (hover === 2 ? -0.5 : 0)
  const hy = yAt(hx)
  const onMove = (e) => {
    const r = svg.current.getBoundingClientRect()
    const x = 550.5 + ((e.clientX - r.left) / r.width) * 875.9
    const i = Math.max(0, Math.min(8, Math.round((x - 655) / 88.9)))
    if (i !== hover) setHover(i)
  }
  const tipX = Math.min(Math.max(hx - 0.5, 612), 1411 - 131)
  const reviews = TRAINER_REVIEWS.map(([n, r, img, lines]) => [n, r, img, lines.map((l) => l.replace(/Jordan/g, first))])
  return (
    <>
      <PageTitle title="Trainer Details" back={{ label: 'Back to Trainer List', to: '/trainers' }} />
      <UserPill />

      <Card x={252.9} y={83.8} w={282} h={947.3} className="td-profile">
        <T x={270} b={121.4} s={16} w={500} c="var(--ink)">
          Profile
        </T>
        <Dots x={491.5} y={102.8} />
        <At x={336} y={151.5} w={115.5} h={115.5} clip={[28, 1]} className="tr-photo">
          <img src={t.id === 'jordan-reed' ? '/img/td-jordan-reed.jpg' : `/img/tr-${t.id}.jpg`} alt={t.name} draggable="false" />
        </At>
        <T cx={393.5} b={304} s={23.5} w={500} c="var(--ink)">
          {t.name}
        </T>
        <T cx={393.5} b={327} s={15} c="var(--ink2)">
          Available
        </T>
        <Layer x={269.5} y={355.3} w={250} h={76.8} sq={[22, 1]} className="td-band fill-blue">
          {[
            ['10', 'yrs', 'Experience', 313.4],
            ['250+', '', 'Members', 394.6],
            ['4.8', '/5.0', 'Rating', 474.6],
          ].map(([v, u, k, cx]) => (
            <div key={k}>
              <T cx={cx} b={390} s={20} w={500} c="var(--ink)">
                {v}
                {u ? <span className="td-u">{u}</span> : null}
              </T>
              <T cx={cx} b={413} s={13} c="var(--ink2)">
                {k}
              </T>
            </div>
          ))}
          <At x={352.5} y={373} w={1.5} h={42.5} className="td-sep" />
          <At x={433.5} y={373} w={1.5} h={42.5} className="td-sep" />
        </Layer>
        <T x={269} b={481.5} s={16} w={500} c="var(--ink)">
          Class
        </T>
        <Dots x={491.5} y={462.8} />
        <At as="button" x={269} y={507.5} w={240} h={32} className="td-class" onClick={() => goto('/classes')}>
          <span className="td-ic blue">
            <Glyph n="video" x={0} y={0} ox={0} oy={0} />
          </span>
          <span className="td-ct">{t.cls}</span>
          <span className="td-cs">{t.cat}</span>
        </At>
        <T x={269} b={591.5} s={16} w={500} c="var(--ink)">
          Contact
        </T>
        <Dots x={491.5} y={573.3} />
        {[
          ['mail', 'Email', [`${t.id.replace('-', '.')}@fitmove.com`]],
          ['call', 'Phone', ['+1 (555) 123-4567']],
          ['home', 'Address', ['123 Fitness Lane, Suite 200,', 'Wellness City, CA 90210']],
        ].map(([ic, k, v], i) => {
          const y = 613.5 + i * 53.25
          return (
            <div key={k}>
              <At x={269} y={y} w={38.5} h={38.5} sq={[12, 1]} className="fill-green">
                <Icon name={ic} size={18} sw={1.6} style={{ left: 10.25, top: 10.25 }} />
              </At>
              <T x={321.5} b={y + 14} s={12.5} c="var(--gray)">
                {k}
              </T>
              <T x={320.5} b={y + 34} s={14.5} lh={20} c="var(--ink)">
                {v.map((l, j) => (
                  <span key={j}>
                    {l}
                    <br />
                  </span>
                ))}
              </T>
            </div>
          )
        })}
        <T x={269} b={830} s={16} w={500} c="var(--ink)">
          Certifications
        </T>
        <Dots x={491.5} y={811.8} />
        {[
          [['Certified Strength and', 'Conditioning Specialist (CSCS)'], '2015'],
          [['NASM Certified Personal Trainer', '(CPT)'], '2013'],
        ].map(([lines, yr], i) => {
          const y = 852.5 + i * 88
          return (
            <Layer key={yr} x={269} y={y} w={249.5} h={74.5} sq={[18, 1]} className="cert">
              <At x={281} y={y + 20} w={34.5} h={34.5} className="info-circle">
                <Icon name="file" size={16} sw={1.6} style={{ left: 9.25, top: 9.25 }} />
              </At>
              <T x={329} b={y + 26} s={12.5} w={500} lh={13.5} c="var(--ink)">
                {lines[0]}
                <br />
                {lines[1]}
              </T>
              <T x={329} b={y + 59.5} s={11.5} c="var(--gray)">
                {yr}
              </T>
            </Layer>
          )
        })}
      </Card>

      <Card x={550.5} y={83.8} w={875.9} h={292} className="td-chart">
        <T x={566.5} b={120.5} s={16} w={500} c="var(--ink)">
          Training Activity
        </T>
        <At as="button" x={1263} y={99.5} w={147.5} h={30.5} className="chip chip-green">
          <Glyph n="date" x={1263 + 13.5} y={99.5 + 7.6} ox={1263} oy={99.5} className="chip-lead" />
          <span className="chip-label" style={{ left: 34, top: 19.5 - 0.85 * 11.5 }}>
            1 - 8 August 2028
          </span>
          <Icon name="down" size={14} sw={1.7} className="chip-caret" style={{ left: 124, top: 8.3 }} />
        </At>
        {GY.map((y, i) => (
          <div key={y}>
            <At x={610} y={y} w={801} h={1} className="hline soft" />
            <T x={566.5} b={y + 4.2} s={11.5} c="var(--gray)">
              {4 - i} Hours
            </T>
          </div>
        ))}
        {DAYS.map((d, i) => (
          <T key={d} cx={DAY_X(i)} b={347.4} s={11.5} c={i === hover ? 'var(--ink)' : 'var(--gray)'}>
            {d}
          </T>
        ))}
        <svg ref={svg} className="chart td-svg" viewBox="550.5 83.8 875.9 292" onMouseMove={onMove} data-s="td-chart">
          <defs>
            <linearGradient id="td-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#CEE9FF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#CEE9FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#td-fill)" className="td-area" />
          <path d={curve} className="td-line" pathLength="1" data-s="td-line" />
          <line x1={hx} x2={hx} y1={hy} y2={320.6} className="td-guide" />
          <circle cx={hx} cy={hy} r={5} className="td-dot" />
          <rect x={600} y={140} width={820} height={190} fill="transparent" style={{ pointerEvents: 'auto' }} />
        </svg>
        <At x={tipX} y={115} w={131} h={58} sq={[10, 1]} className="td-tip">
          <span className="tt-a">{WEEKDAYS[hover]}</span>
          <span className="tt-b">{hoursAt(hy)}</span>
        </At>
      </Card>

      <Card x={550.5} y={391} w={875.9} h={397.5} className="td-sched">
        <Layer x={566.5} y={411} w={391} h={358} sq={[20, 1]} className="cal-panel">
          <T x={584} b={446} s={17.5} w={500} c="var(--ink)">
            {['June', 'July', 'August', 'September'][month - 5]} 2028
          </T>
          <At as="button" x={848} y={423} w={30.5} h={30.5} className="cal-circle green" onClick={() => setMonth((m) => Math.max(5, m - 1))} aria-label="Previous month">
            <Icon name="left" size={14} sw={1.8} style={{ left: 8.25, top: 8.25 }} />
          </At>
          <At as="button" x={886} y={423} w={30.5} h={30.5} className="cal-circle green" onClick={() => setMonth((m) => Math.min(8, m + 1))} aria-label="Next month">
            <Icon name="right" size={14} sw={1.8} style={{ left: 8.25, top: 8.25 }} />
          </At>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <T key={i} cx={CAL_X(i)} b={491} s={12} c="var(--gray)">
              {d}
            </T>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const n = i - 5
            const out = n < 1 || n > 31
            const label = n < 1 ? 26 + i : n > 31 ? n - 31 : n
            const busy = month === 7 && !out && BUSY_DAYS.includes(n)
            return (
              <At key={i} x={CAL_X(i % 7) - 15.5} y={CAL_Y(Math.floor(i / 7)) - 15.25} w={31} h={31} className={`td-day ${out ? 'is-out' : ''} ${busy ? 'is-busy' : ''}`} data-day>
                <span>{label}</span>
              </At>
            )
          })}
        </Layer>
        <T x={946} b={429} s={16.5} w={500} c="var(--ink)">
          {first}’s Schedule
        </T>
        <At as="button" x={1321} y={407} w={89.5} h={30.5} className="chip chip-green">
          <span className="chip-label" style={{ left: 12.4, top: 19.8 - 0.85 * 11 }}>
            This Week
          </span>
          <Icon name="down" size={14} className="chip-caret" style={{ left: 67.2, top: 8.0 }} />
        </At>
        {TRAINER_SCHEDULE.map((r, i) => {
          const y = 464.5 + i * 65.5
          return (
            <div key={r.title} className="ts-row">
              {i ? <At x={946.5} y={y - 19.3} w={464} h={1} className="hline soft" /> : null}
              <T x={956.5} b={y + 9} s={12} c="var(--gray)">
                {r.d}
              </T>
              <T x={956} b={y + 27} s={13.5} w={500} c="var(--ink)">
                {r.t}
              </T>
              <At x={1032} y={y - 3} w={1} h={32} className="vline" />
              <T x={1049} b={y + 20.3} s={16.5} w={500} c="var(--ink)">
                {r.title}
              </T>
              <Icon name="clock" size={11.5} sw={1.7} className="ts-ic" style={{ left: 1311.5 - 550.5, top: y - 1 - 391 }} />
              <T x={1327.5} b={y + 8.5} s={12} c="var(--gray)">
                {r.mins} minutes
              </T>
              <Icon name="user" size={12.5} sw={1.7} className="ts-ic" style={{ left: 1311 - 550.5, top: y + 16.5 - 391 }} />
              <T x={1327.5} b={y + 26} s={12} c="var(--gray)">
                {r.part} participants
              </T>
            </div>
          )
        })}
      </Card>

      <T x={551.5} b={826.5} s={16} w={500} c="var(--ink)" data-pi>
        Reviews
      </T>
      {reviews.map(([name, rate, img, lines], i) => {
        const x = 550.5 + i * 297.2
        return (
          <Card key={name} x={x} y={850} w={281.5} h={181} r={24} className="review">
            <At x={x + 16.5} y={866.5} w={36} h={36} className="rv-avatar">
              <img src={img} alt="" draggable="false" />
            </At>
            <T x={x + 65.1} b={880} s={14.5} w={500} c="var(--ink)">
              {name}
            </T>
            <Icon name="starfill" size={13} style={{ left: 64.5, top: 888.5 - 850 }} />
            <T x={x + 83.1} b={901} s={12} c="var(--ink2)">
              {rate}
            </T>
            <At x={x + 16.5} y={917.5} w={249} h={1} className="hline" />
            <T x={x + 16.5} b={952.5} s={14} lh={20.1} c="var(--ink2)">
              {lines.map((l, k) => (
                <span key={k}>
                  {l}
                  <br />
                </span>
              ))}
            </T>
          </Card>
        )
      })}
    </>
  )
}

function Dots({ x, y }) {
  return (
    <At as="button" x={x} y={y} w={24} h={24} className="dots-btn static" aria-label="More options">
      <Icon name="dots" size={24} sw={1.5} />
    </At>
  )
}
