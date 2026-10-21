import { useRef } from 'react';
import { useSectionProgress } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { P } from '../lib/progress.js';
import { MaterialGui, NewsList } from '../components/Hud.jsx';
import Crosses from '../components/Crosses.jsx';
import { ECG } from '../components/Hud.jsx';

// Heartbeat trace across the hero (1440-wide artboard, four beats)
const PULSE = (() => { let d = ''; for (let x = 0; x <= 1440; x += 3) { const y = 70 - ECG(x / 360) * 58; d += (x ? ' L' : 'M') + x + ' ' + y.toFixed(1); } return d; })();

// Hero overlay. The 3D content lives on the fixed stage; this section only drives P.hero and hosts the HUD.
export default function Hero() {
  const ref = useRef(null);
  useSectionProgress(ref, { onUpdate: (p) => { P.hero = p; } });
  useSectionMeta(ref, { theme: 'dark', index: 0 });
  const drag = useRef(null);
  const onDown = (e) => { if (e.target.closest('.hud')) return; drag.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e) => { if (!drag.current) return; window.dispatchEvent(new CustomEvent('prism-drag', { detail: { dx: e.clientX - drag.current.x, dy: e.clientY - drag.current.y } })); drag.current = { x: e.clientX, y: e.clientY }; };
  const onUp = () => { drag.current = null; };
  return (
    <section id="top" className="sec hero" ref={ref} style={{ height: '200vh', zIndex: 1 }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <div className="sticky hero-ui" style={{ cursor: 'grab' }}>
        <Crosses cols={6} rows={4} offsetX={0.08} offsetY={0.12} stepX={0.168} stepY={0.25} color="rgba(212,255,58,.45)" />
        <svg className="pulse-line" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="pl" x1="0" x2="1"><stop offset="0" stopColor="#d4ff3a" stopOpacity="0" /><stop offset=".7" stopColor="#d4ff3a" /><stop offset="1" stopColor="#ffffff" /></linearGradient></defs>
          <path className="bed" d={PULSE} />
          <path d={PULSE} />
        </svg>
        <MaterialGui />
        <NewsList />
      </div>
    </section>
  );
}
