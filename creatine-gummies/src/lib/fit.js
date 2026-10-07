import { useLayoutEffect, useState } from 'react'

export const W = 1440
export const MW = 430
export const MOBILE = 768

export function fitFor(h, minH = 640) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const s = Math.min(vw / W, Math.max(vh, minH) / h)
  return { s, ox: Math.max(0, (vw - W * s) / 2), h: h * s, vw, vh }
}

export function stageFor(h, minH = 640, mH = 0) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw < MOBILE) {
    const s = vw / MW
    const H = Math.max(mH, vh / s)
    return { m: true, s, ox: 0, oy: 0, W: MW, H, h: H * s, vw, vh }
  }
  const f = fitFor(h, minH)
  return { m: false, s: f.s, ox: f.ox, oy: (vh - h * f.s) / 2, W, H: h, h: f.h, vw, vh }
}

export function useFit(h, minH) {
  const [v, setV] = useState(() => fitFor(h, minH))
  useLayoutEffect(() => {
    const on = () => setV(fitFor(h, minH))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [h, minH])
  return v
}

export function useStage(h, minH, mH) {
  const [v, setV] = useState(() => stageFor(h, minH, mH))
  useLayoutEffect(() => {
    const on = () => setV(stageFor(h, minH, mH))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [h, minH, mH])
  return v
}
