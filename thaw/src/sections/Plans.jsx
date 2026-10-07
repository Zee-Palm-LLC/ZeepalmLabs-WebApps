import { useState } from 'react'
import { scrollToId } from '../lib/smooth.js'
import './plans.css'

const PLANS = [
  {
    name: 'Check-in',
    tag: 'Start here',
    price: [0, 0],
    blurb: 'Daily check-ins and a weekly map of your inner weather.',
    items: ['60-second daily check-ins', 'Weekly mood & sleep map', '3 guided sessions a month', 'Crisis resources, always'],
  },
  {
    name: 'Thaw',
    tag: 'Most chosen',
    price: [12, 9],
    blurb: 'The full companion: unlimited sessions and cold-spot insights.',
    items: ['Everything in Check-in', 'Unlimited guided sessions', 'AI cold-spot insights', 'Sleep & stress tracking', 'Journal prompts that adapt'],
    hot: true,
  },
  {
    name: 'Care',
    tag: 'With a therapist',
    price: [49, 39],
    blurb: 'THAW between sessions, plus a licensed therapist every month.',
    items: ['Everything in Thaw', 'Monthly 50-min video session', 'Shared progress reports', 'Priority human support'],
  },
]

function Odometer({ value, width }) {
  const digits = String(value).padStart(width, '0').split('')
  return (
    <span className="odo" aria-label={`$${value}`}>
      {digits.map((d, i) => (
        <span className="odo-col" key={i} style={{ '--d': Number(d) }}>
          <span className="odo-strip" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function Plans() {
  const [yearly, setYearly] = useState(false)
  return (
    <section className="sec plans" id="plans">
      <div className="wrap">
        <div className="eyebrow">
          <span>
            {'// 05 — '}
            <b>Plans</b>
          </span>
          <span>Cancel anytime</span>
        </div>
        <div className="plans-head">
          <h2 className="display plans-title">Choose how much warmth you need.</h2>
          <div className="toggle mono-s" role="group" aria-label="Billing period">
            <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>
              Monthly
            </button>
            <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>
              Yearly <em>−25%</em>
            </button>
            <span className="toggle-knob" style={{ transform: `translateX(${yearly ? 100 : 0}%)` }} />
          </div>
        </div>
        <div className="plan-grid">
          {PLANS.map((p) => (
            <article className={`plan pane ${p.hot ? 'hot' : ''}`} key={p.name}>
              <header className="mono-s plan-top">
                <span>{p.name}</span>
                <span className="plan-tag">{p.tag}</span>
              </header>
              <div className="plan-price display">
                <i>$</i>
                <Odometer value={p.price[yearly ? 1 : 0]} width={String(Math.max(...p.price)).length} />
                <span className="mono-s dim plan-per">/ month{yearly && p.price[0] ? ', billed yearly' : ''}</span>
              </div>
              <p className="plan-blurb">{p.blurb}</p>
              <ul>
                {p.items.map((it) => (
                  <li key={it}>
                    <span className="plan-dot" />
                    {it}
                  </li>
                ))}
              </ul>
              <button className={`btn ${p.hot ? '' : 'ghost'} plan-btn`} onClick={() => scrollToId('begin')}>
                {p.price[0] ? `Start ${p.name}` : 'Start free'}
                <span className="btn-sq">
                  <svg viewBox="0 0 14.4 9.4" aria-hidden="true">
                    <path d="M1.1 0.9V4.7H13.1M9.5 1.1L13.1 4.7L9.5 8.3" />
                  </svg>
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
