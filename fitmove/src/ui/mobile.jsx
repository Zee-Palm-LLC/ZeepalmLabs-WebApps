import { useSyncExternalStore } from 'react'

const FILM = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('film')
const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1099.98px)') : null
const subscribe = (cb) => {
  if (!mq) return () => {}
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useCompact() {
  return useSyncExternalStore(subscribe, () => !FILM && !!mq && mq.matches)
}

export const MW = 380

export function MBlock({ i = 0, className = '', children, ...rest }) {
  const y = 100 + i * 4000
  return (
    <section className={`mblock ${className}`} data-y={y} style={{ left: 256, top: y, width: MW }} data-pi {...rest}>
      {children}
    </section>
  )
}
