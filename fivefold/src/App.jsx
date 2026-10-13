import { useEffect, useLayoutEffect } from 'react'
import Smoke from './gl/Smoke'
import { setMood } from './gl/mood'
import Cursor from './ui/Cursor'
import Nav from './ui/Nav'
import Hero from './sections/Hero'
import Process from './sections/Process'
import Stages from './sections/Stages'
import Workshops from './sections/Workshops'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import { startScroll, stopScroll, ScrollTrigger, gsap } from './lib/scroll'
import { setState } from './lib/store'

export default function App() {
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    startScroll()
    return () => stopScroll()
  }, [])

  useEffect(() => {
    const triggers = []
    document.querySelectorAll('[data-mood]').forEach((el) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: el.tagName === 'FOOTER' ? 'top 92%' : 'top 55%',
          end: el.tagName === 'FOOTER' ? 'bottom top' : 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return
            setMood(el.dataset.mood)
            if (el.dataset.section) setState({ section: el.dataset.section })
          },
        }),
      )
    })
    const rail = document.querySelector('.progress-rail i')
    const setRail = rail ? gsap.quickSetter(rail, 'scaleY') : null
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => setRail && setRail(self.progress),
      }),
    )
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    document.fonts && document.fonts.ready.then(onLoad)
    return () => {
      triggers.forEach((t) => t.kill())
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return (
    <>
      <Smoke />
      <div className="grain" aria-hidden="true" />
      <div className="veil" aria-hidden="true" />
      <Cursor />
      <Nav />
      <div className="progress-rail" aria-hidden="true">
        <i />
      </div>
      <main>
        <Hero />
        <Process />
        <Stages />
        <Workshops />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
