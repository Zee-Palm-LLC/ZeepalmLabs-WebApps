// Field of small "+" marks laid out on a regular grid (the reference uses 124px spacing on 1440 wide).
export default function Crosses({ cols = 11, rows = 7, color = 'rgba(255,255,255,.9)', offsetX = 0.044, offsetY = 0.075, stepX = 0.0861, stepY = 0.138, opacity = 1, style }) {
  const items = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    items.push(<i key={`${r}-${c}`} className="cross" style={{ left: `calc(${(offsetX + c * stepX) * 100}% - 7px)`, top: `calc(${(offsetY + r * stepY) * 100}% - 7px)` }} />);
  }
  return <div className="cross-field" style={{ color, opacity, ...style }}>{items}</div>;
}
