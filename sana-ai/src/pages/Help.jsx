import { useState } from 'react'
import { Icon } from '../ui/icons.jsx'
import './pages.css'

const FAQ = [
  ['Is Sana a doctor?', 'No. Sana gives general health information and helps you understand your data, but it doesn’t diagnose or replace your clinician. For anything serious, Sana will point you to the right care.'],
  ['Where does my data come from?', 'From the trackers you connect (watch, cuff, smart scale, pharmacy) and the reports you upload. You can disconnect any source at any time from the chatbot home.'],
  ['Is my health data private?', 'Your records are encrypted in transit and at rest. Sana only shares data with a doctor when you ask it to.'],
  ['What happens in an emergency?', 'If you mention warning signs like chest pain, trouble breathing or thoughts of self-harm, Sana stops and shows emergency numbers right away.'],
  ['Can I book real appointments?', 'Yes. Pick a doctor and time from the booking card, and Sana adds it to your calendar and shares your latest vitals.'],
]

export default function Help({ onAsk }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Help center</h1>
          <p>Answers about Sana, your data and getting care.</p>
        </div>
      </div>
      <div className="help">
        <section className="tile faq">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`faq-row ${open === i ? 'open' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {q}
                <Icon name="chevron" size={18} />
              </button>
              <p>{a}</p>
            </div>
          ))}
        </section>
        <div className="help-side">
          <section className="tile contact">
            <Icon name="doctor" size={22} />
            <h3>Talk to a nurse</h3>
            <p>Available 24/7. Average wait under 3 minutes.</p>
            <button className="btn-mint" onClick={() => onAsk('Talk to someone')}>
              <Icon name="phone" size={15} /> Connect me
            </button>
          </section>
          <section className="tile contact sos">
            <Icon name="siren" size={22} />
            <h3>Emergency</h3>
            <p>Call 911 for emergencies, or 988 for mental health crisis support.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
