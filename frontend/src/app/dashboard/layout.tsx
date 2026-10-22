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
      { href: '/dashboard/order',  icon: '🍔', label: 'Pedir Comida' },
    ];
  }
  // Default RESTAURANTE / ADMIN
  return [
    { href: '/dashboard',            icon: '📊', label: 'Dashboard General' },
    { href: '/dashboard/orders',     icon: '📦', label: 'Gestión de Pedidos' },
    { href: '/dashboard/menu',       icon: '🍽️', label: 'Gestión de Menú' },
    { href: '/dashboard/restaurant', icon: '🏪', label: 'Mi Restaurante' },
  ];
}

function getRoleLabel(role?: string) {
  switch (role) {
    case 'REPARTIDOR':  return '🛵 Repartidor';
    case 'CLIENTE':      return '👤 Cliente';
    case 'ADMIN':        return '🛡️ Administrador';
    default:             return '🍽️ Restaurante';
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
        background: '#0f172a',
        borderRight: '1px solid #334155',
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
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
          }}
        >
          🛵
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
            Rapi<span style={{ color: '#f97316' }}>Pedido</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>
            {getRoleLabel(user?.role)}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem' }}>
          Menú Principal
        </div>
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher */}
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🔄 Cambiar de Cuenta:
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
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#cbd5e1',
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
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
          borderTop: '1px solid #334155',
          paddingTop: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #0284c7 100%)',
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1120' }}>
      <Sidebar user={user} />
      <main
        style={{
          flex: 1,
          padding: '2.25rem',
          overflowY: 'auto',
          backgroundColor: '#0b1120',
          backgroundImage: `
            radial-gradient(circle at 90% 10%, rgba(249, 115, 22, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(2, 132, 199, 0.04) 0%, transparent 40%)
          `,
        }}
      >
        {children}
      </main>
    </div>
  );
}
