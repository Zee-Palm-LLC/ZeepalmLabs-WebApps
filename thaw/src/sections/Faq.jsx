import { useState } from 'react'
import './faq.css'

const QA = [
  ['Is THAW therapy?', 'No. THAW is a self-guided companion built on therapeutic techniques like CBT and ACT. It can sit alongside therapy, and the Care plan includes a monthly session with a licensed therapist.'],
  ['What is a “cold spot”?', 'A pattern THAW notices across your check-ins: a time, a topic or a situation where your mood, sleep or stress consistently dips. Naming it is usually the first step to working on it.'],
  ['How does the AI use my data?', 'Your check-ins are processed to spot patterns and suggest sessions. They are encrypted, never sold, never used to train third-party models, and you can export or delete them at any time.'],
  ['How long until I notice a difference?', 'Most people find the daily check-in calming within the first week. Shifts in the patterns themselves usually show over several weeks of regular sessions.'],
  ['What if I’m in crisis?', 'THAW is not an emergency service. If you are in danger or thinking about harming yourself, call or text 988 in the US, or your local emergency number, right away.'],
  ['Can I cancel anytime?', 'Yes. Cancel in two taps from settings. Your Check-in plan stays free forever.'],
]

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="sec faq" id="faq">
      <div className="wrap faq-grid">
        <div>
          <div className="eyebrow">
            <span>
              {'// 07 — '}
              <b>Questions</b>
            </span>
          </div>
          <h2 className="display faq-title">Good questions to ask.</h2>
        </div>
        <div className="faq-list">
          {QA.map(([q, a], i) => (
            <div className={`qa ${open === i ? 'open' : ''}`} key={q}>
              <button className="qa-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="mono-s qa-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="qa-text">{q}</span>
                <span className="qa-icon" aria-hidden="true" />
              </button>
              <div className="qa-a">
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
