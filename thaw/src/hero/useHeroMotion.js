import { useEffect } from 'react'
import { createStage } from './stage.js'
import { playIntro, startIdle } from './intro.js'
import { gsap, ScrollTrigger } from '../lib/smooth.js'
import { W, H } from './layout.js'

const fillFit = (r) => {
  const s = Math.min(r.width / W, r.height / H)
  return { s, ox: Math.max(0, (r.width - W * s) / 2), oy: 0 }
}

export function useHeroMotion(wrap, root, canvas, mode) {
  useEffect(() => {
    const hint = document.createElement('div')
    hint.className = 'drag-hint mono'
    hint.textContent = 'Drag to turn'
    document.body.appendChild(hint)
    const stage = createStage(canvas.current, {
      fit: mode === 'mobile' ? undefined : fillFit,
      onHover: (on, x, y, dragging) => {
        hint.classList.toggle('on', on && mode !== 'mobile')
        hint.classList.toggle('dragging', dragging)
        hint.style.transform = `translate(${x + 18}px, ${y + 18}px)`
      },
    })
    const still = new URLSearchParams(window.location.search).has('still')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = document.querySelectorAll('.nav [data-a="nav"], .nav-mark, .nav-glass, .nav-burger')
    let stopIdle = () => {}
    let tl = null
    if (still || reduce) {
      stage.settle()
      if (!still) stopIdle = startIdle(root.current)
    } else {
      tl = playIntro(root.current, stage, nav)
      tl.eventCallback('onComplete', () => {
        stopIdle = startIdle(root.current)
      })
    }
    const el = root.current
    const words = {
      clarity: el.querySelector('.w-clarity'),
      begins: el.querySelector('.w-begins'),
      here: el.querySelector('.w-here'),
    }
    const left = mode === 'mobile' ? null : el.querySelector('.grp-left')
    const right = mode === 'mobile' ? null : el.querySelector('.grp-right')
    const push = mode === 'mobile' ? 90 : 260
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        stage.state.drip = p
        stage.state.lift = p
        stage.state.fade = 1 - p * 0.35
        gsap.set(words.clarity, { x: -p * push })
        gsap.set([words.begins, words.here], { x: p * push })
        if (left) gsap.set(left, { y: -p * 90, opacity: 1 - p * 1.4 })
        if (right) gsap.set(right, { y: -p * 140, opacity: 1 - p * 1.4 })
      },
    })
    return () => {
      tl?.kill()
      stopIdle()
      st.kill()
      stage.destroy()
      hint.remove()
    }
  }, [wrap, root, canvas, mode])
}
