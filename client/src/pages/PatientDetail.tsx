import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { animalsApi, vaccinationsApi, medicalRecordsApi } from "../lib/api";
import { 
  ArrowLeft, ArrowRight, Dog, Cat, Bird, Rabbit, PawPrint, 
  Edit, Calendar, FileText, FolderOpen, ShieldCheck,
  Stethoscope, Pill, PlusCircle, Upload,
  Syringe, Phone, Mail, MapPin, Clock, ChevronRight,
  Plus, AlertCircle, CheckCircle, AlertTriangle
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { theme } from "../lib/theme";

// Icons mapping
const speciesIcons: Record<string, React.ElementType> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  default: PawPrint,
};

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  weight?: number;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAddress?: string;
  notes?: string;
  lastVisit?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  notes?: string;
  veterinarian?: { name: string };
  appointment?: { id: string };
}

interface Vaccination {
  id: string;
  name: string;
  dateAdministered?: string;
  nextDueDate?: string;
}

const typeLabels: Record<string, string> = {
  consultation: "Consulta",
  surgery: "Cirugía",
  treatment: "Tratamiento",
  diagnosis: "Diagnóstico",
  checkup: "Control",
  vaccination: "Vacuna",
  other: "Otro",
};

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    setIsLoading(true);
    try {
      const [animalData, recordsData, vaccinationsData] = await Promise.all([
        animalsApi.get(id),
        medicalRecordsApi.byAnimal(id),
        vaccinationsApi.byAnimal(id),
      ]);
      
      setAnimal(animalData as Animal);
      setRecords((recordsData as any).records || []);
      setVaccinations((vaccinationsData as any).vaccinations || []);
    } catch (err) {
      console.error("Error loading patient:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const SpeciesIcon = animal ? speciesIcons[animal.species] || speciesIcons.default : PawPrint;

  function calculateAge(birthDate?: string): string {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years > 0) {
      return `${years}y ${months > 0 ? months : 0}m`;
    }
    return `${months}m`;
  }

  function getVaccinationStatus(vax: Vaccination): { 
    label: string; 
    color: string; 
    bg: string;
    daysUntil: number;
    isOverdue: boolean;
    isDueSoon: boolean;
  } {
    if (!vax.nextDueDate) {
      return { label: "Sin fecha", color: theme.onSurfaceVariant, bg: theme.surfaceContainer, daysUntil: 0, isOverdue: false, isDueSoon: false };
    }
    const due = new Date(vax.nextDueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { 
        label: `Vencida hace ${Math.abs(daysUntil)} días`, 
        color: theme.error, 
        bg: theme.errorContainer,
        daysUntil,
        isOverdue: true,
        isDueSoon: false
      };
    }
    if (daysUntil <= 30) {
      return { 
        label: `Vence en ${daysUntil} días`, 
        color: "#f59e0b", 
        bg: "#fef3c7",
        daysUntil,
        isOverdue: false,
        isDueSoon: true
      };
    }
    return { 
      label: format(due, "MMM yyyy", { locale: es }), 
      color: theme.secondary, 
      bg: theme.secondaryContainer,
      daysUntil,
      isOverdue: false,
      isDueSoon: false
    };
  }

  if (isLoading || !animal) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Cargando paciente...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <nav style={styles.breadcrumb}>
        <button onClick={() => navigate("/animals")} style={styles.breadcrumbLink}>
          Pacientes
        </button>
        <ChevronRight size={14} style={styles.breadcrumbSep} />
        <span style={styles.breadcrumbCurrent}>{animal.name}</span>
      </nav>

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/animals")} style={styles.backButton}>
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroImage}>
          <SpeciesIcon size={80} />
        </div>
        <div style={styles.heroInfo}>
          <div style={styles.badges}>
            <span style={styles.badgeSpecies}>{animal.species.toUpperCase()}</span>
            <span style={styles.badgeVip}>PACIENTE VIP</span>
          </div>
          <h1 style={styles.heroName}>{animal.name}</h1>
          <div style={styles.heroGrid}>
            <div>
              <p style={styles.heroLabel}>Raza</p>
              <p style={styles.heroValue}>{animal.breed || animal.species}</p>
            </div>
            <div>
              <p style={styles.heroLabel}>Edad</p>
              <p style={styles.heroValue}>{calculateAge(animal.birthDate)}</p>
            </div>
            <div>
              <p style={styles.heroLabel}>Peso</p>
              <p style={styles.heroValue}>{animal.weight ? `${animal.weight} kg` : "N/A"}</p>
            </div>
            <div>
              <p style={styles.heroLabel}>Última Visita</p>
              <p style={styles.heroValue}>
                {animal.lastVisit ? format(parseISO(animal.lastVisit), "dd MMM yyyy", { locale: es }) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Info Card */}
      <section style={styles.ownerCard}>
        <div style={styles.ownerInfo}>
          <div style={styles.ownerAvatar}>
            {animal.ownerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.ownerLabel}>Dueño Principal</p>
            <p style={styles.ownerName}>{animal.ownerName}</p>
            {animal.ownerPhone && (
              <a href={`tel:${animal.ownerPhone}`} style={styles.ownerContact}>
                <Phone size={12} />
                {animal.ownerPhone}
              </a>
            )}
            {animal.ownerEmail && (
              <a href={`mailto:${animal.ownerEmail}`} style={styles.ownerContact}>
                <Mail size={12} />
                {animal.ownerEmail}
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate(`/animals/edit/${animal.id}`)} 
          style={styles.editButton}
        >
          <Edit size={18} />
          Editar
        </button>
      </section>

      {/* Quick Actions */}
      <section style={styles.quickActions}>
        <button 
          onClick={() => navigate(`/appointments/new?animal=${animal.id}`)}
          style={styles.actionButton}
        >
          <Calendar size={18} />
          Nuevo Turno
        </button>
        <button 
          onClick={() => navigate(`/vaccinations?animal=${animal.id}`)}
          style={styles.actionButton}
        >
          <Syringe size={18} />
          Nueva Vacuna
        </button>
        <button 
          onClick={() => navigate(`/medical-records/${animal.id}`)}
          style={styles.actionButton}
        >
          <Stethoscope size={18} />
          Nuevo Registro
        </button>
      </section>

      {/* Bento Grid */}
      <div style={styles.bentoGrid}>
        {/* Medical History Timeline */}
        <section style={styles.timelineSection}>
          <div style={styles.timelineHeader}>
            <h3 style={styles.sectionTitle}>
              <FileText size={20} />
              Historial Médico
            </h3>
            <button 
              onClick={() => navigate(`/medical-records/${animal.id}`)}
              style={styles.viewAllButton}
            >
              Ver Todo
              <ChevronRight size={14} />
            </button>
          </div>
          
          {records.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={32} style={{ opacity: 0.3 }} />
              <p>No hay registros médicos</p>
              <button 
                onClick={() => navigate(`/medical-records/${animal.id}`)}
                style={styles.emptyCta}
              >
                <Plus size={16} />
                Agregar Primer Registro
              </button>
            </div>
          ) : (
            <div style={styles.timeline}>
              {records.slice(0, 5).map((record, index) => (
                <div 
                  key={record.id} 
                  style={styles.timelineItem}
                  onClick={() => navigate(`/medical-records/${animal.id}?record=${record.id}`)}
                >
                  <div style={{
                    ...styles.timelineDot,
                    background: index === 0 ? theme.primary : index === 1 ? theme.tertiary : theme.outline,
                  }} />
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineTop}>
                      <p style={styles.timelineDate}>
                        <Clock size={12} />
                        {record.date ? format(parseISO(record.date), "dd MMM yyyy", { locale: es }) : "N/A"}
                      </p>
                      {record.veterinarian && (
                        <p style={styles.timelineVet}>{record.veterinarian.name}</p>
                      )}
                    </div>
                    <h4 style={styles.timelineTitle}>
                      {typeLabels[record.type] || record.type}
                    </h4>
                    <p style={styles.timelineText}>
                      {record.diagnosis || record.treatment || "Sin descripción"}
                    </p>
                    <div style={styles.timelineTags}>
                      <span style={styles.tag}>
                        <Stethoscope size={12} />
                        {typeLabels[record.type] || record.type}
                      </span>
                      {record.medication && (
                        <span style={styles.tag}>
                          <Pill size={12} />
                          Receta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar: Vaccinations & Files */}
        <div style={styles.sidebar}>
          {/* Vaccinations */}
          <section style={styles.vaccinationsSection}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>
                <ShieldCheck size={20} />
                Vacunas
              </h3>
              <button 
                onClick={() => navigate(`/vaccinations?animal=${animal.id}`)}
                style={styles.viewAllButton}
              >
                Ver Todas
              </button>
            </div>
            
            {vaccinations.length === 0 ? (
              <div style={styles.emptyStateSimple}>
                <Syringe size={24} style={{ opacity: 0.3 }} />
                <p>No hay vacunas</p>
                <button style={styles.emptyCtaSmall}>
                  <PlusCircle size={14} />
                  Agregar
                </button>
              </div>
            ) : (
              <div style={styles.vaccinationsList}>
                {vaccinations.map((vax) => {
                  const status = getVaccinationStatus(vax);
                  const progress = status.isOverdue ? 0 : status.isDueSoon ? 50 : 100;
                  
                  return (
                    <div key={vax.id} style={styles.vaxItem}>
                      <div style={styles.vaxHeader}>
                        <p style={styles.vaxName}>{vax.name}</p>
                        <div style={{
                          ...styles.statusBadge,
                          background: status.bg,
                          color: status.color,
                        }}>
                          {status.isOverdue && <AlertTriangle size={12} />}
                          {status.isDueSoon && <Clock size={12} />}
                          {!status.isOverdue && !status.isDueSoon && <CheckCircle size={12} />}
                          {status.label}
                        </div>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{
                          ...styles.progressFill,
                          width: `${progress}%`,
                          background: status.color,
                        }} />
                      </div>
                      <div style={styles.vaxFooter}>
                        <span style={styles.vaxLast}>
                          {vax.dateAdministered 
                            ? `Última: ${format(parseISO(vax.dateAdministered), "MMM yyyy", { locale: es })}`
                            : "Sin registrada"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button style={styles.scheduleButton}>
              <Calendar size={16} />
              Programar Refuerzos
            </button>
          </section>

          {/* Clinical Files */}
          <section style={styles.filesSection}>
            <h3 style={styles.sectionTitle}>
              <FolderOpen size={20} />
              Archivos Clínicos
            </h3>
            <div style={styles.filesGrid}>
              <div style={styles.filePlaceholder}>
                <Upload size={20} />
                <span>Arrastrá o</span>
                <span style={styles.fileUpload}>Seleccionar</span>
              </div>
              <button style={styles.uploadBtn}>
                <PlusCircle size={24} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Quick Actions Footer */}
      <div className="mobile-actions" style={styles.mobileActions}>
        <button onClick={() => navigate(`/appointments/new?animal=${animal.id}`)} style={styles.mobileAction}>
          <Calendar size={20} />
          Turno
        </button>
        <button onClick={() => navigate(`/vaccinations?animal=${animal.id}`)} style={styles.mobileAction}>
          <Syringe size={20} />
          Vacuna
        </button>
        <button onClick={() => navigate(`/medical-records/${animal.id}`)} style={styles.mobileAction}>
          <Stethoscope size={20} />
          Registro
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .mobile-actions { display: flex !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .hero-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-name { font-size: 36px !important; }
          .hero-section { flex-direction: column; align-items: flex-start; }
          .hero-image { width: 120px !important; height: 120px !important; }
          .quick-actions { display: none !important; }
          .sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "12px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: `3px solid ${theme.surfaceContainer}`,
    borderTopColor: theme.primary,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: theme.onSurfaceVariant,
    fontSize: "14px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  breadcrumbLink: {
    background: "none",
    border: "none",
    color: theme.primary,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  breadcrumbSep: {
    color: theme.onSurfaceVariant,
  },
  breadcrumbCurrent: {
    color: theme.onSurfaceVariant,
    fontWeight: "600",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: theme.surfaceContainerLowest,
    border: "none",
    color: theme.onSurfaceVariant,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  heroSection: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  heroImage: {
    width: "160px",
    height: "160px",
    borderRadius: "16px",
    background: theme.primaryContainer,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.onPrimaryContainer,
    boxShadow: "0 8px 32px rgba(158, 24, 166, 0.2)",
  },
  heroInfo: {
    flex: 1,
    minWidth: "280px",
  },
  badges: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  badgeSpecies: {
    padding: "4px 12px",
    background: theme.secondaryContainer,
    color: theme.onSecondaryContainer,
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "20px",
  },
  badgeVip: {
    padding: "4px 12px",
    background: theme.primaryContainer,
    color: theme.onPrimaryContainer,
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "20px",
  },
  heroName: {
    fontSize: "48px",
    fontWeight: "900",
    color: theme.onSurface,
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  heroLabel: {
    fontSize: "12px",
    color: theme.onSurfaceVariant,
    fontWeight: "600",
    marginBottom: "4px",
  },
  heroValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: theme.onSurface,
  },
  ownerCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    background: theme.surfaceContainerLowest,
    borderRadius: "16px",
    border: `1px solid ${theme.surfaceContainer}`,
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  ownerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  ownerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: theme.secondaryContainer,
    color: theme.onSecondaryContainer,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
  },
  ownerLabel: {
    fontSize: "11px",
    color: theme.onSurfaceVariant,
    fontWeight: "600",
    textTransform: "uppercase" as const,
  },
  ownerName: {
    fontSize: "16px",
    fontWeight: "700",
    color: theme.onSurface,
  },
  ownerContact: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: theme.primary,
    textDecoration: "none",
    marginTop: "4px",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: theme.primary,
    color: theme.onPrimary,
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  quickActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: theme.surfaceContainerHighest,
    color: theme.onSurface,
    borderRadius: "12px",
    border: `1px solid ${theme.surfaceContainer}`,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  timelineSection: {
    background: theme.surfaceContainerLowest,
    borderRadius: "16px",
    padding: "24px",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: "700",
    color: theme.onSurface,
  },
  viewAllButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: theme.primary,
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  timeline: {
    position: "relative",
    borderLeft: `2px solid ${theme.surfaceVariant}`,
    marginLeft: "12px",
    paddingLeft: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  timelineItem: {
    position: "relative",
    cursor: "pointer",
    padding: "16px",
    background: theme.surfaceContainerLow,
    borderRadius: "12px",
    transition: "all 0.2s",
  },
  timelineDot: {
    position: "absolute",
    left: "-30px",
    top: "20px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: `3px solid ${theme.surfaceContainerLowest}`,
  },
  timelineContent: {},
  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  timelineDate: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "700",
    color: theme.primary,
  },
  timelineVet: {
    fontSize: "11px",
    color: theme.onSurfaceVariant,
  },
  timelineTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: theme.onSurface,
    marginBottom: "4px",
  },
  timelineText: {
    fontSize: "13px",
    color: theme.onSurfaceVariant,
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  timelineTags: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    background: theme.surfaceContainerHighest,
    color: theme.onSurfaceVariant,
    fontSize: "11px",
    fontWeight: "600",
    borderRadius: "8px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  vaccinationsSection: {
    background: theme.surfaceContainer,
    borderRadius: "16px",
    padding: "24px",
  },
  vaccinationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  vaxItem: {
    padding: "12px",
    background: theme.surfaceContainerLowest,
    borderRadius: "10px",
  },
  vaxHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  vaxName: {
    fontSize: "14px",
    fontWeight: "700",
    color: theme.onSurface,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
  },
  progressBar: {
    height: "4px",
    background: theme.surfaceContainerHighest,
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s",
  },
  vaxFooter: {
    display: "flex",
    justifyContent: "space-between",
  },
  vaxLast: {
    fontSize: "10px",
    color: theme.onSurfaceVariant,
  },
  scheduleButton: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    border: `2px solid ${theme.primary}20`,
    background: "transparent",
    color: theme.primary,
    fontSize: "13px",
    fontWeight: "700",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  filesSection: {
    background: theme.surfaceContainerLowest,
    borderRadius: "16px",
    padding: "24px",
  },
  filesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 80px",
    gap: "12px",
    marginTop: "16px",
  },
  filePlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "24px",
    border: `2px dashed ${theme.outlineVariant}`,
    borderRadius: "12px",
    color: theme.onSurfaceVariant,
    fontSize: "13px",
  },
  fileUpload: {
    color: theme.primary,
    fontWeight: "700",
    cursor: "pointer",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed ${theme.outlineVariant}`,
    borderRadius: "12px",
    background: "transparent",
    color: theme.onSurfaceVariant,
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: theme.onSurfaceVariant,
    textAlign: "center" as const,
    gap: "12px",
  },
  emptyStateSimple: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    color: theme.onSurfaceVariant,
    textAlign: "center" as const,
    gap: "8px",
  },
  emptyCta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: theme.primary,
    color: theme.onPrimary,
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
  },
  emptyCtaSmall: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 12px",
    background: theme.primary,
    color: theme.onPrimary,
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mobileActions: {
    display: "none",
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    gap: "8px",
    padding: "12px",
    background: "white",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
    zIndex: 100,
  },
  mobileAction: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "12px 8px",
    background: theme.surfaceContainerHighest,
    border: "none",
    borderRadius: "8px",
    color: theme.onSurface,
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PatientDetailPage;