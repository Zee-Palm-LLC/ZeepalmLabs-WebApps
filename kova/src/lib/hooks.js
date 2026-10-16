import { useEffect, useRef, useState } from 'react'

export function useInView({ threshold = 0.35 } = {}) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setSeen(true)
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

export function useCount(target, on, ms = 1600, d = 0) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!on) return
    let raf = 0
    const t0 = performance.now()
    const run = (now) => {
      const k = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - k, 4)
      setV(target * e)
      if (k < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [on, target, ms])
  return v.toFixed(d)
}

export function useTween(target, k = 0.12) {
  const [v, setV] = useState(target)
  const cur = useRef(target)
  useEffect(() => {
    let raf = 0
    const run = () => {
      cur.current += (target - cur.current) * k
      if (Math.abs(target - cur.current) < 0.001) cur.current = target
      setV(cur.current)
      if (cur.current !== target) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [target, k])
  return v
}
