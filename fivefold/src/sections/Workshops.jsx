import { useEffect, useRef, useState } from 'react'
import { WORKSHOPS } from '../lib/data'
import { gsap, scrollToTarget, reducedMotion } from '../lib/scroll'
import { setState, useStore } from '../lib/store'

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5 6.4 12 13 4.5" />
    </svg>
  )
}

export default function Workshops() {
  const root = useRef(null)
  const picked = useStore((s) => s.workshop)
  const grid = useRef(null)
  const [page, setPage] = useState(0)

  const onSwipe = () => {
    const g = grid.current
    const cards = [...g.children]
    const mid = g.scrollLeft + g.clientWidth / 2
    let best = 0
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i
    })
    setPage(best)
  }

  const goTo = (i) => {
    const g = grid.current
    const c = g.children[i]
    g.scrollTo({ left: c.offsetLeft - (g.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } })
      tl.fromTo('.ws__head .w', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.06 }, 0)
        .fromTo('.ws__head .eyebrow, .ws__intro', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.1)
        .fromTo('.wcard', { y: 90, opacity: 0, rotation: (i) => (i - 1) * 2.5 }, { y: 0, opacity: 1, rotation: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12 }, 0.2)
        .fromTo('.wcard li', { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.6)
      if (reducedMotion()) tl.progress(1)
    }, el)
    return () => ctx.revert()
  }, [])

  const onMove = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    c.style.setProperty('--mx', `${e.clientX - r.left}px`)
    c.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const book = (id) => {
    setState({ workshop: id })
    scrollToTarget('#contact')
  }

  return (
    <section id="workshops" className="ws" ref={root} data-mood="workshops" data-section="workshops" aria-labelledby="ws-title">
      <div className="ws__head">
        <p className="eyebrow">Programs</p>
        <h2 id="ws-title" className="ws__title">
          {'Pick your pace'.split(' ').map((w, i) => (
            <span className="mask" key={i}>
              <span className="w">{w}&nbsp;</span>
            </span>
          ))}
        </h2>
        <p className="ws__intro">Three programs, each scoped to how far through the five stages you want to go.</p>
      </div>
      <div className="ws__grid" ref={grid} onScroll={onSwipe}>
        {WORKSHOPS.map((w) => (
          <article key={w.id} className={`wcard ${picked === w.id ? 'is-picked' : ''}`} onPointerMove={onMove}>
            <div className="wcard__top">
              <span className="eyebrow">{w.tag}</span>
              <span className="wcard__dots" aria-label={`Covers ${w.stages} of 5 stages`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <i key={i} className={i < w.stages ? 'on' : ''} />
                ))}
              </span>
            </div>
            <h3>{w.name}</h3>
            <ul>
              {w.items.map((it) => (
                <li key={it}>
                  <Check />
                  {it}
                </li>
              ))}
            </ul>
            <button className="pill pill--white wcard__cta" onClick={() => book(w.id)}>
              {picked === w.id ? 'Selected — continue' : w.cta}
            </button>
          </article>
        ))}
      </div>
      <div className="ws__pager" role="tablist" aria-label="Programs">
        {WORKSHOPS.map((w, i) => (
          <button key={w.id} role="tab" aria-selected={page === i} aria-label={w.name} className={page === i ? 'is-on' : ''} onClick={() => goTo(i)} />
        ))}
      </div>
    </section>
  )
}
