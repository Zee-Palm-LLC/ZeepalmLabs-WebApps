import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { store } from './store.js';

// While a section is under the header, set the header/side-index theme and the active index tick.
export function useSectionMeta(ref, { theme = 'dark', index }) {
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const apply = () => store.set({ theme, ...(index !== undefined ? { index } : {}) });
    const st = ScrollTrigger.create({ trigger: el, start: 'top 60px', end: 'bottom 60px', onEnter: apply, onEnterBack: apply });
    return () => st.kill();
  }, [ref, theme, index]);
}
