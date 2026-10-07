import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth.js'

export default function ThawText({ as: Tag = 'p', text, className = '', start = 'top 80%', end = 'bottom 45%' }) {
  const ref = useRef(null)

  useEffect(() => {
    const words = ref.current.querySelectorAll('.thaw-word')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.16, filter: 'blur(7px)', color: '#ffffff' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          color: '#c4d9e6',
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start, end, scrub: 0.6 },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [start, end])

  const parts = text.split(/(\s+)/)
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/[*]/g, '')}>
      {parts.map((w, i) =>
        /\s+/.test(w) ? (
          w
        ) : (
          <span key={i} className={`thaw-word ${w.startsWith('*') ? 'hot' : ''}`} aria-hidden="true">
            {w.replace(/[*]/g, '')}
          </span>
        )
      )}
    </Tag>
  )
}
