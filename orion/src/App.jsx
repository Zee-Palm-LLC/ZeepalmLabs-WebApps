import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Shell } from './layout/Shell.jsx'
import { usePath } from './router.js'
import { GlobePage } from './pages/GlobePage.jsx'
import { NetworkPage } from './pages/NetworkPage.jsx'
import { RoadmapPage } from './pages/RoadmapPage.jsx'
import { SalesPage } from './pages/SalesPage.jsx'

const still = new URLSearchParams(location.search).has('still')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pages = {
  '/': GlobePage,
  '/network': NetworkPage,
  '/roadmap': RoadmapPage,
  '/sales': SalesPage,
}

export default function App() {
  const path = usePath()
  const [live, setLive] = useState(!still)
  const [run, setRun] = useState(0)
  const shell = useRef(null)
  const intro = !still && !reduced
  const Page = pages[path]

  // The sidebar builds once, on first load.
  useLayoutEffect(() => {
    if (!intro) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.canvas', { opacity: 0, duration: 0.6 })
        .from('.logo', { scale: 0, rotate: -180, duration: 0.7, ease: 'back.out(2)' }, 0.15)
        .from('.side-icon, .avatar', { x: -16, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.25)
    }, shell)
    return () => ctx.revert()
  }, [])

  const settings = { live, setLive, replay: () => setRun((r) => r + 1) }

  return (
    <div className={still ? 'still' : ''} ref={shell}>
      <Shell path={path} settings={settings}>
        <Page key={`${path}-${run}`} intro={intro} live={live} />
      </Shell>
    </div>
  )
}
