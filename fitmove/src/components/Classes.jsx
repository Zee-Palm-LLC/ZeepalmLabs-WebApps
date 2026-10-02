import { Card, T, At } from '../ui/prim.jsx'
import { Icon, Glyph, glyphBox } from '../ui/icons.jsx'
import { CLASSES } from '../data.js'
import { useUi, setUi } from '../store.js'

export const CLASS_Y = [950.9, 1053.0, 1154.0]
const CLASS_H = [85.4, 83.0, 83.5]

export default function Classes() {
  const menu = useUi((s) => s.menu)
  const joined = useUi((s) => s.joined)
  return (
    <>
      <T x={253.0} b={927} s={16} w={500} c="var(--ink)" className="section-title" data-s="section">
        My Classes
      </T>
      <button className="link-btn" style={{ left: 754.6, top: 924.1 - 0.85 * 11 - 4 }} data-s="section">
        See All
      </button>
      {CLASSES.map((c, i) => {
        const y = CLASS_Y[i]
        const open = menu === `class-${c.id}`
        return (
          <Card key={c.id} x={252.9} y={y} w={538.2} h={CLASS_H[i]} r={20.5} className={`class-card ${joined[c.id] ? 'is-joined' : ''}`} data-s="class">
            <At x={269} y={y + (CLASS_H[i] - 40) / 2} w={40} h={40} className={`class-ico tone-${c.tone}`} data-s="class-ico">
              <Glyph n={c.glyph} x={269 + 20 - glyphBox(c.glyph).w / 2 + c.gdx} y={y + CLASS_H[i] / 2 - glyphBox(c.glyph).h / 2 + c.gdy} ox={269} oy={y + (CLASS_H[i] - 40) / 2} />
            </At>
            <At x={321.3} y={y + 16.4} w={null} h={16.7} className={`class-tag tag-${c.tone}`} data-s="class-tag">
              {c.tag}
            </At>
            <T x={321.3} b={y + 48.65} s={12} w={600} c="var(--ink)" data-s="class-title">
              {c.title}
            </T>
            <Glyph n="user" dy={y - 950.9} className="class-user" />
            <T x={339.0} b={y + 66.6} s={11} c="var(--gray)" data-s="class-coach">
              {c.coach}
            </T>
            <Glyph n="video" dy={y - 950.9} className="class-vid" />
            <T x={507.9} b={y + 46.6} s={11} c="var(--ink)" data-s="class-videos">
              {c.videos}
            </T>
            <T x={507.65} b={y + 65.1} s={11} c="var(--gray)" data-s="class-len">
              {c.len}
            </T>
            <At
              as="button"
              x={632.3}
              y={y + 31.5}
              w={null}
              h={22.5}
              className={`level tone-${c.levelTone}`}
              data-s="class-level"
              onClick={() => setUi({ joined: { ...joined, [c.id]: !joined[c.id] } })}
            >
              {joined[c.id] ? 'Joined ✓' : c.level}
            </At>
            <At
              as="button"
              x={749.2}
              y={y + 29.8}
              w={25.7}
              h={25.7}
              className="more-btn"
              aria-label={`${c.title} options`}
              onClick={() => setUi({ menu: open ? null : `class-${c.id}` })}
            >
              <Icon name="vdots" size={16} />
            </At>
            {open ? (
              <div className="pop class-pop" style={{ left: 538.2 - 186, top: 60 }}>
                {['Open class', 'Message coach', 'Remove from list'].map((l) => (
                  <button key={l} className="pop-row" onClick={() => setUi({ menu: null })}>
                    <span className="pop-label">{l}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </Card>
        )
      })}
    </>
  )
}
