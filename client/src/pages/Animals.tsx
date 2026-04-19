import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalsApi } from '../lib/api';
import { PawPrint, Plus, Search, Loader2, ChevronRight, Phone, Mail, Dog, Cat, Bird, Rabbit } from 'lucide-react';

const speciesIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
};

export function AnimalsPage() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');

  useEffect(() => {
    loadAnimals();
  }, [search, filterSpecies]);

  async function loadAnimals() {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterSpecies) params.species = filterSpecies;
      
      const data = await animalsApi.list(Object.keys(params).length > 0 ? params : undefined);
      setAnimals(data.animals || []);
    } catch (error) {
      console.error('Failed to load animals:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const getSpeciesIcon = (species: string) => {
    const Icon = speciesIcons[species] || PawPrint;
    return <Icon size={20} />;
  };

  const isAdmin = user?.role === 'admin';

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
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#221921' }}>Pacientes</h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>{animals.length} pacientes activos</p>
        </div>
        {isAdmin && (
          <Link to="/animals/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#9e18a6', color: 'white', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', transition: 'background 0.2s' }}>
            <Plus size={20} />
            Nuevo paciente
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o dueño..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 48px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', outline: 'none', background: 'white' }}
          />
        </div>
        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', background: 'white', minWidth: '150px' }}
        >
          <option value="">Todas las espécies</option>
          <option value="dog">Perro</option>
          <option value="cat">Gato</option>
          <option value="bird">Pájaro</option>
          <option value="rabbit">Conejo</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Animals List */}
      {animals.length === 0 ? (
        <div style={emptyStateStyle}>
          <PawPrint size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontWeight: '600', color: '#64748b' }}>No hay pacientes</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            {search || filterSpecies ? 'No se encontraron resultados' : 'Agregá tu primer paciente'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {animals.map((animal: any) => {
            const animalId = animal.id || animal._id;
            return (
              <Link
                key={animalId}
                to={`/animals/${animalId}`}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'white', borderRadius: '14px', boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)', textDecoration: 'none', transition: 'all 0.2s' }}
              >
                {/* Species Icon */}
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(158, 24, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9e18a6' }}>
                  {getSpeciesIcon(animal.species)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: '600', color: '#221921', fontSize: '16px' }}>{animal.name}</p>
                    {animal.breed && <span style={{ fontSize: '13px', color: '#814974' }}>({animal.breed})</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                      <Mail size={14} /> {animal.ownerName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                      <Phone size={14} /> {animal.ownerPhone}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight size={20} color="#94a3b8" />
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }}
      `}</style>
    </div>
  );
}

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)',
};

export default AnimalsPage;