import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createCanStage } from './cans.js'

const Ctx = createContext(null)

export function CanLayer({ children }) {
  const canvas = useRef(null)
  const [stage, setStage] = useState(null)

  useEffect(() => {
    let alive = true
    let s = null
    Promise.all([document.fonts.load('400 62px Gelasio'), document.fonts.load('italic 400 40px Gelasio'), document.fonts.load('500 21px Figtree')]).then(() => {
      if (!alive) return
      s = createCanStage(canvas.current)
      window.__cans = s
      setStage(s)
    })
    return () => {
      alive = false
      s?.destroy()
    }
  }, [])

  return (
    <Ctx.Provider value={stage}>
      {children}
      <canvas className="can-layer" ref={canvas} aria-hidden="true" />
    </Ctx.Provider>
  )
}

export function useCan(ref, flavor, init) {
  const stage = useContext(Ctx)
  const handle = useRef(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!stage || !ref.current) return
    const h = stage.register(ref.current, flavor, init)
    handle.current = h
    setReady(true)
    return () => {
      stage.unregister(h)
      handle.current = null
    }
  }, [stage])
  useEffect(() => {
    if (stage && handle.current) stage.setFlavor(handle.current, flavor)
  }, [stage, flavor])
  return { handle, ready }
}

export function CanAnchor({ flavor, init, className = '', style, onReady }) {
  const ref = useRef(null)
  const { handle, ready } = useCan(ref, flavor, init)
  useEffect(() => {
    if (ready) onReady?.(handle.current)
  }, [ready])
  return <div ref={ref} className={`can-anchor ${className}`} style={style} aria-hidden="true" />
}
