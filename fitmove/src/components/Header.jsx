import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { Card, T, At } from '../ui/prim.jsx'
import { Glyph } from '../ui/icons.jsx'
import { useUi, setUi } from '../store.js'
import { NOTIFICATIONS, SEARCH_INDEX } from '../data.js'

export function Greeting() {
  const wave = useRef(null)
  const hello = 'Hello, Wingman!'
  return (
    <>
      <T x={257.1} b={39.1} s={22} w={500} c="var(--ink)" className="hello" data-s="hello" aria-label={hello}>
        {hello.split('').map((ch, i) => (
          <span key={i} className="ch" aria-hidden="true">
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </T>
      <At
        x={427}
        y={14.5}
        w={29}
        h={28.5}
        className="wave"
        data-s="wave"
        ref={wave}
        onMouseEnter={() => waveHand(wave.current)}
      >
        <img src="/img/wave.png" alt="" draggable="false" />
      </At>
      <T x={256.7} b={61.4} s={12} c="var(--gray)" className="welcome" data-s="welcome">
        Welcome and Let’s do some workout today!
      </T>
    </>
  )
}

export function waveHand(el) {
  if (!el) return
  gsap
    .timeline()
    .to(el, { rotate: 16, duration: 0.14, ease: 'sine.out' })
    .to(el, { rotate: -10, duration: 0.18, ease: 'sine.inOut' })
    .to(el, { rotate: 14, duration: 0.18, ease: 'sine.inOut' })
    .to(el, { rotate: -6, duration: 0.18, ease: 'sine.inOut' })
    .to(el, { rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
}

export function SearchBar() {
  const search = useUi((s) => s.search)
  const open = useUi((s) => s.searchOpen)
  const menu = useUi((s) => s.menu)
  const input = useRef(null)
  const bell = useRef(null)
  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SEARCH_INDEX.slice(0, 5)
    return SEARCH_INDEX.filter((r) => `${r.label} ${r.hint} ${r.kind}`.toLowerCase().includes(q)).slice(0, 6)
  }, [search])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
      }
      if (e.key === 'Escape') {
        input.current?.blur()
        setUi({ searchOpen: false, menu: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ring = () => {
    gsap.fromTo(
      bell.current,
      { rotate: 0 },
      { keyframes: { rotate: [0, 18, -14, 10, -6, 3, 0] }, duration: 0.8, ease: 'none', transformOrigin: '50% 10%' }
    )
    setUi({ menu: menu === 'bell' ? null : 'bell', searchOpen: false })
  }

  return (
    <Card x={738} y={15.9} w={330.1} h={52} r={26} sm={0} className={`search-card ${open ? 'is-open' : ''}`} data-s="search">
      <At x={746} y={23.9} w={270} h={36} className="search-field">
        <Glyph n="search" className="search-icon" ox={746} oy={23.9} />
        <input
          ref={input}
          className="search-input"
          placeholder="Search anything"
          value={search}
          onChange={(e) => setUi({ search: e.target.value, searchOpen: true })}
          onFocus={() => setUi({ searchOpen: true, menu: null })}
          onBlur={() => setTimeout(() => setUi({ searchOpen: false }), 160)}
          aria-label="Search"
        />
      </At>
      <At as="button" x={1024.1} y={23.9} w={36} h={36} className="bell" onClick={ring} aria-label="Notifications">
        <span ref={bell} className="bell-glyph">
          <Glyph n="bell" ox={1024.1} oy={23.9} />
        </span>
        <span className="bell-dot" />
      </At>
      {open ? (
        <div className="pop search-pop" role="listbox">
          {results.length ? (
            results.map((r) => (
              <button
                key={r.label}
                className="pop-row"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setUi({ search: r.label, searchOpen: false })}
              >
                <span className="pop-kind">{r.kind}</span>
                <span className="pop-label">{r.label}</span>
                <span className="pop-hint">{r.hint}</span>
              </button>
            ))
          ) : (
            <div className="pop-empty">No matches for “{search}”</div>
          )}
        </div>
      ) : null}
      {menu === 'bell' ? (
        <div className="pop bell-pop">
          <div className="pop-title">Notifications</div>
          {NOTIFICATIONS.map((n) => (
            <div key={n.title} className="pop-note">
              <span className="pop-dot" />
              <span className="pop-label">{n.title}</span>
              <span className="pop-hint">{n.time}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
