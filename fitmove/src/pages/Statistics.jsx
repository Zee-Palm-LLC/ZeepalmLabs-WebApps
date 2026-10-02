import { useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'

export const H = 1032

const WA_X = [901.4, 976.2, 1051.8, 1127.4, 1203, 1278.6, 1354.2]
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WA = [
  { top: 332.6, label: ['2 Hours', '15 Min'] },
  { top: 342.7, label: ['2 Hours'] },
  { top: 316.8, label: ['2 Hours', '30 Min'] },
  { top: 288, label: ['3 Hours'] },
  { top: 306.7, label: ['2 Hours', '40 Min'] },
  { top: 342.7, label: ['2 Hours'] },
  { top: 311, label: ['2 Hours', '35 Min'] },
]
const CS_X = [931.6, 1002, 1072.7, 1144, 1215.3, 1285.8, 1356.4]
const CS_BASE = 824.3
const CS_K = 178.5 / 2000
const CS = [
  [960, 380],
  [1140, 300],
  [1395, 355],
  [1450, 300],
  [1305, 315],
  [945, 445],
  [1055, 525],
]
const DATES = ['Sun, 2 Aug 2028', 'Mon, 3 Aug 2028', 'Tue, 4 Aug 2028', 'Wed, 5 Aug 2028', 'Thu, 6 Aug 2028', 'Fri, 7 Aug 2028', 'Sat, 8 Aug 2028']
const WEIGHT = [
  [287, 754.5, '96 kg'],
  [335, 795, '85 kg'],
  [372, 797, '85 kg'],
  [410, 815],
  [448, 828],
  [486, 846],
  [526, 858],
]

const fmt = (n) => n.toLocaleString('de-DE')

export default function Statistics() {
  const [wa, setWa] = useState(3)
  const [cs, setCs] = useState(3)
  const [goals, setGoals] = useState({ run: 15, yoga: 3, steps: 6 })
  const ring = 0.75
  const R = 95
  const C = 2 * Math.PI * R
  const wline = WEIGHT.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('')
  return (
    <>
      <PageTitle title="Statistics" sub="Track Your Progress and Achievements" />
      <UserPill x={1147} w={277.5} search={false} />
      <Card x={252.9} y={83.8} w={1171.2} h={899.2} className="st-card">
        <T x={268.5} b={115.5} s={11.5} lh={14} c="var(--gray)">
          Workout
          <br />
          Time
        </T>
        <At x={331} y={100} w={163} h={37.5} className="st-pill">
          <span>
            <b>12</b> Hours <b>35</b> Minutes
          </span>
        </At>
        <T x={558} b={115.5} s={11.5} lh={14} c="var(--gray)">
          Total
          <br />
          Workout
        </T>
        <At x={620.5} y={100} w={107.5} h={37.5} className="st-pill">
          <span>
            <b>14</b> Exercises
          </span>
        </At>
        <At x={1037.5} y={101} w={263} h={35.5} className="search-mini lg">
          <Icon name="search" size={15} sw={1.6} style={{ left: 13, top: 10.2 }} />
          <input placeholder="Search Anything" aria-label="Search statistics" />
        </At>
        <At as="button" x={1309.5} y={101} w={99} h={35.5} className="chip chip-green">
          <span className="chip-label" style={{ left: 14, top: 22.5 - 0.85 * 12 }}>
            This Week
          </span>
          <Icon name="down" size={14} className="chip-caret" style={{ left: 76, top: 10.8 }} />
        </At>

        <Layer x={269} y={154} w={273} h={156} sq={[22, 1]} className="fill-blue st-sub" data-pi>
          <Icon name="heart" size={18} sw={1.6} style={{ left: 16, top: 17 }} />
          <T x={314} b={185} s={14.5} w={500} c="var(--ink)">
            Health Score
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 243, top: 15 }} />
          <T x={285} b={247} s={28} w={500} c="var(--ink)">
            82%
          </T>
          <At x={348.5} y={225.5} w={90} h={20.5} className="st-tag">
            Very Healthy
          </At>
          {[0, 1, 2, 3, 4].map((k) => (
            <At key={k} x={285 + k * 49} y={262.5} w={45} h={5.5} className={`st-seg ${k < 4 ? 'on' : 'part'}`} />
          ))}
          <T x={285} b={291} s={12} c="var(--ink2)">
            Keep up your good work, Kalendra!
          </T>
        </Layer>

        <Layer x={269} y={326.5} w={273} h={205.5} sq={[22, 1]} className="fill-green st-sub" data-pi>
          <Icon name="heart" size={18} sw={1.6} style={{ left: 16, top: 17 }} />
          <T x={314} b={357.5} s={14.5} w={500} c="var(--ink)">
            Heart Beat
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 243, top: 15 }} />
          <T x={285} b={409.5} s={28} w={500} c="var(--ink)">
            110 <span className="st-unit">bpm</span>
          </T>
          <At x={368} y={389.5} w={59.6} h={20.9} className="st-tag">
            Normal
          </At>
          <T x={285} b={432.5} s={12} c="var(--ink2)">
            You are calm and ready for exercises!
          </T>
          <svg className="chart st-ecg" viewBox="269 326.5 273 205.5">
            <path
              d="M285 500L292 500L299 461L305 502L311 486L318 486L324 461L330 506L336 486L344 486L350 461L356 504L362 488L370 488L376 461L382 506L388 486L396 486L402 461L408 502L414 488L421 488L427 461L433 506L439 490L447 490L452 470L458 500L464 494L470 500L526 500"
              pathLength="1"
              className="st-ecg-line"
              data-s="st-ecg"
            />
          </svg>
        </Layer>

        <Layer x={558.5} y={154} w={272.5} h={328} sq={[24, 1]} className="fill-yellow st-sub" data-pi>
          <Icon name="heartcheck" size={18} sw={1.6} style={{ left: 16, top: 18 }} />
          <T x={603.5} b={188} s={14.5} w={500} c="var(--ink)">
            Workout Goals
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 243, top: 16 }} />
          <svg className="chart" viewBox="558.5 154 272.5 328">
            <circle cx={694.75} cy={310} r={R} className="st-ring-track" />
            <circle
              cx={694.75}
              cy={310}
              r={R}
              className="st-ring"
              transform="rotate(90 694.75 310)"
              style={{ strokeDasharray: `${C * ring} ${C}` }}
              data-s="st-ring"
              data-c={C}
            />
            <circle cx={694.75} cy={310} r={83} className="st-disc" />
          </svg>
          <T cx={694.75} b={315} s={38} w={600} c="var(--ink)" data-count="75">
            75%
          </T>
          <T cx={694.75} b={333} s={13} c="var(--ink2)">
            14/20 Completed
          </T>
          <T cx={694.75} b={438.4} s={12.5} lh={18} c="var(--ink2)" style={{ whiteSpace: 'nowrap' }}>
            Almost there! Keep pushing to reach
            <br />
            your goal!
          </T>
        </Layer>

        <Layer x={847.5} y={154.5} w={560.5} h={372.5} sq={[24, 1]} className="st-out" data-pi>
          <T x={863} b={189} s={16} w={500} c="var(--ink)">
            Workout Activity
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 1371 - 847.5, top: 16 }} />
          {WA.map((d, i) => {
            const x = WA_X[i]
            const on = i === wa
            return (
              <At as="button" key={i} x={x - 27.7} y={219.6} w={55.4} h={261.4} className={`wa-col ${on ? 'is-on' : ''}`} onMouseEnter={() => setWa(i)} onClick={() => setWa(i)}>
                <span className="wa-fill" style={{ top: d.top - 219.6, height: 477 - d.top }} data-s="wa-fill" />
                <span className="wa-lab" style={{ top: d.top - 219.6 - (d.label.length > 1 ? 34 : 20) }}>
                  {d.label.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
              </At>
            )
          })}
          {WEEK.map((w, i) => (
            <T key={w} cx={WA_X[i]} b={505.5} s={12} c={i === wa ? 'var(--ink)' : 'var(--gray)'}>
              {w}
            </T>
          ))}
        </Layer>

        <T x={558.5} b={523.5} s={16} w={500} c="var(--ink)">
          Goals List
        </T>
        <Icon name="dots" size={22} sw={1.5} style={{ left: 803 - 252.9, top: 505 - 83.8 }} />
        {[
          { id: 'run', y: 558.7, h: 116, title: 'Complete 5K Runs', tag: 'Running', tagW: 50.5, desc: '25 km (5 runs of 5 km each)', done: goals.run, total: 25, unit: 'km' },
          { id: 'yoga', y: 692, h: 126, title: 'Weekly Yoga Practice', tag: 'Yoga', tagW: 38, desc: '4 sessions per week', done: goals.yoga, total: 4, unit: 'sessions' },
          { id: 'steps', y: 835, h: 132, title: 'Daily 10K Steps', tag: 'Walking', tagW: 52, desc: '7 days at 10,000 steps', done: goals.steps, total: 7, unit: 'days' },
        ].map((g) => {
          const pct = Math.round((g.done / g.total) * 100)
          const tagY = g.y + 33.5
          const pY = g.y + (g.h > 120 ? 90.6 : 81.3)
          return (
            <Layer key={g.id} as="button" x={558.5} y={g.y} w={272.5} h={g.h} sq={[20, 1]} className="st-out goal" data-pi onClick={() => setGoals((s) => ({ ...s, [g.id]: s[g.id] >= g.total ? 0 : s[g.id] + 1 }))}>
              <T x={573.8} b={g.y + 17.3 + (g.h > 120 ? 9.5 : 0)} s={15} w={500} c="var(--ink)">
                {g.title}
              </T>
              <At x={573} y={tagY + (g.h > 120 ? 9.5 : 0)} w={g.tagW} h={18.5} className="st-gtag">
                {g.tag}
              </At>
              <T x={573 + g.tagW + 10} b={tagY + 13.2 + (g.h > 120 ? 9.5 : 0)} s={12} c="var(--ink2)">
                {g.desc}
              </T>
              <T x={573.8} b={pY} s={13} w={500} c="var(--ink)">
                {pct}%
              </T>
              <T r={814.3} b={pY} s={12} c="var(--ink2)">
                {g.done}/{g.total} {g.unit}
              </T>
              <At x={573.8} y={pY + 12.5} w={241} h={7} className="gbar">
                <span style={{ width: `${pct}%` }} />
              </At>
            </Layer>
          )
        })}

        <Layer x={269} y={548.6} w={273} h={418.4} sq={[24, 1]} className="st-out" data-pi>
          <T x={285} b={584} s={16} w={500} c="var(--ink)">
            Weight Data
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 243, top: 15 }} />
          {[
            ['Current Weight', '72', 'kg', 631],
            ['Weight Goal', '65', 'kg', 673],
            ['Progress', '18', '%', 715],
          ].map(([k, v, u, b]) => (
            <div key={k}>
              <T x={285} b={b} s={12.5} c="var(--ink2)">
                {k}
              </T>
              <T r={526} b={b + 3} s={24} w={500} c="var(--ink)">
                {v}
                <span className="st-u2"> {u}</span>
              </T>
            </div>
          ))}
          <At x={285} y={747.5} w={241} h={1} className="hline soft" />
          <svg className="chart" viewBox="269 548.6 273 418.4">
            <defs>
              <linearGradient id="wt-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#CEE9FF" stopOpacity="0.7" />
                <stop offset="1" stopColor="#CEE9FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${wline}L526 945L287 945Z`} fill="url(#wt-fill)" />
            <path d={wline} className="wt-line" pathLength="1" data-s="wt-line" />
            {WEIGHT.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={i < 3 ? 4 : 0} className="wt-dot" />
            ))}
          </svg>
          {WEIGHT.filter((p) => p[2]).map((p) => (
            <T key={p[0]} x={p[0] - 6} b={p[1] - 7} s={11} c="var(--ink2)">
              {p[2]}
            </T>
          ))}
          {['Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => (
            <T key={m} cx={300 + i * 54} b={958} s={11} c="var(--gray)">
              {m}
            </T>
          ))}
        </Layer>

        <Layer x={847.5} y={548.6} w={560.5} h={418.4} sq={[24, 1]} className="st-out" data-pi>
          <T x={863} b={584} s={16} w={500} c="var(--ink)">
            Calories Statistic
          </T>
          <Icon name="dots" size={22} sw={1.5} style={{ left: 1371 - 847.5, top: 15 }} />
          <At x={863} y={610} w={10} h={10} className="lg-sq blue" />
          <T x={879.2} b={619.6} s={12} c="var(--ink2)">
            Active Calories
          </T>
          <At x={975} y={610} w={10} h={10} className="lg-sq gray" />
          <T x={991.2} b={619.6} s={12} c="var(--ink2)">
            Resting Calories
          </T>
          {[2000, 1500, 1000, 500, 0].map((v, i) => (
            <div key={v}>
              <T x={863} b={649.8 + i * 44.6} s={11.5} c="var(--ink2)">
                {v}
              </T>
              <At x={896} y={645.8 + i * 44.6} w={496} h={1} className="hline soft" />
            </div>
          ))}
          {CS.map(([a, r], i) => {
            const x = CS_X[i]
            const on = i === cs
            const ha = a * CS_K
            const ht = (a + r) * CS_K
            return (
              <At as="button" key={i} x={x - 36} y={640.7} w={72} h={212.3} className={`cs-col ${on ? 'is-on' : ''}`} onMouseEnter={() => setCs(i)} onClick={() => setCs(i)}>
                <span className="cs-total" style={{ top: CS_BASE - ht - 640.7, height: ht }} />
                <span className="cs-act" style={{ top: CS_BASE - ha - 640.7, height: ha }} data-s="cs-act" />
              </At>
            )
          })}
          {WEEK.map((w, i) => (
            <T key={w} cx={CS_X[i]} b={848} s={12} c={i === cs ? 'var(--ink)' : 'var(--gray)'}>
              {w}
            </T>
          ))}
          <At x={Math.min(CS_X[cs] + 0.7, 1392 - 151.3)} y={611} w={151.3} h={74.4} sq={[12, 1]} className="cs-tip">
            <span className="ct-d">{DATES[cs]}</span>
            <span className="ct-r" style={{ top: 34 }}>
              <i className="b" />
              Active <b>{fmt(CS[cs][0])} Cal</b>
            </span>
            <span className="ct-r" style={{ top: 52 }}>
              <i className="w" />
              Resting <b>{CS[cs][1]} Cal</b>
            </span>
          </At>
        </Layer>
      </Card>
    </>
  )
}
