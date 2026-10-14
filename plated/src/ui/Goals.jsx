import { GOALS } from '../data/goals.js'
import { em } from '../lib/hooks.js'

export default function Goals({ goalId, setGoal }) {
  return (
    <section className="card goals">
      <header className="card__head">
        <span>Your goal</span>
        <span>Changes the scoring</span>
      </header>
      <div className="goals__list">
        {GOALS.map((g) => (
          <button key={g.id} className={`goal${goalId === g.id ? ' is-on' : ''}`} onClick={() => setGoal(g.id)}>
            <img src={em(g.em)} alt="" />
            <span>
              <b>{g.name}</b>
              <small>{g.blurb}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
