import { LucideIcon, Eye, Pencil, Trash2, PawPrint, Dog, Cat, Bird } from "lucide-react";
import { theme } from "../../lib/theme";

interface PatientTableRowProps {
  animal: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: string;
    ownerName: string;
    ownerEmail?: string;
    ownerPhone?: string;
    lastVisit: string;
    status: "healthy" | "checking-in" | "urgent";
  };
  isExpanded?: boolean;
  isSelected?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleExpand?: () => void;
  onToggleSelect?: () => void;
}

const speciesIcons: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  default: PawPrint,
};

export function PatientTableRow({ 
  animal, 
  isExpanded = false,
  isSelected = false,
  onView, 
  onEdit, 
  onDelete,
  onToggleExpand,
  onToggleSelect 
}: PatientTableRowProps) {
  const SpeciesIcon = speciesIcons[animal.species] || speciesIcons.default;
  
  const statusStyles = {
    healthy: { bg: "#fce7f3", color: theme.primary, label: "Saludable" },
    "checking-in": { bg: theme.primaryFixed, color: theme.onPrimaryFixedVariant, label: "En Consulta" },
    urgent: { bg: theme.tertiaryContainer, color: theme.onTertiaryContainer, label: "Urgente" },
  };
  
  const status = statusStyles[animal.status] || statusStyles.healthy;
  const visitLabel = animal.status === "checking-in" ? "En Consulta" : animal.status === "urgent" ? "Vacunación Vencida" : "Control de Rutina";

  return (
    <>
    <tr style={{ 
      ...styles.tr, 
      background: isSelected ? theme.primaryContainer : isExpanded ? theme.surfaceContainerLow : theme.surfaceContainerLowest,
      cursor: "pointer"
    }}
    >
      <td style={styles.tdCheckbox}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          style={styles.checkbox}
        />
      </td>
      <td style={styles.tdFirst} onClick={onToggleExpand}>
        <div style={styles.petInfo}>
          <div style={styles.petAvatar}><SpeciesIcon size={16} /></div>
          <div>
            <p style={styles.petName}>{animal.name}</p>
            <p style={styles.petBreed}>{(animal.breed || animal.species)} • {animal.age}</p>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <p style={styles.ownerName}>{animal.ownerName}</p>
        <p style={styles.ownerContact}>{animal.ownerEmail || animal.ownerPhone}</p>
      </td>
      <td style={styles.td}>
        <p style={styles.visitDate}>{animal.lastVisit}</p>
        <p style={styles.visitType}>{visitLabel}</p>
      </td>
      <td style={styles.td}>
        <span style={{...styles.statusBadge, background: status.bg, color: status.color}}>
          <span style={{...styles.statusDot, background: status.color}} />
          {status.label}
        </span>
      </td>
      <td style={{...styles.tdLast, textAlign: "right"}}>
        <div style={styles.actions}>
          <button onClick={onView} style={styles.actionButton} title="Ver">
            <Eye size={18} color={theme.primary} />
          </button>
          <button onClick={onEdit} style={styles.actionButton} title="Editar">
            <Pencil size={18} color={theme.secondary} />
          </button>
          <button onClick={onDelete} style={styles.actionButton} title="Eliminar">
            <Trash2 size={18} color={theme.error} />
          </button>
        </div>
      </td>
    </tr>
    {isExpanded && (
      <tr style={styles.expandedRow}>
        <td colSpan={5} style={styles.expandedContent}>
          <div style={styles.expandedGrid}>
            <div>
              <p style={styles.expandedLabel}>Teléfono</p>
              <p>{animal.ownerPhone || "No registrado"}</p>
            </div>
            <div>
              <p style={styles.expandedLabel}>Email</p>
              <p>{animal.ownerEmail || "No registrado"}</p>
            </div>
            <div style={styles.expandedActions}>
              <button onClick={onView} style={styles.expandedBtn}>Ver Detalle</button>
              <button onClick={onEdit} style={styles.expandedBtnSecondary}>Editar</button>
            </div>
          </div>
        </td>
      </tr>
    )}
    </>
  );
}

const styles = {
  tr: { background: theme.surfaceContainerLowest, transition: "all 0.3s" },
  tdCheckbox: { padding: "20px 12px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}`, borderLeft: `1px solid ${theme.surfaceContainer}`, borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" },
  tdFirst: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}`, borderLeft: `none` },
  td: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}` },
  tdLast: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}`, borderRight: `1px solid ${theme.surfaceContainer}`, borderTopRightRadius: "12px", borderBottomRightRadius: "12px" },
  checkbox: { width: "18px", height: "18px", cursor: "pointer" },
  petInfo: { display: "flex", alignItems: "center", gap: "12px" },
  petAvatar: { width: "56px", height: "56px", borderRadius: "12px", background: theme.surfaceContainerHighest, display: "flex", alignItems: "center", justifyContent: "center", color: theme.primary },
  petName: { fontSize: "16px", fontWeight: "700", color: theme.primary },
  petBreed: { fontSize: "12px", color: theme.onSurfaceVariant },
  ownerName: { fontSize: "14px", fontWeight: "600", color: theme.onSurface },
  ownerContact: { fontSize: "12px", color: theme.onSurfaceVariant },
  visitDate: { fontSize: "14px", fontWeight: "500", color: theme.onSurface },
  visitType: { fontSize: "10px", fontWeight: "700", textTransform: "uppercase" as const, color: theme.primary },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%" },
  actions: { display: "flex", gap: "4px", justifyContent: "flex-end" },
  actionButton: { padding: "8px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  expandedRow: { background: theme.surfaceContainerLow },
  expandedContent: { padding: "20px 24px", borderBottom: `1px solid ${theme.surfaceContainer}` },
  expandedGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  expandedLabel: { fontSize: "11px", color: theme.onSurfaceVariant, fontWeight: "600", textTransform: "uppercase" as const, marginBottom: "4px" },
  expandedActions: { display: "flex", gap: "12px", alignItems: "flex-end" },
  expandedBtn: { padding: "8px 16px", background: theme.primary, color: theme.onPrimary, borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  expandedBtnSecondary: { padding: "8px 16px", background: "transparent", color: theme.primary, borderRadius: "8px", border: `1px solid ${theme.primary}`, fontSize: "13px", fontWeight: "600", cursor: "pointer" },
};

export default PatientTableRow;