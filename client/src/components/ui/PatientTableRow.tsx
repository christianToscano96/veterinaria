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
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const speciesIcons: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  default: PawPrint,
};

export function PatientTableRow({ animal, onView, onEdit, onDelete }: PatientTableRowProps) {
  const SpeciesIcon = speciesIcons[animal.species] || speciesIcons.default;
  
  const statusStyles = {
    healthy: { bg: "#fce7f3", color: theme.primary, label: "Saludable" },
    "checking-in": { bg: theme.primaryFixed, color: theme.onPrimaryFixedVariant, label: "En Consulta" },
    urgent: { bg: theme.tertiaryContainer, color: theme.onTertiaryContainer, label: "Urgente" },
  };
  
  const status = statusStyles[animal.status] || statusStyles.healthy;
  const visitLabel = animal.status === "checking-in" ? "En Consulta" : animal.status === "urgent" ? "Vacunación Vencida" : "Control de Rutina";

  return (
    <tr style={styles.tr}>
      <td style={styles.tdFirst}>
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
  );
}

const styles = {
  tr: { background: theme.surfaceContainerLowest, transition: "all 0.3s" },
  tdFirst: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}`, borderLeft: `1px solid ${theme.surfaceContainer}`, borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" },
  td: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}` },
  tdLast: { padding: "20px 24px", borderTop: `1px solid ${theme.surfaceContainer}`, borderBottom: `1px solid ${theme.surfaceContainer}`, borderRight: `1px solid ${theme.surfaceContainer}`, borderTopRightRadius: "12px", borderBottomRightRadius: "12px" },
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
};

export default PatientTableRow;