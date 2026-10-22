'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard',         icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/orders',  icon: '📦', label: 'Pedidos' },
  { href: '/dashboard/menu',    icon: '🍽️', label: 'Menú' },
];

function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--color-surface-800)',
        borderRight: '1px solid rgba(148,163,184,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.25rem' }}>
        <div
          style={{
            width: '38px', height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-brand-violet), var(--color-brand-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          }}
        >
          🛵
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            <span className="gradient-text">RapiPedido</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Panel Restaurante</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${pathname === href ? ' active' : ''}`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div
        style={{
          borderTop: '1px solid rgba(148,163,184,0.08)',
          paddingTop: '1rem',
          marginTop: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-brand-violet), var(--color-brand-teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Usuario'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {user?.role || ''}
            </div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          background: 'radial-gradient(ellipse at 70% 20%, rgba(124,58,237,0.05) 0%, transparent 50%), var(--color-surface-900)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
