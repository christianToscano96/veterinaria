import { theme } from "../../lib/theme";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const badges: Record<string, { bg: string; color: string; text: string }> = {
    scheduled: {
      bg: theme.secondaryFixed,
      color: theme.onSecondaryFixedVariant,
      text: "Programado",
    },
    confirmed: {
      bg: theme.primaryFixed,
      color: theme.onPrimaryFixedVariant,
      text: "Confirmado",
    },
    "in-progress": {
      bg: theme.primary,
      color: theme.onPrimary,
      text: "En Consulta",
    },
    completed: { bg: "#dcfce7", color: "#166534", text: "Completado" },
    cancelled: {
      bg: theme.errorContainer,
      color: theme.onErrorContainer,
      text: "Cancelado",
    },
  };

  const badge =
    badges[status] || {
      bg: theme.surfaceContainerHighest,
      color: theme.onSurfaceVariant,
      text: status,
    };

  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: badge.bg,
        color: badge.color,
      }}
    >
      {badge.text}
    </span>
  );
}

export default StatusBadge;