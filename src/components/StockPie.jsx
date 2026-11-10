import './StockPie.css';

const COLORS = ['#2e7d4f', '#6aa84f', '#b6d7a8', '#c9a227', '#c05621', '#2b6cb0', '#6b46c1', '#78909c'];
const TEXT_COLORS = ['#ffffff', '#ffffff', '#1f3d2b', '#1f3d2b', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];

const CX = 100;
const CY = 100;
const R = 82;
const EXPLODE = 3;

// Punto sa circle ayon sa anggulo (0 = itaas, clockwise)
function polar(angle, radius) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

// Maliit na paghiwalay ng slice
function offset(angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [EXPLODE * Math.cos(rad), EXPLODE * Math.sin(rad)];
}

export default function StockPie({ items = [] }) {
  const total = items.reduce((sum, i) => sum + i.quantity_available, 0);

  if (total === 0) {
    return <p className="sp-empty">Walang stock pa ang mga produkto mo.</p>;
  }

  // Kulay para sa bawat produkto (pati ubos na, para sa legend)
  const data = items.map((item, idx) => ({
    ...item,
    color: COLORS[idx % COLORS.length],
    textColor: TEXT_COLORS[idx % TEXT_COLORS.length],
  }));

  // Ihanda ang slice angles para sa mga produktong may stock
  let start = 0;
  const slices = data
    .filter((d) => d.quantity_available > 0)
    .map((d) => {
      const frac = d.quantity_available / total;
      const sweep = frac * 360;
      const end = start + sweep;
      const slice = { ...d, frac, pct: frac * 100, start, end, mid: start + sweep / 2 };
      start = end;
      return slice;
    });

  return (
    <div className="sp-wrap">
      <ul className="sp-legend">
        {data.map((d) => (
          <li className="sp-legend-item" key={d.product_id}>
            <span
              className="sp-swatch"
              style={{ background: d.quantity_available > 0 ? d.color : '#c9d1c7' }}
            />
            <span>{d.product_name}</span>
            <span className="sp-legend-qty">
              {d.quantity_available} {d.unit}
            </span>
          </li>
        ))}
      </ul>

      <svg viewBox="0 0 200 200" className="sp-chart" role="img" aria-label="Stock ng mga produkto">
        {slices.map((s, idx) => {
          const [dx, dy] = offset(s.mid);
          const delay = `${idx * 120}ms`;

          // Kung iisa lang ang produkto na may stock, buong circle ang gagawin
          if (s.frac >= 1) {
            return (
              <circle
                key={s.product_id}
                className="sp-slice"
                style={{ animationDelay: delay }}
                cx={CX}
                cy={CY}
                r={R}
                fill={s.color}
              />
            );
          }

          const [x1, y1] = polar(s.start, R);
          const [x2, y2] = polar(s.end, R);
          const large = s.end - s.start > 180 ? 1 : 0;
          const path = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;

          return (
            <g key={s.product_id} transform={`translate(${dx} ${dy})`}>
              <path className="sp-slice" style={{ animationDelay: delay }} d={path} fill={s.color} />
            </g>
          );
        })}

        {slices.map((s, idx) => {
          if (s.pct < 5) return null;
          const [lx, ly] = polar(s.mid, R * 0.6);
          const [dx, dy] = offset(s.mid);
          const textColor = data.find((d) => d.product_id === s.product_id)?.textColor || '#ffffff';

          return (
            <text
              key={`label-${s.product_id}`}
              className="sp-label"
              style={{ animationDelay: `${600 + idx * 120}ms` }}
              x={lx + dx}
              y={ly + dy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor}
            >
              {Math.round(s.pct)}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}