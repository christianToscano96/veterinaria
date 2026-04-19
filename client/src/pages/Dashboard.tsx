import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardApi } from "../lib/api";
import {
  PawPrint,
  Calendar,
  Syringe,
  AlertTriangle,
  Phone,
  FileText,
} from "lucide-react";
import { theme } from "../lib/theme";

// Reusable components
import { KpiCard } from "../components/ui/KpiCard";
import { AppointmentRow } from "../components/ui/AppointmentRow";
import { VaccinationAlert } from "../components/ui/VaccinationAlert";
import { QuickActionButton } from "../components/ui/QuickActionButton";
import { ProgressBar } from "../components/ui/ProgressBar";
import { DonutChart } from "../components/ui/DonutChart";

interface Stats {
  totalAnimals: number;
  appointmentsToday: number;
  pendingVaccinations: number;
  draftPosts: number;
}

interface Appointment {
  id: string;
  animal: { name: string; species: string };
  time: string;
  type: string;
  status: string;
}

interface Vaccination {
  id: string;
  animal: { name: string };
  name: string;
  status: "ok" | "due" | "overdue";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats>({
    totalAnimals: 0,
    appointmentsToday: 0,
    pendingVaccinations: 0,
    draftPosts: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsData, appointmentsData, vaccinationsData] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.todayAppointments(),
        dashboardApi.upcomingVaccinations(7),
      ]);

      setStats(statsData as Stats);
      setTodayAppointments((appointmentsData as any).appointments || []);
      setUpcomingVaccinations((vaccinationsData as any).vaccinations || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  // KPI Cards data
  const kpiCards = [
    {
      title: "Pacientes Hoy",
      value: stats.totalAnimals.toString(),
      subtitle: "Activos",
      icon: PawPrint,
      color: theme.primary,
      trend: "+12% vs promedio",
      trendType: "positive" as const,
    },
    {
      title: "Turnos Hoy",
      value: stats.appointmentsToday.toString(),
      subtitle: "Programados",
      icon: Calendar,
      color: theme.secondary,
      trend: "Steady",
      trendType: "neutral" as const,
    },
    {
      title: "Vacunas Pendientes",
      value: stats.pendingVaccinations.toString(),
      subtitle: "Próximas 7 días",
      icon: Syringe,
      color: theme.tertiary,
      trend: stats.pendingVaccinations > 0 ? "Requiere atención" : "Al día",
      trendType: stats.pendingVaccinations > 0 ? ("warning" as const) : ("positive" as const),
    },
    {
      title: "Borradores",
      value: stats.draftPosts.toString(),
      subtitle: "Social Media",
      icon: FileText,
      color: theme.secondary,
      trend: "Listos para publicar",
      trendType: "neutral" as const,
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: PawPrint, label: "Nuevo Paciente", path: "/animals/new" },
    { icon: Calendar, label: "Nuevo Turno", path: "/appointments/new" },
    { icon: FileText, label: "Historial", path: "/medical-records" },
    { icon: Syringe, label: "Vacunas", path: "/vaccinations" },
  ];

  // Distribution data for charts
  const distributionData = [
    { label: "Consultas", percentage: 45, color: theme.primary },
    { label: "Vacunas", percentage: 25, color: theme.secondary },
    { label: "Cirugías", percentage: 20, color: theme.tertiary },
  ];

  const speciesData = [
    { label: "Caninos", percentage: 58, color: theme.primary },
    { label: "Felinos", percentage: 34, color: theme.secondary },
    { label: "Exóticos", percentage: 8, color: theme.tertiary },
  ];

  // Filter urgent vaccinations
  const urgentVaccinations = upcomingVaccinations.filter(
    (v) => v.status === "overdue" || v.status === "due",
  );

  return (
    <div style={styles.container}>
      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        {kpiCards.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Today's Schedule */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.h2}>Turnos de Hoy</h3>
                <p style={styles.caption}>
                  {todayAppointments.length} programados
                </p>
              </div>
              <button onClick={() => navigate("/appointments")} style={styles.linkButton}>
                Ver Calendario
              </button>
            </div>

            {loading ? (
              <div style={styles.emptyState}>Cargando...</div>
            ) : todayAppointments.length === 0 ? (
              <div style={styles.emptyState}>
                No hay turnos programados para hoy
              </div>
            ) : (
              <div style={styles.list}>
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    animal={appointment.animal}
                    time={appointment.time}
                    type={appointment.type}
                    status={appointment.status}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Quick Stats */}
          <div style={styles.statsGrid}>
            {/* Distribution */}
            <section style={{ ...styles.section, padding: "24px" }}>
              <h4 style={styles.sectionTitle}>Distribución</h4>
              <DonutChart data={distributionData} />
            </section>

            {/* Pets by Type */}
            <section style={{ ...styles.section, padding: "24px" }}>
              <h4 style={styles.sectionTitle}>Pacientes por Especie</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {speciesData.map((item) => (
                  <ProgressBar key={item.label} {...item} />
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Action Required */}
          <section style={styles.section}>
            <div style={styles.alertHeader}>
              <AlertTriangle size={20} style={{ color: theme.error }} />
              <h3 style={styles.h3}>Requiere Atención</h3>
            </div>
            <div style={styles.alertList}>
              {urgentVaccinations.length === 0 ? (
                <p style={styles.caption}>Todo al día</p>
              ) : (
                urgentVaccinations.slice(0, 3).map((vax) => (
                  <VaccinationAlert
                    key={vax.id}
                    animal={vax.animal}
                    name={vax.name}
                    status={vax.status}
                  />
                ))
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section style={styles.section}>
            <h4 style={styles.sectionTitle}>Accesos Rápidos</h4>
            <div style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </section>

          {/* Staff On Duty */}
          <section
            style={{
              ...styles.section,
              background: theme.primary,
              color: theme.onPrimary,
            }}
          >
            <p style={styles.staffLabel}>De Guardia Hoy</p>
            <h4 style={styles.staffName}>Dr. Michael Chen</h4>
            <p style={styles.staffInfo}>Cirujano • Disponible hasta 20:00</p>
            <div style={styles.staffContact}>
              <Phone size={16} />
              <span>Llamar</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Local styles (only layout-specific styles remain here)
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    padding: "24px",
    minHeight: "100vh",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
    width: "100%",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  section: {
    background: theme.surfaceContainer,
    borderRadius: "16px",
    padding: "32px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "16px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.onSurfaceVariant,
  },
  h2: {
    fontSize: "24px",
    fontWeight: 700,
    color: theme.onSurface,
  },
  h3: {
    fontSize: "20px",
    fontWeight: 700,
    color: theme.onSurface,
  },
  caption: {
    fontSize: "13px",
    color: theme.onSurfaceVariant,
  },
  linkButton: {
    fontSize: "12px",
    color: theme.primary,
    fontWeight: 700,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px",
    color: theme.onSurfaceVariant,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  alertHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  alertList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  staffLabel: {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    opacity: 0.8,
  },
  staffName: {
    fontSize: "18px",
    fontWeight: 800,
    marginTop: "4px",
  },
  staffInfo: {
    fontSize: "12px",
    opacity: 0.7,
    marginTop: "16px",
  },
  staffContact: {
    marginTop: "24px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
};

export default DashboardPage;