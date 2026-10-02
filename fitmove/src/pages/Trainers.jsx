import { useMemo, useState } from 'react'
import { Card, T, At, Layer } from '../ui/prim.jsx'
import { Icon, Glyph } from '../ui/icons.jsx'
import { PageTitle, UserPill } from '../shell/PageHeader.jsx'
import { goto } from '../nav.js'
import { TRAINERS, CATEGORIES } from './trainersData.js'

export const H = 1156

const COL = (c) => 268.5 + c * 230.8
const ROW = (r) => 150 + r * 304

export default function Trainers() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(CATEGORIES[0])
  const [open, setOpen] = useState(false)
  const list = useMemo(
    () => TRAINERS.filter((t) => (cat === CATEGORIES[0] || t.cat === cat) && `${t.name} ${t.cls}`.toLowerCase().includes(q.toLowerCase())),
    [q, cat]
  )
  return (
    <>
      <PageTitle title="Trainers" sub="Meet Your Fitness Experts" />
      <UserPill />
      <Card x={252.9} y={83.8} w={1171.2} h={1001.2} className="trainers-card">
        <At x={268.5} y={100} w={232} h={30} className="search-mini">
          <Icon name="search" size={14} sw={1.6} style={{ left: 9, top: 8 }} />
          <input value={q} placeholder="Search for trainer" onChange={(e) => setQ(e.target.value)} aria-label="Search for trainer" />
        </At>
        <At as="button" x={510} y={100} w={null} h={30} className="pill-gray auto" data-menu onClick={() => setOpen((v) => !v)}>
          <span className="pill-text-in">{cat}</span>
          <Icon name="down" size={14} sw={1.7} className="pill-caret-in" />
        </At>
        {open ? (
          <div className="pop cat-pop" style={{ left: 510 - 252.9, top: 52 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pop-row ${c === cat ? 'is-on' : ''}`}
                onClick={() => {
                  setCat(c)
                  setOpen(false)
                }}
              >
                <span className="pop-label">{c}</span>
              </button>
            ))}
          </div>
        ) : null}
        {list.map((t, i) => {
          const x = COL(i % 5)
          const y = ROW(Math.floor(i / 5))
          return (
            <Layer as="button" key={t.id} x={x} y={y} w={215.5} h={284} sq={[24, 1]} className="tr-card" data-pi onClick={() => goto(`/trainers/${t.id}`)}>
              <At x={x + 50.6} y={y + 27.5} w={114.8} h={114.8} clip={[26, 1]} className="tr-photo">
                <img src={`/img/tr-${t.id}.jpg`} alt={t.name} draggable="false" />
              </At>
              <span className="tr-name">{t.name}</span>
              <span className="tr-cls">
                <Glyph n="video" x={0} y={0} ox={0} oy={0} className="tr-cls-ico" />
                {t.cls}
              </span>
              <span className="tr-cat">{t.cat}</span>
            </Layer>
          )
        })}
        {list.length === TRAINERS.length ? (
          <Layer as="button" x={COL(4)} y={ROW(2)} w={215.5} h={284} sq={[24, 1]} className="tr-card tr-more" data-pi onClick={() => goto('/trainers/jordan-reed')}>
            <span className="more-ring">
              <Icon name="right" size={22} sw={1.8} style={{ left: 28.5, top: 28.5 }} />
            </span>
            <span className="tr-name">14 more trainers</span>
            <span className="tr-cls">Browse the full roster on page 2</span>
            <span className="tr-cat green">See all</span>
          </Layer>
        ) : null}
        {!list.length ? (
          <T x={270} b={190} s={14} c="var(--gray)">
            No trainers match.
          </T>
        ) : null}
        <T x={269} b={1077} s={12} c="var(--gray)">
          Showing
        </T>
        <At x={322} y={1057.5} w={47} h={30} className="pill-gray">
          <span className="pill-text" style={{ left: 10.5 }}>
            {Math.min(15, list.length + (list.length === TRAINERS.length ? 1 : 0))}
          </span>
          <Icon name="down" size={14} sw={1.7} style={{ left: 27, top: 8 }} />
        </At>
        <T x={379} b={1077} s={12} c="var(--gray)">
          out of 28
        </T>
      </Card>
    </>
  )
}
