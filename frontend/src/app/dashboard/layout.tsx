'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

function getNavItems(role?: string) {
  if (role === 'REPARTIDOR') {
    return [
      { href: '/dashboard',        icon: '🛵', label: 'Rutas & Telemetría' },
      { href: '/dashboard/orders', icon: '📦', label: 'Pedidos Asignados' },
    ];
  }
  if (role === 'CLIENTE') {
    return [
      { href: '/dashboard',        icon: '🛍️', label: 'Mis Pedidos & Rastreo' },
    ];
  }
  // Default RESTAURANTE / ADMIN
  return [
    { href: '/dashboard',        icon: '📊', label: 'Dashboard General' },
    { href: '/dashboard/orders', icon: '📦', label: 'Gestión de Pedidos' },
    { href: '/dashboard/menu',   icon: '🍔', label: 'Gestión de Menú' },
  ];
}

function getRoleLabel(role?: string) {
  switch (role) {
    case 'REPARTIDOR':  return '🛵 Panel Repartidor';
    case 'CLIENTE':      return '👤 Portal Cliente';
    case 'ADMIN':        return '🛡️ Panel Administrador';
    default:             return '🍽️ Panel Restaurante';
  }
}

function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const navItems = getNavItems(user?.role);

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        background: '#121627',
        borderRight: '1px solid #232b43',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.45)',
          }}
        >
          🛵
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
            <span className="gradient-text">RapiPedido</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>
            {getRoleLabel(user?.role)}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem' }}>
          Navegación
        </div>
        {navItems.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${pathname === href ? ' active' : ''}`}
          >
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Role Switcher Pills (para pruebas rápidas de Juan) */}
      <div
        style={{
          background: '#181e35',
          border: '1px solid #2d3859',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🔄 Cambiar Rol Rápido:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            { label: '🍽️ Restaurante', email: 'restaurante@demo.com' },
            { label: '🛵 Repartidor', email: 'repartidor@demo.com' },
            { label: '👤 Cliente', email: 'cliente@demo.com' },
          ].map((r) => (
            <button
              key={r.email}
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.375rem',
                color: '#cbd5e1',
                padding: '0.35rem 0.5rem',
                fontSize: '0.72rem',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* User profile info */}
      <div
        style={{
          borderTop: '1px solid #232b43',
          paddingTop: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Usuario'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
              {user?.role || ''}
            </div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    const userData = localStorage.getItem('rp_user');
    if (!token) {
      window.location.href = '/';
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0e19' }}>
      <Sidebar user={user} />
      <main
        style={{
          flex: 1,
          padding: '2.25rem',
          overflowY: 'auto',
          backgroundImage: `
            radial-gradient(circle at 80% 10%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 20% 90%, rgba(20, 184, 166, 0.06) 0%, transparent 40%)
          `,
        }}
      >
        {children}
      </main>
    </div>
  );
}
