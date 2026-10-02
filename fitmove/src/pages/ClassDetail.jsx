import { useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { goto } from '../nav.js'

export const H = 1040

const STATS = [
  ['level', 'Intermediate', 'Level', 'blue', 285.5, 330.1],
  ['gauge', 'Moderate to High', 'Intensity', 'yellow', 419.4, 463.5],
  ['classes', '12 Videos', 'Total Video', 'green', 578.3, 622.9],
  ['clock', '45 Mins/Session', 'Duration', 'gray', 696.8, 740.3],
  ['flamesm', '400-500 Cal/session', 'Calories Burned', 'red', 849.8, 893.9],
]
const ABOUT = [
  'The "Strength & Conditioning" class is designed to help intermediate-level participants build overall strength and improve',
  'their conditioning through a combination of resistance training, functional movements, and metabolic conditioning',
  'exercises. This class emphasizes proper form and technique, ensuring that participants maximize their gains while',
  'minimizing the risk of injury.',
]
const EQUIP = [
  ['Dumbbells (various weights)', 'Bodyweight'],
  ['Kettlebells', 'Mat'],
  ['Resistance Bands', null],
]
const BENEFITS = [
  [['Build and tone muscles across the entire body.'], ['Gain better balance, stability, and core strength.']],
  [['Enhance cardiovascular health and endurance.'], ['Increase metabolism and burn more calories', 'throughout the day.']],
  [['Boost everyday athletic performance.'], null],
]
const MOVES = [
  ['Dumbbell Lunges', '12 reps', '3 sets'],
  ['Kettlebell Swings', '15 reps', '3 sets'],
  ['Push-Up Variations', '10 reps', '4 sets'],
  ['Inverted Rows', '12 reps', '3 sets'],
  ['Farmer’s Carry', '40 m', '3 sets'],
  ['Plank Shoulder Taps', '20 reps', '3 sets'],
]
const SESSIONS = [
  ['Mon, 3 Aug', '7:00 AM', 'Upper Body Power', 'blue'],
  ['Wed, 5 Aug', '6:00 PM', 'Lower Body Strength', 'yellow'],
  ['Fri, 7 Aug', '8:00 AM', 'Full-Body Circuit', 'green'],
]

export default function ClassDetail() {
  const [saved, setSaved] = useState(false)
  const [taken, setTaken] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [doneMoves, setDoneMoves] = useState({ 0: true })
  const [copied, setCopied] = useState(false)
  return (
    <>
      <PageTitle title="Class Details" back={{ label: 'Back to Class List', to: '/' }} />
      <UserPill />

      <Card x={252.9} y={83.8} w={793.3} h={906.2} className="cd-card">
        <T x={269.2} b={119.5} s={22.5} w={500} c="var(--ink)">
          Strength &amp; Conditioning
        </T>
        <T x={269.2} b={143.3} s={13} c="var(--gray)">
          Strength Training
        </T>
        <At x={378} y={131} w={1} h={15} className="vline" />
        <At as="button" x={387} y={131} w={null} h={16} className="cd-coach" onClick={() => goto('/trainers/jordan-reed')}>
          Jordan Reed
        </At>
        <T r={839.3} b={115.2} s={18} w={500} c="var(--ink)">
          $59.99
        </T>
        <T r={839.3} b={131.7} s={11.5} c="var(--gray)">
          for the full course
        </T>
        <At
          as="button"
          x={856.9}
          y={100}
          w={34}
          h={34}
          className={`cd-round ${copied ? 'is-on' : ''}`}
          aria-label="Share class"
          onClick={() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
        >
          <Icon name={copied ? 'tick' : 'share'} size={16} sw={1.7} style={{ left: 9, top: 9 }} />
        </At>
        <At as="button" x={900.5} y={100} w={34} h={34} className={`cd-round ${saved ? 'is-on' : ''}`} aria-label="Save class" onClick={() => setSaved((v) => !v)}>
          <Icon name="bookmark" size={16} sw={1.7} style={{ left: 9, top: 9 }} />
        </At>
        <At as="button" x={944} y={100} w={85.6} h={34} className={`btn-green cd-take ${taken ? 'is-on' : ''}`} onClick={() => setTaken((v) => !v)}>
          {taken ? 'Enrolled ✓' : 'Take Class'}
        </At>

        <At x={269.6} y={488.8} w={760.9} h={83.5} sq={[18, 1]} className="cd-strip" />
        <At x={269.2} y={164.9} w={760.4} h={342.7} clip={[18, 1]} className={`cd-video ${playing ? 'is-playing' : ''}`} data-s="cd-video">
          <img src="/img/class-video.jpg" alt="Strength and Conditioning class preview" draggable="false" />
          <span className="cd-progress">
            <i />
          </span>
        </At>
        <At as="button" x={629.4} y={306} w={61} h={61} className={`cd-play ${playing ? 'is-playing' : ''}`} aria-label={playing ? 'Pause preview' : 'Play preview'} onClick={() => setPlaying((v) => !v)} data-s="cd-play">
          {playing ? <span className="pause" /> : <span className="tri" />}
        </At>
        {STATS.map(([ic, a, b, tone, x, tx]) => (
          <div key={a} className="cd-stat">
            <At x={x} y={522.8} w={35} h={35} className={`cd-ic tone-${tone}`}>
              {ic === 'level' || ic === 'flamesm' ? <Glyph n={ic} cx={x + 17.5} cy={540.3} k={ic === 'level' ? 1.15 : 1.05} ox={x} oy={522.8} /> : <Icon name={ic === 'gauge' ? 'speed' : ic} size={16} sw={1.6} style={{ left: 9.5, top: 9.5 }} />}
            </At>
            <T x={tx} b={537.3} s={13} w={600} c="var(--ink)">
              {a}
            </T>
            <T x={tx} b={552.3} s={11.5} c="var(--gray)">
              {b}
            </T>
          </div>
        ))}

        <T x={269.6} b={606.3} s={16} w={500} c="var(--ink)">
          About The Class
        </T>
        <T x={269.6} b={634.3} s={14} lh={19} c="var(--ink2)">
          {ABOUT.map((l) => (
            <span key={l}>
              {l}
              <br />
            </span>
          ))}
        </T>
        <T x={269.6} b={735.3} s={16} w={500} c="var(--ink)">
          Equipments
        </T>
        {EQUIP.map((row, i) =>
          row.map((t, k) =>
            t ? (
              <div key={t}>
                <At x={k ? 654.6 : 269.6} y={749.8 + i * 30.2} w={22} h={22} className="bullet" />
                <T x={k ? 685.6 : 299.9} b={767.3 + i * 30.2} s={14} c="var(--ink2)">
                  {t}
                </T>
              </div>
            ) : null
          )
        )}
        <T x={269.6} b={868.3} s={16} w={500} c="var(--ink)">
          Benefits
        </T>
        {BENEFITS.map((row, i) =>
          row.map((lines, k) =>
            lines ? (
              <div key={lines[0]}>
                <At x={k ? 654.6 : 269.6} y={885.8 + i * 30} w={22} h={22} className="check-dot">
                  <Icon name="tick" size={12} sw={1.8} style={{ left: 5, top: 5 }} />
                </At>
                <T x={k ? 685.6 : 299.9} b={903.3 + i * 30} s={14} lh={21.5} c="var(--ink2)">
                  {lines.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </T>
              </div>
            ) : null
          )
        )}
      </Card>

      <T x={1062.6} b={103} s={16} w={500} c="var(--ink)">
        Exercises
      </T>
      {MOVES.map(([name, a, b], i) => {
        const y = 127.3 + i * 81
        const done = !!doneMoves[i]
        return (
          <Card key={name} as="button" x={1062.6} y={y} w={361.5} h={65.5} r={20} className={`mv-card ${done ? 'is-done' : ''}`} onClick={() => setDoneMoves((s) => ({ ...s, [i]: !s[i] }))}>
            <At x={1078.5} y={y + 17.5} w={30} h={30} className="mv-n">
              {done ? <Icon name="tick" size={14} sw={2} style={{ left: 8, top: 8 }} /> : <span>{i + 1}</span>}
            </At>
            <T x={1121} b={y + 29.5} s={15} w={500} c="var(--ink)">
              {name}
            </T>
            <Icon name="repeat" size={11} sw={1.8} className="mv-ic" style={{ left: 1121 - 1062.6, top: 36.5 }} />
            <T x={1137} b={y + 48} s={12} c="var(--gray)">
              {a} • {b}
            </T>
            <span className="mv-play">
              <Icon name="play" size={12} sw={1.8} style={{ left: 8, top: 8 }} />
            </span>
          </Card>
        )
      })}
      <T x={1062.6} b={638} s={16} w={500} c="var(--ink)">
        Schedule
      </T>
      <Card x={1062.6} y={655} w={361.5} h={335} r={24} className="cd-sched">
        {SESSIONS.map(([d, t, title, tone], i) => {
          const y = 680 + i * 98
          return (
            <Layer key={title} x={1078.5} y={y} w={329.5} h={80} className="cs-item">
              <At x={1078.5} y={y + 6} w={22} h={22} className={`cs-node tone-${tone}`} />
              {i < SESSIONS.length - 1 ? <At x={1088.8} y={y + 34} w={1.5} h={58} className="step-line" /> : null}
              <T x={1114} b={y + 15} s={12} c="var(--gray)">
                {d} • {t}
              </T>
              <T x={1114} b={y + 37} s={15} w={500} c="var(--ink)">
                {title}
              </T>
              <T x={1114} b={y + 56} s={12} c="var(--gray)">
                with Jordan Reed · 60 minutes
              </T>
            </Layer>
          )
        })}
      </Card>
    </>
  )
}
