'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE:  '🟡 Pendiente',
  PREPARANDO: '🔵 Preparando',
  EN_CAMINO:  '🟣 En Camino',
  ENTREGADO:  '🟢 Entregado',
  CANCELADO:  '🔴 Cancelado',
};

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number | string; accent: string }) {
  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: accent }}>{value}</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    if (!token) return;
    ordersApi.getAll(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pendiente: orders.filter((o) => o.status === 'PENDIENTE').length,
    enCamino: orders.filter((o) => o.status === 'EN_CAMINO').length,
    entregado: orders.filter((o) => o.status === 'ENTREGADO').length,
    revenue: orders
      .filter((o) => o.status === 'ENTREGADO')
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  const recent = [...orders].slice(0, 8);

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Dashboard <span className="gradient-text">General</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Resumen de operaciones de tu restaurante en tiempo real
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard icon="📦" label="Total Pedidos" value={stats.total} accent="var(--color-brand-violet)" />
        <StatCard icon="🟡" label="Pendientes" value={stats.pendiente} accent="#eab308" />
        <StatCard icon="🛵" label="En Camino" value={stats.enCamino} accent="var(--color-brand-violet-light)" />
        <StatCard icon="✅" label="Entregados" value={stats.entregado} accent="var(--color-success)" />
        <StatCard
          icon="💰"
          label="Ingresos (COP)"
          value={`$${stats.revenue.toLocaleString('es-CO')}`}
          accent="var(--color-brand-teal)"
        />
      </div>

      {/* Recent Orders */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Pedidos Recientes</h2>
          <a href="/dashboard/orders" style={{ fontSize: '0.8rem', color: 'var(--color-brand-violet-light)', textDecoration: 'none' }}>
            Ver todos →
          </a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            <div className="animate-spin" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--color-surface-500)', borderTopColor: 'var(--color-brand-violet)', borderRadius: '50%' }} />
          </div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No hay pedidos aún. ¡Comparte tu restaurante!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-brand-violet-light)' }}>
                    {order.orderNumber}
                  </td>
                  <td>{order.customer?.name || '—'}</td>
                  <td>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${Number(order.total).toLocaleString('es-CO')}
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
