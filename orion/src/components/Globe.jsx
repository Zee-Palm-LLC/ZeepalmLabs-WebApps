import { useEffect, useRef } from 'react'
import { createGlobe } from '../globe/createGlobe.js'

export function Globe({ intro }) {
  const canvas = useRef(null)
  useEffect(() => createGlobe(canvas.current, { intro }), [intro])
  return (
    <div className="globe-wrap">
      <div className="globe-halo" />
      <div className="globe-shadow" />
      <canvas ref={canvas} className="globe" aria-label="3D globe of active users, drag to spin" />
    </div>
  )
}
