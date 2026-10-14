import { em } from '../lib/hooks.js'
import { ROUND, rank } from '../data/orders.js'

export function Stars({ n, size = 22 }) {
  return (
    <span className="stars" style={{ '--s': `${size}px` }}>
      {[0, 1, 2].map((i) => (
        <img key={i} src={em('star')} alt="" className={i < n ? 'is-on' : ''} style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  )
}

export function Ticket({ order, idx, total, time, checks, onServe, compact }) {
  const low = time <= 10
  return (
    <section className={`ticket${compact ? ' ticket--compact' : ''}`} key={order.id}>
      <div className="ticket__pin" />
      <header className="ticket__head">
        <span>
          Order {idx + 1} of {total}
        </span>
        <span className={`ticket__time${low ? ' is-low' : ''}`}>
          <img src={em('timer')} alt="" />
          {Math.ceil(time)}s
        </span>
      </header>
      <div className="ticket__bar">
        <i style={{ transform: `scaleX(${time / ROUND})` }} className={low ? 'is-low' : ''} />
      </div>
      <div className="ticket__who">
        <img src={em(order.em)} alt="" />
        <span>
          <b>{order.name}</b>
          <q>{order.quote}</q>
        </span>
      </div>
      <ul className="ticket__rules">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'is-ok' : ''}>
            <i />
            {c.label}
          </li>
        ))}
      </ul>
      <button className="serve" onClick={onServe}>
        <img src={em('bell')} alt="" />
        Ring to serve
        <kbd>Enter</kbd>
      </button>
    </section>
  )
}

export function Intro({ onStart, onCancel }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Lunch rush">
      <div className="modal__card intro">
        <img className="intro__bell" src={em('bell')} alt="" />
        <p className="eyebrow">Game mode</p>
        <h2>Lunch Rush</h2>
        <p className="intro__lede">
          Five hungry customers. Forty-five seconds each. Read the ticket, build the plate, ring the bell.
        </p>
        <ul className="intro__how">
          <li>
            <b>3 stars</b> Every request met, plate score 70+
          </li>
          <li>
            <b>2 stars</b> Every request met
          </li>
          <li>
            <b>1 star</b> Two of three requests
          </li>
        </ul>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel}>
            Back to free plate
          </button>
          <button className="btn btn--hot" onClick={onStart} autoFocus>
            Open the kitchen
          </button>
        </div>
      </div>
    </div>
  )
}

export function Summary({ results, onAgain, onFree, onShare }) {
  const stars = results.reduce((a, r) => a + r.stars, 0)
  const [title, mood] = rank(stars)
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Rush results">
      <div className="modal__card summary">
        <img className="summary__mood" src={em(mood)} alt="" />
        <p className="eyebrow">Kitchen closed</p>
        <h2>{title}</h2>
        <p className="summary__total">
          <img src={em('star')} alt="" />
          <b>{stars}</b> / {results.length * 3} stars
        </p>
        <ol className="summary__list">
          {results.map((r) => (
            <li key={r.order.id}>
              <img src={em(r.order.em)} alt="" />
              <span>
                <b>{r.order.name}</b>
                <small>
                  {r.met}/3 requests · score {r.score}
                </small>
              </span>
              <Stars n={r.stars} size={18} />
            </li>
          ))}
        </ol>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onFree}>
            Free plate
          </button>
          <button className="btn btn--ghost" onClick={onShare}>
            Share result
          </button>
          <button className="btn btn--hot" onClick={onAgain} autoFocus>
            Play again
          </button>
        </div>
      </div>
    </div>
  )
}

export function Stamp({ result }) {
  return (
    <div className="stamp" aria-live="assertive">
      <Stars n={result.stars} size={54} />
      <b>{['Sent back', 'Served', 'Great plate', 'Perfect order'][result.stars]}</b>
    </div>
  )
}
