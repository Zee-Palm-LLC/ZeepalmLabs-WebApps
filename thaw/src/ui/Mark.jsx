const DOTS = []
for (let j = -2; j <= 2; j++) {
  for (let i = -2; i <= 2; i++) {
    if (Math.abs(i) === 2 && Math.abs(j) === 2) continue
    const d = Math.hypot(i, j)
    const r = d === 0 ? 2.25 : d === 1 ? 2.0 : d < 1.5 ? 1.6 : d === 2 ? 1.05 : 0.72
    DOTS.push({ i, j, r, d })
  }
}

export default function Mark({ className = '', style, size = 28 }) {
  return (
    <svg className={`mark ${className}`} style={style} width={size} height={size} viewBox="-14 -14 28 28" aria-hidden="true">
      {DOTS.map(({ i, j, r, d }) => (
        <circle key={`${i}${j}`} cx={i * 6.55} cy={j * 6.55} r={r} style={{ '--d': d }} />
      ))}
    </svg>
  )
}
