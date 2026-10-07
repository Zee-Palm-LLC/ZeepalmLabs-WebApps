import { useEffect, useRef } from 'react'
import { TILES } from '../data/tiles.js'

const PALETTE = TILES.flat().filter((c) => c[0] < 62)

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export default function Backdrop() {
  const canvas = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    const c = canvas.current
    const ctx = c.getContext('2d')
    let raf = 0
    let t0 = performance.now()
    const draw = (time = 0) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr)
        c.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const tile = w < 900 ? w / 6 : w / 22
      const cols = Math.ceil(w / tile)
      const rows = Math.ceil(h / tile) + 1
      const off = (window.scrollY * 0.12) % tile
      const s = time / 1000
      for (let r = -1; r < rows; r++) {
        const ry = r + Math.floor((window.scrollY * 0.12) / tile)
        for (let k = 0; k < cols; k++) {
          const hv = hash(k, ry)
          const base = PALETTE[Math.floor(hv * PALETTE.length)]
          const wave = Math.sin(s * 0.35 + hash(k + 7, ry) * 6.283) * 1.6 * (hv * 2 - 1)
          ctx.fillStyle = `rgb(${base[0] - 4 + wave},${base[1] - 4 + wave},${base[2] - 3 + wave})`
          ctx.fillRect(k * tile - 0.5, r * tile - off - 0.5, tile + 1, tile + 1)
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.045)'
      const col = w < 900 ? w / 3 : w / 11
      for (let k = 1; k < (w < 900 ? 3 : 11); k++) ctx.fillRect(Math.round(k * col), 0, 1, h)
    }
    const loop = (time) => {
      raf = requestAnimationFrame(loop)
      if (time - t0 < 33) return
      t0 = time
      draw(time)
    }
    raf = requestAnimationFrame(loop)
    const onMove = (e) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvas} />
      <span className="backdrop-glow" ref={glow} />
    </div>
  )
}
