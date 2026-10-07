export const SPARK = 'M0 -1 Q0.12 -0.12 1 0 Q0.12 0.12 0 1 Q-0.12 0.12 -1 0 Q-0.12 -0.12 0 -1Z'

export function Star({ size = 12, className = '', style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true">
      <path d={SPARK} fill="currentColor" transform="rotate(45) scale(1.28)" />
    </svg>
  )
}

export function Spark({ size = 12, className = '', style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true">
      <path d={SPARK} fill="currentColor" />
    </svg>
  )
}

export function LogoMark({ size = 40, className = '', style }) {
  return (
    <svg className={`logo-mark ${className}`} style={style} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <g transform="translate(20 20) scale(10.6)">
        <path d={SPARK} fill="#fff" transform="rotate(45) scale(1.32)" />
      </g>
    </svg>
  )
}

const FRUITS = {
  apple: (
    <g>
      <path d="M32 22c-6-5-17-2-17 10 0 9 7 18 13 18 2 0 3-1 4-1s2 1 4 1c6 0 13-9 13-18 0-12-11-15-17-10z" fill="#e9ec8a" stroke="#4f6b33" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32 22c0-4 1-7 3-9" fill="none" stroke="#4f6b33" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M35 15c3-4 9-4 11-2-2 4-7 5-11 2z" fill="#9bc35c" stroke="#4f6b33" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 30c1-3 3-5 6-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </g>
  ),
  strawberry: (
    <g>
      <path d="M32 50c-9-5-16-13-15-22 1-6 7-8 15-8s14 2 15 8c1 9-6 17-15 22z" fill="#f6b3ad" stroke="#d2433a" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 19l4 4 4-6 4 6 4-4-1 5-7 2-7-2z" fill="#f6b3ad" stroke="#d2433a" strokeWidth="2" strokeLinejoin="round" />
      {[[26, 31], [36, 30], [31, 37], [24, 39], [38, 38], [31, 44]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y}l1.4 -2.6`} stroke="#d2433a" strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </g>
  ),
  berry: (
    <g>
      <circle cx="32" cy="33" r="17" fill="#4e1b1e" />
      <circle cx="32" cy="33" r="17" fill="none" stroke="#2e0e10" strokeWidth="1.5" />
      <path d="M32 22l2.5 6 6.5 0.6-5 4.4 1.6 6.4-5.6-3.4-5.6 3.4 1.6-6.4-5-4.4 6.5-0.6z" fill="#e9b45c" stroke="#fff3d6" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M22 27c2-3 5-5 8-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    </g>
  ),
  lemon: (
    <g>
      <circle cx="32" cy="33" r="16" fill="#fbe27a" stroke="#e1a73a" strokeWidth="2.2" />
      <circle cx="32" cy="33" r="11" fill="#fff5bf" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d="M32 33 L32 23" transform={`rotate(${a} 32 33)`} stroke="#e8b84a" strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </g>
  ),
  blueberry: (
    <g>
      <circle cx="32" cy="33" r="17" fill="#9c86d6" stroke="#5b3f9e" strokeWidth="2.2" />
      <path d="M32 24l1.8 3.8 4.2.4-3.2 2.8 1 4-3.8-2.2-3.8 2.2 1-4-3.2-2.8 4.2-.4z" fill="#6a4fb3" stroke="#5b3f9e" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M21 31c1-4 4-7 8-8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </g>
  ),
  hazelnut: (
    <g>
      <path d="M32 18c9 0 15 8 15 17s-7 15-15 15-15-6-15-15 6-17 15-17z" fill="#7a3f2c" stroke="#3d1c12" strokeWidth="2" />
      <path d="M20 26c4-6 20-6 24 0-4 3-20 3-24 0z" fill="#c78c5c" stroke="#3d1c12" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M25 36c2-4 5-6 8-6" fill="none" stroke="#f3d5c3" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
}

export function Fruit({ kind, size = 48, className = '', style }) {
  return (
    <svg className={`fruit ${className}`} style={style} width={size} height={size} viewBox="10 10 44 44" aria-hidden="true">
      {FRUITS[kind]}
    </svg>
  )
}

export function Doodle({ kind = 'spark', className = '', style, color = 'currentColor' }) {
  if (kind === 'spark')
    return (
      <svg className={className} style={style} viewBox="0 0 52 46" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 10c6 2 9 6 10 12" />
        <path d="M18 4c1 6 0 11-3 15" />
        <path d="M29 18c6-2 12-1 17 3" />
        <path d="M30 30c4 3 7 7 8 12" />
      </svg>
    )
  return null
}

export function Icon({ name, size = 20, className = '', style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', className, style, 'aria-hidden': true }
  switch (name) {
    case 'cart':
      return (
        <svg {...p}>
          <path d="M3 4h2.4l2.2 10.2h10.6l2-7.2H6.3" />
          <circle cx="9" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 20.5s-8-4.7-8-10.6C4 6.9 6.2 5 8.6 5c1.6 0 2.7.8 3.4 1.9C12.7 5.8 13.8 5 15.4 5 17.8 5 20 6.9 20 9.9c0 5.9-8 10.6-8 10.6z" />
        </svg>
      )
    case 'smile':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1.2" fill="#fff" />
          <circle cx="15" cy="10" r="1.2" fill="#fff" />
          <path d="M8.5 14c1.8 2.2 5.2 2.2 7 0" stroke="#fff" strokeWidth="1.6" fill="none" />
        </svg>
      )
    case 'pill':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M5.6 13.6l8-8a4.2 4.2 0 016 6l-8 8a4.2 4.2 0 01-6-6z" />
          <path d="M9.6 9.6l4.8 4.8" stroke="#fff" strokeWidth="1.6" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...p}>
          <path d="M12 6v12M6 12h12" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...p}>
          <path d="M6 12h12" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...p}>
          <path d="M4 12h15M14 7l5 5-5 5" />
        </svg>
      )
    case 'up':
      return (
        <svg {...p}>
          <path d="M12 19V5M7 10l5-5 5 5" />
        </svg>
      )
    case 'play':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M8 5.5v13a.8.8 0 001.2.7l10.4-6.5a.8.8 0 000-1.4L9.2 4.8A.8.8 0 008 5.5z" />
        </svg>
      )
    case 'pause':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
          <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
        </svg>
      )
    case 'mouse':
      return (
        <svg {...p}>
          <rect x="7" y="3.5" width="10" height="17" rx="5" />
          <path className="mouse-wheel" d="M12 7.5v3" />
        </svg>
      )
    default:
      return null
  }
}
