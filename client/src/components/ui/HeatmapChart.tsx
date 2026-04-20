import { theme } from "../../lib/theme";

export interface HeatmapData {
  day: string;  // Mon, Tue, Wed, etc.
  hour: number;  // 0-23
  value: number;
}

export interface HeatmapChartProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
  colorScale?: [string, string];  // [low, high]
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am - 7pm

export function HeatmapChart({
  data,
  width = 400,
  height = 200,
  colorScale = [theme.surfaceContainerHighest, theme.primary],
}: HeatmapChartProps) {
  const padding = { top: 30, right: 10, bottom: 30, left: 40 };
  const cellWidth = (width - padding.left - padding.right) / 7;
  const cellHeight = (height - padding.top - padding.bottom) / HOURS.length;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Create lookup map
  const valueMap = new Map<string, number>();
  data.forEach((d) => valueMap.set(`${d.day}-${d.hour}`, d.value));

  // Interpolate color
  const interpolateColor = (value: number) => {
    const t = value / maxValue;
    const r = parseInt(colorScale[0].slice(1, 3), 16);
    const g = parseInt(colorScale[0].slice(3, 5), 16);
    const b = parseInt(colorScale[0].slice(5, 7), 16);
    
    const r2 = parseInt(colorScale[1].slice(1, 3), 16);
    const g2 = parseInt(colorScale[1].slice(3, 5), 16);
    const b2 = parseInt(colorScale[1].slice(5, 7), 16);
    
    const rNew = Math.round(r + (r2 - r) * t);
    const gNew = Math.round(g + (g2 - g) * t);
    const bNew = Math.round(b + (b2 - b) * t);
    
    return `rgb(${rNew}, ${gNew}, ${bNew})`;
  };

  return (
    <svg width={width} height={height}>
      {/* Y Axis (Hours) */}
      {HOURS.map((hour, i) => (
        <text
          key={`hour-${i}`}
          x={padding.left - 8}
          y={padding.top + i * cellHeight + cellHeight / 2 + 4}
          textAnchor="end"
          fontSize={10}
          fill={theme.onSurfaceVariant}
        >
          {hour}:00
        </text>
      ))}

      {/* X Axis (Days) */}
      {DAYS.map((day, i) => (
        <text
          key={`day-${i}`}
          x={padding.left + i * cellWidth + cellWidth / 2}
          y={height - padding.bottom + 20}
          textAnchor="middle"
          fontSize={11}
          fill={theme.onSurfaceVariant}
        >
          {day}
        </text>
      ))}

      {/* Cells */}
      {HOURS.map((hour, hourIdx) =>
        DAYS.map((day, dayIdx) => {
          const key = `${day}-${hour}`;
          const value = valueMap.get(key) || 0;
          const x = padding.left + dayIdx * cellWidth;
          const y = padding.top + hourIdx * cellHeight;

          return (
            <g key={key}>
              <rect
                x={x + 2}
                y={y + 2}
                width={cellWidth - 4}
                height={cellHeight - 4}
                fill={value > 0 ? interpolateColor(value) : theme.surfaceContainerHighest}
                rx={4}
              />
              {value > 0 && (
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2 + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill={value / maxValue > 0.5 ? theme.onPrimary : theme.onSurface}
                >
                  {value}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

// Simple heatmap with just color intensity
export function SimpleHeatmap({
  data,
  width = 300,
  height = 150,
}: Omit<HeatmapChartProps, "colorScale">) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const cols = 7;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / Math.ceil(data.length / cols));

  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const intensity = d.value / max;
        const color = intensity > 0.5 ? theme.primary : theme.secondary;

        return (
          <g key={i}>
            <rect
              x={col * cellW + 1}
              y={row * cellH + 1}
              width={cellW - 2}
              height={cellH - 2}
              fill={d.value > 0 ? color : theme.surfaceContainerHighest}
              rx={4}
            />
            {d.value > 0 && (
              <text
                x={col * cellW + cellW / 2}
                y={row * cellH + cellH / 2 + 4}
                textAnchor="middle"
                fontSize={10}
                fill={intensity > 0.5 ? theme.onPrimary : theme.onSurface}
              >
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default HeatmapChart;