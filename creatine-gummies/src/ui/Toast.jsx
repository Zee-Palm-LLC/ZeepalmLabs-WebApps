import { useEffect, useState } from 'react'
import { Fruit, Icon } from './art.jsx'
import './toast.css'

export default function Toast({ toast, cart }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!toast) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 2600)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  const { f } = toast
  return (
    <div className={`toast ${show ? 'in' : ''}`} role="status" aria-live="polite" style={{ '--acc': f.accent }}>
      <span className="toast-ic" key={toast.id}>
        <Fruit kind={f.fruit} size={34} />
      </span>
      <span className="toast-t">
        <b>{f.name}</b>
        <small>Added to cart · $5</small>
      </span>
      <span className="toast-c">
        <Icon name="cart" size={18} />
        <i key={cart}>{cart}</i>
      </span>
    </div>
  )
}
