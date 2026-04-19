import { LucideIcon } from "lucide-react";
import { styles, theme } from "../../lib/theme";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  trend: string;
  trendType?: "positive" | "negative" | "neutral" | "warning";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendType = "neutral",
}: KpiCardProps) {
  const trendColors = {
    positive: { bg: "#dcfce7", color: "#166534" },
    negative: { bg: theme.errorContainer, color: theme.onErrorContainer },
    neutral: { bg: theme.surfaceContainerHighest, color: theme.onSurfaceVariant },
    warning: { bg: theme.errorContainer, color: theme.onErrorContainer },
  };

  return (
    <div style={styles.kpiCard}>
      <div style={styles.flexBetween as React.CSSProperties}>
        <span style={styles.small as React.CSSProperties}>{title}</span>
        <Icon size={24} style={{ color }} />
      </div>
      <div
        style={{
          ...(styles.flexBetween as React.CSSProperties),
          alignItems: "flex-end",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: theme.onSurface,
          }}
        >
          {value}
        </h2>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: "12px",
            ...trendColors[trendType],
          }}
        >
          {trend}
        </div>
      </div>
      <span style={styles.small as React.CSSProperties}>{subtitle}</span>
    </div>
  );
}

export default KpiCard;