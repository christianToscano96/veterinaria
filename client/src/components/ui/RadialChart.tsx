import { theme } from "../../lib/theme";

// Define filter for glow effect
const GlowFilter = ({ color }: { color: string }) => (
  <defs>
    <filter id="glow">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
    </filter>
  </defs>
);

export interface RadialData {
  label: string;
  value: number;
  color?: string;
}

export interface RadialChartProps {
  data: RadialData[];
  size?: number;
  thickness?: number;
  showLabels?: boolean;
  showValues?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

// Concentric rings chart - like Apple Watch activity rings
export function RadialChart({
  data,
  size = 200,
  thickness = 20,
  showLabels = true,
  showValues = true,
  centerLabel,
  centerValue,
}: RadialChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const center = size / 2;
  const maxRadius = size / 2 - thickness;
  
  return (
    <svg width={size} height={size}>
      {data.map((item, i) => {
        const radius = maxRadius - (i * (thickness + 8));
        const circumference = 2 * Math.PI * radius;
        const progress = (item.value / maxValue) * circumference;
        const offset = circumference - progress;
        const color = item.color || theme.primary;
        
        return (
          <g key={item.label}>
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={theme.surfaceContainerHighest}
              strokeWidth={thickness}
            />
            {/* Progress ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={`${progress} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </g>
        );
      })}
      
      {/* Center text */}
      {centerValue && (
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          fontSize={size / 5}
          fontWeight={800}
          fill={theme.onSurface}
        >
          {centerValue}
        </text>
      )}
      {centerLabel && (
        <text
          x={center}
          y={center + size / 6}
          textAnchor="middle"
          fontSize={12}
          fill={theme.onSurfaceVariant}
        >
          {centerLabel}
        </text>
      )}
      
      {/* Labels outside */}
      {showLabels && data.map((item, i) => {
        const radius = maxRadius + 25;
        const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        
        return (
          <g key={`label-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill={item.color || theme.onSurfaceVariant}
              fontWeight={600}
            >
              {item.label}
            </text>
            {showValues && (
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fill={theme.onSurfaceVariant}
              >
                {item.value}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Multi-level radar/polar chart
export function PolarChart({
  data,
  size = 250,
  showValues = true,
}: Omit<RadialChartProps, "thickness" | "centerLabel" | "centerValue">) {
  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const center = size / 2;
  const maxRadius = size / 2 - 30;
  const levels = 4;
  
  return (
    <svg width={size} height={size}>
      {/* Background levels */}
      {Array.from({ length: levels }).map((_, levelIdx) => {
        const levelRadius = maxRadius * ((levelIdx + 1) / levels);
        const points = data.map((_, i) => {
          const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
          return {
            x: center + levelRadius * Math.cos(angle),
            y: center + levelRadius * Math.sin(angle),
          };
        });
        
        const pathD = points.map((p, i) => 
          i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
        ).join(" ") + " Z";
        
        return (
          <path
            key={levelIdx}
            d={pathD}
            fill="none"
            stroke={theme.outlineVariant}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        );
      })}
      
      {/* Data polygons */}
      {data.map((item, i) => {
        const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
        const radius = maxRadius * (item.value / maxValue);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        
        return (
          <g key={i}>
            {/* Line from center */}
            <line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={item.color || theme.primary}
              strokeWidth={2}
              opacity={0.6}
            />
            {/* Point */}
            <circle
              cx={x}
              cy={y}
              r={6}
              fill={item.color || theme.primary}
            />
            {/* Label */}
            <text
              x={center + (maxRadius + 20) * Math.cos(angle)}
              y={center + (maxRadius + 20) * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={600}
              fill={theme.onSurface}
            >
              {item.label}
            </text>
          </g>
        );
      })}
      
      {/* Center dot */}
      <circle cx={center} cy={center} r={4} fill={theme.primary} />
    </svg>
  );
}

export default RadialChart;