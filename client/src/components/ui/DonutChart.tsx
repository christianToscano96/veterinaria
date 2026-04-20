import { theme } from "../../lib/theme";

interface DonutChartData {
  label: string;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
}

export function DonutChart({ data, size = 100 }: DonutChartProps) {
  // Convert percentages to stroke-dasharray values
  let offset = 0;
  const segments = data.map((item) => {
    const segment = {
      ...item,
      dasharray: (item.percentage / 100) * 100,
      dashoffset: -offset,
    };
    offset += item.percentage;
    return segment;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {/* Chart */}
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg
          viewBox="0 0 36 36"
          style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="transparent"
            stroke={theme.surfaceContainerHighest}
            strokeWidth="3"
          />
          {/* Data segments */}
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke={segment.color}
              strokeDasharray={`${segment.dasharray} 100`}
              strokeDashoffset={segment.dashoffset}
              strokeLinecap="round"
              strokeWidth="3"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {data.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              {item.label}
            </span>
            <span style={{ fontWeight: 600 }}>{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;