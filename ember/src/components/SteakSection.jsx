const shapes = {
  ribeye: {
    outline: "M60 150 C 50 86, 120 40, 212 44 C 300 48, 360 88, 356 150 C 352 214, 290 250, 204 250 C 118 250, 68 214, 60 150 Z",
    fat: "M118 70 C 150 52, 190 48, 222 50 C 200 64, 176 96, 172 128 C 150 110, 132 90, 118 70 Z",
    marble: [
      "M120 150 C 150 138, 180 160, 214 146",
      "M230 120 C 256 132, 286 116, 312 130",
      "M150 196 C 180 206, 214 190, 246 204",
      "M260 176 C 280 186, 300 172, 322 182",
    ],
    bone: null,
  },
  striploin: {
    outline: "M52 120 C 52 84, 90 60, 200 60 C 312 60, 364 84, 364 124 L 364 190 C 364 228, 318 246, 206 246 C 94 246, 52 228, 52 190 Z",
    fat: "M52 120 C 52 84, 90 60, 200 60 C 312 60, 364 84, 364 124 L 364 108 C 352 80, 306 72, 206 72 C 110 72, 64 80, 52 108 Z",
    marble: ["M110 160 C 150 150, 190 170, 230 156", "M240 190 C 270 200, 300 186, 330 196"],
    bone: null,
  },
  tomahawk: {
    outline: "M50 150 C 42 90, 106 48, 192 50 C 272 52, 324 88, 322 148 C 320 208, 264 244, 186 244 C 106 244, 58 208, 50 150 Z",
    fat: "M100 72 C 132 54, 170 50, 200 52 C 180 66, 160 96, 156 126 C 134 110, 116 92, 100 72 Z",
    marble: ["M106 150 C 136 138, 166 160, 198 146", "M210 124 C 236 136, 262 120, 288 132", "M140 196 C 170 206, 204 190, 236 204"],
    bone: "M300 132 L 408 116 C 420 114, 428 126, 424 136 C 432 142, 432 156, 422 160 L 304 172 Z",
  },
  picanha: {
    outline: "M70 190 C 60 130, 120 76, 214 70 C 300 66, 356 110, 350 176 C 346 222, 290 244, 210 244 C 130 244, 76 230, 70 190 Z",
    fat: "M70 190 C 60 130, 120 76, 214 70 C 300 66, 356 110, 350 176 C 340 132, 290 96, 214 98 C 138 100, 84 140, 70 190 Z",
    marble: ["M140 180 C 170 170, 210 188, 250 176"],
    bone: null,
  },
};

export default function SteakSection({ cut, level }) {
  const shape = shapes[cut];
  const id = `steak-${cut}`;
  return (
    <svg viewBox="0 0 440 300" className="steak-svg" role="img" aria-label={`Cross-section of a ${cut} cooked ${level.name.toLowerCase()}`}>
      <defs>
        <radialGradient id={`${id}-inside`} cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor={level.centre} />
          <stop offset={`${Math.round((1 - level.band * 1.6) * 100)}%`} stopColor={level.centre} />
          <stop offset={`${Math.round((1 - level.band) * 100)}%`} stopColor={level.edge} />
          <stop offset="96%" stopColor="#8a6552" />
          <stop offset="100%" stopColor="#5a3524" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={shape.outline} />
        </clipPath>
      </defs>
      {shape.bone && <path d={shape.bone} className="steak-bone" />}
      <path d={shape.outline} className="steak-crust" />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={shape.outline} fill={`url(#${id}-inside)`} className="steak-inside" />
        <path d={shape.fat} className="steak-fat" />
        {shape.marble.map((path) => (
          <path key={path} d={path} className="steak-marble" />
        ))}
      </g>
      <path d={shape.outline} className="steak-edge" />
    </svg>
  );
}
