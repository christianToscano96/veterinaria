import { LucideProps } from "lucide-react";
import { theme } from "../../lib/theme";

interface BentoCardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function BentoCard({ children, style }: BentoCardProps) {
  return (
    <div style={{ ...styles.card, ...style }}>
      {children}
    </div>
  );
}

export function BentoLarge({ children }: { children: React.ReactNode }) {
  return <div style={styles.bentoLarge}>{children}</div>;
}

export function BentoMedium({ children }: { children: React.ReactNode }) {
  return <div style={styles.bentoMedium}>{children}</div>;
}

export function BentoSmall({ children }: { children: React.ReactNode }) {
  return <div style={styles.bentoSmall}>{children}</div>;
}

interface VaccinationDriveProps {
  patientCount: number;
  onNotify?: () => void;
}

export function VaccinationDrive({ patientCount, onNotify }: VaccinationDriveProps) {
  return (
    <BentoLarge style={styles.bentoLarge}>
      <div style={styles.bentoContent}>
        <p style={styles.bentoLabel}>Campaña de Vacunación</p>
        <p style={styles.bentoTitle}>{patientCount} pacientes necesitan refuerzo esta semana.</p>
        <button style={styles.bentoButton} onClick={onNotify}>Enviar Notificaciones</button>
      </div>
    </BentoLarge>
  );
}

interface SpeciesMixProps {
  data: { label: string; percentage: number; color: string }[];
}

export function SpeciesMix({ data }: SpeciesMixProps) {
  return (
    <BentoMedium style={styles.bentoMedium}>
      <p style={styles.bentoLabel}>Mix de Especies</p>
      <div style={styles.speciesList}>
        {data.map((item) => (
          <div key={item.label} style={styles.speciesItem}>
            <span style={{ ...styles.speciesDot, background: item.color }} />
            <span style={styles.speciesLabel}>{item.label}</span>
            <span style={styles.speciesPercent}>{item.percentage}%</span>
          </div>
        ))}
      </div>
      <div style={styles.speciesBar}>
        {data.map((item) => (
          <div key={item.label} style={{ ...styles.speciesBarFill, width: `${item.percentage}%`, background: item.color }} />
        ))}
      </div>
    </BentoMedium>
  );
}

interface SatisfactionProps {
  score: string;
  reviews: string;
  icon?: React.ComponentType<LucideProps>;
}

export function Satisfaction({ score, reviews, icon: Icon }: SatisfactionProps) {
  return (
    <BentoSmall style={styles.bentoSmall}>
      <div style={styles.satisfactionIcon}>
        {Icon && <Icon size={32} />}
      </div>
      <p style={styles.bentoLabel}>Satisfacción del Cliente</p>
      <p style={styles.satisfactionScore}>{score}</p>
      <p style={styles.satisfactionSub}>Basado en {reviews} reseñas</p>
    </BentoSmall>
  );
}

const styles = {
  card: {
    borderRadius: "16px",
    padding: "24px",
  },
  bentoLarge: {
    background: theme.primary,
    color: theme.onPrimary,
    padding: "28px",
    borderRadius: "16px",
    position: "relative" as const,
    overflow: "hidden",
  },
  bentoMedium: {
    background: theme.surfaceContainerLow,
    padding: "28px",
    borderRadius: "16px",
    border: `1px solid ${theme.surfaceContainerHighest}`,
  },
  bentoSmall: {
    background: theme.secondaryContainer,
    color: theme.onSecondaryContainer,
    padding: "28px",
    borderRadius: "16px",
    border: `1px solid ${theme.secondaryContainer}`,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
  },
  bentoContent: {
    position: "relative",
    zIndex: 1,
  },
  bentoLabel: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    opacity: 0.7,
    marginBottom: "8px",
  },
  bentoTitle: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "20px",
  },
  bentoButton: {
    padding: "10px 20px",
    background: "white",
    color: theme.primary,
    borderRadius: "12px",
    border: "none",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  speciesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    marginTop: "16px",
  },
  speciesItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  speciesDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  speciesLabel: {
    fontSize: "12px",
    fontWeight: "700",
    flex: 1,
  },
  speciesPercent: {
    fontSize: "12px",
    color: theme.onSurfaceVariant,
  },
  speciesBar: {
    height: "10px",
    background: theme.surfaceContainerLowest,
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    marginTop: "24px",
  },
  speciesBarFill: {
    height: "100%",
  },
  satisfactionIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  satisfactionScore: {
    fontSize: "40px",
    fontWeight: "800",
  },
  satisfactionSub: {
    fontSize: "10px",
    opacity: 0.6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
};

export default BentoCard;