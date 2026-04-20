import { theme } from "../../lib/theme";

interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

export function ProgressBar({ label, percentage, color }: ProgressBarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: theme.surfaceContainerHighest,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;