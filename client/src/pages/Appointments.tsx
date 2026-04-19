import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi } from '../lib/api';
import { Plus, Loader2, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export function AppointmentsPage() {
  const { user } = useAuth();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  async function loadAppointments() {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await appointmentsApi.list({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
      });
      
      const formattedEvents = (data.appointments || []).map((apt: any) => ({
        id: apt._id,
        title: `${apt.animal?.name || 'Animal'} - ${apt.type}`,
        start: `${apt.date.split('T')[0]}T${apt.time}`,
        backgroundColor: getEventColor(apt.status),
        borderColor: getEventColor(apt.status),
        extendedProps: {
          status: apt.status,
          animal: apt.animal,
          reason: apt.reason,
          type: apt.type,
        },
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const getEventColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#9e18a6',
      confirmed: '#3b82f6',
      'in-progress': '#eab308',
      completed: '#22c55e',
      cancelled: '#94a3b8',
      'no-show': '#ef4444',
    };
    return colors[status] || '#9e18a6';
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} color="#9e18a6" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#221921' }}>Turnos</h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>Gestión de citas y turnos</p>
        </div>
        {isAdmin && (
          <Link to="/appointments/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#9e18a6', color: 'white', borderRadius: '10px', fontWeight: '600', textDecoration: 'none' }}>
            <Plus size={20} />
            Nuevo turno
          </Link>
        )}
      </div>

      {/* Calendar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handlePrev} style={navButtonStyle}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleToday} style={{ ...navButtonStyle, padding: '8px 16px' }}>
            Hoy
          </button>
          <button onClick={handleNext} style={navButtonStyle}>
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setView('dayGridMonth')}
            style={{ ...viewButtonStyle, background: view === 'dayGridMonth' ? '#9e18a6' : 'white', color: view === 'dayGridMonth' ? 'white' : '#64748b' }}
          >
            Mes
          </button>
          <button 
            onClick={() => setView('timeGridWeek')}
            style={{ ...viewButtonStyle, background: view === 'timeGridWeek' ? '#9e18a6' : 'white', color: view === 'timeGridWeek' ? 'white' : '#64748b' }}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(56, 45, 54, 0.06)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          events={events}
          headerToolbar={false}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          weekends={true}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayMaxEvents={3}
          eventClick={(info) => {
            // Handle event click - show details or navigate
            console.log('Appointment clicked:', info.event.extendedProps);
          }}
          eventContent={(eventInfo) => (
            <div style={{ padding: '4px 8px', fontSize: '12px', overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {eventInfo.event.extendedProps.animal?.name || 'Sin nombre'}
              </div>
              <div style={{ opacity: 0.8, fontSize: '11px' }}>
                {eventInfo.timeText}
              </div>
            </div>
          )}
          styles={{
            calendar: { fontFamily: 'Manrope, sans-serif' },
            dayGridMonth: { fontSize: '14px' },
            event: { borderRadius: '6px', border: 'none' },
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px', background: 'white', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#9e18a6' }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Programado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#3b82f6' }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Confirmado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#eab308' }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>En progreso</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#22c55e' }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Completado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#94a3b8' }} />
          <span style={{ fontSize: '13px', color: '#64748b' }}>Cancelado</span>
        </div>
      </div>

      <style>{`
        .fc {
          --fc-border-color: #e2e8f0;
          --fc-button-bg-color: #9e18a6;
          --fc-button-border-color: #9e18a6;
          --fc-button-hover-bg-color: #7d1485;
          --fc-button-hover-border-color: #7d1485;
          --fc-button-active-bg-color: #7d1485;
          --fc-button-active-border-color: #7d1485;
          --fc-today-bg-color: rgba(158, 24, 166, 0.05);
          --fc-event-border-color: transparent;
        }
        .fc .fc-button {
          font-family: Manrope, sans-serif;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
        }
        .fc .fc-daygrid-day-number,
        .fc .fc-col-header-cell-cushion {
          font-weight: 600;
          color: #221921;
          text-decoration: none;
        }
        .fc .fc-daygrid-day-number {
          padding: 8px;
        }
        .fc-event {
          cursor: pointer;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }
      `}</style>
    </div>
  );
}

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#64748b',
};

const viewButtonStyle = {
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s',
};

export default AppointmentsPage;