import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-=+*#';

// Text that decodes from random glyphs into the target string whenever `text` changes.
export default function ScrambleText({ text, duration = 700, className, as: Tag = 'span' }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = out;
    const len = Math.max(from.length, text.length);
    cancelAnimationFrame(raf.current);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      let s = '';
      for (let i = 0; i < len; i++) {
        const reveal = i / len < t * 1.15 - 0.15;
        if (reveal) s += text[i] ?? '';
        else if (t < 0.12 && from[i]) s += from[i];
        else s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s.slice(0, Math.max(text.length, Math.round(len * (1 - t) + text.length * t))));
      if (t < 1) raf.current = requestAnimationFrame(step); else setOut(text);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return <Tag className={className}>{out}</Tag>;
}
