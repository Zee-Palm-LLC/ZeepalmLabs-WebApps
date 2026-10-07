import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth.js'
import './benefits.css'

function Slice({ stroke, fill, style }) {
  return (
    <svg className="bn-doodle" style={style} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill={fill} stroke={stroke} strokeWidth="5" />
      <circle cx="50" cy="50" r="33" fill="none" stroke={stroke} strokeWidth="2.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d="M50 50 L50 19" transform={`rotate(${a} 50 50)`} stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="50" r="5" fill={stroke} />
    </svg>
  )
}

function Berry({ fill, style }) {
  return (
    <svg className="bn-doodle" style={style} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="52" r="42" fill={fill} stroke="#fff" strokeWidth="4" />
      <path d="M50 22l6 12 13 1.5-10 8.5 3 13-12-7-12 7 3-13-10-8.5 13-1.5z" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 54c1-12 8-20 18-24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function Stat({ title, copy, to, tone, children }) {
  return (
    <article className={`bn-card bn-stat ${tone}`}>
      {children}
      <h3 className="serif">{title}</h3>
      <p>{copy}</p>
      <b className="display bn-num" data-to={to}>
        +0%
      </b>
    </article>
  )
}

function Photo({ src, title, copy, place, cls }) {
  return (
    <article className={`bn-card bn-photo ${cls}`}>
      <div className="bn-img">
        <img src={src} alt="" />
      </div>
      <div className={`bn-text ${place}`}>
        <h3 className="display">{title}</h3>
        {copy && <p>{copy}</p>}
      </div>
    </article>
  )
}

export default function Benefits() {
  const root = useRef(null)
  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.bn-word'),
        { opacity: 0, filter: 'blur(14px)', yPercent: 40 },
        { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 70%' } },
      )
      gsap.fromTo(el.querySelector('.bn-sub'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } })
      el.querySelectorAll('.bn-card').forEach((c) => {
        gsap.fromTo(c, { y: 50, opacity: 0, filter: 'blur(16px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out', clearProps: 'filter', scrollTrigger: { trigger: c, start: 'top 92%' } })
        const img = c.querySelector('.bn-img img')
        if (img) gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      el.querySelectorAll('.bn-num').forEach((n) => {
        const o = { v: 0 }
        gsap.to(o, {
          v: +n.dataset.to,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: n, start: 'top 98%' },
          onUpdate: () => (n.textContent = `+${Math.round(o.v)}%`),
        })
      })
      el.querySelectorAll('.bn-doodle').forEach((d, k) => {
        gsap.to(d, { rotate: k % 2 ? 24 : -24, ease: 'none', scrollTrigger: { trigger: d, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const words = (s, cls = '') =>
    s.split(' ').map((w, k) => (
      <span key={k}>
        {k > 0 && ' '}
        <span className={`bn-word ${cls}`}>{w}</span>
      </span>
    ))

  return (
    <section className="benefits" id="benefits" ref={root}>
      <h2 className="display bn-title">
        <span className="bn-line">
          {words('Power')} <span className="bn-word hot">Your</span>{' '}
          <span className="bn-word hot">
            Performance<i>,</i>
          </span>
        </span>
        <span className="bn-line">{words('One Gummy at a Time.')}</span>
      </h2>
      <p className="bn-sub">
        Everything you need to know about Creatine Gummies -{' '}
        <br />
        how they work and boost performance.
      </p>
      <div className="bn-grid">
        <div className="bn-col">
          <Stat title="Focus" copy="Stay sharp and concentrated during your training sessions." to={40} tone="orange">
            <Slice stroke="#c9352f" fill="#f8c95a" style={{ left: `calc(-38 * var(--u))`, top: `calc(-30 * var(--u))`, width: `calc(140 * var(--u))` }} />
            <Slice stroke="#c9352f" fill="#f8c95a" style={{ left: `calc(300 * var(--u))`, top: `calc(186 * var(--u))`, width: `calc(150 * var(--u))` }} />
          </Stat>
          <Photo src="/img/benefit-energy.webp" title="Energising Support" place="bottom" cls="h380" />
          <Stat title="Motivation" copy="Make your fitness routine more enjoyable and consistent." to={49} tone="blue">
            <Berry fill="#5b9bd0" style={{ left: `calc(290 * var(--u))`, top: `calc(-40 * var(--u))`, width: `calc(90 * var(--u))` }} />
            <Berry fill="#5b9bd0" style={{ left: `calc(-48 * var(--u))`, top: `calc(150 * var(--u))`, width: `calc(100 * var(--u))` }} />
            <Berry fill="#5b9bd0" style={{ left: `calc(340 * var(--u))`, top: `calc(246 * var(--u))`, width: `calc(90 * var(--u))` }} />
          </Stat>
        </div>
        <div className="bn-col">
          <Photo src="/img/benefit-strength.webp" title="Strength Boost" copy="Power through your workouts with enhanced muscle energy." place="bottom" cls="h460" />
          <Photo src="/img/benefit-routine.webp" title="Easy Daily Routine" copy="No powders, no mess — just tasty gummies you’ll love." place="top" cls="h541 narrow" />
        </div>
      </div>
    </section>
  )
}
