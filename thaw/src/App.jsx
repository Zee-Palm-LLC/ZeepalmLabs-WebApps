import { useEffect, useState } from 'react'
import Nav from './ui/Nav.jsx'
import Backdrop from './ui/Backdrop.jsx'
import Hero from './hero/Hero.jsx'
import Ticker from './sections/Ticker.jsx'
import Approach from './sections/Approach.jsx'
import HowItWorks from './sections/HowItWorks.jsx'
import Session from './sections/Session.jsx'
import Science from './sections/Science.jsx'
import Plans from './sections/Plans.jsx'
import Assessment from './sections/Assessment.jsx'
import Faq from './sections/Faq.jsx'
import Footer from './sections/Footer.jsx'
import { startSmooth, ScrollTrigger } from './lib/smooth.js'
import './styles/sections.css'
import './styles/mobile.css'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    document.fonts
      .load('700 168px Heros')
      .then(() => document.fonts.ready)
      .then(() => alive && setReady(true))
    startSmooth()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(id)
  }, [ready])

  return (
    <div id="top" className={`app ${ready ? 'is-ready' : ''}`}>
      <Backdrop />
      <Nav />
      <main>
        {ready ? (
          <>
            <Hero />
            <Ticker />
            <Approach />
            <HowItWorks />
            <Session />
            <Science />
            <Plans />
            <Assessment />
            <Faq />
          </>
        ) : (
          <div style={{ height: '100vh' }} />
        )}
      </main>
      {ready ? <Footer /> : null}
    </div>
  )
}
