import { LucideIcon, FileText, Stethoscope } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { theme } from "../../lib/theme";

interface AppointmentRowProps {
  animal: { name: string; species: string };
  time: string;
  type: string;
  status: string;
  onClick?: () => void;
}

export function AppointmentRow({
  animal,
  time,
  type,
  status,
  onClick,
}: AppointmentRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 2fr 1fr 40px",
        gap: "16px",
        alignItems: "center",
        padding: "16px 20px",
        background: theme.surfaceContainerLowest,
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={onClick}
    >
      {/* Animal Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: theme.surfaceContainerHighest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: theme.primary,
          }}
        >
          {animal.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px" }}>{animal.name}</p>
          <p style={{ fontSize: "12px", color: theme.onSurfaceVariant }}>
            {animal.species}
          </p>
        </div>
      </div>

      {/* Type & Time */}
      <div>
        <p style={{ fontSize: "14px", fontWeight: 500 }}>{type}</p>
        <p style={{ fontSize: "12px", color: theme.onSurfaceVariant }}>{time}</p>
      </div>

      {/* Status */}
      <StatusBadge status={status} />

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          color: theme.outline,
        }}
      >
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          <FileText size={18} />
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Stethoscope size={18} />
        </button>
      </div>
    </div>
  );
}

export default AppointmentRow;