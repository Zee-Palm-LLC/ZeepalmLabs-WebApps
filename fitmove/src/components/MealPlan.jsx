import { Card, T, At } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { MEALS } from '../data.js'
import { useUi, setUi } from '../store.js'

const CARD_Y = [666.1, 861.8, 1057.9]

export default function MealPlan() {
  const menu = useUi((s) => s.menu)
  const liked = useUi((s) => s.liked)
  return (
    <>
      <T x={807.0} b={641.3} s={16} w={500} c="var(--ink)" className="section-title" data-s="section">
        Meal Plan
      </T>
      <button
        className="dots-btn"
        style={{ left: 1041.3, top: 622.8 }}
        aria-label="Meal plan options"
        onClick={() => setUi({ menu: menu === 'meals' ? null : 'meals' })}
        data-s="section"
      >
        <Icon name="dots" size={24} sw={1.5} />
      </button>
      {menu === 'meals' ? (
        <div className="pop meals-pop" style={{ left: 1068 - 170, top: 652 }}>
          {['Swap breakfast', 'Generate shopping list', 'Adjust calories'].map((l) => (
            <button key={l} className="pop-row" onClick={() => setUi({ menu: null })}>
              <span className="pop-label">{l}</span>
            </button>
          ))}
        </div>
      ) : null}
      {MEALS.map((m, i) => {
        const y = CARD_Y[i]
        return (
          <Card
            key={m.id}
            x={806.6}
            y={y}
            r={20.5}
            w={261.5}
            h={i === 2 ? 181 : 180.2}
            className={`meal meal-${m.tone} ${liked[m.id] ? 'is-liked' : ''}`}
            data-s="meal"
            onDoubleClick={() => setUi({ liked: { ...liked, [m.id]: !liked[m.id] } })}
          >
            <At x={823.1} y={y + 15.8} w={84.2} h={84.1} clip={[16, 1]} className="meal-photo" data-s="meal-photo">
              <img src={m.img} alt={m.title} draggable="false" />
            </At>
            <At x={919.1} y={y + 19.8} w={null} h={16} className="meal-tag" data-s="meal-tag">
              {m.tag}
            </At>
            <T x={919.0} b={y + 53.3} s={12} w={500} c="var(--ink)" data-s="meal-title">
              {m.title}
            </T>
            <Glyph n="level" dy={y - 666.1} className="meal-ico" />
            <T x={935.1} b={y + 73.6} s={11} c="var(--ink2)" data-s="meal-meta">
              {m.level}
            </T>
            <Glyph n="flamesm" dy={y - 666.1} className="meal-ico" />
            <T x={934.9} b={y + 93.6} s={11} c="var(--ink2)" data-s="meal-meta">
              {m.cal}
            </T>
            <At x={822.7} y={y + 115.5} w={230} h={1.2} className="meal-rule" data-s="meal-rule" />
            <T x={823.0} b={y + 142.4} s={11} lh={17.6} c="var(--ink2)" className="meal-desc" data-s="meal-desc">
              {m.desc[0]}
              <br />
              {m.desc[1]}
            </T>
            <span className="meal-like" aria-hidden="true">♥</span>
          </Card>
        )
      })}
    </>
  )
}
