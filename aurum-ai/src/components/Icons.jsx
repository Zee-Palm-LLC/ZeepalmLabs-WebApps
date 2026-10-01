const base = (size, props) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  ...props,
});

export function GoldDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dcaa" />
          <stop offset="0.5" stopColor="#d6ac72" />
          <stop offset="1" stopColor="#8f6a3f" />
        </linearGradient>
        <linearGradient id="goldSoft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d6a4" />
          <stop offset="1" stopColor="#b8925f" />
        </linearGradient>
        <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bff2ee" />
          <stop offset="1" stopColor="#5fb9b2" />
        </linearGradient>
        <linearGradient id="logoA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b783" />
          <stop offset="0.45" stopColor="#f7deb1" />
          <stop offset="1" stopColor="#9a7344" />
        </linearGradient>
        <linearGradient id="logoB" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e9c38e" />
          <stop offset="0.5" stopColor="#c99b62" />
          <stop offset="1" stopColor="#6e5233" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoMark({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M17 7.5h11.5a3.5 3.5 0 0 1 3.5 3.5v6.6h6.5a3.5 3.5 0 0 1 3.5 3.5v6.3"
        stroke="url(#logoA)"
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M31 40.5H19.5a3.5 3.5 0 0 1-3.5-3.5v-6.6H9.5A3.5 3.5 0 0 1 6 26.9v-6.3"
        stroke="url(#logoB)"
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M24 15.2c.9 5.4 3.4 7.9 8.8 8.8-5.4.9-7.9 3.4-8.8 8.8-.9-5.4-3.4-7.9-8.8-8.8 5.4-.9 7.9-3.4 8.8-8.8z" fill="#ffffff" />
    </svg>
  );
}

export function Hamburger() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <rect x="2" y="1.4" width="16.5" height="2.1" rx="1" fill="#f3d394" />
      <rect x="7" y="6.9" width="11.5" height="2.1" rx="1" fill="#c9ad86" />
      <rect x="7" y="12.4" width="11.5" height="2.1" rx="1" fill="#a99273" />
    </svg>
  );
}

export function NetworkIcon({ size = 24, active }) {
  const c = active ? "url(#goldSoft)" : "#eef3f2";
  return (
    <svg {...base(size)}>
      <g stroke={c} strokeWidth="1.5">
        <circle cx="12" cy="11.6" r="3" />
        <circle cx="5.2" cy="4.8" r="2" />
        <rect x="16.6" y="3" width="3.4" height="3.4" rx="1" />
        <circle cx="5.2" cy="18.6" r="2" />
        <circle cx="18.8" cy="18.6" r="2" />
        <path d="M6.6 6.2l3.2 3.2M17 6.4l-2.8 3M7 17l2.9-3.2M17.1 17l-2.9-3.2M12 14.6v3.2" />
        <circle cx="12" cy="19.6" r="1.4" fill={c} />
      </g>
    </svg>
  );
}

export function TreeIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <g stroke="#f1f5f4" strokeWidth="1.6">
        <circle cx="12" cy="4.6" r="2.1" />
        <circle cx="5.4" cy="18.6" r="2.3" />
        <circle cx="18.6" cy="18.6" r="2.3" />
        <path d="M12 6.7v4.4M5.4 16.3v-4.2a1 1 0 0 1 1-1h11.2a1 1 0 0 1 1 1v4.2" />
      </g>
    </svg>
  );
}

export function PlusIcon({ size = 22, color = "#eef3f2", width = 1.8 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 4.5v15M4.5 12h15" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M4.5 12h15" stroke="#eef3f2" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <path d="M3.5 5h17l-6.4 7.6v6.4l-4.2-1.9v-4.5z" stroke="#f1f5f4" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function SortIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <g stroke="#f1f5f4" strokeWidth="1.7" strokeLinecap="round">
        <path d="M8 6.5h6M5.6 11h8.4M3.4 15.5h10.6" />
        <path d="M18 5v14.5M14.7 16.4l3.3 3.3 3.3-3.3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function SparkFrameIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <g stroke="#f1f5f4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.6 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6.2" />
        <path d="M7.6 10.8h4.4M9.8 8.6v4.4" />
        <path d="M13.8 13.3v4M11.8 15.3h4M12.4 13.9l2.8 2.8M15.2 13.9l-2.8 2.8" strokeWidth="1.3" />
        <path d="M19.4 2.4v4M17.4 4.4h4" strokeWidth="1.2" />
        <circle cx="21.2" cy="8.4" r="0.6" fill="#f1f5f4" />
      </g>
    </svg>
  );
}

export function ThemeIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.6" stroke="url(#gold)" strokeWidth="1.8" />
      <path d="M12 5.6a6.4 6.4 0 0 1 0 12.8 6.4 6.4 0 0 1-6.1-4.4A6.4 6.4 0 0 0 12 5.6z" fill="url(#gold)" />
    </svg>
  );
}

export function SearchIcon({ size = 24 }) {
  return (
    <svg {...base(size)}>
      <circle cx="10.3" cy="10.3" r="6.1" stroke="url(#gold)" strokeWidth="1.9" />
      <path d="M14.8 14.8l5.4 5.4" stroke="url(#gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDown({ size = 18, color = "url(#gold)" }) {
  return (
    <svg {...base(size)}>
      <path d="M5.5 9l6.5 6.5L18.5 9" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ size = 18, color = "#dfe6e6" }) {
  return (
    <svg {...base(size)}>
      <path d="M9 5.5l6.5 6.5L9 18.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUp({ size = 14, color = "#e9eeee" }) {
  return (
    <svg {...base(size)}>
      <path d="M5.5 15l6.5-6.5 6.5 6.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ size = 14 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 6l12 12M18 6L6 18" stroke="#eef2f2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16, color = "#eef2f2" }) {
  return (
    <svg {...base(size)}>
      <path d="M7 17L17 7M8.5 7H17v8.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Briefcase({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M9 6.4V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2v1.2" stroke="#8ad8d2" strokeWidth="1.6" />
      <rect x="3" y="6.6" width="18" height="12.6" rx="2" fill="url(#teal)" />
      <rect x="3" y="11.6" width="18" height="1.3" fill="#1d4b49" />
      <rect x="10.4" y="10.6" width="3.2" height="3.2" rx="0.6" fill="#1d4b49" />
    </svg>
  );
}

export function GridCalc({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.8" fill="url(#teal)" />
      <rect x="6" y="5.5" width="12" height="3.6" rx="0.6" fill="#1d4b49" />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) => <rect key={`${col}${row}`} x={6.2 + col * 3} y={11 + row * 2.9} width="1.8" height="1.8" fill="#1d4b49" />)
      )}
    </svg>
  );
}

export function Gavel({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <g fill="url(#goldSoft)">
        <rect x="10.2" y="3" width="4.4" height="9.4" rx="1" transform="rotate(45 12.4 7.7)" />
        <rect x="8.8" y="10.4" width="2.4" height="10" rx="1.2" transform="rotate(-45 10 15.4)" />
        <rect x="3" y="19" width="10" height="2.2" rx="1" />
      </g>
    </svg>
  );
}

export function ShieldStar({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 2.8l7.6 3v5.4c0 4.6-3.2 8.4-7.6 10-4.4-1.6-7.6-5.4-7.6-10V5.8z" fill="url(#teal)" />
      <path d="M12 8.2l1.2 2.5 2.7.3-2 1.9.6 2.7-2.5-1.4-2.5 1.4.6-2.7-2-1.9 2.7-.3z" fill="#173f3d" />
    </svg>
  );
}

export function HalfCircle({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.3" stroke="#72c8c1" strokeWidth="1.8" />
      <path d="M12 3.7a8.3 8.3 0 0 1 0 16.6z" fill="url(#teal)" />
    </svg>
  );
}

export function Caduceus({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 46" fill="none" aria-hidden="true">
      <g stroke="url(#goldSoft)" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="22" cy="4.6" r="2.3" />
        <path d="M22 7v36" />
        <path d="M3 10.5c5 .4 10 .3 15.6-.4M41 10.5c-5 .4-10 .3-15.6-.4" strokeWidth="1.5" />
        <path d="M6.5 13.4c4 .2 7.6 0 11.4-.6M37.5 13.4c-4 .2-7.6 0-11.4-.6" />
        <path d="M10 16.2c2.8 0 5.4-.2 8-.6M34 16.2c-2.8 0-5.4-.2-8-.6" />
        <path d="M18.4 11.8c-3.4 2.8 7.2 5.2 3.6 8.4-3.6 3.2-7.4 5-3.6 8.4 3.8 3.4 7.2 5.2 3.6 8.4" />
        <path d="M25.6 11.8c3.4 2.8-7.2 5.2-3.6 8.4 3.6 3.2 7.4 5 3.6 8.4-3.8 3.4-7.2 5.2-3.6 8.4" />
      </g>
    </svg>
  );
}

export function CheckCircle({ size = 34 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="10.4" stroke="url(#goldSoft)" strokeWidth="0.75" />
      <path d="M6.8 12.2l3.6 3.4 7.4-10.2" stroke="url(#goldSoft)" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.4" cy="15.6" r="0.75" fill="#d9b67f" />
      <circle cx="17.8" cy="5.4" r="0.75" fill="#d9b67f" />
    </svg>
  );
}

export function DocIcon({ size = 34 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 2.8h8.6l4.2 4.2v14.2H6z" stroke="url(#goldSoft)" strokeWidth="0.85" strokeLinejoin="round" />
      <path d="M14.4 2.8V7h4.4" stroke="url(#goldSoft)" strokeWidth="0.85" />
      <path d="M8.4 9.6h7.8M8.4 11.8h7.8M8.4 14h7.8M8.4 16.2h7.8M8.4 18.4h7.8" stroke="url(#goldSoft)" strokeWidth="0.75" />
    </svg>
  );
}

export function CloudDots({ size = 34 }) {
  return (
    <svg {...base(size)}>
      <g stroke="url(#goldSoft)" strokeWidth="0.75">
        <path d="M6.6 20.2h11.6a3.6 3.6 0 0 0 .6-7.1 5 5 0 0 0-9.6-1.1 4.1 4.1 0 0 0-2.6 8.2z" />
        <rect x="9.6" y="15.4" width="1.6" height="1.6" />
        <rect x="12.4" y="15.4" width="1.6" height="1.6" />
        <rect x="8.4" y="18.4" width="1.4" height="1.8" />
        <rect x="14.8" y="18.4" width="1.4" height="1.8" />
        <rect x="9.6" y="3.4" width="1.6" height="1.6" />
        <rect x="18.8" y="3.4" width="1.6" height="1.6" />
        <rect x="5.2" y="7.4" width="1.6" height="1.6" />
        <rect x="15.4" y="7.4" width="1.6" height="1.6" />
        <rect x="19.8" y="10.4" width="1.6" height="1.6" />
      </g>
    </svg>
  );
}

export function SparkTrend({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M2.8 19.4l5.4-5 3.6 3 8.8-8.6" stroke="#7fd3cc" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 2.6l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#9ae4dd" />
      <path d="M3.6 8.6l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#9ae4dd" />
      <path d="M14.6 7.6l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#9ae4dd" />
    </svg>
  );
}

export function AgentIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 3.4h16v14.4h-5.6L12 21l-2.4-3.2H4z" fill="url(#teal)" />
      <path d="M12 6.8l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z" fill="#123533" />
    </svg>
  );
}

export function ClockA({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3.2a8.8 8.8 0 1 1-8.3 6" stroke="#79cfc8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.4 5.2l.4 4.2 4-1" stroke="#79cfc8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.2 16l2.8-7.6 2.8 7.6M10.2 13.6h3.6" stroke="#79cfc8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SendIcon({ size = 20 }) {
  return (
    <svg {...base(size)}>
      <path d="M3.4 4.2L21 12 3.4 19.8l2.6-7.8z" fill="url(#teal)" />
      <path d="M6 12h7.6" stroke="#0f2b2b" strokeWidth="1.3" />
    </svg>
  );
}

export function TrendDown({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M2.6 6.4l5.2 6 3.6-3.4 6.4 7.2" stroke="#e8463f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.8 17.4h4.6v-4.6" stroke="#e8463f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Thumb({ size = 14, color = "#a9b1b0" }) {
  return (
    <svg {...base(size)}>
      <path d="M2.6 10.4h3.6v10H2.6z" fill={color} />
      <path d="M7.6 10.2l3.8-6.6c1.4-.4 2.6.6 2.4 2.2l-.6 3.4h5.6c1.3 0 2.2 1.2 1.9 2.4l-1.9 7.4c-.3 1-1.2 1.6-2.2 1.6H7.6z" fill={color} />
    </svg>
  );
}

export function BankIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <g stroke="#cdd8d6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.2L12 4l9 5.2z" />
        <path d="M5.4 10.6v7M9.8 10.6v7M14.2 10.6v7M18.6 10.6v7M3 20h18" />
      </g>
    </svg>
  );
}

export function RefreshIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M19.6 13a7.8 7.8 0 1 1-2.4-6.6" stroke="#cdd8d6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.4 3.8v4.4H15" stroke="#cdd8d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ComplianceIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 20v-3.4M8.6 20v-6.4M13.2 20v-3.8M17.8 20V5.6" stroke="#cfe7e3" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.6 13.4l4-3.6 4 2.6 5-5.2" stroke="#7fd3cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CardListIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="5" width="18" height="14" rx="1.6" fill="url(#teal)" />
      <path d="M6.4 9.2h4M6.4 12h4M6.4 14.8h4" stroke="#123533" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 12.4l1.8 1.8 3.2-4" stroke="#123533" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
