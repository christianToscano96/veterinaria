import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { animalsApi } from '../lib/api';
import { ArrowLeft, Save, Loader2, Dog, Cat, Bird, Rabbit } from 'lucide-react';

const speciesOptions = [
  { value: 'dog', label: 'Perro', icon: Dog },
  { value: 'cat', label: 'Gato', icon: Cat },
  { value: 'bird', label: 'Pájaro', icon: Bird },
  { value: 'rabbit', label: 'Conejo', icon: Rabbit },
  { value: 'other', label: 'Otro', icon: Dog },
];

const genderOptions = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Hembra' },
  { value: 'unknown', label: 'Desconocido' },
];

export function AnimalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'unknown',
    color: '',
    birthDate: '',
    weight: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    notes: '',
  });

  // Load animal if editing
  useEffect(() => {
    if (isEditing) {
      loadAnimal();
    }
  }, [id]);

  async function loadAnimal() {
    try {
      const data = await animalsApi.get(id!);
      const d = data as any;
      setForm({
        name: d.name || '',
        species: d.species || 'dog',
        breed: d.breed || '',
        gender: d.gender || 'unknown',
        color: d.color || '',
        birthDate: d.birthDate ? d.birthDate.split('T')[0] : '',
        weight: d.weight?.toString() || '',
        ownerName: d.ownerName || '',
        ownerPhone: d.ownerPhone || '',
        ownerEmail: d.ownerEmail || '',
        ownerAddress: d.ownerAddress || '',
        notes: d.notes || '',
      });
    } catch (err) {
      setError('Animal no encontrado');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        birthDate: form.birthDate ? new Date(form.birthDate) : undefined,
      };

      if (isEditing) {
        await animalsApi.update(id!, payload);
      } else {
        await animalsApi.create(payload);
      }

      navigate('/animals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
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
          onClick={() => navigate('/animals')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#64748b" />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#221921' }}>
            {isEditing ? 'Editar paciente' : 'Nuevo paciente'}
          </h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>
            {isEditing ? 'Actualizá los datos del paciente' : 'Agregá un nuevo paciente'}
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

        {/* Datos del animal */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Datos del animal</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Especie *</label>
                <select
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                  style={inputStyle}
                >
                  {speciesOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Raza</label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: Labrador"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Género</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  style={inputStyle}
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  style={inputStyle}
                  placeholder="Negro"
                />
              </div>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  style={inputStyle}
                  placeholder="25"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Datos del dueño */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Datos del dueño</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nombre del dueño *</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Teléfono *</label>
                <input
                  type="tel"
                  value={form.ownerPhone}
                  onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                type="text"
                value={form.ownerAddress}
                onChange={(e) => setForm({ ...form, ownerAddress: e.target.value })}
                style={inputStyle}
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
            placeholder="Notas adicionales sobre el paciente..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', background: '#9e18a6', color: 'white', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
          {isSaving ? 'Guardando...' : 'Guardar paciente'}
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

export default AnimalFormPage;