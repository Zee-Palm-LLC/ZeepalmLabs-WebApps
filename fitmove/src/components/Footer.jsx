import { T } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'

const SOCIAL = [
  ['facebook', 'Facebook'],
  ['x', 'X'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'],
]

export default function Footer({ H = 1290, sx = 919.5 }) {
  const b = H - 21.7
  return (
    <footer className="footer" data-s="footer" data-pi>
      <T x={252.4} b={b} s={14} c="var(--gray)">
        Copyright © 2024 Peterdraw
      </T>
      {[
        ['Privacy Policy', 460.2],
        ['Term and conditions', 561.7],
        ['Contact', 706.1],
      ].map(([l, x]) => (
        <T key={l} as="a" href="#" x={x} b={b} s={14} c="var(--muted)" className="footer-link" onClick={(e) => e.preventDefault()}>
          {l}
        </T>
      ))}
      {SOCIAL.map(([icon, label], i) => (
        <a key={icon} href="#" className="social" style={{ left: sx + i * 32, top: b - 13.8 }} aria-label={label} onClick={(e) => e.preventDefault()}>
          <Icon name={icon} size={18} sw={1.5} />
        </a>
      ))}
    </footer>
  )
}
