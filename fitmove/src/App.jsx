import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Footer from './components/Footer.jsx'
import { setUi, useUi } from './store.js'
import { playIntro, startIdle } from './story.js'
import { matchRoute } from './routes.js'
import { PAGES } from './pages/index.js'
import { goto, pageIn } from './nav.js'
import { reflow, resetReflow } from './reflow.js'
import CompactBar from './shell/CompactBar.jsx'

export const W = 1440

const params = new URLSearchParams(window.location.search)
const FILM = params.has('film')
const STILL = params.has('still')

function canvasFor(vw) {
  if (FILM || vw >= 1100) return W
  return vw < 700 ? 560 : 860
}

function fit() {
  if (FILM) return 1
  return window.innerWidth / canvasFor(window.innerWidth)
}

export default function App() {
  const [scale, setScale] = useState(fit)
  const [cw, setCw] = useState(() => canvasFor(window.innerWidth))
  const [ch, setCh] = useState(0)
  const compact = cw !== W
  const frame = useRef(null)
  const page = useRef(null)
  const route = useUi((s) => s.route)
  const match = matchRoute(route)
  const P = PAGES[match.page] || PAGES.dashboard
  const H = typeof P.H === 'function' ? P.H(match.param) : P.H
  const firstRoute = useRef(true)
  const idle = useRef(() => {})

  useEffect(() => {
    const onResize = () => {
      setScale(fit())
      setCw(canvasFor(window.innerWidth))
    }
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
    if (STILL) {
      document.documentElement.dataset.still = '1'
      return
    }
    if (FILM) {
      window.__fitmove = { frame: frame.current, playIntro, startIdle, setUi, goto }
      window.__cam = (fx, fy, s, rx = 0, rz = 0, ty = 0) => {
        const el = document.getElementById('film-cam')
        el.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2 + ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translate(${-fx}px, ${-fy}px)`
      }
      window.__cam(720, 645, 0.84)
      return
    }
    if (match.page !== 'dashboard') return
    const tl = playIntro(frame.current)
    tl.eventCallback('onComplete', () => {
      idle.current = startIdle(frame.current)
    })
    return () => tl.kill()
  }, [])

  useLayoutEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false
      if (match.page === 'dashboard' || STILL || FILM) return
    }
    idle.current()
    idle.current = () => {}
    if (STILL) return
    const tl = pageIn(page.current, P.intro)
    if (match.page === 'dashboard') {
      tl.eventCallback('onComplete', () => {
        idle.current = startIdle(frame.current)
      })
    }
    document.title = `${match.title} · FitMove`
    return () => tl.kill()
  }, [route])

  useLayoutEffect(() => {
    const el = page.current
    if (!el) return
    if (!compact) {
      resetReflow(el)
      return
    }
    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setCh(reflow(el, cw)))
    }
    setCh(reflow(el, cw))
    const mo = new MutationObserver((list) => {
      if (list.some((m) => m.type === 'childList' && m.target === el)) run()
    })
    mo.observe(el, { childList: true })
    document.fonts?.ready.then(run)
    return () => {
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [compact, cw, route])

  if (compact) {
    const height = Math.max(ch, 200)
    return (
      <div className="compact-root">
        <CompactBar route={route} title={match.title} />
        <div className="viewport" style={{ height: height * scale }}>
          <div className="stage" style={{ transform: `scale(${scale})`, width: cw, height }}>
            <main className="frame compact" ref={frame} data-s="frame" style={{ width: cw, height }}>
              <div className="page" data-page key={route} ref={page}>
                <P.C param={match.param} />
              </div>
            </main>
          </div>
        </div>
        <footer className="compact-foot">
          <span>Copyright © 2024 Peterdraw</span>
          <span>Privacy Policy · Terms · Contact</span>
        </footer>
      </div>
    )
  }

  const content = (
    <main className="frame" ref={frame} data-s="frame" style={{ height: H }}>
      <Sidebar H={H} />
      <div className="page" data-page key={route} ref={page}>
        <P.C param={match.param} />
        <Footer H={H} sx={P.socialX} />
      </div>
    </main>
  )

  if (FILM) {
    return (
      <div className="film">
        <div className="film-cam" id="film-cam" style={{ height: H }}>
          <div className="film-shell">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="viewport" style={{ height: H * scale }}>
      <div className="stage" style={{ transform: `scale(${scale})`, height: H }}>
        {content}
      </div>
    </div>
  )
}
