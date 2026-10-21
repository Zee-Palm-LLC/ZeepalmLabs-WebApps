import { INDEX } from '../data/content.js';
import { useStore } from '../lib/store.js';

// Left scroll index: a labelled major tick per section with minor ticks between, as on the reference.
export default function SideIndex() {
  const active = useStore((s) => s.index);
  const theme = useStore((s) => s.theme);
  return (
    <div className={`side-index ${theme === 'light' ? 'on-light' : ''}`} aria-hidden="true">
      {INDEX.map((label, i) => (
        <div key={label} style={{ display: 'contents' }}>
          <div className={`tick ${active === i ? 'active' : ''}`}><span>{label}</span></div>
          {i < INDEX.length - 1 && [0, 1, 2].map((k) => <div key={k} className="tick minor" />)}
        </div>
      ))}
    </div>
  );
}
