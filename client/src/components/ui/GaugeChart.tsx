import { useMemo } from "react";
import { theme } from "../../lib/theme";

export interface GaugeChartProps {
  value: number;  // 0-100
  label?: string;
  size?: number;
  color?: string;
  showValue?: boolean;
}

export function GaugeChart({
  value,
  label,
  size = 120,
  color = theme.primary,
  showValue = true,
}: GaugeChartProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const percentage = clampedValue / 100;
  
  const { startAngle, endAngle, path } = useMemo(() => {
    const start = -225; // Start from bottom-left
    const end = 45;     // End at bottom-right
    const range = end - start;
    const currentAngle = start + range * percentage;
    
    // Create arc path
    const startAngleRad = (start * Math.PI) / 180;
    const endAngleRad = (currentAngle * Math.PI) / 180;
    const radius = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;
    
    const x1 = cx + radius * Math.cos(startAngleRad);
    const y1 = cy + radius * Math.sin(startAngleRad);
    const x2 = cx + radius * Math.cos(endAngleRad);
    const y2 = cy + radius * Math.sin(endAngleRad);
    
    const largeArc = percentage > 0.5 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    return { startAngle: start, endAngle: currentAngle, path: d };
  }, [percentage, size]);

  return (
    <svg width={size} height={size}>
      {/* Background arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 10}
        fill="none"
        stroke={theme.surfaceContainerHighest}
        strokeWidth={8}
        strokeDasharray={`${Math.PI * (size / 2 - 10) * 0.75} ${Math.PI * (size / 2 - 10)}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size / 2})`}
      />
      
      {/* Value arc */}
      <path
        d={path}
        fill={color}
        opacity={0.8}
      />
      
      {/* Center text */}
      {showValue && (
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize={size / 4}
          fontWeight={800}
          fill={theme.onSurface}
        >
          {Math.round(clampedValue)}%
        </text>
      )}
      
      {/* Label below */}
      {label && (
        <text
          x={size / 2}
          y={size - 5}
          textAnchor="middle"
          fontSize={12}
          fill={theme.onSurfaceVariant}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

// Simple circular progress
export function CircularProgress({
  value,
  size = 60,
  color = theme.primary,
  strokeWidth = 6,
}: Omit<GaugeChartProps, "label" | "showValue">) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={theme.surfaceContainerHighest}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export default GaugeChart;