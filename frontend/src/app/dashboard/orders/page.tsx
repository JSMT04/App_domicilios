'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';

const STATUS_FLOW = ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'];

const STATUS_NEXT: Record<string, string | null> = {
  PENDIENTE:  'PREPARANDO',
  PREPARANDO: 'EN_CAMINO',
  EN_CAMINO:  'ENTREGADO',
  ENTREGADO:  null,
  CANCELADO:  null,
};

const STATUS_ACTIONS: Record<string, string> = {
  PENDIENTE:  '✅ Confirmar y Preparar',
  PREPARANDO: '🛵 Asignar Repartidor',
  EN_CAMINO:  '📍 Marcar Entregado',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const token = typeof window !== 'undefined' ? localStorage.getItem('rp_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    ordersApi.getAll(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function advanceStatus(order: any) {
    const nextStatus = STATUS_NEXT[order.status];
    if (!nextStatus) return;
    setUpdating(order.id);
    try {
      const updated = await ordersApi.updateStatus(token, order.id, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)));
      if (selected?.id === order.id) setSelected((p: any) => ({ ...p, status: updated.status }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function cancelOrder(order: any) {
    if (!confirm('¿Cancelar este pedido?')) return;
    setUpdating(order.id);
    try {
      const updated = await ordersApi.updateStatus(token, order.id, 'CANCELADO');
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)));
      if (selected?.id === order.id) setSelected((p: any) => ({ ...p, status: updated.status }));
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filterStatus === 'ALL' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 4rem)' }}>
      {/* Order list */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Pedidos <span className="gradient-text">en Tiempo Real</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Gestiona el estado de cada pedido usando la máquina de estados
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: filterStatus === s ? 'var(--color-brand-violet)' : 'rgba(148,163,184,0.15)',
                background: filterStatus === s ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: filterStatus === s ? 'var(--color-brand-violet-light)' : 'var(--color-text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s === 'ALL' ? `Todos (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--color-surface-500)', borderTopColor: 'var(--color-brand-violet)', borderRadius: '50%' }} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
            {filtered.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                <p>No hay pedidos en este estado</p>
              </div>
            ) : filtered.map((order) => (
              <div
                key={order.id}
                className="glass-card"
                onClick={() => setSelected(order)}
                style={{
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selected?.id === order.id
                    ? '1px solid var(--color-brand-violet)'
                    : '1px solid rgba(124,58,237,0.12)',
                  transform: selected?.id === order.id ? 'translateX(3px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-brand-violet-light)', fontWeight: 700 }}>
                    {order.orderNumber}
                  </span>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    👤 {order.customer?.name || '—'}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-teal)' }}>
                    ${Number(order.total).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail panel */}
      <div
        className="glass-card"
        style={{
          width: '340px',
          flexShrink: 0,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          opacity: selected ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}
      >
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>👆</div>
            <p style={{ fontSize: '0.875rem' }}>Selecciona un pedido para ver el detalle y gestionar su estado</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Detalle del Pedido</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            {/* State machine progress */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {STATUS_FLOW.map((s, i) => {
                  const idx = STATUS_FLOW.indexOf(selected.status);
                  const isPast = i < idx;
                  const isCurrent = i === idx;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 'auto' }}>
                      <div
                        title={s}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                          background: isCurrent
                            ? 'linear-gradient(135deg, var(--color-brand-violet), var(--color-brand-blue))'
                            : isPast ? 'var(--color-success)' : 'var(--color-surface-600)',
                          color: '#fff',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(124,58,237,0.3)' : 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        {isPast ? '✓' : i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div style={{ flex: 1, height: '2px', background: isPast ? 'var(--color-success)' : 'var(--color-surface-600)', transition: 'background 0.3s' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                {selected.status === 'CANCELADO' ? '❌ Pedido cancelado' : `Estado actual: ${selected.status}`}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Ítems</div>
              {(selected.items || []).map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(148,163,184,0.06)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    ×{item.quantity} {item.menuItem?.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>${Number(item.subtotal).toLocaleString('es-CO')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontWeight: 700, color: 'var(--color-brand-teal)' }}>
                <span>Total</span>
                <span>${Number(selected.total).toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--color-surface-700)', borderRadius: 'var(--radius-md)' }}>
              📍 {selected.deliveryAddress}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
              {STATUS_NEXT[selected.status] && (
                <button
                  id={`advance-order-${selected.id}`}
                  className="btn-primary"
                  onClick={() => advanceStatus(selected)}
                  disabled={updating === selected.id}
                  style={{ justifyContent: 'center' }}
                >
                  {updating === selected.id
                    ? <span className="animate-spin" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    : STATUS_ACTIONS[selected.status] || '→'}
                </button>
              )}
              {(selected.status === 'PENDIENTE' || selected.status === 'PREPARANDO') && (
                <button
                  id={`cancel-order-${selected.id}`}
                  className="btn-ghost"
                  onClick={() => cancelOrder(selected)}
                  disabled={updating === selected.id}
                  style={{ justifyContent: 'center', color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  ✕ Cancelar Pedido
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
