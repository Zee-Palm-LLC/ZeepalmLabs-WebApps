import { useLayoutEffect, useRef } from 'react';
import { useSectionProgress, range, easeOut, easeInOut, lerp } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { zPath } from '../lib/zMark.js';

// Construction guides for the footer artboard (1440×900, slice)
const VERT = [118, 210, 262, 520, 655, 760, 958, 1006, 1062, 1110, 1158, 1240, 1300, 1356];
const HORZ = [250, 335, 420, 470, 600, 640];
const DIAG = [[-80, -40, 520, 900], [-40, -40, 560, 900], [0, -40, 600, 900], [560, -40, -40, 900], [600, -40, 0, 900]];

export default function Outro() {
  const ref = useRef(null); const ui = useRef(null);
  const lens = useRef([]);
  useLayoutEffect(() => {
    lens.current = [...ui.current.querySelectorAll('[data-draw]')].map((el) => { const l = el.getTotalLength(); el.style.strokeDasharray = l; el.style.strokeDashoffset = l; return l; });
  }, []);
  useSectionProgress(ref, {
    onUpdate: (p) => {
      const el = ui.current; if (!el) return;
      const markIn = easeOut(range(p, 0.0, 0.22));
      const move = easeInOut(range(p, 0.34, 0.6));
      const mark = el.querySelector('.outro-mark');
      mark.style.opacity = String(markIn);
      mark.style.transform = `translate(-50%, -50%) translateY(${lerp(0, -2, move)}vh) scale(${lerp(0.82, 1, markIn) * lerp(1, 0.86, move)})`;
      const word = el.querySelector('.outro-word');
      const w = easeOut(range(p, 0.38, 0.62));
      word.style.opacity = String(w); word.style.transform = `translate(-50%, -50%) translateX(${(1 - w) * 18}vw)`;
      el.querySelectorAll('[data-draw]').forEach((path, i) => { const t = easeInOut(range(p, 0.28 + (i % 9) * 0.015, 0.55 + (i % 9) * 0.015)); path.style.strokeDashoffset = String(lens.current[i] * (1 - t)); });
      const f = easeOut(range(p, 0.6, 0.78));
      el.querySelectorAll('.f-in').forEach((n) => { n.style.opacity = String(f); n.style.transform = `translateY(${(1 - f) * 16}px)`; });
    },
  });
  useSectionMeta(ref, { theme: 'dark', index: 5 });
  return (
    <section id="contact" className="sec outro" ref={ref} style={{ height: '260vh', background: 'var(--bg)', zIndex: 2 }}>
      <div className="sticky" ref={ui}>
        <svg className="outro-lines" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="rgba(255,255,255,.32)" strokeWidth="1">
          {VERT.map((x) => <path key={`v${x}`} data-draw d={`M${x} 0 V900`} />)}
          {HORZ.map((y, i) => <path key={`h${y}`} data-draw d={`M${i % 2 ? 1440 : 0} ${y} H${i % 2 ? 0 : 1440}`} />)}
          {DIAG.map(([a, b, c, d], i) => <path key={`d${i}`} data-draw d={`M${a} ${b} L${c} ${d}`} />)}
          <path data-draw d="M720 250 a170 170 0 1 1 -0.1 0" stroke="rgba(255,255,255,.18)" />
        </svg>
        <div className="outro-word">VIVORA</div>
        <svg className="outro-mark" viewBox="0 0 100 100" aria-hidden="true"><path d={zPath} fill="#fff" /></svg>

        <nav className="footer-nav f-in">
          <a href="#top">Top</a><a href="#about">About</a><span>Follow ▾</span>
          <a href="#works">Programs</a><a href="#labs">vivoclub</a><span className="lk"><a href="#instagram">Instagram</a><a href="#tiktok">TikTok</a></span>
          <a href="#service">Coaching</a><a href="#contact">Contact</a><span className="lk"><a href="#strava">Strava</a>&nbsp;&nbsp;<a href="#youtube">YouTube</a></span>
        </nav>
        <div className="footer-right f-in">
          <div className="row"><a href="mailto:hello@vivora.fit">Free trial<span className="circ">↗</span></a><a href="#careers">Become a coach<span className="circ">↗</span></a></div>
          <div className="row" style={{ gap: 18, fontSize: 11, color: 'rgba(255,255,255,.7)' }}><a href="#privacy">Privacy Policy</a><a href="#license">License</a></div>
        </div>
        <div className="copyright f-in">©2026 VIVORA Fitness, Inc.</div>
      </div>
    </section>
  );
}
