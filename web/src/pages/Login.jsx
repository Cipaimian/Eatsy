import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('mahasiswa');
  const [availableTenants, setAvailableTenants] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', tenantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate(session.user.role === 'tenant' ? '/tenant' : '/mahasiswa', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (tab === 'register' && role === 'tenant') {
      api('/api/auth/tenants').then(setAvailableTenants).catch(() => setAvailableTenants([]));
    }
  }, [tab, role]);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role, tenantId: form.tenantId || undefined };
      const data = await api(endpoint, { method: 'POST', body });
      login(data);
      navigate(data.user.role === 'tenant' ? '/tenant' : '/mahasiswa', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.5rem', borderRadius: 14, margin: '0 auto 0.75rem' }}>🍽️</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.5px' }}>
            Eat<span style={{ color: 'var(--orange)' }}>sy</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            Kantin digital kampus
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={tab === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setTab('login'); setError(''); }}
            type="button"
          >Masuk</button>
          <button
            className={tab === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setTab('register'); setError(''); }}
            type="button"
          >Daftar</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="role-picker">
                {['mahasiswa', 'tenant'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-pick-btn${role === r ? ' active' : ''}`}
                    onClick={() => setRole(r)}
                  >
                    {r === 'mahasiswa' ? '🎓' : '🧑‍🍳'}
                    <span>{r === 'mahasiswa' ? 'Mahasiswa' : 'Tenant'}</span>
                  </button>
                ))}
              </div>

              <div className="field-group">
                <label className="field-label">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>

              {role === 'tenant' && (
                <div className="field-group">
                  <label className="field-label">Tenant yang Dikelola</label>
                  {availableTenants.length === 0
                    ? <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', padding: '0.5rem 0' }}>Semua tenant sudah punya akun.</p>
                    : (
                      <select
                        value={form.tenantId}
                        onChange={(e) => set('tenantId', e.target.value)}
                        required
                      >
                        <option value="">Pilih tenant...</option>
                        {availableTenants.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    )}
                </div>
              )}
            </>
          )}

          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="notice error" style={{ margin: 0 }}>
              <span>❌</span><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {loading ? 'Memuat...' : tab === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
