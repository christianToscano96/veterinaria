import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fafafa 0%, #f3e8f6 50%, #fafafa 100%)', padding: '20px' }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(158, 24, 166, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(188, 58, 193, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '72px', height: '72px', background: '#9e18a6', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 40px rgba(158, 24, 166, 0.3)' }}>
            <PawPrint size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#9e18a6', letterSpacing: '-0.02em' }}>
            Veterinaria Pandy
          </h1>
          <p style={{ color: '#814974', marginTop: '8px', fontSize: '15px' }}>
            Gestión clínica profesional
          </p>
        </div>

        {/* Login Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 60px rgba(56, 45, 54, 0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', color: '#221921' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', border: 'none', borderBottom: '2px solid #d7c0d1', background: 'transparent', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="tu@email.com"
                required
                onFocus={(e) => e.target.style.borderBottomColor = '#9e18a6'}
                onBlur={(e) => e.target.style.borderBottomColor = '#d7c0d1'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', color: '#221921' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', border: 'none', borderBottom: '2px solid #d7c0d1', background: 'transparent', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="••••••••"
                required
                onFocus={(e) => e.target.style.borderBottomColor = '#9e18a6'}
                onBlur={(e) => e.target.style.borderBottomColor = '#d7c0d1'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', background: '#9e18a6', color: 'white', fontSize: '15px', fontWeight: '600', borderRadius: '10px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
            >
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#814974' }}>
          <p>Credenciales de demo:</p>
          <code style={{ fontSize: '12px', color: '#9e18a6' }}>admin@vetclinic.com / Password1</code>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;