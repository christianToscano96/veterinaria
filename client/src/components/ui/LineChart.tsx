import { useMemo } from "react";
import { theme } from "../../lib/theme";

export interface LineChartData {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showDots?: boolean;
  showValue?: boolean;
  curved?: boolean;
}

export function LineChart({
  data,
  width = 400,
  height = 200,
  color = theme.primary,
  showArea = false,
  showDots = true,
  showValue = true,
  curved = true,
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { maxValue, minValue, points, areaPath, linePath } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value), 0);
    const range = max - min || 1;

    const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
    const yScale = (v: number) =>
      padding.top + chartHeight - ((v - min) / range) * chartHeight;

    const pts = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.value),
      value: d.value,
      label: d.label,
    }));

    // Generate line path
    let line = "";
    let area = "";
    
    if (curved && data.length > 2) {
      // Smooth curve using cubic bezier
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[Math.min(pts.length - 1, i + 1)];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        if (i === 0) {
          line = `M ${p1.x} ${p1.y}`;
          area = `M ${p1.x} ${yScale(min)} L ${p1.x} ${p1.y}`;
        } else {
          line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
          area += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
      }
      area += ` L ${pts[pts.length - 1].x} ${yScale(min)} Z`;
    } else {
      // Linear
      pts.forEach((p, i) => {
        if (i === 0) {
          line = `M ${p.x} ${p.y}`;
          area = `M ${p.x} ${yScale(min)} L ${p.x} ${p.y}`;
        } else {
          line += ` L ${p.x} ${p.y}`;
          area += ` L ${p.x} ${p.y}`;
        }
      });
      area += ` L ${pts[pts.length - 1].x} ${yScale(min)} Z`;
    }

    return { maxValue: max, minValue: min, points: pts, areaPath: area, linePath: line };
  }, [data, chartWidth, chartHeight, curved]);

  const yScale = (v: number) => {
    const range = maxValue - minValue || 1;
    return padding.top + chartHeight - ((v - minValue) / range) * chartHeight;
  };

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="lineChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
        <line
          key={`grid-${i}`}
          x1={padding.left}
          x2={width - padding.right}
          y1={yScale(minValue + tick * (maxValue - minValue))}
          y2={yScale(minValue + tick * (maxValue - minValue))}
          stroke={theme.outlineVariant}
          strokeDasharray="4,4"
        />
      ))}

      {/* Area */}
      {showArea && (
        <path d={areaPath} fill={`url(#lineChartGradient)`} />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill={theme.surfaceContainerLowest}
            stroke={color}
            strokeWidth={2}
          />
        ))}

      {/* Value labels */}
      {showValue &&
        points.map((p, i) => (
          <text
            key={`val-${i}`}
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={theme.onSurface}
          >
            {p.value}
          </text>
        ))}

      {/* X Axis labels */}
      {points.map((p, i) => (
        <text
          key={`x-${i}`}
          x={p.x}
          y={height - 10}
          textAnchor="middle"
          fontSize={11}
          fill={theme.onSurfaceVariant}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export default LineChart;