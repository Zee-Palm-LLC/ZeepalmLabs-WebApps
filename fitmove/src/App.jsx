import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import { Greeting, SearchBar } from './components/Header.jsx'
import { CaloriesCard, HeartCard, StepsCard } from './components/StatCards.jsx'
import ActivityCard from './components/ActivityCard.jsx'
import ProgressCard from './components/ProgressCard.jsx'
import TodayCard from './components/TodayCard.jsx'
import MealPlan from './components/MealPlan.jsx'
import Classes from './components/Classes.jsx'
import ProfilePanel from './components/ProfilePanel.jsx'
import Footer from './components/Footer.jsx'
import { setUi } from './store.js'
import { playIntro, startIdle } from './story.js'

export const W = 1440
export const H = 1290

const params = new URLSearchParams(window.location.search)
const FILM = params.has('film')
const STILL = params.has('still')

function fit() {
  if (FILM) return 1
  return window.innerWidth / W
}

export default function App() {
  const [scale, setScale] = useState(fit)
  const frame = useRef(null)

  useEffect(() => {
    const onResize = () => setScale(fit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onDown = (e) => {
      if (!e.target.closest('.pop, [data-menu]')) setUi({ menu: null })
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.mode = FILM ? 'film' : 'site'
    if (FILM) document.documentElement.dataset.film = '1'
    let stopIdle = () => {}
    if (STILL) {
      document.documentElement.dataset.still = '1'
      return
    }
    if (FILM) {
      window.__fitmove = { frame: frame.current, playIntro, startIdle, setUi }
      window.__cam = (fx, fy, s, rx = 0, rz = 0, ty = 0) => {
        const el = document.getElementById('film-cam')
        el.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2 + ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translate(${-fx}px, ${-fy}px)`
      }
      window.__cam(720, 645, 0.84)
      return
    }
    const tl = playIntro(frame.current)
    tl.eventCallback('onComplete', () => {
      stopIdle = startIdle(frame.current)
    })
    return () => {
      tl.kill()
      stopIdle()
    }
  }, [])

  const dashboard = (
    <main className="frame" ref={frame} data-s="frame">
      <Sidebar />
      <Greeting />
      <SearchBar />
      <CaloriesCard />
      <HeartCard />
      <StepsCard />
      <ActivityCard />
      <ProgressCard />
      <TodayCard />
      <MealPlan />
      <Classes />
      <ProfilePanel />
      <Footer />
    </main>
  )

  if (FILM) {
    return (
      <div className="film">
        <div className="film-cam" id="film-cam">
          <div className="film-shell">{dashboard}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="viewport" style={{ height: H * scale }}>
      <div className="stage" style={{ transform: `scale(${scale})` }}>
        <main className="frame" ref={frame} data-s="frame">
          <Sidebar />
          <Greeting />
          <SearchBar />
          <CaloriesCard />
          <HeartCard />
          <StepsCard />
          <ActivityCard />
          <ProgressCard />
          <TodayCard />
          <MealPlan />
          <Classes />
          <ProfilePanel />
          <Footer />
        </main>
      </div>
    </div>
  )
}
