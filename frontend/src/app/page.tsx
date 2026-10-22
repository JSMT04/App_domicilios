'use client';

import { useState, FormEvent } from 'react';
import { authApi } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { role: 'RESTAURANTE', label: '🍽️ Restaurante Demo', email: 'restaurante@demo.com', desc: 'Gestiona pedidos, menú y métricas' },
  { role: 'REPARTIDOR',  label: '🛵 Repartidor Demo',  email: 'repartidor@demo.com',  desc: 'Pedidos asignados y tracking GPS' },
  { role: 'CLIENTE',      label: '👤 Cliente Demo',     email: 'cliente@demo.com',      desc: 'Historial de compras y seguimiento' },
];

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [email, setEmail] = useState('restaurante@demo.com');
  const [password, setPassword] = useState('rapipedido123');

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RESTAURANTE');

  function selectDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('rapipedido123');
    setError('');
  }

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
        backgroundColor: '#0a0d17',
        backgroundImage: `
          radial-gradient(circle at 15% 30%, rgba(139, 92, 246, 0.22) 0%, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(20, 184, 166, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)
        `,
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          backgroundColor: '#121627',
          border: '1.5px solid rgba(139, 92, 246, 0.35)',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.12)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              fontSize: '2rem',
              marginBottom: '1rem',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.5)',
            }}
          >
            🛵
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            <span className="gradient-text">RapiPedido</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
            Plataforma de Domicilios en Tiempo Real
          </p>
        </div>

        {/* Demo Accounts Quick Picker */}
        <div
          style={{
            background: 'rgba(21, 26, 44, 0.85)',
            border: '1px solid #2a3450',
            borderRadius: '0.75rem',
            padding: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>⚡</span> Cuentas de Prueba (1 Clic):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectDemoAccount(acc.email)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '1.5px solid #8b5cf6' : '1px solid #333d59',
                    background: isSelected ? 'rgba(139, 92, 246, 0.25)' : '#181d2f',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                  title={acc.desc}
                >
                  {acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#181d2f',
            border: '1px solid #2d3652',
            borderRadius: '0.75rem',
            padding: '4px',
            marginBottom: '1.75rem',
          }}
        >
          {(['login', 'register'] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  background: active
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                    : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  boxShadow: active ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none',
                }}
              >
                {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            );
          })}
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1.5px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label
                htmlFor="login-email"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.45rem',
                }}
              >
                <span>✉️</span> Correo Electrónico
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.45rem',
                }}
              >
                <span>🔒</span> Contraseña
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

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              {loading ? (
                <span
                  className="animate-spin"
                  style={{
                    display: 'inline-block',
                    width: '1.1rem',
                    height: '1.1rem',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                '🚀'
              )}
              {loading ? 'Ingresando al sistema...' : 'Ingresar al Panel'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label
                htmlFor="reg-name"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}
              >
                Nombre Completo
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Martelo"
                required
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}
              >
                Correo Electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}
              >
                Teléfono (WhatsApp)
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+573001234567"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}
              >
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>

            <div>
              <label
                htmlFor="reg-role"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}
              >
                Tipo de Cuenta
              </label>
              <select
                id="reg-role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="RESTAURANTE">🍽️ Restaurante (Gestión de local y pedidos)</option>
                <option value="REPARTIDOR">🛵 Repartidor (Entregas y tracking GPS)</option>
                <option value="CLIENTE">👤 Cliente (Realizar pedidos)</option>
              </select>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              {loading ? (
                <span
                  className="animate-spin"
                  style={{
                    display: 'inline-block',
                    width: '1.1rem',
                    height: '1.1rem',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                '✨'
              )}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta y Entrar'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
