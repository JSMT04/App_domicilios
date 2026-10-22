'use client';

import { useState, FormEvent } from 'react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RESTAURANTE');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('rp_token', res.token);
      localStorage.setItem('rp_user', JSON.stringify(res.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({ email, password, name, phone, role });
      localStorage.setItem('rp_token', res.token);
      localStorage.setItem('rp_user', JSON.stringify(res.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.08) 0%, transparent 60%), var(--color-surface-900)',
        padding: '1rem',
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1), transparent)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card animate-fade-in-up"
        style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--color-brand-violet), var(--color-brand-blue))',
              fontSize: '1.75rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 25px rgba(124,58,237,0.4)',
            }}
          >
            🛵
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <span className="gradient-text">RapiPedido</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Panel de Gestión · Restaurantes
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-surface-800)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '1.75rem',
          }}
        >
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                background: tab === t
                  ? 'linear-gradient(135deg, var(--color-brand-violet), var(--color-brand-blue))'
                  : 'transparent',
                color: tab === t ? '#fff' : 'var(--color-text-muted)',
                boxShadow: tab === t ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@restaurante.com"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> : '🔐'}
              {loading ? 'Ingresando...' : 'Ingresar al Panel'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Nombre completo</label>
              <input id="reg-name" type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Martelo" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Correo electrónico</label>
              <input id="reg-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@restaurante.com" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Teléfono (opcional)</label>
              <input id="reg-phone" type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+573001234567" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Contraseña</label>
              <input id="reg-password" type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Tipo de cuenta</label>
              <select id="reg-role" className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="RESTAURANTE">🍽️ Restaurante</option>
                <option value="REPARTIDOR">🛵 Repartidor</option>
                <option value="CLIENTE">👤 Cliente</option>
              </select>
            </div>
            <button id="register-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> : '🚀'}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
