import { createContext, forwardRef, useContext } from 'react'
import { squircleClip, squirclePath } from './squircle.js'

const Origin = createContext({ x: 0, y: 0 })

export function SqBg({ w, h, r, sm = 1, className = '' }) {
  return (
    <svg className={`sq-bg ${className}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={squirclePath(w, h, r, sm)} />
    </svg>
  )
}

export const Card = forwardRef(function Card({ x, y, w, h, r = 28.5, sm = 1, className = '', style, children, as: Tag = 'div', ...rest }, ref) {
  return (
    <Origin.Provider value={{ x, y }}>
      <Tag ref={ref} className={`card ${className}`} style={{ left: x, top: y, width: w, height: h, ...style }} {...rest}>
        <SqBg w={w} h={h} r={r} sm={sm} className="card-bg" />
        {children}
      </Tag>
    </Origin.Provider>
  )
})

export const Layer = forwardRef(function Layer({ x, y, w, h, sq, className = '', style, children, as: Tag = 'div', ...rest }, ref) {
  const o = useContext(Origin)
  return (
    <Origin.Provider value={{ x, y }}>
      <Tag ref={ref} className={`layer ${className}`} style={{ left: x - o.x, top: y - o.y, width: w, height: h, ...style }} {...rest}>
        {sq ? <SqBg w={w} h={h} r={sq[0]} sm={sq[1] ?? 1} /> : null}
        {children}
      </Tag>
    </Origin.Provider>
  )
})

export const At = forwardRef(function At({ x, y, w, h, sq, clip, className = '', style, children, as: Tag = 'div', ...rest }, ref) {
  const o = useContext(Origin)
  const st = { left: x - o.x, top: y - o.y, width: w, height: h, ...style }
  if (clip) st.clipPath = squircleClip(w, h, clip[0], clip[1] ?? 1)
  return (
    <Tag ref={ref} className={`at ${className}`} style={st} {...rest}>
      {sq ? <SqBg w={w} h={h} r={sq[0]} sm={sq[1] ?? 1} /> : null}
      {children}
    </Tag>
  )
})

export const T = forwardRef(function T({ x, r, cx, b, s, w = 400, c, ls, lh, className = '', style, children, as: Tag = 'span', ...rest }, ref) {
  const o = useContext(Origin)
  const st = { top: b - o.y - 0.85 * s, fontSize: s, fontWeight: w, color: c, letterSpacing: ls, ...style }
  if (lh) {
    st.lineHeight = `${lh}px`
    st.top = b - o.y - (lh - 1.2 * s) / 2 - 0.95 * s
  }
  if (r != null) {
    st.left = r - o.x - 600
    st.width = 600
    st.textAlign = 'right'
  } else if (cx != null) {
    st.left = cx - o.x - 300
    st.width = 600
    st.textAlign = 'center'
  } else {
    st.left = x - o.x
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
