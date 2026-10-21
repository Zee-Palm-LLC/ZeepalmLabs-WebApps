import { useRef } from 'react';
import { useSectionProgress, range, easeOut } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { LABS } from '../data/content.js';

// vivoclub — the members club panel (the reference's "stellla" block).
export default function Labs() {
  const ref = useRef(null); const ui = useRef(null);
  useSectionProgress(ref, {
    onUpdate: (p) => {
      const el = ui.current; if (!el) return;
      const t = easeOut(range(p, 0.05, 0.3));
      el.style.setProperty('--in', t);
      el.querySelectorAll('.labs-word h2 .ch').forEach((c, i) => { const k = easeOut(range(p, 0.05 + i * 0.025, 0.25 + i * 0.025)); c.style.transform = `translateY(${(1 - k) * 105}%)`; });
      el.querySelector('.labs-bg').style.transform = `scale(${1.15 - p * 0.15})`;
      el.querySelector('.labs-photo').style.transform = `scale(${1.12 - p * 0.1}) translateY(${(0.5 - p) * 3}%)`;
    },
  });
  useSectionMeta(ref, { theme: 'dark', index: 4 });
  return (
    <section id="labs" className="sec labs" ref={ref} style={{ height: '220vh', background: 'var(--bg)', zIndex: 2 }}>
      <div className="sticky" ref={ui} style={{ '--in': 0 }}>
        <div className="labs-photo" style={{ backgroundImage: `url(${LABS.bg})` }} />
        <div className="labs-bg"><i /><i /><i /><i /></div>
        <div className="labs-frame"><b /><b /><b /><b /></div>
        <div className="labs-word">
          <h2 aria-label="vivoclub">{'vivoclub'.split('').map((c, i) => <span key={i} className="mask"><span className="ch">{c}</span></span>)}</h2>
          <svg className="sparkle" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0 C53 40 60 47 100 50 C60 53 53 60 50 100 C47 60 40 53 0 50 C40 47 47 40 50 0Z" fill="#fff" /></svg>
          <a className="arrow" href="#labs" aria-label="Join vivoclub"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></a>
        </div>
        <div className="labs-body" style={{ opacity: 'var(--in)' }}>{LABS.body.map((l) => <div key={l}>{l}</div>)}</div>
        <div className="labs-side" style={{ opacity: 'var(--in)' }}>{LABS.side}</div>
      </div>
    </section>
  );
}
