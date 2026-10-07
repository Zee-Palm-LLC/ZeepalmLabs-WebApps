import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import { Icon } from '../ui/art.jsx'
import './faq.css'

const QA = [
  ['What are Creatine Gummies?', 'Chewable gummies made with creatine monohydrate — the most researched form of creatine — so you get your daily dose in a few tasty bites instead of a scoop of powder.'],
  ['Do they work as well as creatine powder?', 'Yes. Each daily serving delivers the same creatine monohydrate you would find in powder. What matters is taking it consistently, and gummies make that part easy.'],
  ['How should I take them?', 'Creatine Gummies are designed to make your daily creatine routine effortless. You don’t need water, a shaker, or precise measuring — just chew your recommended daily serving (usually 2–4 gummies, depending on the brand’s dosage).'],
  ['Are Creatine Gummies safe?', 'Creatine is one of the most studied supplements in sports nutrition and is well tolerated by healthy adults at recommended doses. If you have a medical condition, check with your doctor first.'],
  ['Will they cause bloating?', 'Most people feel nothing at all. There is no loading phase and no big glass of liquid, so the gentle daily dose keeps things comfortable.'],
  ['When is the best time to take them?', 'Any time that you will remember. Many people chew them after a workout or with breakfast — consistency matters more than timing.'],
  ['Are they vegan?', 'Our gummies are made with pectin instead of gelatin, so every flavor is vegan-friendly.'],
  ['How long until I notice results?', 'Creatine builds up in your muscles over time. Most people notice better strength and recovery after three to four weeks of daily use.'],
]

function Row({ q, a, open, onToggle }) {
  const body = useRef(null)
  useEffect(() => {
    const el = body.current
    gsap.to(el, { height: open ? el.scrollHeight : 0, duration: 0.6, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() })
  }, [open])
  return (
    <div className={`fq-row ${open ? 'open' : ''}`}>
      <button className="fq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <i className="fq-ic">
          <Icon name="plus" size={20} />
        </i>
      </button>
      <div className="fq-a" ref={body}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(-1)
  const [more, setMore] = useState(false)
  const root = useRef(null)
  const list = more ? QA : QA.slice(0, 5)

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.fq-title span'), { opacity: 0, filter: 'blur(12px)', y: 30 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 70%' } })
      gsap.fromTo(el.querySelectorAll('.fq-row'), { opacity: 0, filter: 'blur(10px)', y: 40 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 60%' } })
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!more) return
    const rows = root.current.querySelectorAll('.fq-row')
    gsap.fromTo([...rows].slice(5), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08, onComplete: () => ScrollTrigger.refresh() })
  }, [more])

  return (
    <section className="faq" id="faq" ref={root}>
      <h2 className="display fq-title">
        <span>Frequently Asked</span>
        <span>Questions</span>
      </h2>
      <div className="fq-list">
        {list.map(([q, a], k) => (
          <Row key={q} q={q} a={a} open={open === k} onToggle={() => setOpen((o) => (o === k ? -1 : k))} />
        ))}
      </div>
      <button className="pill fq-more" onClick={() => setMore((m) => !m)}>
        {more ? 'Show Less' : 'Show More'}
      </button>
    </section>
  )
}
