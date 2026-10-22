import { useEffect, useRef, useState } from 'react'

// Lays out children on a fixed design-size stage and scales that stage to fit
// the container's width and the room left below it in the window, so a
// hand-placed diagram stretches with the page. Below `minScale` the stage
// stops shrinking and the box scrolls sideways instead.
export function FitBox({ width, height, minScale = 0.6, maxScale = 1.6, bottomGap = 32, className = '', children }) {
  const box = useRef(null)
  const [fit, setFit] = useState({ scale: 1, offset: 0 })
  useEffect(() => {
    const el = box.current
    const measure = () => {
      const w = el.clientWidth
      const room = window.innerHeight - el.getBoundingClientRect().top - bottomGap
      const byHeight = window.innerWidth > 760 ? room / height : Infinity
      const scale = Math.min(maxScale, Math.max(minScale, Math.min(w / width, byHeight)))
      setFit({ scale, offset: Math.max(0, (w - width * scale) / 2) })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [width, height, minScale, maxScale, bottomGap])
  return (
    <div ref={box} className={`fitbox ${className}`} style={{ height: height * fit.scale }}>
      <div className="fitbox-stage" style={{ width, height, left: fit.offset, transform: `scale(${fit.scale})` }}>
        {children}
      </div>
    </div>
  )
}
