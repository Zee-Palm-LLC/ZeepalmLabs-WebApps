import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import Loader from './components/Loader.jsx';
import Header from './components/Header.jsx';
import SideIndex from './components/SideIndex.jsx';
import { VitalsPanel } from './components/Hud.jsx';
import Stage from './gl/Stage.jsx';
import Hero from './sections/Hero.jsx';
import Works, { WorksIntro } from './sections/Works.jsx';
import About from './sections/About.jsx';
import Services, { ServiceIntro } from './sections/Services.jsx';
import Labs from './sections/Labs.jsx';
import Outro from './sections/Outro.jsx';
import { useSmoothScroll } from './lib/scroll.js';
import { fontsReady } from './lib/textures.js';
import { P } from './lib/progress.js';
import { useStore } from './lib/store.js';

export default function App() {
  const [fonts, setFonts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  useEffect(() => { fontsReady().then(() => setFonts(true)); window.scrollTo(0, 0); }, []);
  // Dev aid: /?skipintro jumps straight to the hero (used for visual QA)
  useEffect(() => {
    if (!fonts || !new URLSearchParams(location.search).has('skipintro')) return;
    setEntered(true); setLoading(false); P.intro = 1;
    // /?skipintro&at=works:0.5 → jump to 50% through the #works section
    const at = new URLSearchParams(location.search).get('at');
    if (at) setTimeout(() => {
      const [id, f = '0'] = at.split(':'); const el = document.querySelector(`section.${id}, #${id}`);
      if (el) { const y = el.offsetTop + parseFloat(f) * (el.offsetHeight - innerHeight); window.scrollTo(0, y); }
    }, 300);
  }, [fonts]);
  useSmoothScroll(entered);
  const theme = useStore((s) => s.theme);

  const onChoose = useCallback(() => setEntered(true), []);
  const onDone = useCallback(() => {
    setLoading(false);
    gsap.to(P, { intro: 1, duration: 1.6, ease: 'expo.out' });
    gsap.fromTo('.header > *, .side-index', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo('.hud', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', delay: 0.35 });
  }, []);

  // Quaternion panel only belongs to the dark WebGL run (hero → works)
  const [quatVisible, setQuatVisible] = useState(true);
  useEffect(() => { let raf; const loop = () => { setQuatVisible(P.stageActive && P.works < 0.98); raf = requestAnimationFrame(loop); }; loop(); return () => cancelAnimationFrame(raf); }, []);

  return (
    <>
      {fonts && <Stage />}
      <Header />
      <SideIndex />
      <div style={{ position: 'fixed', inset: 0, zIndex: 30, pointerEvents: 'none', opacity: quatVisible && theme === 'dark' ? 1 : 0, transition: 'opacity .5s' }}>
        <div style={{ pointerEvents: 'auto' }}><VitalsPanel /></div>
      </div>
      <main>
        <Hero />
        <WorksIntro />
        <Works />
        <About />
        <ServiceIntro />
        <Services />
        <Labs />
        <Outro />
      </main>
      {loading && fonts && <Loader onChoose={onChoose} onDone={onDone} />}
    </>
  );
}
