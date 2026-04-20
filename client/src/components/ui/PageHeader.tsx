import { LucideIcon, Search, Bell } from "lucide-react";
import { theme } from "../../lib/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: {
    icon: LucideIcon;
    onClick: () => void;
    label?: string;
  }[];
  containerStyle?: React.CSSProperties;
}

export function PageHeader({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  actions = [],
  containerStyle,
}: PageHeaderProps) {
  return (
    <div style={{ ...styles.container, ...containerStyle }}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      <div style={styles.actions}>
        {showSearch && (
          <div style={{ position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: theme.outline,
              }}
            />
            <input
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        )}
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            style={styles.actionButton}
            title={action.label}
          >
            <action.icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    backgroundColor: "#fff",
    padding: "16px 24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: theme.onSurface,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "15px",
    color: theme.onSurfaceVariant,
    marginTop: "4px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 12px 12px 40px",
    background: theme.surfaceContainerLowest,
    border: `1px solid ${theme.outlineVariant}`,
    borderRadius: "24px",
    fontSize: "14px",
    color: theme.onSurface,
    outline: "none",
    width: "200px",
    transition: "all 0.2s",
  },
  actionButton: {
    padding: "12px",
    background: theme.surfaceContainerLowest,
    border: `1px solid ${theme.outlineVariant}`,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.onSurfaceVariant,
    transition: "all 0.2s",
  },
};

export default PageHeader;
