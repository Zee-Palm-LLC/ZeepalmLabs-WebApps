import { Sidebar } from '../components/Sidebar.jsx'

// Fluid app frame: a slim icon rail on the left (a bottom tab bar on phones)
// and a scrolling main area that each page fills with its own grid.
export function Shell({ path, settings, children }) {
  return (
    <div className="app">
      <Sidebar path={path} settings={settings} />
      <main className="main">{children}</main>
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-head anim-rise">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o, i) => (
        <button key={o} role="tab" aria-selected={i === value} className={i === value ? 'is-on' : ''} onClick={() => onChange(i)}>
          {o}
        </button>
      ))}
    </div>
  )
}
