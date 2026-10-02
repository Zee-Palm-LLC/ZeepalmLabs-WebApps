import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'

export const H = 1024

const K = 1.5017
const P = (pts) => pts.map(([x, y]) => [Math.max(12, x * K + 5.2), y * K])

const WORKOUTS = [
  {
    id: 'park',
    kind: 'Running',
    icon: 'run',
    tone: 'blue',
    title: 'Central Park Loop',
    when: 'Today • 6:30 AM',
    km: '8 km',
    start: 'Central Park Entrance',
    finish: 'Central Park North Gate',
    t0: '6:30 AM',
    t1: '7:20 AM',
    stats: [['Duration', '50', 'mins'], ['Steps', '10,500', ''], ['Avg. Pace', '10', 'mins/km'], ['Calories', '450', 'cal']],
    hr: [140, 160, '3.5%'],
    pts: [[174.9, 447.5], [147.8, 477.5], [72.8, 518.1], [35.2, 563.1], [23.2, 608.2], [41.2, 668.2], [14.2, 705.8], [-29.2, 771.5], [50.2, 788.4], [147.8, 825.9], [245.4, 810.9], [283.0, 750.8], [328.0, 660.7], [365.6, 593.2], [362.6, 495.5], [365.6, 450.5], [410.6, 382.9], [448.2, 292.8], [448.2, 240.3], [488.7, 225.2], [463.2, 202.7], [440.7, 217.7], [403.1, 202.7], [445.2, 150.2], [445.2, 97.6], [388.1, 60.1], [335.5, 55.6]],
  },
  {
    id: 'reservoir',
    kind: 'Running',
    icon: 'run',
    tone: 'yellow',
    title: 'Reservoir Sunrise Run',
    when: 'Yesterday • 6:10 AM',
    km: '5.2 km',
    start: 'Engineers’ Gate',
    finish: 'Engineers’ Gate',
    t0: '6:10 AM',
    t1: '6:42 AM',
    stats: [['Duration', '32', 'mins'], ['Steps', '6,840', ''], ['Avg. Pace', '6.2', 'mins/km'], ['Calories', '310', 'cal']],
    hr: [146, 168, '1.2%'],
    pts: P([[113, 298], [60, 330], [28, 380], [26, 440], [50, 495], [110, 528], [170, 520], [210, 470], [232, 400], [226, 340], [190, 312], [140, 300], [113, 298]]),
  },
  {
    id: 'ride',
    kind: 'Cycling',
    icon: 'bike',
    tone: 'green',
    title: 'North Woods Ride',
    when: 'Aug 10 • 5:45 PM',
    km: '14 km',
    start: 'The Blockhouse',
    finish: 'Museum Mile',
    t0: '5:45 PM',
    t1: '6:30 PM',
    stats: [['Duration', '45', 'mins'], ['Cadence', '82', 'rpm'], ['Avg. Speed', '18.7', 'km/h'], ['Calories', '520', 'cal']],
    hr: [132, 151, '2.1%'],
    pts: P([[220, 37], [180, 60], [150, 110], [140, 170], [175, 215], [235, 230], [300, 205], [345, 160], [370, 120], [390, 180], [380, 250], [345, 300]]),
  },
]

const routeD = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')

export default function Tracker() {
  const [sel, setSel] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [day, setDay] = useState('Today')
  const [steps, setSteps] = useState(7500)
  const line = useRef(null)
  const mapRef = useRef(null)
  const first = useRef(true)
  const w = WORKOUTS[sel]
  const head = w.pts[0]
  const tail = w.pts[w.pts.length - 1]

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    gsap.fromTo(line.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
    gsap.fromTo(mapRef.current.querySelectorAll('.trk-pin'), { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.15 })
  }, [sel])

  const pct = Math.min(100, Math.round((steps / 10000) * 100))
  return (
    <>
      <PageTitle title="Workout Tracker" sub="Track Your Runs, Rides and Daily Goals" />
      <UserPill x={1147} w={277.5} search={false} />

      <Card x={252.9} y={83.8} w={380.1} h={295} className="trk-list">
        <T x={269} b={121} s={16} w={500} c="var(--ink)">
          Recent Workouts
        </T>
        <At as="button" x={594.5} y={104} w={24} h={24} className="dots-btn static" aria-label="Workout options">
          <Icon name="dots" size={24} sw={1.5} />
        </At>
        {WORKOUTS.map((o, i) => {
          const y = 140 + i * 76.5
          return (
            <At as="button" key={o.id} x={269} y={y} w={348} h={68.5} className={`trk-row ${i === sel ? 'is-on' : ''}`} onClick={() => setSel(i)} data-trk={i}>
              <span className={`trk-ic tone-${o.tone}`}>
                <Icon name={o.icon} size={18} sw={1.6} style={{ left: 10, top: 10 }} />
              </span>
              <span className="trk-t">{o.title}</span>
              <span className="trk-w">{o.when}</span>
              <span className="trk-km">{o.km}</span>
            </At>
          )
        })}
      </Card>

      <Card x={252.9} y={394.8} w={380.1} h={281.6} className="trk-sum">
        <T x={269} b={432} s={16} w={500} c="var(--ink)">
          Activity Summary
        </T>
        <At as="button" x={523} y={414} w={94} h={28} className="chip chip-green">
          <span className="chip-label" style={{ left: 12, top: 18 - 0.85 * 11 }}>
            This Month
          </span>
          <Icon name="down" size={13} className="chip-caret" style={{ left: 72, top: 7.5 }} />
        </At>
        {[
          ['Total Distance', '142.6', 'km', 'yellow', 'run', 269.8, 459.6],
          ['Total Steps', '186,240', '', 'green', 'steps', 452, 459.6],
          ['Total Calories', '25,800', 'cal', 'green', 'flamesm', 269.8, 570.6],
          ['Total Time', '51', 'hrs', 'blue', 'clock', 452, 570.6],
        ].map(([k, v, u, tone, ic, x, y]) => (
          <At key={k} x={x} y={y} w={164.8} h={88} sq={[16, 1]} className={`trk-tile fill-${tone}`} data-pi>
            <span className="tt-ic">{ic === 'flamesm' || ic === 'steps' ? <Glyph n={ic} x={0} y={0} ox={0} oy={0} /> : <Icon name={ic} size={14} sw={1.7} />}</span>
            <span className="tt-k">{k}</span>
            <span className="tt-v">
              {v}
              {u ? <em>{u}</em> : null}
              {k === 'Total Time' ? (
                <>
                  {' '}
                  36<em>mins</em>
                </>
              ) : null}
            </span>
          </At>
        ))}
      </Card>

      <Card x={252.9} y={692.7} w={380.1} h={277.6} className="trk-goals">
        <T x={269} b={730} s={16} w={500} c="var(--ink)">
          Goals
        </T>
        <At as="button" x={590} y={711} w={24} h={24} className="dots-btn static" aria-label="Goal options">
          <Icon name="dots" size={24} sw={1.5} />
        </At>
        <Layer as="button" x={269} y={754} w={166} h={202.5} sq={[18, 1]} className="goal-tile" onClick={() => setSteps((s) => (s >= 10000 ? 2500 : s + 500))}>
          <At x={328} y={774} w={48} h={48} sq={[14, 1]} className="fill-blue gt-ic">
            <Glyph n="steps" cx={352} cy={798} k={1.3} ox={328} oy={774} />
          </At>
          <T cx={352} b={856} s={12.5} c="var(--gray)">
            Steps
          </T>
          <T cx={352} b={878.5} s={20} w={600} c="var(--ink)">
            10,000
          </T>
          <T cx={352} b={892} s={11} c="var(--gray)">
            per day
          </T>
          <At x={281} y={914} w={142} h={8.5} className="gbar blue">
            <span style={{ width: `${pct}%` }} />
          </At>
          <T x={281} b={942} s={11.5} c="var(--gray)">
            {steps.toLocaleString('de-DE')} steps
          </T>
          <T r={423} b={942} s={11.5} w={500} c="var(--ink)">
            {pct}%
          </T>
        </Layer>
        <Layer x={451} y={754} w={166.5} h={202.5} sq={[18, 1]} className="goal-tile">
          <At x={510} y={774} w={48.5} h={48.5} sq={[14, 1]} className="fill-yellow gt-ic">
            <Icon name="speed" size={22} sw={1.6} style={{ left: 13.25, top: 13.25 }} />
          </At>
          <T cx={534.25} b={856} s={12.5} c="var(--gray)">
            Weight
          </T>
          <T cx={534.25} b={876.5} s={20} w={600} c="var(--ink)">
            72 <span className="st-u2">kg</span>
          </T>
          <At x={463} y={901} w={142} h={1} className="hline soft" />
          <T x={463.5} b={926.5} s={11} c="var(--gray)">
            Current
          </T>
          <T r={605} b={926.5} s={11} c="var(--gray)">
            Target
          </T>
          <T x={463.5} b={943} s={12} w={500} c="var(--ink)">
            80 kg
          </T>
          <T r={605} b={943} s={12} w={500} c="var(--ink)">
            -8 kg
          </T>
        </Layer>
      </Card>

      <Card x={649.8} y={83.8} w={774.2} h={887.6} r={24} bg={false} className="trk-map" data-s="trk-map">
        <div className="map-clip" ref={mapRef}>
          <div className="map-zoom" style={{ transform: `scale(${zoom})`, transformOrigin: `${head[0]}px ${head[1]}px` }}>
            <img src="/img/tracker-map.jpg" alt="Map of the run through Central Park" draggable="false" />
            <svg viewBox="0 0 774.2 887.6" className="map-svg">
              <path d={routeD(w.pts)} className="trk-route-shadow" />
              <path d={routeD(w.pts)} className="trk-route" pathLength="1" ref={line} data-s="trk-route" />
            </svg>
            <span className="trk-pin start" style={{ left: tail[0] - 27.6, top: tail[1] - 27.6 }}>
              <i>
                <Icon name="pin" size={13} sw={2} style={{ left: 9, top: 8 }} />
              </i>
            </span>
            <span className="trk-pin flag" style={{ left: head[0] - 27.6, top: head[1] - 27.6 }}>
              <i>
                <Icon name="flag" size={12} style={{ left: 10, top: 9.5 }} />
              </i>
            </span>
          </div>
        </div>
        <div className="zoom-box" style={{ left: 663.4, top: 20.6 }}>
          <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>
            <Icon name="minus" size={18} sw={1.6} />
          </button>
          <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}>
            <Icon name="plus" size={18} sw={1.6} />
          </button>
        </div>
      </Card>

      <Card x={667.4} y={739} w={739} h={217} r={22} className="trk-panel" data-s="trk-panel">
        <At x={681} y={754} w={30} h={30} className={`trk-ic sm tone-${w.tone}`}>
          <Icon name={w.icon} size={16} sw={1.6} style={{ left: 7, top: 7 }} />
        </At>
        <T x={720} b={778.5} s={17} w={500} c="var(--ink)">
          {w.kind} Activity
        </T>
        <At as="button" x={1125} y={754} w={88.5} h={30.5} className="chip chip-green" onClick={() => setDay((d) => (d === 'Today' ? 'This Week' : 'Today'))}>
          <Icon name="date" size={14} sw={1.6} className="chip-lead" style={{ left: 12, top: 8 }} />
          <span className="chip-label" style={{ left: 32, top: 20 - 0.85 * 11 }}>
            {day === 'Today' ? 'Today' : 'Week'}
          </span>
          <Icon name="down" size={13} className="chip-caret" style={{ left: 67, top: 8.5 }} />
        </At>
        <T x={683.5} b={811.5} s={11.5} c="var(--gray)">
          Start
        </T>
        <T x={683} b={836} s={17} w={500} c="var(--ink)">
          {w.start}
        </T>
        <Icon name="clock" size={11} sw={1.8} style={{ left: 683.5 - 667.4, top: 844 - 739 }} />
        <T x={699} b={853.5} s={11.5} c="var(--gray)">
          {w.t0}
        </T>
        <At x={864} y={830} w={149.5} h={2} className="trk-dist" />
        <Icon name="run" size={12} sw={1.8} style={{ left: 916 - 667.4, top: 812 - 739 }} />
        <T x={933.5} b={823} s={13} c="var(--ink2)">
          {w.km}
        </T>
        <T r={1210.5} b={811.5} s={11.5} c="var(--gray)">
          Finish
        </T>
        <T r={1210.5} b={836} s={17} w={500} c="var(--ink)">
          {w.finish}
        </T>
        <T r={1210} b={853.5} s={11.5} c="var(--gray)">
          {w.t1}
        </T>
        <Icon name="clock" size={11} sw={1.8} style={{ left: 1154 - 667.4 - (w.t1.length - 7) * 6, top: 844 - 739 }} />
        {w.stats.map(([k, v, u], i) => {
          const x = 681 + i * 137
          return (
            <At key={k} x={x} y={868} w={121.5} h={72} sq={[16, 1]} className="trk-stat">
              <span className="ts-k">{k}</span>
              <span className="ts-v">
                {v}
                {u ? <em>{u}</em> : null}
              </span>
            </At>
          )
        })}
        <Layer x={1229} y={754} w={163.5} h={186.5} sq={[18, 1]} className="fill-yellow trk-hr">
          <Icon name="heart" size={15} sw={1.7} style={{ left: 14, top: 13 }} />
          <span className="hr-t">Heart Beat</span>
          {[
            ['Average', w.hr[0], 798],
            ['Peak', w.hr[1], 855],
          ].map(([k, v, y]) => (
            <Layer key={k} x={1240} y={y} w={141.5} h={45} sq={[12, 1]} className="hr-row">
              <span className="hr-k">{k}</span>
              <span className="hr-v">
                {v}
                <em>bpm</em>
              </span>
            </Layer>
          ))}
          <span className="hr-foot">
            <Icon name="up" size={11} sw={2} style={{ position: 'static' }} />
            <b>{w.hr[2]}</b> vs last day
          </span>
        </Layer>
      </Card>
    </>
  )
}
