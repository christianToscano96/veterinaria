import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi, animalsApi } from '../lib/api';
import { ArrowLeft, Save, Loader2, Clock, Calendar } from 'lucide-react';

const typeOptions = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'vaccination', label: 'Vacunación' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'checkup', label: 'Control' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'other', label: 'Otro' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export function AppointmentFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    animal: '',
    date: '',
    time: '09:00',
    type: 'consultation',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  async function loadAnimals() {
    try {
      const data = await animalsApi.list({ isActive: 'true' });
      setAnimals(data.animals || []);
    } catch (err) {
      console.error('Failed to load animals:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await appointmentsApi.create({
        animal: form.animal,
        date: form.date,
        time: form.time,
        type: form.type,
        reason: form.reason,
        notes: form.notes,
      });

      navigate('/appointments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear turno');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    background: 'white',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/appointments')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#64748b" />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>
            Nuevo turno
          </h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>
            Programar una cita
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Datos del turno */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Datos del turno</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Paciente *</label>
              <select
                value={form.animal}
                onChange={(e) => setForm({ ...form, animal: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Seleccionar paciente...</option>
                {animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>
                    {animal.name} ({animal.ownerName})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Fecha *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '44px' }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hora *</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '44px' }}
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tipo de turno *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={inputStyle}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Motivo</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                style={inputStyle}
                placeholder="Ej: Control anual,Vacunación antirábica..."
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Notas</h3>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', background: '#9e18a6', color: 'white', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
          {isSaving ? 'Guardando...' : 'Crear turno'}
        </button>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const sectionStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)',
};

const sectionTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#221921',
  marginBottom: '20px',
};

export default AppointmentFormPage;