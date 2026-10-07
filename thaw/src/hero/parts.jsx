import { L } from './layout.js'
import { BARS, DOT_ROWS, HOURS } from './data.js'

const S = 1.1728
const BAR_X = (i) => (1302.5 + i * 4.42 - 56.08) / S
const BAR_BASE = (1047.5 - 140) / S
const HOUR_X = (i) => (1315 + i * 61 - 56.08) / S

export function Word({ text, className, style, kern = [], sx = [] }) {
  return (
    <span className={`hl-word ${className}`} style={style} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="hl-ch" data-i={i} style={kern[i] || sx[i] ? { marginRight: kern[i] ? `${kern[i]}em` : undefined, '--sx': sx[i] || 1 } : undefined}>
          {ch}
        </span>
      ))}
    </span>
  )
}

export function CheckChart({ live }) {
  return (
    <svg className="chart" viewBox={`${L.check.x} ${L.check.y} ${L.check.w} ${L.check.h}`} style={{ left: 0, top: 0, width: L.check.w, height: L.check.h }} aria-hidden="true">
      {HOURS.map((_, i) => (
        <line key={i} className="hour" x1={HOUR_X(i)} x2={HOUR_X(i)} y1={(971 - 140) / S} y2={BAR_BASE} />
      ))}
      <line className="future" x1={(1443 - 56.08) / S} x2={(1576 - 56.08) / S} y1={BAR_BASE - 0.6} y2={BAR_BASE - 0.6} />
      {BARS.map((top, i) => {
        const h = (1047.5 - top) / S
        const v = live[i] ?? 1
        return <rect key={i} className="bar" data-i={i} data-h={h} data-base={BAR_BASE} x={BAR_X(i) - 0.5} y={BAR_BASE - h * v} width={1} height={h * v} />
      })}
      {HOURS.map((t, i) => (
        <text key={t} className="hour-label" x={HOUR_X(i)} y={(1060.5 - 140) / S} textAnchor="middle">
          {t}
        </text>
      ))}
    </svg>
  )
}

export function DotMatrix() {
  return (
    <svg className="dots" viewBox={`0 0 ${10.232 * 22 + 6} ${9.38 * 3 + 6}`} style={{ left: L.dots.x - 3, top: L.dots.y - 3, width: 10.232 * 22 + 6, height: 9.38 * 3 + 6 }} aria-hidden="true">
      {DOT_ROWS.map((row, r) =>
        [...row].map((v, c) => <circle key={`${r}-${c}`} className={`dot lv${v}`} data-r={r} data-c={c} data-v={v} cx={3 + c * 10.232} cy={3 + r * 9.38} r={1.45} />)
      )}
    </svg>
  )
}
