import { T } from '../ui/prim.jsx'
import { Icon } from '../ui/icons.jsx'

const SOCIAL = [
  ['facebook', 'Facebook'],
  ['x', 'X'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'],
]

export default function Footer() {
  return (
    <footer className="footer" data-s="footer">
      <T x={252.4} b={1268.3} s={14} c="var(--gray)">
        Copyright © 2024 Peterdraw
      </T>
      {[
        ['Privacy Policy', 460.2],
        ['Term and conditions', 561.7],
        ['Contact', 706.1],
      ].map(([l, x]) => (
        <T key={l} as="a" href="#" x={x} b={1268.3} s={14} c="var(--muted)" className="footer-link" onClick={(e) => e.preventDefault()}>
          {l}
        </T>
      ))}
      {SOCIAL.map(([icon, label], i) => (
        <a key={icon} href="#" className="social" style={{ left: 919.5 + i * 32, top: 1254.5 }} aria-label={label} onClick={(e) => e.preventDefault()}>
          <Icon name={icon} size={18} sw={1.5} />
        </a>
      ))}
    </footer>
  )
}
