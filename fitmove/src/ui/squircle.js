const rad = (d) => (d * Math.PI) / 180

function corner(R, smoothing, budget) {
  let sm = smoothing
  let p = (1 + sm) * R
  const maxSmoothing = budget / R - 1
  sm = Math.max(0, Math.min(sm, maxSmoothing))
  p = Math.min(p, budget)
  const arc = 90 * (1 - sm)
  const arcLen = Math.sin(rad(arc / 2)) * R * Math.SQRT2
  const alpha = (90 - arc) / 2
  const p34 = R * Math.tan(rad(alpha / 2))
  const beta = 45 * sm
  const c = p34 * Math.cos(rad(beta))
  const d = c * Math.tan(rad(beta))
  const b = (p - arcLen - c - d) / 3
  const a = 2 * b
  return { a, b, c, d, p, arcLen, R }
}

const f = (n) => Number(n.toFixed(3))

export function squirclePath(w, h, R, smoothing = 1) {
  const budget = Math.min(w, h) / 2
  const r = Math.min(R, budget)
  if (r <= 0) return `M0 0H${w}V${h}H0Z`
  const { a, b, c, d, p, arcLen } = corner(r, smoothing, budget)
  return [
    `M${f(w - p)} 0`,
    `c${f(a)} 0 ${f(a + b)} 0 ${f(a + b + c)} ${f(d)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(arcLen)} ${f(arcLen)}`,
    `c${f(d)} ${f(c)} ${f(d)} ${f(b + c)} ${f(d)} ${f(a + b + c)}`,
    `L${f(w)} ${f(h - p)}`,
    `c0 ${f(a)} 0 ${f(a + b)} ${f(-d)} ${f(a + b + c)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(-arcLen)} ${f(arcLen)}`,
    `c${f(-c)} ${f(d)} ${f(-(b + c))} ${f(d)} ${f(-(a + b + c))} ${f(d)}`,
    `L${f(p)} ${f(h)}`,
    `c${f(-a)} 0 ${f(-(a + b))} 0 ${f(-(a + b + c))} ${f(-d)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(-arcLen)} ${f(-arcLen)}`,
    `c${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b + c))} ${f(-d)} ${f(-(a + b + c))}`,
    `L0 ${f(p)}`,
    `c0 ${f(-a)} 0 ${f(-(a + b))} ${f(d)} ${f(-(a + b + c))}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(arcLen)} ${f(-arcLen)}`,
    `c${f(c)} ${f(-d)} ${f(b + c)} ${f(-d)} ${f(a + b + c)} ${f(-d)}`,
    'Z',
  ].join('')
}

export function squircleClip(w, h, R, smoothing = 1) {
  return `path('${squirclePath(w, h, R, smoothing)}')`
}
