import { GROUPS } from '../data/foods.js'
import { grade, hue, verdict } from '../lib/score.js'
import { useTween } from '../lib/hooks.js'

const ORDER = ['veg', 'fruit', 'protein', 'grain', 'dairy', 'treat']

export function Dial({ value, size = 132 }) {
  const v = useTween(value, 900)
  const r = 54
  const c = 2 * Math.PI * r
  const arc = c * 0.75
  const h = hue(v)
  return (
    <div className="dial" style={{ width: size, height: size, '--h': h }}>
      <svg viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} className="dial__track" strokeDasharray={`${arc} ${c}`} transform="rotate(135 66 66)" />
        <circle
          cx="66"
          cy="66"
          r={r}
          className="dial__val"
          strokeDasharray={`${(arc * v) / 100} ${c}`}
          transform="rotate(135 66 66)"
        />
      </svg>
      <div className="dial__num">
        <b>{Math.round(v)}</b>
        <span>/ 100</span>
      </div>
    </div>
  )
}

function Bar({ label, v, max }) {
  const w = useTween(v, 700)
  return (
    <p className="sub">
      <span>{label}</span>
      <i>
        <em style={{ width: `${(w / max) * 100}%` }} />
      </i>
      <b>
        {Math.round(w)}
        <small>/{max}</small>
      </b>
    </p>
  )
}

export default function Score({ result, goal }) {
  const s = result.total
  const share = result.t.share
  return (
    <section className="card score">
      <header className="card__head">
        <span>Plate score</span>
        <span className="score__goal">{goal.name}</span>
      </header>
      <div className="score__top">
        <Dial value={s} size={112} />
        <div className="score__grade" style={{ '--h': hue(s) }}>
          <b key={grade(s)}>{result.empty ? '–' : grade(s)}</b>
          <span>{result.empty ? 'Empty plate' : verdict(s)}</span>
        </div>
      </div>
      <Bar label="Balance" v={result.parts.balance} max={40} />
      <Bar label="Nutrition" v={result.parts.nutrition} max={35} />
      <Bar label="Variety" v={result.parts.variety} max={15} />
      <Bar label="Drink" v={result.parts.drink} max={10} />
      <div className="mix">
        <p className="mix__lbl">
          <span>Your plate</span>
        </p>
        <div className="mix__bar">
          {ORDER.map((g) => (
            <i key={g} style={{ flexGrow: result.empty ? 0 : share[g] || 0, background: GROUPS[g].color }} title={GROUPS[g].label} />
          ))}
          {result.empty && <i className="mix__empty" />}
        </div>
        <div className="mix__bar mix__bar--ideal">
          {ORDER.map((g) => (
            <i key={g} style={{ flexGrow: goal.ideal[g] || 0, background: GROUPS[g].color }} />
          ))}
        </div>
        <p className="mix__lbl">
          <span>Ideal</span>
          <span className="mix__keys">
            {ORDER.slice(0, 4).map((g) => (
              <span key={g}>
                <i style={{ background: GROUPS[g].color }} />
                {GROUPS[g].short}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  )
}
