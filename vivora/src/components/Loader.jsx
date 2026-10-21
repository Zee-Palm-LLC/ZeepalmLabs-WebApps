import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Z_POINTS } from '../lib/zMark.js';
import { TAGLINE } from '../data/content.js';
import { startAudio } from '../lib/audio.js';
import { store } from '../lib/store.js';

// Construction-line intro, laid out on a 1440×900 artboard (scaled with `slice`).
const BX = 510, BY = 180, BW = 420, BH = 400;
const P = Z_POINTS.map(([x, y]) => [BX + (x / 100) * BW, BY + (y / 100) * BH]);
const zOutline = 'M' + P.map((p) => p.join(' ')).join(' L') + ' Z';

function longLine(a, b, ext = 1400) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); const ux = dx / l, uy = dy / l;
  return [a[0] - ux * ext, a[1] - uy * ext, b[0] + ux * ext, b[1] + uy * ext];
}
function triple(a, b, gap = 7) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); const nx = -dy / l, ny = dx / l;
  return [-gap, 0, gap].map((o) => longLine([a[0] + nx * o, a[1] + ny * o], [b[0] + nx * o, b[1] + ny * o]));
}
// cross construction: triple guides along both arms + a faint diagonal X through the centre
const DIAG = [...triple(P[0], P[6]), ...triple(P[4], P[5]), ...triple(P[1], P[2], 5)];
const MIRROR = [...triple(P[3], P[2], 5)];
const H_LINES = [P[0][1], 260, 330, P[2][1], P[5][1], P[5][1] + 14, P[5][1] + 22, P[5][1] + 30];
const V_LINES = [477, 963];

export default function Loader({ onChoose, onDone }) {
  const root = useRef(null);
  const tl = useRef(null);

  useLayoutEffect(() => {
    document.body.classList.add('is-loading');
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      q('[data-draw]').forEach((el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); });
      gsap.set(q('.bar'), { yPercent: 100 });
      gsap.set(q('.tag'), { opacity: 0 });
      const t = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      t.to(q('.v [data-draw]'), { strokeDashoffset: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(q('.h [data-draw]'), { strokeDashoffset: 0, duration: 1.3, stagger: 0.06 }, 0.15)
        .to(q('.c [data-draw]'), { strokeDashoffset: 0, duration: 1.8, stagger: 0.2, ease: 'power2.inOut' }, 0.3)
        .to(q('.d [data-draw]'), { strokeDashoffset: 0, duration: 1.5, stagger: 0.05 }, 0.55)
        .to(q('.s [data-draw]'), { strokeDashoffset: 0, duration: 1.0, stagger: 0.08 }, 1.1)
        .to(q('.tag'), { opacity: 1, duration: 0.6, ease: 'none' }, 1.2)
        .fromTo(q('.tag'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'steps(46)' }, 1.2)
        .to(q('.progress'), { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 2.0)
        .to(q('.z [data-draw]'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 2.6)
        .to(q('.tag'), { opacity: 0.35, duration: 0.5 }, 3.4)
        .to(q('.bar'), { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 3.5);
      tl.current = t;
    }, root);
    return () => { ctx.revert(); document.body.classList.remove('is-loading'); };
  }, []);

  const choose = (sound) => {
    store.set({ sound });
    if (sound) startAudio();
    onChoose && onChoose();
    const q = gsap.utils.selector(root);
    gsap.timeline({ onComplete: () => { document.body.classList.remove('is-loading'); onDone(); } })
      .to(q('.bar'), { yPercent: 100, duration: 0.6, ease: 'expo.in' }, 0)
      .to(q('.tag'), { opacity: 0, duration: 0.3 }, 0)
      .to(q('.z path'), { fill: '#fff', duration: 0.35, ease: 'power2.out' }, 0.25)
      .to(q('.guides'), { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0.35)
      .to(q('.z'), { scale: 1.08, transformOrigin: '720px 380px', duration: 0.9, ease: 'expo.inOut' }, 0.5)
      .to(root.current, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 1.0);
  };

  useEffect(() => () => tl.current && tl.current.kill(), []);

  return (
    <div className="loader" ref={root}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fff" strokeWidth="1">
        <g className="guides">
          <g className="v" opacity="0.5">{V_LINES.map((x) => <path key={x} data-draw d={`M${x} 0 V900`} />)}</g>
          <g className="h" opacity="0.6">{H_LINES.map((y, i) => <path key={i} data-draw d={`M${i % 2 ? 1285 : 155} ${y} H${i % 2 ? 155 : 1285}`} strokeOpacity={i > 4 ? 0.55 : 0.8} />)}</g>
          <g className="c" opacity="0.35">
            <path data-draw d="M720 110 a270 270 0 1 1 -0.1 0" />
            <path data-draw d="M720 245 a135 135 0 1 0 0.1 0" />
          </g>
          <g className="s" opacity="0.28">
            {[0, 72, 144, 216, 288].map((a) => { const r = 270; const x = 720 + Math.sin((a * Math.PI) / 180) * r; const y = 380 - Math.cos((a * Math.PI) / 180) * r; return <path key={a} data-draw d={`M720 380 L${x.toFixed(1)} ${y.toFixed(1)}`} />; })}
            <path data-draw d="M720 110 V650" strokeDasharray="2 4" />
          </g>
          <g className="d" opacity="0.75">
            {[...DIAG, ...MIRROR].map(([x1, y1, x2, y2], i) => <path key={i} data-draw d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} />)}
          </g>
          <path className="progress" d={`M${P[6][0]} ${P[6][1]} H${P[5][0]}`} stroke="#d4ff3a" strokeWidth="2" strokeDasharray="110" strokeDashoffset="110" />
        </g>
        <g className="z"><path data-draw d={zOutline} strokeWidth="1.6" strokeLinejoin="miter" /></g>
      </svg>
      <div className="tag">{TAGLINE}</div>
      <div className="bar">
        <div className="snd"><b>▲</b>sound</div>
        <div className="msg">This site includes sound. Would you like to turn it on?</div>
        <div className="acts">
          <button className="pill" onClick={() => choose(true)}>Turn sound on</button>
          <button className="link" onClick={() => choose(false)}>Continue without sound</button>
        </div>
      </div>
    </div>
  );
}
