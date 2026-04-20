import { LucideIcon } from "lucide-react";
import { theme } from "../../lib/theme";

interface FilterButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export function FilterButton({ icon: Icon, label, isActive = false, onClick }: FilterButtonProps) {
  return (
    <button onClick={onClick} style={{...styles.button, ...(isActive ? styles.buttonActive : {})}}>
      <Icon size={18} />
      {label}
    </button>
  );
}

const styles = {
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "12px",
    background: theme.surfaceContainerHighest,
    color: theme.onSurfaceVariant,
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    transition: "all 0.2s",
  },
  buttonActive: {
    background: theme.primary,
    color: theme.onPrimary,
  },
};

export default FilterButton;