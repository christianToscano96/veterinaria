import { LucideIcon } from "lucide-react";
import { theme } from "../../lib/theme";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function QuickActionButton({ icon: Icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "white",
        borderRadius: "12px",
        border: `1px solid ${theme.outlineVariant}`,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <Icon size={24} style={{ color: theme.primary, marginBottom: "8px" }} />
      <span style={{ fontSize: "11px", fontWeight: 600 }}>{label}</span>
    </button>
  );
}

export default QuickActionButton;