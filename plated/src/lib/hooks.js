import { useEffect, useRef, useState } from 'react'

export function useTween(target, dur = 650) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  const cur = useRef(target)
  useEffect(() => {
    from.current = cur.current
    const t0 = performance.now()
    let raf = 0
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      const val = from.current + (target - from.current) * e
      cur.current = val
      setV(val)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, dur])
  return v
}

export function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

export const em = (id) => `/em/${id}.webp`
