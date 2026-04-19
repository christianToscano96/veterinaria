import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicalRecordsApi, animalsApi } from '../lib/api';
import { Plus, FileText, Calendar, User, Pill, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface MedicalRecord {
  id: string;
  animal: { id: string; name: string; species: string; ownerName: string };
  date: string;
  type: string;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  dosage?: string;
  notes?: string;
  veterinarian: { name: string };
  appointment?: { id: string; date: string; type: string };
}

const typeLabels: Record<string, string> = {
  consultation: 'Consulta',
  surgery: 'Cirugía',
  treatment: 'Tratamiento',
  diagnosis: 'Diagnóstico',
  checkup: 'Control',
  other: 'Otro',
};

export function MedicalRecordsPage() {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId?: string }>();
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  // State for selected animal - starts as null, set after initialization
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    date: '',
    type: 'consultation',
    diagnosis: '',
    treatment: '',
    medication: '',
    dosage: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Single initialization effect - runs once on mount
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);
      
      try {
        // First, get the list of animals
        const animalsData = await animalsApi.list({ isActive: 'true' });
        const animals = (animalsData as any).animals || [];
        
        let targetAnimal = null;
        let targetId = null;
        
        // If animalId param is valid, try to find it in the list
        if (animalId && animalId !== 'undefined' && animalId !== 'null') {
          targetAnimal = animals.find((a: any) => a.id === animalId || a._id === animalId);
          if (targetAnimal) {
            targetId = targetAnimal.id || targetAnimal._id;
          }
        }
        
        // If not found, use first animal
        if (!targetAnimal && animals.length > 0) {
          targetAnimal = animals[0];
          targetId = targetAnimal.id || targetAnimal._id;
        }
        
        if (mounted && targetId) {
          setSelectedAnimalId(targetId);
          setAnimal(targetAnimal);
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    }
    
    initialize();
    
    return () => { mounted = false; };
  }, []); // Empty deps - only run once

  // Load data when selectedAnimalId or filterType changes (after initialization)
  useEffect(() => {
    if (!isInitialized || !selectedAnimalId) return;
    
    async function loadData() {
      setLoading(true);
      try {
        // Fetch animal details
        const animalData = await animalsApi.get(selectedAnimalId);
        setAnimal(animalData);

        // Fetch medical records
        const params: Record<string, string> = {};
        if (filterType !== 'all') {
          params.type = filterType;
        }
        
        const data = await medicalRecordsApi.byAnimal(selectedAnimalId, params);
        setRecords((data as any).records || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [selectedAnimalId, filterType, isInitialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!selectedAnimalId) {
      setFormError('Selecciona un paciente primero');
      return;
    }
    if (!form.date || !form.type) {
      setFormError('Fecha y tipo son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await medicalRecordsApi.create({
        animal: selectedAnimalId,
        date: form.date,
        type: form.type,
        diagnosis: form.diagnosis || undefined,
        treatment: form.treatment || undefined,
        medication: form.medication || undefined,
        dosage: form.dosage || undefined,
        notes: form.notes || undefined,
      });

      setShowForm(false);
      setForm({
        date: '',
        type: 'consultation',
        diagnosis: '',
        treatment: '',
        medication: '',
        dosage: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro médico?')) return;
    try {
      await medicalRecordsApi.delete(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#221921' }}>
            Historial Médico
          </h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>
            {animal ? `${animal.name} - ${animal.ownerName}` : 'Selecciona un paciente'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!selectedAnimalId}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
            background: selectedAnimalId ? '#9e18a6' : '#ccc', color: 'white', borderRadius: '10px', 
            border: 'none', fontSize: '14px', fontWeight: '600', cursor: selectedAnimalId ? 'pointer' : 'not-allowed' 
          }}
        >
          <Plus size={18} />
          Nuevo registro
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#221921', marginBottom: '20px' }}>
            Nuevo Registro Médico
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Fecha *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={inputStyle}
                  required
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Diagnóstico</label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                style={inputStyle}
                placeholder="Diagnóstico..."
              />
            </div>

            <div>
              <label style={labelStyle}>Tratamiento</label>
              <textarea
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Tratamiento realizado..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Medicación</label>
                <input
                  type="text"
                  value={form.medication}
                  onChange={(e) => setForm({ ...form, medication: e.target.value })}
                  style={inputStyle}
                  placeholder="Medicamento..."
                />
              </div>
              <div>
                <label style={labelStyle}>Dosis</label>
                <input
                  type="text"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  style={inputStyle}
                  placeholder="Dosis..."
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
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
                {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '10px 16px',
            background: filterType === 'all' ? '#9e18a6' : 'white',
            color: filterType === 'all' ? 'white' : '#64748b',
            borderRadius: '8px',
            border: `1px solid ${filterType === 'all' ? '#9e18a6' : '#e2e8f0'}`,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Todos
        </button>
        {Object.entries(typeLabels).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilterType(value)}
            style={{
              padding: '10px 16px',
              background: filterType === value ? '#9e18a6' : 'white',
              color: filterType === value ? 'white' : '#64748b',
              borderRadius: '8px',
              border: `1px solid ${filterType === value ? '#9e18a6' : '#e2e8f0'}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#814974' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px' }}>Cargando...</p>
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <FileText size={48} color="#d8b4e2" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>No hay registros médicos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {records.map((record) => {
            const isExpanded = expandedId === record.id;
            const recordDate = record.date ? parseISO(record.date) : null;

            return (
              <div
                key={record.id}
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
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <FileText size={20} color="#9e18a6" />
                    <div>
                      <div style={{ fontWeight: '600', color: '#221921', fontSize: '15px' }}>
                        {typeLabels[record.type] || record.type}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', color: '#94a3b8', fontSize: '13px' }}>
                        {recordDate && isValid(recordDate) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {format(recordDate, 'dd/MM/yyyy', { locale: es })}
                          </span>
                        )}
                        {record.veterinarian && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} />
                            {record.veterinarian.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    {record.diagnosis && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Diagnóstico</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{record.diagnosis}</span>
                      </div>
                    )}
                    {record.treatment && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Tratamiento</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{record.treatment}</span>
                      </div>
                    )}
                    {record.medication && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Medicación</span>
                          <span style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Pill size={14} /> {record.medication} {record.dosage && `(${record.dosage})`}
                          </span>
                        </div>
                      </div>
                    )}
                    {record.notes && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Notas</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{record.notes}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
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

export default MedicalRecordsPage;