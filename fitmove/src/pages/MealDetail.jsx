import { useState } from 'react'
import { Card, T, At } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { DETAILS } from './mealDetails.js'

export const H = 1247

const INFO_X = [665, 809, 953]
const INFO_Y = [345.5, 393.5]
const MACRO_X = [1157.5, 1224, 1290.5, 1356.5]

export default function MealDetail({ param }) {
  const d = DETAILS[param] || DETAILS['power-protein']
  const reviews = d.reviews || DETAILS['power-protein'].reviews
  const [servings, setServings] = useState(1)
  const [openIng, setOpenIng] = useState(true)
  const [openNut, setOpenNut] = useState(true)
  const [done, setDone] = useState({})
  return (
    <>
      <PageTitle title="Detail Menu" back={{ label: 'Back to List Menu', to: '/meal-plan' }} />
      <UserPill />

      <Card x={252.9} y={83.8} w={875.1} h={379.5} className="dm-hero">
        <At x={268.5} y={99} w={381} h={347.5} clip={[18, 1]} className="dm-photo" data-s="dm-photo">
          <img src={d.img} alt={d.title.join(' ')} draggable="false" />
        </At>
        <At x={665.5} y={99.5} w={78.5} h={27.5} className="tagpill lg tone-l-blue">
          {d.tag}
        </At>
        <Icon name="starfill" size={15} style={{ left: 980 - 252.9, top: 105.5 - 83.8 }} />
        <T r={1111.5} b={119} s={12.5} c="var(--ink2)">
          {d.rating}
        </T>
        <T x={665.5} b={169} s={22.3} w={500} lh={25.5} c="var(--ink)">
          {d.title[0]}
          <br />
          {d.title[1]}
        </T>
        <T x={665} b={234} s={14} lh={20} c="var(--ink2)" className="dm-about">
          {d.about.map((l, i) => (
            <span key={i}>
              {l}
              <br />
            </span>
          ))}
        </T>
        {d.info.map(([ic, k, v], i) => {
          const x = INFO_X[i % 3]
          const y = INFO_Y[Math.floor(i / 3)]
          return (
            <div key={k}>
              <At x={x} y={y} w={32.5} h={32.5} className="info-circle">
                {ic === 'level' ? <Glyph n="level" cx={x + 16.25} cy={y + 16.25} k={1.15} ox={x} oy={y} /> : <Icon name={ic} size={16} sw={1.6} style={{ left: 8.25, top: 8.25 }} />}
              </At>
              <T x={x + 42.5} b={y + 12} s={11} c="var(--gray)">
                {k}
              </T>
              <T x={x + 42.5} b={y + 30} s={14.5} w={500} c="var(--ink)">
                {v}
              </T>
            </div>
          )
        })}
      </Card>

      <Card x={1143.2} y={83.8} w={280.9} h={99} r={20} className="dm-macros fill-blue">
        {d.macros.map(([k, v, u], i) => (
          <div key={k}>
            <T cx={MACRO_X[i] + 27.25} b={109} s={11.5} w={500} c="var(--ink)">
              {k}
            </T>
            <At x={MACRO_X[i]} y={119.5} w={54.5} h={48} sq={[14, 1]} className="macro-chip">
              <span className="mc-v">{Math.round(v * servings)}</span>
              <span className="mc-u">{u}</span>
            </At>
          </div>
        ))}
      </Card>

      <Card x={1143.2} y={197.8} w={280.9} h={299} r={24} className="dm-ing">
        <At x={1159.5} y={214.5} w={32.5} h={32.5} className="info-circle">
          <Glyph n="bowl" cx={1159.5 + 16.25} cy={214.5 + 16.25} k={0.8} ox={1159.5} oy={214.5} />
        </At>
        <T x={1199.5} b={228.5} s={12} lh={16} c="var(--gray)">
          Total
          <br />
          Servings
        </T>
        <At x={1307} y={217} w={98.5} h={27} className="stepper">
          <span className="st-n">{servings}</span>
          <span className="st-btns">
            <button aria-label="Fewer servings" onClick={() => setServings((v) => Math.max(1, v - 1))}>
              <Icon name="minus" size={14} sw={1.8} />
            </button>
            <button aria-label="More servings" onClick={() => setServings((v) => Math.min(8, v + 1))}>
              <Icon name="plus" size={14} sw={1.8} />
            </button>
          </span>
        </At>
        <At x={1159.5} y={263.5} w={249.5} h={1} className="hline" />
        <T x={1160.5} b={304.5} s={16} w={500} c="var(--ink)">
          Ingredients
        </T>
        <At as="button" x={1379.5} y={280} w={29.5} h={29.5} className={`fold-btn ${openIng ? '' : 'is-closed'}`} onClick={() => setOpenIng((v) => !v)} aria-label="Toggle ingredients">
          <Icon name="up" size={14} sw={1.7} />
        </At>
        <div className={`fold ${openIng ? '' : 'is-closed'}`}>
          {d.ingredients.map((t, i) => (
            <div key={t} className="ing-row">
              <At x={1159.5} y={326 + i * 32.1} w={22} h={22} className="bullet" />
              <T x={1190} b={345 + i * 32.1} s={14} c="var(--ink2)">
                {servings > 1 ? scale(t, servings) : t}
              </T>
            </div>
          ))}
        </div>
      </Card>

      <Card x={252.9} y={478.8} w={875.1} h={475} className="dm-dir">
        <T x={269.5} b={516} s={16} w={500} c="var(--ink)">
          Directions
        </T>
        {d.steps.map(([title, lines], i) => {
          const y = 540 + i * 82.3
          return (
            <div key={title} className={`step ${done[i] ? 'is-done' : ''}`}>
              {i < d.steps.length - 1 ? <At x={286.2} y={y + 40} w={1.5} h={38} className="step-line" /> : null}
              <At as="button" x={268.5} y={y} w={36.5} h={36.5} className="step-n" onClick={() => setDone((s) => ({ ...s, [i]: !s[i] }))} aria-label={`Mark step ${i + 1} done`}>
                {done[i] ? <Icon name="tick" size={16} sw={2} style={{ left: 10.25, top: 10.25 }} /> : <span>{i + 1}</span>}
              </At>
              <T x={317} b={y + 18.5} s={14.5} w={500} c="var(--ink)">
                {title}
              </T>
              <T x={317} b={y + 44} s={14} lh={20} c="var(--ink2)">
                {lines[0]}
                <br />
                {lines[1]}
              </T>
            </div>
          )
        })}
        <At x={846} y={500} w={1} h={433} className="vline" />
        <T x={863} b={516} s={16} w={500} c="var(--ink)">
          Tools and Equipments
        </T>
        {d.tools.map((t, i) => (
          <div key={t}>
            <At x={863.5} y={536 + i * 32.2} w={22} h={22} className="bullet" />
            <T x={894} b={553 + i * 32.2} s={14} c="var(--ink2)">
              {t}
            </T>
          </div>
        ))}
        <At x={863.5} y={710} w={248} h={1} className="hline" />
        <T x={864} b={748} s={16} w={500} c="var(--ink)">
          Notes
        </T>
        {d.notes.map((lines, i) => {
          const y = i === 0 ? 768.5 : 768.5 + 91
          return (
            <div key={i}>
              <At x={863.5} y={y} w={22} h={22} className="bullet" />
              <T x={894} b={y + 16.5} s={14} lh={20} c="var(--ink2)">
                {lines.map((l, k) => (
                  <span key={k}>
                    {l}
                    <br />
                  </span>
                ))}
              </T>
            </div>
          )
        })}
      </Card>

      <Card x={1143.2} y={512.8} w={280.9} h={683.5} r={24} className="dm-nut">
        <T x={1160.5} b={550} s={16} w={500} c="var(--ink)">
          Nutrition Facts
        </T>
        <At as="button" x={1379.5} y={528.5} w={29.5} h={29.5} className={`fold-btn ${openNut ? '' : 'is-closed'}`} onClick={() => setOpenNut((v) => !v)} aria-label="Toggle nutrition facts">
          <Icon name="up" size={14} sw={1.7} />
        </At>
        <T r={1409} b={587} s={10.5} c="var(--gray)">
          Per Serving
        </T>
        <T x={1159.5} b={603.8} s={16} w={600} c="var(--ink)">
          Calories
        </T>
        <T r={1408.5} b={603.8} s={16} w={600} c="var(--ink)">
          {d.macros[0][1] * servings}
        </T>
        <div className={`fold ${openNut ? '' : 'is-closed'}`}>
          {d.nutrition.map(([k, v, bold], i) => (
            <div key={k}>
              <At x={1159.5} y={618.5 + i * 40.05} w={249.5} h={1} className="hline" />
              <T x={bold ? 1159.5 : 1180.5} b={644 + i * 40.05} s={14} w={bold ? 600 : 400} c={bold ? 'var(--ink)' : 'var(--ink2)'}>
                {k}
              </T>
              <T r={1408.5} b={644 + i * 40.05} s={14} w={600} c="var(--ink)">
                {v}
              </T>
            </div>
          ))}
        </div>
      </Card>

      <T x={253.3} b={990.5} s={16} w={500} c="var(--ink)" data-pi>
        Reviews
      </T>
      {reviews.map(([name, rate, img, lines], i) => {
        const x = 252.9 + i * 296.9
        return (
          <Card key={name} x={x} y={1015.3} w={281.3} h={181} r={24} className="review">
            <At x={x + 15.6} y={1031} w={36.5} h={36.5} className="rv-avatar">
              <img src={img} alt="" draggable="false" />
            </At>
            <T x={x + 65.1} b={1044.5} s={14.5} w={500} c="var(--ink)">
              {name}
            </T>
            <Icon name="starfill" size={13} style={{ left: 64.5, top: 1053 - 1015.3 }} />
            <T x={x + 83.1} b={1065.5} s={12} c="var(--ink2)">
              {rate}
            </T>
            <At x={x + 15.6} y={1082.5} w={249} h={1} className="hline" />
            <T x={x + 15.6} b={1117.5} s={14} lh={20.1} c="var(--ink2)">
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

function scale(text, k) {
  return text.replace(/^(\d+)(\/\d+)?/, (m, a, b) => (b ? `${(Number(a) / Number(b.slice(1))) * k}` : `${Number(a) * k}`))
}
