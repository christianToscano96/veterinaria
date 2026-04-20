import { theme } from "../../lib/theme";

export interface ComparisonData {
  label: string;
  current: number;
  previous?: number;
}

export interface ComparisonChartProps {
  data: ComparisonData[];
  width?: number;
  height?: number;
  color?: string;
  showChange?: boolean;
}

// Side-by-side comparison bars (current vs previous)
export function ComparisonChart({
  data,
  width = 300,
  height = 150,
  color = theme.primary,
  showChange = true,
}: ComparisonChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.current, d.previous || 0]), 1);
  const barHeight = 24;
  const gap = 16;
  const totalHeight = data.length * barHeight + (data.length - 1) * gap;
  
  const getChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.round(change),
      positive: change >= 0,
    };
  };

  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const y = i * (barHeight + gap);
        const currentWidth = (d.current / maxValue) * (width - 80);
        const previousWidth = d.previous ? (d.previous / maxValue) * (width - 80) : 0;
        const change = getChange(d.current, d.previous);
        
        return (
          <g key={d.label}>
            {/* Label */}
            <text
              x={0}
              y={y + barHeight / 2 + 4}
              fontSize={12}
              fontWeight={600}
              fill={theme.onSurface}
            >
              {d.label}
            </text>
            
            {/* Previous bar (background) */}
            {d.previous && (
              <rect
                x={80}
                y={y + 4}
                width={previousWidth}
                height={16}
                fill={theme.surfaceContainerHighest}
                rx={4}
              />
            )}
            
            {/* Current bar */}
            <rect
              x={80}
              y={y + 4}
              width={currentWidth}
              height={16}
              fill={d.previous ? color : theme.primary}
              rx={4}
            />
            
            {/* Value */}
            <text
              x={width - 10}
              y={y + barHeight / 2 + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight={700}
              fill={theme.onSurface}
            >
              {d.current}
            </text>
            
            {/* Change indicator */}
            {showChange && change && (
              <text
                x={width - 45}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={10}
                fontWeight={600}
                fill={change.positive ? "#22c55e" : theme.error}
              >
                {change.positive ? "+" : ""}{change.value}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Stacked bar (partes de un todo)
export interface StackedBarData {
  label: string;
  value: number;
  color: string;
}

export interface StackedBarProps {
  data: StackedBarData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export function StackedBar({
  data,
  width = 300,
  height = 40,
  showLabels = true,
}: StackedBarProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let xOffset = 0;
  
  return (
    <svg width={width} height={height}>
      {data.map((item, i) => {
        const barWidth = total > 0 ? (item.value / total) * (width - 20) : 0;
        const x = xOffset;
        xOffset += barWidth;
        
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={4}
              width={barWidth}
              height={height - 8}
              fill={item.color}
              rx={i === 0 ? 8 : 0}
              ry={i === 0 ? 8 : 0}
              rx={i === data.length - 1 ? 8 : 0}
              ry={i === data.length - 1 ? 8 : 0}
            />
            {showLabels && barWidth > 30 && (
              <text
                x={x + barWidth / 2}
                y={height / 2 + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill={theme.onPrimary}
              >
                {item.value}
              </text>
            )}
          </g>
        );
      })}
      {/* Labels below */}
      {data.map((item, i) => {
        const barWidth = total > 0 ? (item.value / total) * (width - 20) : 0;
        let curX = 0;
        for (let j = 0; j < i; j++) {
          curX += total > 0 ? (data[j].value / total) * (width - 20) : 0;
        }
        
        return (
          <g key={`label-${i}`}>
            <text
              x={curX + barWidth / 2}
              y={height + 15}
              textAnchor="middle"
              fontSize={10}
              fill={theme.onSurfaceVariant}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default ComparisonChart;