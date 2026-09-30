function ClipArt() {
  return (
    <svg viewBox="0 0 400 260" className="art art-clip" aria-hidden="true">
      <rect x="20" y="116" width="360" height="28" rx="6" className="art-steel" />
      <rect x="56" y="36" width="36" height="188" rx="9" className="art-plate" />
      <rect x="98" y="52" width="28" height="156" rx="8" className="art-plate" />
      <rect x="132" y="98" width="16" height="64" rx="4" className="art-steel-solid" />
      <g className="clip-sensor">
        <rect x="176" y="98" width="76" height="64" rx="16" className="art-lime" />
        <rect x="190" y="122" width="34" height="16" rx="8" className="art-ink" />
        <circle cx="236" cy="130" r="5" className="clip-led" />
      </g>
      <circle cx="214" cy="130" r="46" className="clip-ring" />
      <circle cx="214" cy="130" r="46" className="clip-ring clip-ring-late" />
    </svg>
  );
}

function LiftArt() {
  return (
    <svg viewBox="0 0 400 260" className="art art-lift" aria-hidden="true">
      <line x1="40" y1="247" x2="360" y2="247" className="art-floor" />
      <circle cx="200" cy="70" r="50" className="art-ghost" />
      <path d="M200 196 C 186 160, 220 126, 206 100 S 196 80, 200 70" pathLength="1" className="lift-trace" />
      <g className="lift-plate">
        <circle cx="200" cy="196" r="50" className="art-plate" />
        <circle cx="200" cy="196" r="32" className="art-plate-ring" />
        <circle cx="200" cy="196" r="8" className="art-steel-solid" />
        <rect x="236" y="184" width="32" height="24" rx="8" className="art-lime" />
      </g>
      <text x="292" y="74" className="art-figure">
        0.84
      </text>
      <text x="292" y="96" className="art-caption">
        m/s, rep 2
      </text>
      <text x="40" y="74" className="art-caption">
        Lockout
      </text>
    </svg>
  );
}

const readRows = [0.92, 0.9, 0.87, 0.82, 0.71];

function ReadArt() {
  return (
    <div className="art art-read" aria-hidden="true">
      <div className="phone">
        <p className="phone-title">Back squat, set 3</p>
        <p className="phone-sub">120 kg, 5 reps</p>
        <ul className="phone-rows">
          {readRows.map((speed, index) => (
            <li key={index} className={`phone-row ${index === readRows.length - 1 ? "is-slow" : ""}`}>
              <span className="phone-rep">{index + 1}</span>
              <span className="phone-bar">
                <span style={{ width: `${speed * 100}%`, animationDelay: `${index * 0.35}s` }} />
              </span>
              <span className="phone-speed">{speed.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="phone-note">Speed fell 23% on rep 5.</p>
      </div>
    </div>
  );
}

const beatPoints = [
  [30, 200],
  [84, 182],
  [138, 186],
  [192, 150],
  [246, 128],
  [300, 96],
  [354, 58],
];

function BeatArt() {
  const line = beatPoints.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const [lastX, lastY] = beatPoints[beatPoints.length - 1];
  return (
    <svg viewBox="0 0 400 260" className="art art-beat" aria-hidden="true">
      <line x1="30" y1="226" x2="370" y2="226" className="art-floor" />
      <path d={line} pathLength="1" className="beat-line" />
      {beatPoints.slice(0, -1).map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" className="beat-dot" />
      ))}
      <circle cx={lastX} cy={lastY} r="18" className="beat-pulse" />
      <circle cx={lastX} cy={lastY} r="8" className="art-lime" />
      <text x={lastX - 12} y={lastY - 26} textAnchor="end" className="art-figure">
        142.5
      </text>
      <text x="30" y="250" className="art-caption">
        Week 1
      </text>
      <text x="370" y="250" textAnchor="end" className="art-caption">
        Week 7
      </text>
    </svg>
  );
}

const kinds = {
  clip: ClipArt,
  lift: LiftArt,
  read: ReadArt,
  beat: BeatArt,
};

export default function HowArt({ kind }) {
  const Art = kinds[kind];
  return <Art />;
}
