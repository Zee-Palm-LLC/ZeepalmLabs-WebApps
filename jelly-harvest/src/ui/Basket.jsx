import { ITEMS, GROUPS } from '../farm/farmdata.js'

const GOALS = [
  ['protein', 'Protein', (t) => (t.protein / 50) * 100, (t) => `${t.protein.toFixed(1)} g`],
  ['fibre', 'Fibre', (t) => (t.fibre / 28) * 100, (t) => `${t.fibre.toFixed(1)} g`],
  ['ca', 'Calcium', (t) => t.ca, (t) => `${Math.round(t.ca)}%`],
  ['va', 'Vitamin A', (t) => t.va, (t) => `${Math.round(t.va)}%`],
  ['vc', 'Vitamin C', (t) => t.vc, (t) => `${Math.round(t.vc)}%`],
  ['vd', 'Vitamin D', (t) => t.vd, (t) => `${Math.round(t.vd)}%`],
]

function Ring({ pct, label, value }) {
  const r = 17
  const c = 2 * Math.PI * r
  const k = Math.min(100, pct) / 100
  return (
    <div className={`ring${pct >= 100 ? ' is-full' : ''}`}>
      <svg viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} className="ring__bg" />
        <circle cx="22" cy="22" r={r} className="ring__fg" strokeDasharray={`${c * k} ${c}`} transform="rotate(-90 22 22)" opacity={k > 0 ? 1 : 0} />
      </svg>
      <b>{Math.round(Math.min(999, pct))}%</b>
      <span>{label}</span>
      <small>{value}</small>
    </div>
  )
}

function tip(t, groups, n) {
  if (!n) return 'Squish an animal or pick a crop to start filling your basket.'
  const missing = Object.keys(GROUPS).filter((g) => !groups.has(g))
  if (missing.includes('veg')) return 'Add some veg: pumpkin is packed with vitamin A, and mushrooms bring vitamin D.'
  if (missing.includes('fruit')) return 'Fruit time. One cup of strawberries covers a whole day of vitamin C.'
  if (missing.includes('protein')) return 'Visit the hens. An egg is a complete protein.'
  if (missing.includes('dairy')) return 'Squish a cow or a sheep for calcium-rich milk or yogurt.'
  if (missing.includes('grains')) return 'Pick some sweet corn from the corn rows for whole-grain energy.'
  if (t.fibre < 14) return 'Every group covered! Top up your fibre with apples or corn.'
  return 'A beautifully balanced basket. Every food group, plenty of fibre. The farm approves.'
}

export default function Basket({ basket, onClear, refEl }) {
  const t = { kcal: 0, protein: 0, fibre: 0, sugar: 0, ca: 0, va: 0, vc: 0, vd: 0 }
  const groups = new Set()
  let n = 0
  for (const [k, cnt] of Object.entries(basket)) {
    const it = ITEMS[k]
    if (!it) continue
    groups.add(it.group)
    n += cnt
    for (const key of Object.keys(t)) t[key] += it[key] * cnt
  }
  const entries = Object.entries(basket).filter(([k]) => ITEMS[k])
  const cover = GOALS.reduce((a, g) => a + Math.min(100, g[2](t)), 0) / GOALS.length
  const score = Math.round(groups.size * 10 + cover * 0.5)
  return (
    <section className="sec basket" ref={refEl}>
      <h3>
        Harvest basket
        {entries.length > 0 && (
          <button className="link" onClick={onClear}>
            Start over
          </button>
        )}
      </h3>
      <div className="basket__items">
        {entries.length === 0 && <span className="muted">Empty for now 🧺</span>}
        {entries.map(([k, cnt]) => (
          <span key={k} className="chip" title={ITEMS[k].note}>
            <span>{ITEMS[k].emoji}</span>
            {ITEMS[k].name}
            <b>×{cnt}</b>
          </span>
        ))}
      </div>

      <div className="groups">
        <p className="groups__head">
          <span>Food groups</span>
          <b>{groups.size}/5</b>
        </p>
        <div className="groups__row">
          {Object.entries(GROUPS).map(([k, g]) => (
            <span key={k} className={`grp${groups.has(k) ? ' is-on' : ''}`}>
              <i>{g.emoji}</i>
              {g.name}
            </span>
          ))}
        </div>
      </div>

      <div className="goals">
        <p className="groups__head">
          <span>Daily goals</span>
          <b>Balance score {Math.min(100, score)}</b>
        </p>
        <div className="rings">
          {GOALS.map(([k, label, pct, val]) => (
            <Ring key={k} pct={pct(t)} label={label} value={val(t)} />
          ))}
        </div>
        <p className="totals">
          <span>
            <b>{Math.round(t.kcal)}</b> kcal
          </span>
          <span>
            <b>{t.sugar.toFixed(1)} g</b> natural sugars
          </span>
        </p>
      </div>
      <p className="tip">{tip(t, groups, n)}</p>
    </section>
  )
}
