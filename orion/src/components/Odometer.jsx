import { useEffect, useRef, useState } from 'react'

const STRIP = Array.from({ length: 40 }, (_, i) => i % 10)

// One rolling digit. It always rolls forward (downwards through the strip)
// at least one full turn when it changes, like the source video, then quietly
// rewinds to the first ten digits so the strip never runs out.
function Digit({ digit, delay }) {
  const [pos, setPos] = useState(0)
  const [animate, setAnimate] = useState(true)
  const target = useRef(digit)

  useEffect(() => {
    target.current = digit
    const id = setTimeout(() => {
      setAnimate(true)
      setPos((p) => {
        const current = p % 10
        if (current === digit && p !== 0) return p
        return p + ((digit - current + 10) % 10) + 10
      })
    }, delay)
    return () => clearTimeout(id)
  }, [digit, delay])

  const onEnd = () => {
    if (pos >= 10) {
      setAnimate(false)
      setPos(target.current)
    }
  }

  return (
    <span className="odo-digit">
      <span
        className="odo-strip"
        onTransitionEnd={onEnd}
        style={{
          transform: `translateY(${-pos * 2.5}%)`,
          transition: animate ? undefined : 'none',
        }}
      >
        {STRIP.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </span>
    </span>
  )
}

export function Odometer({ value, format = (n) => n.toLocaleString('en-US'), delay = 0, className = '' }) {
  const text = format(value)
  const chars = [...text]
  return (
    <span className={`odo ${className}`} role="text" aria-label={text}>
      {chars.map((ch, i) => {
        const fromRight = chars.length - i
        return /\d/.test(ch) ? (
          <Digit key={`d${fromRight}`} digit={Number(ch)} delay={delay + fromRight * 35} />
        ) : (
          <span key={`s${fromRight}`} className="odo-sep" aria-hidden="true">
            {ch}
          </span>
        )
      })}
    </span>
  )
}
