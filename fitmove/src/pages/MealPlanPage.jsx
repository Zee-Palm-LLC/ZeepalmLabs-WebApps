import { useMemo, useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { goto } from '../nav.js'
import { useUi, setUi } from '../store.js'

export const H = 1027

export const MENU = [
  { id: 'lean-and-green', tag: 'Dinner', title: 'Lean & Green', desc: 'Baked Salmon with Steamed Broccoli and Brown Rice', level: 'Easy', mins: '30 minutes', cal: 450, carbs: 40, protein: 35, fats: 15, score: 85, img: '/img/mp-lean.jpg' },
  { id: 'power-protein', tag: 'Breakfast', title: 'Power Protein', desc: 'Scrambled Eggs with Turkey Bacon and Sautéed Spinach', level: 'Medium', mins: '15 minutes', cal: 350, carbs: 10, protein: 25, fats: 20, score: 90, img: '/img/mp-power.jpg', wrap: true },
  { id: 'vegan-energy-boost', tag: 'Lunch', title: 'Vegan Energy Boost', desc: 'Chickpea and Avocado Salad with Lemon Tahini Dressing', level: 'Medium', mins: '20 minutes', cal: 400, carbs: 45, protein: 15, fats: 18, score: 80, img: '/img/mp-vegan.jpg' },
  { id: 'mediterranean-delight', tag: 'Dinner', title: 'Mediterranean Delight', desc: 'Grilled Chicken with Quinoa Tabbouleh and Hummus', level: 'Medium', mins: '35 minutes', cal: 500, carbs: 50, protein: 35, fats: 18, score: 85, img: '/img/mp-med.jpg' },
]

const TAG_TONE = { Breakfast: 'blue', Lunch: 'yellow', Dinner: 'green', Snack: 'yellow' }
const TABS = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner']
const TAB_X = [8, 66, 145, 196, 247]
const TAB_W = [50, 78, 50, 50, 56]
const ROW_Y = 208.8
const ROW_STEP = 180.6

const POPULAR = [
  { title: ['Grilled Steak with Sweet', 'Potato Fries'], rate: '4.9/5', tag: 'Dinner', img: '/img/mp-steak.jpg' },
  { title: ['Quinoa and Black Bean', 'Stuffed Peppers'], rate: '4.7/5', tag: 'Lunch', img: '/img/mp-quinoa.jpg' },
  { title: ['Avocado Toast with Poached', 'Eggs'], rate: '4.9/5', tag: 'Breakfast', img: '/img/mp-avocado.jpg' },
]
const RECOMMENDED = [
  { title: ['Overnight Oats with Almond', 'Butter and Banana'], tag: 'Lunch', level: 'Easy', macros: ['400 Cal', '50g Carbs', '12g Protein', '16g Fats'], img: '/img/mp-oats.jpg' },
  { title: ['Grilled Chicken and Veggie', 'Skewers'], tag: 'Breakfast', level: 'Medium', macros: ['450 Cal', '30g Carbs', '40g Protein', '15g Fats'], img: '/img/mp-skewers.jpg' },
]

function ScoreBar({ x, y, score }) {
  const filled = Math.round(score / 5)
  return (
    <At x={x} y={y} w={232} h={13.5} className="score-bar">
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} className={i < filled ? 'on' : ''} style={{ left: i * 11.55, transitionDelay: `${i * 18}ms` }} />
      ))}
    </At>
  )
}

function MenuRow({ m, i, added, onAdd }) {
  const y = ROW_Y + i * ROW_STEP
  return (
    <Layer x={269.5} y={y} w={746} h={163.5} sq={[20, 1]} className="menu-row" data-pi onClick={() => goto(`/meal-plan/${m.id}`)}>
      <At x={285.5} y={y + 15.7} w={153} h={132.5} clip={[14, 1]} className="menu-photo">
        <img src={m.img} alt={m.title} draggable="false" />
      </At>
      <At x={458} y={y + 15.8} w={null} h={22.5} className={`tagpill tone-l-${TAG_TONE[m.tag]}`}>
        {m.tag}
      </At>
      <At x={711} y={y + 16.2} w={54} h={21.5} className="metapill">
        <Glyph n="level" cx={724.2} cy={y + 27} k={0.95} ox={711} oy={y + 16.2} />
        <span style={{ left: 22.5 }}>{m.level}</span>
      </At>
      <At x={776.5} y={y + 16.2} w={86} h={21.5} className="metapill">
        <Icon name="clock" size={12} sw={1.6} style={{ left: 7, top: 4.7 }} />
        <span style={{ left: 23.5 }}>{m.mins}</span>
      </At>
      <T x={458.8} b={y + 68.6} s={18} w={500} c="var(--ink)">
        {m.title}
      </T>
      <T x={458.9} b={y + 90} s={12} c="var(--gray)">
        {m.desc}
      </T>
      <T x={459} b={y + 125} s={12.5} c="var(--gray)">
        Health Score:
      </T>
      <T x={539.3} b={y + 125.4} s={16} w={600} c="var(--ink2)">
        {m.score}
        <span className="score-of">/100</span>
      </T>
      <ScoreBar x={458.5} y={y + 140.7} score={m.score} />
      <At
        as="button"
        x={800}
        y={y + 118.7}
        w={62.5}
        h={29}
        className={`add-pill ${added ? 'is-added' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onAdd(m.id)
        }}
      >
        <Icon name={added ? 'tick' : 'plus'} size={14} sw={1.8} style={{ left: 11, top: 7.5 }} />
        <span>{added ? 'Added' : 'Add'}</span>
      </At>
      <At x={884} y={y + 16.2} w={114.5} h={131.5} sq={[16, 1]} className="macro-box">
        {(m.wrap
          ? [
              ['flamesm', `${m.cal} Cal`, 27],
              ['carbs', `${m.carbs}g Carbs`, 52],
              ['protein', null, 82.5],
              ['fat', `${m.fats}g Fats`, 117.5],
            ]
          : [
              ['flamesm', `${m.cal} Cal`, 27],
              ['carbs', `${m.carbs}g Carbs`, 57],
              ['protein', `${m.protein}g Protein`, 87.5],
              ['fat', `${m.fats}g Fats`, 117.5],
            ]
        ).map(([g, label, by]) => (
          <div key={g}>
            <MacroIcon g={g} y={by} />
            {label ? (
              <span className="macro-l" style={{ top: by - 0.85 * 12.5 - 1.5 }}>
                {label}
              </span>
            ) : (
              <span className="macro-l" style={{ top: by - 18 - 0.85 * 12.5 + 2.5, lineHeight: '18px' }}>
                {m.protein}g
                <br />
                Protein
              </span>
            )}
          </div>
        ))}
      </At>
    </Layer>
  )
}

function MacroIcon({ g, y }) {
  if (g === 'flamesm') return <Glyph n="flamesm" x={884 + 15.4} y={0} k={1} ox={884} oy={0} className="macro-i" style={{ top: y - 12 }} />
  const name = { carbs: 'bread', protein: 'protein', fat: 'drop' }[g]
  return <Icon name={name} size={14.5} sw={1.5} className="macro-i" style={{ left: 14.5, top: y - 12.4 }} />
}

export default function MealPlanPage() {
  const tab = useUi((s) => s.mealTab ?? 'All')
  const q = useUi((s) => s.mealQ ?? '')
  const added = useUi((s) => s.mealAdded) || {}
  const list = useMemo(
    () => MENU.filter((m) => (tab === 'All' || m.tag === tab) && `${m.title} ${m.desc}`.toLowerCase().includes(q.toLowerCase())),
    [tab, q]
  )
  const [page, setPage] = useState(1)
  return (
    <>
      <PageTitle title="Meal Plan" sub="Explore a Variety of Meal Options" />
      <UserPill />
      <Card x={252.9} y={83.8} w={777.5} h={893} className="menu-card">
        <T x={273} b={122} s={16} w={500} c="var(--ink)">
          All Menu
        </T>
        <At x={651} y={100.5} w={184.5} h={29.5} className="search-mini">
          <Icon name="search" size={14} sw={1.6} style={{ left: 11, top: 8 }} />
          <input value={q} placeholder="Search for menu" onChange={(e) => setUi({ mealQ: e.target.value })} aria-label="Search for menu" />
        </At>
        <At as="button" x={846} y={100.5} w={84} h={29.5} className="pill-gray">
          <Icon name="filter" size={14} sw={1.6} style={{ left: 11, top: 8 }} />
          <span className="pill-text" style={{ left: 30.5 }}>
            Filter
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 60, top: 8 }} />
        </At>
        <At as="button" x={940} y={100} w={75.5} h={31} className="btn-green sm">
          Add Menu
        </At>
        <At x={269.5} y={146} w={746} h={1} className="hline" />
        <At x={270} y={162.5} w={304} h={30} className="tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`tab ${tab === t ? 'is-on' : ''}`} style={{ left: TAB_X[i], width: TAB_W[i] }} onClick={() => setUi({ mealTab: t })}>
              {t}
            </button>
          ))}
        </At>
        <T x={887.5} b={182.4} s={12} c="var(--muted)">
          Sort by:
        </T>
        <At as="button" x={936.5} y={162.5} w={78.5} h={30} className="pill-gray">
          <span className="pill-text" style={{ left: 12.5 }}>
            Calories
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 56, top: 8 }} />
        </At>
        {list.map((m, i) => (
          <MenuRow key={m.id} m={m} i={i} added={!!added[m.id]} onAdd={(id) => setUi({ mealAdded: { ...added, [id]: !added[id] } })} />
        ))}
        {!list.length ? (
          <T x={459} b={290} s={14} c="var(--gray)">
            No meals match this filter.
          </T>
        ) : null}
        <T x={270} b={954.2} s={12} c="var(--gray)">
          Showing
        </T>
        <At x={323} y={931} w={43.5} h={30} className="pill-gray">
          <span className="pill-text" style={{ left: 12.5 }}>
            4
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 23.5, top: 8 }} />
        </At>
        <T x={376} b={954.2} s={12} c="var(--gray)">
          out of 28
        </T>
        {['‹', '1', '2', '3', '›'].map((p, i) => (
          <At
            as="button"
            key={p}
            x={833 + i * 38}
            y={931}
            w={30}
            h={30}
            className={`page-dot ${String(page) === p ? 'is-on' : ''} ${i === 0 && page === 1 ? 'is-dim' : ''}`}
            onClick={() => setPage((v) => (p === '‹' ? Math.max(1, v - 1) : p === '›' ? Math.min(3, v + 1) : Number(p)))}
          >
            {p === '‹' ? <Icon name="left" size={14} sw={1.7} /> : p === '›' ? <Icon name="right" size={14} sw={1.7} /> : p}
          </At>
        ))}
      </Card>

      <Card x={1046.4} y={83.8} w={377.7} h={454} className="side-card">
        <T x={1067.8} b={121.5} s={16} w={500} c="var(--ink)">
          Popular Menu
        </T>
        <At as="button" x={1385} y={104} w={24} h={24} className="dots-btn static" aria-label="Popular menu options">
          <Icon name="dots" size={24} sw={1.5} />
        </At>
        {POPULAR.map((p, i) => {
          const y = 146.5 + i * 130.5
          return (
            <Layer key={p.img} x={1064} y={y} w={348} h={113.5} sq={[18, 1]} className="menu-row small" data-pi onClick={() => goto('/meal-plan/power-protein')}>
              <At x={1080} y={y + 16} w={81.5} h={81.5} clip={[14, 1]} className="menu-photo">
                <img src={p.img} alt="" draggable="false" />
              </At>
              <T x={1178.6} b={y + 37.5} s={15} w={500} lh={18.4} c="var(--ink)">
                {p.title[0]}
                <br />
                {p.title[1]}
              </T>
              <At x={1179} y={y + 72} w={59} h={23.5} className="ratepill">
                <Icon name="starfill" size={13} style={{ left: 7.5, top: 5 }} />
                <span>{p.rate}</span>
              </At>
              <At x={1246} y={y + 72} w={null} h={23.5} className={`tagpill sm tone-l-${TAG_TONE[p.tag]}`}>
                {p.tag}
              </At>
            </Layer>
          )
        })}
      </Card>

      <Card x={1046.4} y={553.3} w={377.7} h={423.5} className="side-card">
        <T x={1064.2} b={590.6} s={16} w={500} c="var(--ink)">
          Recommended Menu
        </T>
        <At as="button" x={1385} y={572} w={24} h={24} className="dots-btn static" aria-label="Recommended menu options">
          <Icon name="dots" size={24} sw={1.5} />
        </At>
        {RECOMMENDED.map((p, i) => {
          const y = 616.5 + i * 180.8
          return (
            <Layer key={p.img} x={1064} y={y} w={348} h={162.5} sq={[18, 1]} className="menu-row small" data-pi onClick={() => goto('/meal-plan/power-protein')}>
              <At x={1080} y={y + 16} w={81.5} h={81.5} clip={[14, 1]} className="menu-photo">
                <img src={p.img} alt="" draggable="false" />
              </At>
              <T x={1178} b={y + 41.4} s={15} w={500} lh={18.4} c="var(--ink)">
                {p.title[0]}
                <br />
                {p.title[1]}
              </T>
              <At x={1178} y={y + 70.5} w={null} h={23.5} className={`tagpill sm tone-l-${TAG_TONE[p.tag]}`}>
                {p.tag}
              </At>
              <At x={p.tag === 'Lunch' ? 1239 : 1257} y={y + 70.5} w={null} h={23.5} className="metapill lg">
                <Glyph n="level" cx={0} cy={0} k={0.95} className="metapill-ico" style={{ left: 9, top: 6 }} />
                <span>{p.level}</span>
              </At>
              <At x={1080} y={y + 113.5} w={316} h={1} className="hline" />
              <div className="macros-line" style={{ left: 16, top: 130 }}>
                {p.macros.map((mm, k) => (
                  <span key={mm}>
                    {k ? <i>•</i> : null}
                    {mm}
                  </span>
                ))}
              </div>
            </Layer>
          )
        })}
      </Card>
    </>
  )
}
