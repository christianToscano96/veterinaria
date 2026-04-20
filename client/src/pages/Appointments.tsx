import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsApi, animalsApi } from "../lib/api";
import {
  Plus,
  Loader2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Check,
  X,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { theme } from "../lib/theme";
import { format, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    scheduled: { bg: "#f3e8f4", color: theme.primary, label: "Programado" },
    confirmed: { bg: "#dbeafe", color: "#3b82f6", label: "Confirmado" },
    "in-progress": { bg: "#fef9c3", color: "#eab308", label: "En Progreso" },
    completed: { bg: "#dcfce7", color: "#22c55e", label: "Completado" },
    cancelled: { bg: "#f1f5f9", color: "#94a3b8", label: "Cancelado" },
    "no-show": { bg: "#fee2e2", color: "#ef4444", label: "No asistio" },
  };
  const c = config[status] || config.scheduled;
  return (
    <span style={{ ...styles.statusBadge, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

// Stats Card
function StatsCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div style={styles.statsCard}>
      <Icon size={20} style={{ color }} />
      <div>
        <p style={styles.statsLabel}>{label}</p>
        <p style={styles.statsValue}>{value}</p>
      </div>
    </div>
  );
}

type FilterStatus =
  | "all"
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";
type ViewMode = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const calendarRef = useRef<any>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("dayGridMonth");

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchAnimal, setSearchAnimal] = useState("");

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  const isAdmin = user?.role === "admin";

  async function loadAppointments() {
    try {
      setIsLoading(true);
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const data = await appointmentsApi.list({
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      });

      setAllAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const [calendarReady, setCalendarReady] = useState(false);
  
  // Load appointments on mount and when filters change
  useEffect(() => {
    loadAppointments();
  }, [currentDate, filterStatus]);

  // Change calendar view when view state changes
  useEffect(() => {
    if (calendarReady) {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.changeView(view);
      }
    }
  }, [view, calendarReady]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...allAppointments];

    if (filterStatus !== "all") {
      filtered = filtered.filter((a: any) => a.status === filterStatus);
    }

    if (searchAnimal) {
      const s = searchAnimal.toLowerCase();
      filtered = filtered.filter((a: any) =>
        a.animal?.name?.toLowerCase().includes(s),
      );
    }

    return filtered.map((apt: any) => ({
      id: apt._id,
      title: `${apt.animal?.name || "Animal"} - ${apt.type}`,
      start: `${apt.date.split("T")[0]}T${apt.time}`,
      backgroundColor: getEventColor(apt.status),
      borderColor: getEventColor(apt.status),
      extendedProps: {
        ...apt,
      },
    }));
  }, [allAppointments, filterStatus, searchAnimal]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    const todayCount = allAppointments.filter(
      (a: any) => a.date.split("T")[0] === todayStr,
    ).length;

    const pendingCount = allAppointments.filter(
      (a: any) => a.status === "scheduled" || a.status === "confirmed",
    ).length;

    const completedCount = allAppointments.filter(
      (a: any) => a.status === "completed",
    ).length;

    const cancelledCount = allAppointments.filter(
      (a: any) => a.status === "cancelled",
    ).length;

    return {
      today: todayCount,
      pending: pendingCount,
      completed: completedCount,
      cancelled: cancelledCount,
    };
  }, [allAppointments]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return allAppointments
      .filter((a: any) => a.date.split("T")[0] === todayStr)
      .sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [allAppointments]);

  const getEventColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: theme.primary,
      confirmed: "#3b82f6",
      "in-progress": "#eab308",
      completed: "#22c55e",
      cancelled: "#94a3b8",
      "no-show": "#ef4444",
    };
    return colors[status] || theme.primary;
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    setCurrentDate(calendarApi?.getDate() || new Date());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    setCurrentDate(calendarApi?.getDate() || new Date());
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    setCurrentDate(new Date());
  };

  const handleDateClick = (info: any) => {
    const dateStr = info.dateStr.split("T")[0];
    navigate(`/appointments/new?date=${dateStr}`);
  };

  async function handleStatusChange(aptId: string, newStatus: string) {
    try {
      if (newStatus === "cancelled") {
        await appointmentsApi.delete(aptId);
      } else {
        await appointmentsApi.update(aptId, { status: newStatus });
      }
      showToast("Turno actualizado", "success");
      loadAppointments();
    } catch (error) {
      showToast("Error al actualizar", "error");
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ id: Date.now().toString(), message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function exportSchedule() {
    const headers = ["Fecha", "Hora", "Paciente", "Tipo", "Estado", "Motivo"];
    const rows = filteredEvents.map((e: any) => [
      e.extendedProps.date,
      e.extendedProps.time,
      e.extendedProps.animal?.name,
      e.extendedProps.type,
      e.extendedProps.status,
      e.extendedProps.reason,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turnos_${format(currentDate, "yyyy-MM")}.csv`;
    a.click();
    showToast("Exportado exitosamente", "success");
  }

  const statusFilters: { key: FilterStatus; label: string; color: string }[] = [
    { key: "all", label: "Todos", color: theme.onSurfaceVariant },
    { key: "scheduled", label: "Programado", color: theme.primary },
    { key: "confirmed", label: "Confirmado", color: "#3b82f6" },
    { key: "in-progress", label: "En Progreso", color: "#eab308" },
    { key: "completed", label: "Completado", color: "#22c55e" },
    { key: "cancelled", label: "Cancelado", color: "#94a3b8" },
  ];

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <Loader2
          size={32}
          color={theme.primary}
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background:
              toast.type === "success"
                ? theme.secondaryContainer
                : theme.errorContainer,
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header Row */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Search */}
          <div style={styles.searchBox}>
            <Search size={16} style={{ color: theme.onSurfaceVariant }} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchAnimal}
              onChange={(e) => setSearchAnimal(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Status Filters */}
          <div style={styles.filters}>
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  ...styles.filterBtn,
                  background: filterStatus === f.key ? f.color : "transparent",
                  color: filterStatus === f.key ? "white" : f.color,
                  borderColor: f.color,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.headerRight}>
          {isAdmin && (
            <button
              onClick={() => navigate("/appointments/new")}
              style={styles.addButton}
            >
              <Plus size={18} />
              Nuevo turno
            </button>
          )}
          <button onClick={exportSchedule} style={styles.exportButton}>
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <StatsCard
          label="Hoy"
          value={stats.today}
          icon={Calendar}
          color={theme.primary}
        />
        <StatsCard
          label="Pendientes"
          value={stats.pending}
          icon={Clock}
          color="#eab308"
        />
        <StatsCard
          label="Completados"
          value={stats.completed}
          icon={Check}
          color="#22c55e"
        />
        <StatsCard
          label="Cancelados"
          value={stats.cancelled}
          icon={X}
          color="#94a3b8"
        />
      </div>

      {/* Main Content - Calendar + Sidebar */}
      <div style={styles.mainContent}>
        {/* Calendar Section */}
        <div style={styles.calendarSection}>
          {/* Calendar Controls */}
          <div style={styles.calendarControls}>
            <div style={styles.navButtons}>
              <button onClick={handlePrev} style={styles.navBtn}>
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleToday}
                style={{ ...styles.navBtn, padding: "8px 16px" }}
              >
                Hoy
              </button>
              <button onClick={handleNext} style={styles.navBtn}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div style={styles.viewButtons}>
              <button
                onClick={() => setView("dayGridMonth")}
                style={{
                  ...styles.viewBtn,
                  background: view === "dayGridMonth" ? theme.primary : "white",
                  color:
                    view === "dayGridMonth" ? "white" : theme.onSurfaceVariant,
                }}
              >
                Mes
              </button>
              <button
                onClick={() => setView("timeGridWeek")}
                style={{
                  ...styles.viewBtn,
                  background: view === "timeGridWeek" ? theme.primary : "white",
                  color:
                    view === "timeGridWeek" ? "white" : theme.onSurfaceVariant,
                }}
              >
                Semana
              </button>
              <button
                onClick={() => setView("timeGridDay")}
                style={{
                  ...styles.viewBtn,
                  background: view === "timeGridDay" ? theme.primary : "white",
                  color:
                    view === "timeGridDay" ? "white" : theme.onSurfaceVariant,
                }}
              >
                Día
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div style={styles.calendarWrapper}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              events={filteredEvents}
              headerToolbar={false}
              height="auto"
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              weekends={true}
              eventDisplay="block"
              editable={false}
              selectable={true}
              datesSet={() => setCalendarReady(true)}
              dateClick={handleDateClick}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              dayMaxEvents={3}
              eventClick={(info) => {
                const apt = info.event.extendedProps;
                navigate(`/appointments/${apt._id}`);
              }}
              eventContent={(eventInfo) => (
                <div style={styles.eventContent}>
                  <div style={styles.eventTitle}>
                    {eventInfo.event.extendedProps.animal?.name || "Sin nombre"}
                  </div>
                  <div style={styles.eventTime}>{eventInfo.timeText}</div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Today's Sidebar */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>
            <Calendar size={18} />
            Turnos de Hoy
          </h3>

          {todayAppointments.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No hay turnos para hoy</p>
            </div>
          ) : (
            <div style={styles.todayList}>
              {todayAppointments.map((apt: any) => (
                <div key={apt._id} style={styles.todayItem}>
                  <div style={styles.todayTime}>{apt.time}</div>
                  <div style={styles.todayInfo}>
                    <p style={styles.todayAnimal}>{apt.animal?.name}</p>
                    <p style={styles.todayType}>{apt.type}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                  {isAdmin &&
                    apt.status !== "completed" &&
                    apt.status !== "cancelled" && (
                      <div style={styles.todayActions}>
                        {apt.status === "scheduled" && (
                          <button
                            onClick={() =>
                              handleStatusChange(apt._id, "confirmed")
                            }
                            title="Confirmar"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {apt.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusChange(apt._id, "in-progress")
                            }
                            title="Iniciar"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleStatusChange(apt._id, "cancelled")
                          }
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {statusFilters.slice(1).map((f) => (
          <div key={f.key} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: f.color }} />
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fc {
          --fc-border-color: ${theme.surfaceContainer};
          --fc-button-bg-color: ${theme.primary};
          --fc-button-border-color: ${theme.primary};
          --fc-today-bg-color: rgba(158, 24, 166, 0.05);
          --fc-event-border-color: transparent;
        }
        .fc .fc-button {
          font-family: Manrope, sans-serif;
          font-weight: 600;
          border-radius: 8px;
        }
        .fc .fc-daygrid-day-number, .fc .fc-col-header-cell-cushion {
          font-weight: 600;
          color: ${theme.onSurface};
          text-decoration: none;
        }
        .fc-event { cursor: pointer; }
        @media (max-width: 1024px) {
          .sidebar { display: none !important; }
        }
        @media (max-width: 768px) {
          .header { flex-direction: column !important; }
          .statsRow { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column" as const, gap: "24px" },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  toast: {
    position: "fixed",
    top: "80px",
    right: "24px",
    padding: "12px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    zIndex: 1000,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  headerRight: { display: "flex", gap: "12px" },
  title: { fontSize: "28px", fontWeight: "800", color: theme.onSurface },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: theme.surfaceContainerLowest,
    borderRadius: "10px",
    border: `1px solid ${theme.surfaceContainer}`,
    width: "240px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: "14px",
    color: theme.onSurface,
    outline: "none",
  },
  filters: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  filterBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  addButton: {
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
  exportButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: theme.surfaceContainerHighest,
    color: theme.onSurface,
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  statsCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: theme.surfaceContainerLowest,
    borderRadius: "12px",
    border: `1px solid ${theme.surfaceContainer}`,
  },
  statsLabel: {
    fontSize: "12px",
    color: theme.onSurfaceVariant,
    fontWeight: "600",
  },
  statsValue: { fontSize: "24px", fontWeight: "800", color: theme.onSurface },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "24px",
  },
  calendarSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  calendarControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  navButtons: { display: "flex", gap: "8px" },
  navBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    background: "white",
    border: `1px solid ${theme.surfaceContainer}`,
    borderRadius: "8px",
    cursor: "pointer",
    color: theme.onSurfaceVariant,
  },
  viewButtons: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "8px 16px",
    border: `1px solid ${theme.surfaceContainer}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  calendarWrapper: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(56, 45, 54, 0.06)",
  },
  eventContent: { padding: "4px 8px", fontSize: "12px", overflow: "hidden" },
  eventTitle: {
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  eventTime: { opacity: 0.8, fontSize: "11px" },
  sidebar: {
    background: theme.surfaceContainerLowest,
    borderRadius: "16px",
    padding: "20px",
    border: `1px solid ${theme.surfaceContainer}`,
    height: "fit-content",
  },
  sidebarTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "700",
    color: theme.onSurface,
    marginBottom: "16px",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "24px",
    color: theme.onSurfaceVariant,
  },
  todayList: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  todayItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "white",
    borderRadius: "10px",
  },
  todayTime: {
    fontSize: "14px",
    fontWeight: "700",
    color: theme.primary,
    minWidth: "50px",
  },
  todayInfo: { flex: 1 },
  todayAnimal: { fontSize: "14px", fontWeight: "600", color: theme.onSurface },
  todayType: { fontSize: "12px", color: theme.onSurfaceVariant },
  todayActions: { display: "flex", gap: "4px" },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
  },
  legend: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap" as const,
    padding: "16px",
    background: "white",
    borderRadius: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: theme.onSurfaceVariant,
  },
  legendDot: { width: "10px", height: "10px", borderRadius: "3px" },
};

export default AppointmentsPage;
