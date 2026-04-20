import { theme } from "../../lib/theme";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ label, value, color = theme.secondary }: StatCardProps) {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <p style={{ ...styles.value, color }}>{value}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: "16px 24px",
    borderRadius: "12px",
    background: theme.secondaryContainer,
    border: `1px solid ${theme.secondaryContainer}`,
    textAlign: "center" as const,
    minWidth: "120px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.secondary,
  },
  value: {
    fontSize: "28px",
    fontWeight: "800",
  },
};

export default StatCard;