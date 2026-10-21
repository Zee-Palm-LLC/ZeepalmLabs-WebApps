import Logo from './Logo.jsx';
import { NAV } from '../data/content.js';
import { useStore, store } from '../lib/store.js';
import { startAudio, stopAudio, tick } from '../lib/audio.js';
import { getLenis } from '../lib/scroll.js';

const TARGETS = { Programs: '#works', Coaching: '#service', Club: '#labs', About: '#about' };

export default function Header() {
  const theme = useStore((s) => s.theme);
  const sound = useStore((s) => s.sound);
  const go = (e, href) => { e.preventDefault(); tick(2200); getLenis()?.scrollTo(href, { duration: 1.8 }); };
  const toggleSound = () => { const on = !sound; store.set({ sound: on }); on ? startAudio() : stopAudio(); };
  return (
    <header className={`header ${theme === 'light' ? 'on-light' : ''}`}>
      <Logo />
      <nav className="nav">
        {NAV.map((n) => (
          <a key={n} href={TARGETS[n]} onClick={(e) => go(e, TARGETS[n])} onMouseEnter={() => tick(2600, 0.03, 0.03)}>{n}</a>
        ))}
      </nav>
      <div className="header-right">
        <a className="pill" href="#contact" onClick={(e) => go(e, '#contact')}>Start free trial</a>
        <button className={`sound-toggle ${sound ? 'on' : ''}`} onClick={toggleSound} aria-label={sound ? 'Mute sound' : 'Enable sound'}>
          <i /><i /><i /><i />
        </button>
      </div>
    </header>
  );
}
