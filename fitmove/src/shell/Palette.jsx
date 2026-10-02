import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { setUi } from '../store.js'
import { goto } from '../nav.js'
import { PALETTE } from '../data.js'

export default function Palette() {
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const input = useRef(null)
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    const list = s ? PALETTE.filter((r) => `${r.label} ${r.kind} ${r.hint || ''}`.toLowerCase().includes(s)) : PALETTE.filter((r) => r.kind === 'Page')
    return list.slice(0, 8)
  }, [q])

  useEffect(() => {
    input.current?.focus()
  }, [])

  const close = () => setUi({ menu: null })
  const pick = (r) => {
    close()
    if (r) goto(r.to)
  }

  return createPortal(
    <div className="palette-wrap" data-menu onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette" role="dialog" aria-label="Search FitMove">
        <div className="palette-field">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="M17 17L21 21M19 11C19 6.58 15.42 3 11 3C6.58 3 3 6.58 3 11C3 15.42 6.58 19 11 19C15.42 19 19 15.42 19 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            value={q}
            placeholder="Search pages, classes, meals, trainers…"
            onChange={(e) => {
              setQ(e.target.value)
              setI(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setI((v) => Math.min(results.length - 1, v + 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setI((v) => Math.max(0, v - 1))
              }
              if (e.key === 'Enter') pick(results[i])
              if (e.key === 'Escape') close()
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list">
          {results.length ? (
            results.map((r, k) => (
              <button key={r.kind + r.label} className={`palette-row ${k === i ? 'is-on' : ''}`} onMouseEnter={() => setI(k)} onClick={() => pick(r)}>
                <span className="palette-kind">{r.kind}</span>
                <span className="palette-label">{r.label}</span>
                {r.hint ? <span className="palette-hint">{r.hint}</span> : null}
              </button>
            ))
          ) : (
            <div className="palette-empty">Nothing matches “{q}”</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
