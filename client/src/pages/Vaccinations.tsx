import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vaccinationsApi, animalsApi } from '../lib/api';
import { Plus, Syringe, AlertTriangle, Check, Clock, Calendar, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  ownerName: string;
}

interface Vaccination {
  id: string;
  animal: Animal;
  name: string;
  dateAdministered: string;
  nextDueDate?: string;
  batchNumber?: string;
  laboratory?: string;
  notes?: string;
  reminderSent?: boolean;
  status: 'ok' | 'due' | 'overdue';
}

type FilterType = 'all' | 'upcoming' | 'overdue';

export function VaccinationsPage() {
  const navigate = useNavigate();
  
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [animals, setAnimals] = useState<Record<string, { name: string; ownerName: string }>>({});
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    animal: '',
    name: '',
    dateAdministered: '',
    nextDueDate: '',
    batchNumber: '',
    laboratory: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    setLoading(true);
    try {
      let data;
      if (filter === 'upcoming') {
        data = await vaccinationsApi.upcoming(30);
        setVaccinations(data.vaccinations as Vaccination[]);
      } else if (filter === 'overdue') {
        data = await vaccinationsApi.overdue();
        setVaccinations(data.vaccinations as Vaccination[]);
      } else {
        // For "all", get all animals and their vaccinations
        const response = await animalsApi.list({ isActive: 'true' });
        const animalsData = (response as any).animals || [];
        
        const allVaccinations: Vaccination[] = [];
        const animalMap: Record<string, { name: string; ownerName: string }> = {};
        
        for (const animal of animalsData) {
          const animalId = animal.id;
          animalMap[animalId] = { name: animal.name, ownerName: animal.ownerName };
          const vaxData = await vaccinationsApi.byAnimal(animalId);
          for (const v of vaxData.vaccinations as Vaccination[]) {
            allVaccinations.push({ ...v, animal: { id: animalId, _id: animalId, name: animal.name, species: animal.species, ownerName: animal.ownerName } });
          }
        }
        
        setAnimals(animalMap);
        // Sort by date (most recent first)
        allVaccinations.sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());
        setVaccinations(allVaccinations);
      }
    } catch (err) {
      console.error('Failed to load vaccinations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!form.animal || form.animal.length < 10) {
      setFormError('Por favor selecciona un paciente válido');
      return;
    }
    if (!form.name) {
      setFormError('Por favor selecciona una vacuna');
      return;
    }
    if (!form.dateAdministered) {
      setFormError('Por favor selecciona la fecha de aplicación');
      return;
    }

    setIsSaving(true);

    try {
      await vaccinationsApi.create({
        animal: form.animal,
        name: form.name,
        dateAdministered: form.dateAdministered,
        nextDueDate: form.nextDueDate || undefined,
        batchNumber: form.batchNumber || undefined,
        laboratory: form.laboratory || undefined,
        notes: form.notes || undefined,
      });

      setShowForm(false);
      setForm({
        animal: '',
        name: '',
        dateAdministered: '',
        nextDueDate: '',
        batchNumber: '',
        laboratory: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      console.error('Vaccination create error:', err);
      let errorMsg = 'Error al guardar';
      if (err.message) {
        errorMsg = err.message;
      }
      setFormError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta vacuna?')) return;
    
    try {
      await vaccinationsApi.delete(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ok': return '#10b981';
      case 'due': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  }

  // Helper to get animal ID - handles both id and _id from different API responses
  function getAnimalId(animal: any): string {
    return animal?.id || animal?._id || '';
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'ok': return 'Al día';
      case 'due': return 'Por vencer';
      case 'overdue': return 'Vencida';
      default: return 'Desconocido';
    }
  }

  function getDaysUntilDue(nextDueDate?: string) {
    if (!nextDueDate) return null;
    const due = parseISO(nextDueDate);
    if (!isValid(due)) return null;
    return differenceInDays(due, new Date());
  }

  // Get animals list for form
  const [animalOptions, setAnimalOptions] = useState<any[]>([]);
  useEffect(() => {
    animalsApi.list({ isActive: 'true' }).then(data => {
      setAnimalOptions(data.animals as any[]);
    }).catch(console.error);
  }, []);

  const commonVaccines = [
    'Rabia',
    'Pentavalente',
    'Antirrabica',
    'Moquillo',
    'Parvovirus',
    'Hepatitis',
    'Leptospirosis',
    'Tos de Perrera',
    'Gripe Felina',
    'Leucemia Felina (FeLV)',
    'Panleucopenia',
    'Calicivirus',
    'Otro',
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#221921' }}>
            Vacunas
          </h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>
            Seguimiento de vacunación de pacientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#9e18a6', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Nueva vacuna
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#221921', marginBottom: '20px' }}>
            Registrar vacuna
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Paciente *</label>
                <select
                  value={form.animal}
                  onChange={(e) => setForm({ ...form, animal: e.target.value })}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar paciente...</option>
                  {animalOptions.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} ({animal.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Vacuna *</label>
                <select
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {commonVaccines.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Fecha de aplicación *</label>
                <input
                  type="date"
                  value={form.dateAdministered}
                  onChange={(e) => setForm({ ...form, dateAdministered: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Próxima fecha</label>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Lote</label>
                <input
                  type="text"
                  value={form.batchNumber}
                  onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                  style={inputStyle}
                  placeholder="Número de lote"
                />
              </div>

              <div>
                <label style={labelStyle}>Laboratorio</label>
                <input
                  type="text"
                  value={form.laboratory}
                  onChange={(e) => setForm({ ...form, laboratory: e.target.value })}
                  style={inputStyle}
                  placeholder="Nombre del laboratorio"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Notas adicionales..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '12px 20px', background: '#f1f5f9', color: '#64748b', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#9e18a6', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { value: 'all', label: 'Todas' },
          { value: 'upcoming', label: 'Próximas (30 días)' },
          { value: 'overdue', label: 'Vencidas' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as FilterType)}
            style={{
              padding: '10px 16px',
              background: filter === f.value ? '#9e18a6' : 'white',
              color: filter === f.value ? 'white' : '#64748b',
              borderRadius: '8px',
              border: `1px solid ${filter === f.value ? '#9e18a6' : '#e2e8f0'}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#814974' }}>
          <Clock size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px' }}>Cargando...</p>
        </div>
      ) : vaccinations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <Syringe size={48} color="#d8b4e2" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            {filter === 'all' ? 'No hay vacunas registradas' : filter === 'upcoming' ? 'No hay vacunas próximas' : 'No hay vacunas vencidas'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {vaccinations.map((vax) => {
            const daysUntil = getDaysUntilDue(vax.nextDueDate);
            const isExpanded = expandedId === vax.id;

            return (
              <div
                key={vax.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(56, 45, 54, 0.04)',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : vax.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Status indicator */}
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getStatusColor(vax.status),
                        flexShrink: 0,
                      }}
                      title={getStatusLabel(vax.status)}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#221921', fontSize: '15px' }}>
                          {vax.name}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>
                          {vax.animal?.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {vax.dateAdministered ? format(parseISO(vax.dateAdministered), 'dd/MM/yyyy', { locale: es }) : '-'}
                        </span>
                        {vax.nextDueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getStatusColor(vax.status) }}>
                            {vax.status === 'overdue' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                            {daysUntil !== null && (
                              <>
                                {daysUntil < 0
                                  ? `Vencida hace ${Math.abs(daysUntil)} días`
                                  : daysUntil === 0
                                    ? 'Vence hoy'
                                    : `Vence en ${daysUntil} días`
                                }
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: `${getStatusColor(vax.status)}15`,
                        color: getStatusColor(vax.status),
                      }}
                    >
                      {getStatusLabel(vax.status)}
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Paciente</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {vax.animal?.name} ({vax.animal?.ownerName})
                        </span>
                      </div>
                      {vax.laboratory && (
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Laboratorio</span>
                          <span style={{ fontSize: '14px', color: '#374151' }}>{vax.laboratory}</span>
                        </div>
                      )}
                      {vax.batchNumber && (
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Lote</span>
                          <span style={{ fontSize: '14px', color: '#374151' }}>{vax.batchNumber}</span>
                        </div>
                      )}
                      {vax.notes && (
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Notas</span>
                          <span style={{ fontSize: '14px', color: '#374151' }}>{vax.notes}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(vax.id); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: 'white',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
};

export default VaccinationsPage;