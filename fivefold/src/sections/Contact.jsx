import { useEffect, useRef, useState } from 'react'
import { TEAM_SIZES, WORKSHOPS } from '../lib/data'
import { gsap, reducedMotion } from '../lib/scroll'
import { setState, useStore } from '../lib/store'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const KEY = 'fivefold:enquiries'

function save(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]')
    list.push(entry)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    return
  }
}

export default function Contact() {
  const root = useRef(null)
  const workshop = useStore((s) => s.workshop)
  const [form, setForm] = useState({ name: '', email: '', size: TEAM_SIZES[0], message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [sent, setSent] = useState(null)
  const ws = WORKSHOPS.find((w) => w.id === workshop)

  useEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 72%', once: true } })
      tl.fromTo('.ct__title .w', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.06 }, 0)
        .fromTo('.ct__text .eyebrow, .ct__lede, .ct__meta', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.1)
        .fromTo('.ct__card', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: 'expo.out' }, 0.15)
        .fromTo('.field, .chips, .ct__send', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.07 }, 0.4)
      if (reducedMotion()) tl.progress(1)
    }, el)
    return () => ctx.revert()
  }, [])

  const set = (k) => (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const x = {}
    if (form.name.trim().length < 2) x.name = 'Tell us your name'
    if (!EMAIL.test(form.email.trim())) x.email = 'Enter a valid email'
    if (form.message.trim().length < 10) x.message = 'A sentence or two helps us suggest a program'
    return x
  }

  const submit = (e) => {
    e.preventDefault()
    const x = validate()
    setErrors(x)
    if (Object.keys(x).length) {
      const first = root.current.querySelector(`[name="${Object.keys(x)[0]}"]`)
      first && first.focus()
      gsap.fromTo('.ct__card', { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      return
    }
    setStatus('sending')
    const entry = { ...form, workshop: ws ? ws.name : null, at: new Date().toISOString() }
    setTimeout(() => {
      save(entry)
      setSent(entry)
      setStatus('sent')
    }, 1300)
  }

  const reset = () => {
    setForm({ name: '', email: '', size: TEAM_SIZES[0], message: '' })
    setErrors({})
    setStatus('idle')
    setSent(null)
    setState({ workshop: null })
  }

  useEffect(() => {
    if (status !== 'sent') return
    gsap.fromTo('.ct__done > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08 })
    gsap.fromTo('.ct__tick path', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 })
  }, [status])

  return (
    <section id="contact" className="ct" ref={root} data-mood="contact" data-section="contact" aria-labelledby="ct-title">
      <div className="ct__text">
        <p className="eyebrow">Contact</p>
        <h2 id="ct-title" className="ct__title">
          {'Find your flow.'.split(' ').map((w, i) => (
            <span className="mask" key={i}>
              <span className="w">{w}&nbsp;</span>
            </span>
          ))}
        </h2>
        <p className="ct__lede">
          Tell us about your goals and how you like to train.{' '}
          <br />
          We will reply with a suggested program.
        </p>
        <p className="ct__meta">
          <a href="mailto:hello@fivefold.fit">hello@fivefold.fit</a>
          <span>Replies within two working days</span>
        </p>
      </div>

      <div className="ct__card">
        {status === 'sent' && sent ? (
          <div className="ct__done" role="status">
            <svg className="ct__tick" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="22" />
              <path d="M14 24.5 21 31l13-14" strokeDasharray="40" />
            </svg>
            <h3>Thanks, {sent.name.split(' ')[0]}.</h3>
            <p>
              We have your note{sent.workshop ? ` about ${sent.workshop}` : ''}, training {sent.size === 'Daily' ? 'daily' : `${sent.size} days a week`}. Expect a suggested program at {sent.email} within two working days.
            </p>
            <button className="pill pill--white" onClick={reset}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label className={`field ${errors.name ? 'is-bad' : ''}`}>
              <span>Name</span>
              <input name="name" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
              <em>{errors.name}</em>
            </label>
            <label className={`field ${errors.email ? 'is-bad' : ''}`}>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} />
              <em>{errors.email}</em>
            </label>
            <fieldset className="chips">
              <legend>Training days a week</legend>
              <div className="chips__row">
                {TEAM_SIZES.map((s) => (
                  <label key={s} className={`chip ${form.size === s ? 'is-on' : ''}`}>
                    <input type="radio" name="size" value={s} checked={form.size === s} onChange={set('size')} />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
            {ws && (
              <div className="ct__ws">
                <span>
                  Program <b>{ws.name}</b> · {ws.tag}
                </span>
                <button type="button" onClick={() => setState({ workshop: null })} aria-label="Remove selected program">
                  ×
                </button>
              </div>
            )}
            <label className={`field field--area ${errors.message ? 'is-bad' : ''}`}>
              <span>Your goals</span>
              <textarea name="message" rows="3" value={form.message} onChange={set('message')} aria-invalid={!!errors.message} />
              <em>{errors.message}</em>
            </label>
            <button className={`pill pill--white ct__send ${status === 'sending' ? 'is-busy' : ''}`} type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <i className="spin" aria-hidden="true" />
                  Sending
                </>
              ) : (
                'Send message'
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
