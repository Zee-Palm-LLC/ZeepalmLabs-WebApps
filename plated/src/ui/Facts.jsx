import { useTween } from '../lib/hooks.js'

const DV = { f: 78, c: 275, fi: 28, p: 50 }

function N({ v, d = 0 }) {
  const t = useTween(v, 700)
  return <>{t.toFixed(d)}</>
}

function Row({ label, v, unit = 'g', dv, sub, flag }) {
  return (
    <p className={`facts__row${sub ? ' is-sub' : ''}${flag ? ` is-${flag}` : ''}`}>
      <span>
        {sub ? label : <b>{label}</b>} <N v={v} />
        {unit}
      </span>
      {dv ? (
        <b>
          <N v={(v / dv) * 100} />%
        </b>
      ) : (
        <b />
      )}
    </p>
  )
}

export default function Facts({ result, goal, plate }) {
  const t = result.t
  const n = plate.items.length + plate.side.length + (plate.drink ? 1 : 0)
  const kcalFlag = result.empty ? null : t.kcal > goal.kcal[1] ? 'bad' : t.kcal >= goal.kcal[0] ? 'good' : null
  return (
    <section className="facts" aria-label="Nutrition facts">
      <h3>Nutrition Facts</h3>
      <p className="facts__serv">
        {n} {n === 1 ? 'item' : 'items'} <span>1 plate</span>
      </p>
      <div className="facts__rule facts__rule--xl" />
      <p className="facts__aps">Amount per plate</p>
      <p className={`facts__cal${kcalFlag ? ` is-${kcalFlag}` : ''}`}>
        <b>Calories</b>
        <b className="facts__kcal">
          <N v={t.kcal} />
        </b>
      </p>
      <div className="facts__rule facts__rule--l" />
      <p className="facts__dv">% Daily Value*</p>
      <Row label="Total Fat" v={t.f} dv={DV.f} />
      <Row label="Total Carbohydrate" v={t.c} dv={DV.c} flag={goal.carbs != null && t.c > goal.carbs ? 'bad' : null} />
      <Row label="Dietary Fiber" v={t.fi} dv={DV.fi} sub flag={t.fi >= 10 ? 'good' : null} />
      <Row label="Total Sugars" v={t.su} sub flag={t.su > 35 ? 'bad' : null} />
      <Row label="Protein" v={t.p} dv={DV.p} flag={t.p >= goal.protein ? 'good' : null} />
      <div className="facts__rule facts__rule--xl" />
      <p className="facts__foot">
        * Target for {goal.name.toLowerCase()}: {goal.kcal[0]}–{goal.kcal[1]} kcal, {goal.protein} g+ protein
        {goal.carbs != null ? `, under ${goal.carbs} g carbs` : ''}
        {goal.carbMin != null ? `, ${goal.carbMin} g+ carbs` : ''}.
      </p>
    </section>
  )
}
