import { useEffect, useState } from 'react'
import { em } from '../lib/hooks.js'

export default function Chef({ line, mood, compact }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    let i = 0
    setShown('')
    const id = setInterval(() => {
      i += 1
      setShown(line.text.slice(0, i))
      if (i >= line.text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [line])

  return (
    <div className={`chef${compact ? ' chef--compact' : ''}`}>
      <div className="chef__who">
        <img className="chef__img" src={em('chef')} alt="" />
        <img key={mood} className="chef__mood" src={em(mood)} alt="" />
      </div>
      <div className="chef__bubble" aria-live="polite">
        <span className="chef__name">Chef Remy</span>
        <p>
          {shown}
          <span className="chef__ghost">{line.text.slice(shown.length)}</span>
        </p>
      </div>
    </div>
  )
}
