import { zPath } from '../lib/zMark.js';

export function ZMark({ size = 22, fill = 'currentColor', stroke, strokeWidth = 1 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d={zPath} fill={stroke ? 'none' : fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Logo() {
  return (
    <a className="logo" href="#top" aria-label="VIVORA home">
      <ZMark size={22} />
      <span className="word">VIVORA</span>
    </a>
  );
}
