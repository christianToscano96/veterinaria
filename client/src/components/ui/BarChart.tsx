import { useCallback } from "react";
import { BarRendererConfig, BarSeries, XYChart } from "@visx/xychart";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { GradientBar, Bar } from "@visx/shape";
import { theme } from "../../lib/theme";

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  color?: string;
  showValue?: boolean;
  horizontal?: boolean;
  animated?: boolean;
}

const accessors = {
  xAccessor: (d: BarChartData) => d.label,
  yAccessor: (d: BarChartData) => d.value,
};

export function BarChart({
  data,
  width = 300,
  height = 200,
  color = theme.primary,
  showValue = true,
  horizontal = false,
  animated = true,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  const xScale = useCallback(
    scaleBand({
      domain: data.map(accessors.xAccessor),
      padding: 0.2,
    }),
    [data]
  );
  
  const yScale = useCallback(
    scaleLinear({
      domain: [0, maxValue * 1.1],
      range: [height, 0],
      nice: true,
    }),
    [height, maxValue]
  );

  if (horizontal) {
    const yScaleH = useCallback(
      scaleBand({
        domain: data.map(accessors.xAccessor),
        padding: 0.2,
      }),
      [data]
    );
    
    const xScaleH = useCallback(
      scaleLinear({
        domain: [0, maxValue * 1.1],
        range: [0, width],
        nice: true,
      }),
      [width, maxValue]
    );

    return (
      <svg width={width} height={height}>
        <Group>
          {data.map((d, i) => (
            <Bar
              key={i}
              x={0}
              y={yScaleH(d.label) ?? 0}
              width={xScaleH(d.value)}
              height={yScaleH.bandwidth}
              fill={d.color || color}
              rx={4}
            />
          ))}
        </Group>
        {/* Labels */}
        {data.map((d, i) => {
          const y = (yScaleH(d.label) ?? 0) + yScaleH.bandwidth / 2 + 4;
          return (
            <text
              key={`label-${i}`}
              x={8}
              y={y}
              fontSize={11}
              fill={theme.onSurface}
              fontWeight={600}
            >
              {d.label}
            </text>
          );
        })}
        {/* Values */}
        {data.map((d, i) => {
          const y = (yScaleH(d.label) ?? 0) + yScaleH.bandwidth / 2 + 4;
          return (
            <text
              key={`value-${i}`}
              x={xScaleH(d.value) - 8}
              y={y}
              fontSize={11}
              fill={theme.onSurfaceVariant}
              textAnchor="end"
            >
              {d.value}
            </text>
          );
        })}
      </svg>
    );
  }

  return (
    <svg width={width} height={height}>
      <Group>
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barHeight = height - yScale(d.value);
          const barX = xScale(d.label) ?? 0;
          const barY = yScale(d.value);
          
          return (
            <g key={i}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color || color}
                rx={4}
              />
              {showValue && (
                <text
                  x={barX + barWidth / 2}
                  y={barY - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill={theme.onSurfaceVariant}
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </Group>
      {/* X Axis Labels */}
      {data.map((d, i) => {
        const x = (xScale(d.label) ?? 0) + xScale.bandwidth() / 2;
        return (
          <text
            key={`x-${i}`}
            x={x}
            y={height + 20}
            textAnchor="middle"
            fontSize={11}
            fill={theme.onSurfaceVariant}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// Simple vertical bar chart - más común
export function SimpleBarChart({
  data,
  height = 200,
  color = theme.primary,
}: Omit<BarChartProps, "width">) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 40;
  const gap = 20;
  const totalWidth = data.length * (barWidth + gap);
  const width = Math.max(totalWidth, 300);
  
  const yScale = scaleLinear<number>({
    domain: [0, maxValue * 1.1],
    range: [height - 30, 10],
    nice: true,
  });
  
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {/* Y Axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={yScale(tick * maxValue)}
          y2={yScale(tick * maxValue)}
          stroke={theme.outlineVariant}
          strokeDasharray="4,4"
          strokeWidth={1}
        />
      ))}
      
      {/* Bars */}
      {data.map((d, i) => {
        const x = i * (barWidth + gap) + gap;
        const barHeight = yScale(0) - yScale(d.value);
        const barY = yScale(d.value);
        
        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={d.color || color}
              rx={6}
              ry={6}
            />
            
            {/* Value on top */}
            <text
              x={x + barWidth / 2}
              y={barY - 8}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={theme.onSurface}
            >
              {d.value}
            </text>
            
            {/* Label below */}
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill={theme.onSurfaceVariant}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default BarChart;