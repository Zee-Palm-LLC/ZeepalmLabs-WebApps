export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__cloth" />
      <div className="ambient__light" />
      <svg className="ambient__leaves" viewBox="0 0 600 600">
        <g className="leaves leaves--a">
          <path d="M600 40 C 470 90 360 170 250 300" />
          <ellipse cx="520" cy="80" rx="60" ry="22" transform="rotate(-25 520 80)" />
          <ellipse cx="455" cy="130" rx="66" ry="24" transform="rotate(30 455 130)" />
          <ellipse cx="400" cy="170" rx="58" ry="21" transform="rotate(-40 400 170)" />
          <ellipse cx="340" cy="225" rx="62" ry="22" transform="rotate(22 340 225)" />
          <ellipse cx="290" cy="270" rx="52" ry="19" transform="rotate(-50 290 270)" />
        </g>
        <g className="leaves leaves--b">
          <path d="M600 260 C 500 280 420 330 360 420" />
          <ellipse cx="540" cy="275" rx="56" ry="20" transform="rotate(10 540 275)" />
          <ellipse cx="470" cy="310" rx="60" ry="21" transform="rotate(-30 470 310)" />
          <ellipse cx="415" cy="360" rx="54" ry="19" transform="rotate(35 415 360)" />
        </g>
      </svg>
      <div className="ambient__window" />
    </div>
  )
}
