import { useCallback, useEffect, useRef, useState } from 'react'
import { CanLayer } from './three/CanLayer.jsx'
import Hero from './sections/Hero.jsx'
import Showcase from './sections/Showcase.jsx'
import Products from './sections/Products.jsx'
import Manifesto from './sections/Manifesto.jsx'
import Benefits from './sections/Benefits.jsx'
import Faq from './sections/Faq.jsx'
import Finale from './sections/Finale.jsx'
import Toast from './ui/Toast.jsx'
import Splash from './ui/Splash.jsx'
import Cursor from './ui/Cursor.jsx'
import { startSmooth } from './lib/smooth.js'

export default function App() {
  const [cart, setCart] = useState(3)
  const [toast, setToast] = useState(null)
  const still = new URLSearchParams(window.location.search).has('still')
  const [go, setGo] = useState(still)
  const n = useRef(0)
  useEffect(() => {
    startSmooth()
  }, [])
  const add = useCallback((f) => {
    setCart((c) => c + 1)
    setToast({ id: ++n.current, f })
  }, [])
  return (
    <CanLayer>
      <div id="top" className="app">
        <main>
          <Hero cart={cart} intro go={go} />
          <Showcase />
          <Products onAdd={add} />
          <Manifesto />
          <Benefits />
          <Faq />
          <Finale />
        </main>
      </div>
      <Toast toast={toast} cart={cart} />
      {!still && <Splash onDone={() => setGo(true)} />}
      <Cursor />
    </CanLayer>
  )
}
