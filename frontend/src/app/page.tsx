'use client';

import { useState, FormEvent } from 'react';
import { authApi } from '@/lib/api';

const QUICK_ACCOUNTS = [
  { role: 'RESTAURANTE', label: '🍽️ Restaurante', email: 'restaurante@demo.com', desc: 'Gestiona pedidos, menú y métricas' },
  { role: 'REPARTIDOR',  label: '🛵 Repartidor',  email: 'repartidor@demo.com',  desc: 'Pedidos asignados y tracking GPS' },
  { role: 'CLIENTE',      label: '👤 Cliente',     email: 'cliente@demo.com',      desc: 'Historial de compras y pedidos' },
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

  function selectAccount(targetEmail: string) {
    setEmail(targetEmail);
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
        backgroundColor: '#0b1120',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(2, 132, 199, 0.08) 0%, transparent 40%)
        `,
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2.5rem',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '1rem',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              fontSize: '1.8rem',
              marginBottom: '0.85rem',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
            }}
          >
            🛵
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Rapi<span style={{ color: '#f97316' }}>Pedido</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
            Plataforma de Domicilios y Gestión en Tiempo Real
          </p>
        </div>

        {/* Quick Accounts Picker */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⚡</span> Cuentas de prueba:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {QUICK_ACCOUNTS.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectAccount(acc.email)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '1.5px solid #f97316' : '1px solid #334155',
                    background: isSelected ? 'rgba(249, 115, 22, 0.15)' : '#1e293b',
                    color: isSelected ? '#f97316' : '#cbd5e1',
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
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.625rem',
            padding: '3px',
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
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  background: active ? '#f97316' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  boxShadow: active ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
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
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
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
                  color: '#ffffff',
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
                  color: '#ffffff',
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
              {loading ? 'Ingresando al panel...' : 'Ingresar al Panel'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label
                htmlFor="reg-name"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}
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
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}
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
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}
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
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}
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
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}
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
                <option value="RESTAURANTE">🍽️ Restaurante (Gestión de local, menú y pedidos)</option>
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
