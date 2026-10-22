import { useEffect, useState } from 'react'
import { navigate } from '../router.js'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const icons = {
  globe: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="8" />
      <path d="M7.5 6.5c1.8 1 2 2.6 1 3.6s-.4 2.6 1.4 2.9c1.6.3 1.4 2.2.4 3.4M14.5 4.6c-.6 1.6.2 2.8 1.8 3 1.4.2 1.6 1.6 2.9 2" />
    </svg>
  ),
  flow: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3.5" y="9.5" width="6" height="5" rx="1.2" />
      <rect x="14.5" y="4" width="6" height="5" rx="1.2" />
      <rect x="14.5" y="15" width="6" height="5" rx="1.2" />
      <path d="M9.5 12h2.5c1 0 1.5-.5 1.5-1.5V8c0-1 .5-1.5 1-1.5M12 12h1.5v3.5c0 1 .5 1.5 1 1.5" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 14h4M8 17h7" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.5c0 5.6-7.5 10-7.5 10z" />
      <path d="M6 12.5h3l1.5-2.5 2 4 1.5-2.5H18" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 3.8l1.4 2 2.4-.6.7 2.4 2.3.9-.5 2.4 1.7 1.7-1.7 1.7.5 2.4-2.3.9-.7 2.4-2.4-.6-1.4 2-1.4-2-2.4.6-.7-2.4-2.3-.9.5-2.4L3.8 12l1.7-1.7-.5-2.4 2.3-.9.7-2.4 2.4.6z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M6.5 16.5V11a5.5 5.5 0 0111 0v5.5l1.5 1.5H5z" />
      <path d="M10 20.5h4" />
    </svg>
  ),
}

const items = [
  { icon: 'globe', path: '/', label: 'Global activity' },
  { icon: 'flow', path: '/network', label: 'Coaching flow' },
  { icon: 'calendar', path: '/roadmap', label: 'Training plan' },
  { icon: 'pulse', path: '/sales', label: 'Fitness report' },
]

export function Sidebar({ path, settings }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e) => !e.target.closest('.settings-pop, .side-icon.gear') && setOpen(false)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <aside className="sidebar">
      <button className="logo" aria-label="Orion home" onClick={() => navigate('/')} />
      <nav className="side-nav" aria-label="Pages">
        {items.map((it) => (
          <button
            key={it.path}
            className={`side-icon ${it.path === path ? 'is-active' : ''}`}
            aria-label={it.label}
            data-tip={it.label}
            aria-current={it.path === path ? 'page' : undefined}
            onClick={() => navigate(it.path)}
          >
            {icons[it.icon]}
            <span className="side-label">{it.label.split(' ')[0]}</span>
          </button>
        ))}
        <span className="side-gear-wrap">
          <button
            className={`side-icon gear ${open ? 'is-open' : ''}`}
            aria-label="Settings"
            data-tip="Settings"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {icons.gear}
            <span className="side-label">Settings</span>
          </button>
          {open && settings && (
            <div className="settings-pop" role="dialog" aria-label="Settings">
              <div className="sp-title">Settings</div>
              <label className="sp-row">
                <span>Live data</span>
                <input type="checkbox" checked={settings.live} onChange={(e) => settings.setLive(e.target.checked)} />
                <i className="switch" />
              </label>
              <button
                className="sp-action"
                onClick={() => {
                  setOpen(false)
                  settings.replay()
                }}
              >
                Replay intro
              </button>
            </div>
          )}
        </span>
      </nav>
      <div className="side-bottom">
        <div className="avatar" aria-label="Profile">
          <svg viewBox="0 0 40 40">
            <defs>
              <linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5B5FA8" />
                <stop offset="1" stopColor="#262A4D" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="url(#av)" />
            <circle cx="20" cy="16" r="7" fill="#C9A48A" />
            <path d="M7 36c2.5-7 8-9.5 13-9.5S30.5 29 33 36" fill="#C9A48A" />
            <path d="M12.5 15c0-6 3.5-8.5 7.5-8.5s7.5 2.5 7.5 8.5c-2-2.5-4.5-3.6-7.5-3.6S14.5 12.5 12.5 15z" fill="#1E1B33" />
          </svg>
        </div>
        <button className="side-icon bell" aria-label="Notifications" data-tip="Notifications">
          {icons.bell}
          <span className="bell-dot" />
        </button>
      </div>
    </aside>
  )
}
