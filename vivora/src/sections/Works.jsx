import { useEffect, useRef, useState } from 'react';
import { useSectionProgress } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { P } from '../lib/progress.js';
import { WORKS } from '../data/content.js';
import ScrambleText from '../components/ScrambleText.jsx';

export function WorksIntro() {
  const ref = useRef(null);
  useSectionProgress(ref, { onUpdate: (p) => { P.worksIntro = p; } });
  useSectionMeta(ref, { theme: 'dark', index: 1 });
  return <section className="sec works-intro" ref={ref} style={{ height: '300vh', zIndex: 1 }}><div className="sticky" /></section>;
}

// Pinned works reel: the ring of cards is on the stage; this renders the info panel that decodes per project.
export default function Works() {
  const ref = useRef(null);
  const { velocity } = useSectionProgress(ref, { onUpdate: (p) => { P.works = p; } });
  useSectionMeta(ref, { theme: 'dark', index: 1 });
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let raf;
    const loop = () => {
      P.velocity = velocity.current;
      const idx = Math.round(Math.min(WORKS.length - 1, Math.max(0, P.works * (WORKS.length - 0.6) - 0.15)));
      setI(idx);
      setShown(P.worksIntro > 0.93 && P.works < 0.995);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [velocity]);
  const w = WORKS[i];
  return (
    <section id="works" className="sec works" ref={ref} style={{ height: `${100 + WORKS.length * 70}vh`, zIndex: 1 }}>
      <div className="sticky">
        <div className="work-info" style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(20px)', transition: 'opacity .6s, transform .8s cubic-bezier(.22,1,.36,1)' }}>
          <div className="date"><ScrambleText text={w.date} duration={500} /><span className="note">{w.note}</span></div>
          <ScrambleText as="div" className="title" text={w.title} duration={800} />
          <ScrambleText as="div" className="sub" text={w.sub} duration={650} />
          <div className="tags">{w.tags.map((t) => <span key={t + i}>{t}</span>)}</div>
        </div>
        <a className="more-works" href="#works" style={{ opacity: shown ? 1 : 0, transition: 'opacity .6s' }}>All programs <span aria-hidden>↗</span></a>
      </div>
    </section>
  );
}
