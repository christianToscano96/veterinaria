import { useState, useEffect } from 'react';
import { socialPostsApi } from '../lib/api';
import { Plus, Send, Calendar, Trash2, Edit, Image, Loader2, Facebook, Instagram, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledDate?: string;
  publishedDate?: string;
  mediaUrls?: string[];
  publishError?: string;
  createdBy: { name: string };
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: '#6b7280', icon: Edit },
  scheduled: { label: 'Programado', color: '#f59e0b', icon: Clock },
  published: { label: 'Publicado', color: '#10b981', icon: CheckCircle },
  failed: { label: 'Fallido', color: '#ef4444', icon: XCircle },
};

export function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    content: '',
    platforms: [] as string[],
    scheduledDate: '',
    mediaUrls: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const data = await socialPostsApi.list(params);
      setPosts((data as any).posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.content) {
      setFormError('El contenido es requerido');
      return;
    }
    if (form.platforms.length === 0) {
      setFormError('Selecciona al menos una plataforma');
      return;
    }

    setIsSaving(true);
    try {
      await socialPostsApi.create({
        content: form.content,
        platforms: form.platforms,
        scheduledDate: form.scheduledDate || undefined,
        mediaUrls: form.mediaUrls ? form.mediaUrls.split(',').map((url: string) => url.trim()).filter(Boolean) : undefined,
      });

      setShowForm(false);
      setForm({
        content: '',
        platforms: [],
        scheduledDate: '',
        mediaUrls: '',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este post?')) return;
    try {
      await socialPostsApi.delete(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  async function handlePublish(id: string) {
    if (!confirm('¿Publicar este post ahora?')) return;
    try {
      await socialPostsApi.publish(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al publicar');
    }
  }

  function togglePlatform(platform: string) {
    const platforms = form.platforms.includes(platform)
      ? form.platforms.filter((p: string) => p !== platform)
      : [...form.platforms, platform];
    setForm({ ...form, platforms });
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
            Social Media
          </h1>
          <p style={{ color: '#814974', marginTop: '4px' }}>
            Gestión de publicaciones para Facebook e Instagram
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#9e18a6', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Nuevo post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(56, 45, 54, 0.04)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#221921', marginBottom: '20px' }}>
            Nuevo Post
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <div>
              <label style={labelStyle}>Contenido *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="¿Qué querés publicar?"
                maxLength={500}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                {form.content.length}/500 caracteres
              </span>
            </div>

            <div>
              <label style={labelStyle}>Plataformas *</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => togglePlatform('facebook')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: form.platforms.includes('facebook') ? '#1877f2' : 'white',
                    color: form.platforms.includes('facebook') ? 'white' : '#1877f2',
                    borderRadius: '8px', border: `2px solid #1877f2`, fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  <Facebook size={18} />
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('instagram')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: form.platforms.includes('instagram') ? '#e4405f' : 'white',
                    color: form.platforms.includes('instagram') ? 'white' : '#e4405f',
                    borderRadius: '8px', border: `2px solid #e4405f`, fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  <Instagram size={18} />
                  Instagram
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Programar para más tarde</label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>URLs de medios (separados por coma)</label>
              <input
                type="text"
                value={form.mediaUrls}
                onChange={(e) => setForm({ ...form, mediaUrls: e.target.value })}
                style={inputStyle}
                placeholder="https://..., https://..."
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
                {isSaving ? 'Guardando...' : form.scheduledDate ? 'Programar' : 'Crear Borrador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { value: 'all', label: 'Todos' },
          { value: 'draft', label: 'Borradores' },
          { value: 'scheduled', label: 'Programados' },
          { value: 'published', label: 'Publicados' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '10px 16px',
              background: filter === f.value ? '#9e18a6' : 'white',
              color: filter === f.value ? 'white' : '#64748b',
              borderRadius: '8px',
              border: `1px solid ${filter === f.value ? '#9e18a6' : '#e2e8f0'}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#814974' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px' }}>Cargando...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <Send size={48} color="#d8b4e2" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>No hay posts</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => {
            const isExpanded = expandedId === post.id;
            const statusInfo = statusLabels[post.status] || statusLabels.draft;
            const StatusIcon = statusInfo.icon;
            const scheduledDate = post.scheduledDate ? parseISO(post.scheduledDate) : null;
            const publishedDate = post.publishedDate ? parseISO(post.publishedDate) : null;

            return (
              <div
                key={post.id}
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
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    {/* Platforms */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {post.platforms.includes('facebook') && <Facebook size={18} color="#1877f2" />}
                      {post.platforms.includes('instagram') && <Instagram size={18} color="#e4405f" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#221921', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content.substring(0, 80)}{post.content.length > 80 ? '...' : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '12px' }}>
                        {scheduledDate && isValid(scheduledDate) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {format(scheduledDate, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                          </span>
                        )}
                        {publishedDate && isValid(publishedDate) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                            <CheckCircle size={12} />
                            {format(publishedDate, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: `${statusInfo.color}15`, color: statusInfo.color, display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Contenido completo</span>
                      <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                    </div>

                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Medios</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {post.mediaUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: '#9e18a6', textDecoration: 'none' }}>
                              <Image size={14} />
                              Ver imagen
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {post.status === 'draft' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublish(post.id); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#10b981', color: 'white', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer' }}
                        >
                          <Send size={14} />
                          Publicar
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
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

export default SocialPostsPage;