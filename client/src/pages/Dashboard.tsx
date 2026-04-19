import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, Calendar, Syringe, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { dashboardApi } from '../lib/api';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalAnimals: 0, appointmentsToday: 0, pendingVaccinations: 0, draftPosts: 0 });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, appointmentsData, vaccinesData] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.todayAppointments(),
          dashboardApi.upcomingVaccinations(7),
        ]);
        setStats(statsData);
        setTodayAppointments(appointmentsData.appointments || []);
        setUpcomingVaccinations(vaccinesData.vaccinations || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const getVaccineStatusColor = (nextDueDate: string) => {
    const due = new Date(nextDueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '#ef4444';
    if (diffDays <= 7) return '#eab308';
    return '#22c55e';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      completed: { bg: '#dcfce7', text: '#16a34a' },
      confirmed: { bg: '#dbeafe', text: '#2563eb' },
      scheduled: { bg: '#f3e8f6', text: '#9e18a6' },
    };
    return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} color="#9e18a6" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#221921' }}>
          Hola, {user?.name} 👋
        </h1>
        <p style={{ color: '#814974', marginTop: '4px' }}>Aquí está el resumen de hoy</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', '@media (minWidth: 1024px)': { gridTemplateColumns: 'repeat(4, 1fr)' } }} className="stats-grid">
        <Link to="/animals" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(158, 24, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawPrint size={24} color="#9e18a6" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>{stats.totalAnimals}</p>
              <p style={{ fontSize: '13px', color: '#814974' }}>Pacientes</p>
            </div>
          </div>
        </Link>

        <Link to="/appointments" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>{stats.appointmentsToday}</p>
              <p style={{ fontSize: '13px', color: '#814974' }}>Turnos hoy</p>
            </div>
          </div>
        </Link>

        <Link to="/vaccinations/upcoming" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Syringe size={24} color="#ca8a04" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>{stats.pendingVaccinations}</p>
              <p style={{ fontSize: '13px', color: '#814974' }}>Vacunas pendientes</p>
            </div>
          </div>
        </Link>

        <div style={{ ...cardStyle, opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="#94a3b8" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>{stats.draftPosts}</p>
              <p style={{ fontSize: '13px', color: '#814974' }}>Borradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gap: '24px', '@media (minWidth: 1024px)': { gridTemplateColumns: '1fr 1fr' } }} className="two-col">
        {/* Today's Appointments */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#221921' }}>Turnos de hoy</h2>
            <Link to="/appointments" style={{ fontSize: '14px', color: '#9e18a6', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#814974' }}>
              <Calendar size={40} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
              <p>No hay turnos programados para hoy</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayAppointments.slice(0, 5).map((appointment: any) => {
                const badge = getStatusBadge(appointment.status);
                return (
                  <div key={appointment._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#fafafa', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center', minWidth: '50px' }}>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#221921' }}>{appointment.time}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', color: '#221921', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appointment.animal?.name || 'Sin nombre'}</p>
                      <p style={{ fontSize: '13px', color: '#814974', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appointment.reason || appointment.type}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: badge.bg, color: badge.text }}>
                      {appointment.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Vaccinations */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#221921' }}>Próximas vacunas</h2>
            <Link to="/vaccinations" style={{ fontSize: '14px', color: '#9e18a6', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          {upcomingVaccinations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#814974' }}>
              <Syringe size={40} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
              <p>No hay vacunas próximas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingVaccinations.slice(0, 5).map((vaccination: any) => (
                <div key={vaccination._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#fafafa', borderRadius: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getVaccineStatusColor(vaccination.nextDueDate) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', color: '#221921', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vaccination.animal?.name || 'Sin nombre'}</p>
                    <p style={{ fontSize: '13px', color: '#814974' }}>{vaccination.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#221921' }}>
                      {new Date(vaccination.nextDueDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
          .two-col { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

const cardStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 10px 40px rgba(56, 45, 54, 0.06)',
  transition: 'all 0.2s',
};

export default DashboardPage;