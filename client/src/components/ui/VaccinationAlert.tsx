import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { theme } from "../../lib/theme";

interface VaccinationAlertProps {
  animal: { name: string };
  name: string;
  status: "ok" | "due" | "overdue";
}

export function VaccinationAlert({ animal, name, status }: VaccinationAlertProps) {
  const statusConfig = {
    overdue: {
      bg: theme.errorContainer,
      color: theme.onErrorContainer,
      icon: AlertTriangle,
      label: "Urgente",
      borderColor: theme.error,
    },
    due: {
      bg: "#fef3c7",
      color: "#92400e",
      icon: Clock,
      label: "Pendiente",
      borderColor: "#f59e0b",
    },
    ok: {
      bg: "#dcfce7",
      color: "#166534",
      icon: CheckCircle,
      label: "OK",
      borderColor: "#22c55e",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      style={{
        padding: "12px",
        background: config.bg,
        borderRadius: "8px",
        borderLeft: `3px solid ${config.borderColor}`,
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: config.color,
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {config.label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 600 }}>{animal.name}</p>
      <p style={{ fontSize: "12px", color: theme.onSurfaceVariant }}>{name}</p>
    </div>
  );
}

export default VaccinationAlert;