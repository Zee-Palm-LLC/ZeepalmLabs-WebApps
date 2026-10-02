import { createContext, forwardRef, useContext } from 'react'
import { squircleClip, squirclePath } from './squircle.js'

const Origin = createContext({ x: 0, y: 0, dw: 0, dh: 0 })

export function SqBg({ w, h, r, sm = 1, className = '' }) {
  return (
    <svg className={`sq-bg ${className}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={squirclePath(w, h, r, sm)} />
    </svg>
  )
}

export const Card = forwardRef(function Card(
  { x, y, w, h, px, py, dw = 0, dh = 0, r = 28.5, sm = 1, bg = true, className = '', style, children, as: Tag = 'div', ...rest },
  ref
) {
  const W = w + dw
  const Hh = h + dh
  return (
    <Origin.Provider value={{ x, y, dw, dh }}>
      <Tag ref={ref} className={`card ${className}`} style={{ left: px ?? x, top: py ?? y, width: W, height: Hh, ...style }} {...rest}>
        {bg ? <SqBg w={W} h={Hh} r={r} sm={sm} className="card-bg" /> : null}
        {children}
      </Tag>
    </Origin.Provider>
  )
})

export const Layer = forwardRef(function Layer({ x, y, w, h, sq, ra, dw: ldw = 0, className = '', style, children, as: Tag = 'div', ...rest }, ref) {
  const o = useContext(Origin)
  const W = (w ?? 0) + ldw
  return (
    <Origin.Provider value={{ x, y, dw: ldw, dh: 0 }}>
      <Tag ref={ref} className={`layer ${className}`} style={{ left: x - o.x + (ra ? o.dw : 0), top: y - o.y, width: w == null ? undefined : W, height: h, ...style }} {...rest}>
        {sq ? <SqBg w={W} h={h} r={sq[0]} sm={sq[1] ?? 1} /> : null}
        {children}
      </Tag>
    </Origin.Provider>
  )
})

export const At = forwardRef(function At({ x, y, w, h, sq, clip, ra, ca, ba, sw, className = '', style, children, as: Tag = 'div', ...rest }, ref) {
  const o = useContext(Origin)
  const shift = ra ? o.dw : ca ? o.dw / 2 : 0
  const W = w == null ? w : w + (sw ? o.dw : 0)
  const st = { left: x - o.x + shift, top: y - o.y + (ba ? o.dh : 0), width: W, height: h, ...style }
  if (clip) st.clipPath = squircleClip(W, h, clip[0], clip[1] ?? 1)
  return (
    <Tag ref={ref} className={`at ${className}`} style={st} {...rest}>
      {sq ? <SqBg w={W} h={h} r={sq[0]} sm={sq[1] ?? 1} /> : null}
      {children}
    </Tag>
  )
})

export const T = forwardRef(function T({ x, r, cx, b, s, w = 400, c, ls, lh, ra, ba, className = '', style, children, as: Tag = 'span', ...rest }, ref) {
  const o = useContext(Origin)
  const dy = ba ? o.dh : 0
  const st = { top: b - o.y - 0.85 * s + dy, fontSize: s, fontWeight: w, color: c, letterSpacing: ls, ...style }
  if (lh) {
    st.lineHeight = `${lh}px`
    st.top = b - o.y - (lh - 1.2 * s) / 2 - 0.95 * s + dy
  }
  if (r != null) {
    st.left = r - o.x - 600 + o.dw
    st.width = 600
    st.textAlign = 'right'
  } else if (cx != null) {
    st.left = cx - o.x - 300 + o.dw / 2
    st.width = 600
    st.textAlign = 'center'
  } else {
    st.left = x - o.x + (ra ? o.dw : 0)
  }
  return (
    <Tag ref={ref} className={`t ${className}`} style={st} {...rest}>
      {children}
    </Tag>
  )
})

export function useOrigin() {
  return useContext(Origin)
}
