import { useState } from "react";

export default function AdminChart({
  title,
  subtitle,
  data = [600, 750, 700, 1200, 2400, 2000, 2950, 2200, 2600, 1800, null, null],
  labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  yMax = 3000,
  yStep = 1000,
  badgeText = "12M",
  dateText = "September",
  yearText = "2026",
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const width = 800;
  const height = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate Y axis levels
  const yLevels = [];
  for (let val = 0; val <= yMax; val += yStep) {
    yLevels.push(val);
  }

  // Filter valid points up to September (index 8)
  const validPoints = data
    .map((val, idx) => ({ val, idx }))
    .filter((p) => p.val !== null && p.val !== undefined);

  // Compute coordinates
  const coords = validPoints.map((p) => {
    const x = paddingLeft + (p.idx / (labels.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.val / yMax) * chartHeight;
    return { x, y, val: p.val, label: labels[p.idx], idx: p.idx };
  });

  // Generate smooth cubic bezier curve
  const createSmoothPath = (points) => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(coords);
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`
      : "";

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-xs space-y-4 font-sans">
      {/* Header with Title and Date Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#b90101] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-xs font-bold self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded-md bg-[#b90101] text-white font-extrabold uppercase">
            {badgeText}
          </span>
          <span className="text-neutral-500 font-semibold">{dateText}</span>
          <span className="text-[#b90101] font-bold">{yearText}</span>
        </div>
      </div>

      {/* SVG Chart Viewport */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] overflow-visible"
        >
          {/* Area Fill: #FDF3F1 */}
          <path d={areaPath} fill="#FDF3F1" />

          {/* Horizontal Gridlines & Y Labels */}
          {yLevels.map((yVal) => {
            const yPos = paddingTop + chartHeight - (yVal / yMax) * chartHeight;
            return (
              <g key={yVal}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#f1f5f9"
                  strokeWidth="1.2"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[11px] fill-neutral-400 font-semibold"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#b90101"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {labels.map((label, idx) => {
            const xPos = paddingLeft + (idx / (labels.length - 1)) * chartWidth;
            const yPos = height - 12;
            const isRed = idx <= 8; // Jan - Sep are red in screenshot
            return (
              <text
                key={label}
                x={xPos}
                y={yPos}
                textAnchor="middle"
                className={`text-[11px] font-bold ${isRed ? "fill-[#b90101]" : "fill-[#b90101]"}`}
              >
                {label}
              </text>
            );
          })}

          {/* Interactive Data Points */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-[#b90101] stroke-white stroke-2 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-bold shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-8"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            {hoveredPoint.label}: {hoveredPoint.val.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
