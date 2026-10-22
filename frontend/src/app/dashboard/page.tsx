'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string; icon: string }> = {
  PENDIENTE:  { label: 'Pendiente',  badge: 'badge-pendiente',  color: '#facc15', icon: '🟡' },
  PREPARANDO: { label: 'Preparando', badge: 'badge-preparando', color: '#60a5fa', icon: '🍳' },
  EN_CAMINO:  { label: 'En Camino',  badge: 'badge-en_camino',  color: '#c4b5fd', icon: '🛵' },
  ENTREGADO:  { label: 'Entregado',  badge: 'badge-entregado',  color: '#4ade80', icon: '✅' },
  CANCELADO:  { label: 'Cancelado',  badge: 'badge-cancelado',  color: '#f87171', icon: '🔴' },
};

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number | string; accent: string }) {
  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{
        borderTop: `4px solid ${accent}`,
        backgroundColor: '#161c2e',
        border: '1px solid #28334f',
        borderTopColor: accent,
        padding: '1.25rem 1.5rem',
        borderRadius: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: accent }}>{value}</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState({ lat: 4.6650, lng: -74.0800 });

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    const userData = localStorage.getItem('rp_user');
    if (userData) setUser(JSON.parse(userData));
    if (!token) return;

    ordersApi.getAll(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Simulación de telemetría GPS para el Repartidor
  useEffect(() => {
    if (!gpsSimulating) return;
    const interval = setInterval(() => {
      setGpsCoords((prev) => ({
        lat: Number((prev.lat + (Math.random() - 0.49) * 0.001).toFixed(6)),
        lng: Number((prev.lng + (Math.random() - 0.49) * 0.001).toFixed(6)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [gpsSimulating]);

  const role = user?.role || 'RESTAURANTE';

  // ─────────────────────────────────────────────────────────────
  // 1. VISTA: REPARTIDOR
  // ─────────────────────────────────────────────────────────────
  if (role === 'REPARTIDOR') {
    const enCaminoOrder = orders.find((o) => o.status === 'EN_CAMINO') || orders[0];
    const completedOrders = orders.filter((o) => o.status === 'ENTREGADO');

    return (
      <div style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🛵 Vista Especializada: Domiciliario
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Panel de Reparto · <span className="gradient-text">{user?.name || 'Andrés'}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Gestión de pedidos asignados, estado de ruta y transmisión de coordenadas GPS.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="🛵" label="Pedidos en Ruta" value={orders.filter((o) => o.status === 'EN_CAMINO').length} accent="#8b5cf6" />
          <StatCard icon="✅" label="Entregas Realizadas" value={completedOrders.length} accent="#22c55e" />
          <StatCard icon="💰" label="Ganancias del Día" value={`$${(completedOrders.length * 5000).toLocaleString('es-CO')}`} accent="#14b8a6" />
          <StatCard icon="⭐" label="Calificación Promedio" value="5.0 ★" accent="#f59e0b" />
        </div>

        {/* Live GPS Telemetry Card */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1.5px solid rgba(56, 189, 248, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-pulse-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', background: gpsSimulating ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  Telemetría GPS en Vivo (WebSocket Gateway)
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Canal WebSocket: <code style={{ color: '#38bdf8' }}>ws://localhost:3000/tracking</code> (Emisión cada 5s respaldada en Redis)
              </p>
            </div>
            <button
              onClick={() => setGpsSimulating(!gpsSimulating)}
              className="btn-primary"
              style={{
                background: gpsSimulating ? '#ef4444' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                fontSize: '0.85rem',
              }}
            >
              {gpsSimulating ? '⏹️ Detener Emisión GPS' : '🛰️ Iniciar Emisión GPS en Tiempo Real'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#0e1220', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #252e46' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LATITUD ACTUAL</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{gpsCoords.lat}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LONGITUD ACTUAL</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{gpsCoords.lng}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DESTINO ASIGNADO</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{enCaminoOrder?.deliveryAddress || 'Av. El Dorado #68C-61'}</div>
            </div>
          </div>
        </div>

        {/* Assigned Orders Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            📦 Lista de Pedidos en tu Zona
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Tarifa Entrega</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c4b5fd' }}>{o.orderNumber}</td>
                  <td>{o.deliveryAddress}</td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[o.status]?.badge || ''}`}>
                      {STATUS_CONFIG[o.status]?.icon} {o.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#22c55e' }}>$5.000 COP</td>
                  <td>
                    {o.status === 'EN_CAMINO' ? (
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>🚴‍♂️ En entrega</span>
                    ) : o.status === 'ENTREGADO' ? (
                      <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Completado</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>En restaurante</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. VISTA: CLIENTE
  // ─────────────────────────────────────────────────────────────
  if (role === 'CLIENTE') {
    const activeOrder = orders.find((o) => o.status === 'EN_CAMINO' || o.status === 'PREPARANDO' || o.status === 'PENDIENTE') || orders[0];
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    return (
      <div style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            👤 Vista Especializada: Cliente
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Bienvenido, <span className="gradient-text">{user?.name || 'Laura'}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Consulta el estado de tu pedido en tiempo real y revisa tu historial de compras.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="🛍️" label="Tus Pedidos Realizados" value={orders.length} accent="#8b5cf6" />
          <StatCard icon="🛵" label="Pedidos Activos" value={orders.filter((o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO').length} accent="#38bdf8" />
          <StatCard icon="🍔" label="Restaurante Favorito" value="Burguer Bros" accent="#f97316" />
          <StatCard icon="💳" label="Total en Compras" value={`$${totalSpent.toLocaleString('es-CO')}`} accent="#22c55e" />
        </div>

        {/* Active Order Tracker */}
        {activeOrder && (
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1.5px solid rgba(139, 92, 246, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase' }}>Pedido en Curso</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeOrder.orderNumber} · Burguer Bros 🍔
                </h2>
              </div>
              <span className={`badge ${STATUS_CONFIG[activeOrder.status]?.badge || ''}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                {STATUS_CONFIG[activeOrder.status]?.icon} {activeOrder.status}
              </span>
            </div>

            {/* Stepper visual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'PENDIENTE', label: '1. Recibido', icon: '📝' },
                { key: 'PREPARANDO', label: '2. En Cocina', icon: '🍳' },
                { key: 'EN_CAMINO', label: '3. En Camino', icon: '🛵' },
                { key: 'ENTREGADO', label: '4. Entregado', icon: '🎉' },
              ].map((step, idx) => {
                const isPassed = ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'].indexOf(activeOrder.status) >= idx;
                return (
                  <div
                    key={step.key}
                    style={{
                      background: isPassed ? 'rgba(139, 92, 246, 0.25)' : '#131728',
                      border: isPassed ? '1.5px solid #8b5cf6' : '1px solid #262e45',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{step.icon}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isPassed ? '#ffffff' : '#64748b' }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#0e1220', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dirección de Entrega:</div>
                <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>{activeOrder.deliveryAddress}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total a Pagar:</div>
                <div style={{ fontSize: '1.1rem', color: '#22c55e', fontWeight: 800 }}>${Number(activeOrder.total).toLocaleString('es-CO')} COP</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders History */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            📜 Historial Completo de Compras
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c4b5fd' }}>{o.orderNumber}</td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[o.status]?.badge || ''}`}>
                      {STATUS_CONFIG[o.status]?.icon} {o.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>${Number(o.total).toLocaleString('es-CO')}</td>
                  <td>{o.paymentMethod || 'TARJETA'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(o.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. VISTA: RESTAURANTE (DEFAULT)
  // ─────────────────────────────────────────────────────────────
  const stats = {
    total: orders.length,
    pendiente: orders.filter((o) => o.status === 'PENDIENTE').length,
    preparando: orders.filter((o) => o.status === 'PREPARANDO').length,
    enCamino: orders.filter((o) => o.status === 'EN_CAMINO').length,
    entregado: orders.filter((o) => o.status === 'ENTREGADO').length,
    revenue: orders
      .filter((o) => o.status === 'ENTREGADO')
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🍽️ Vista Especializada: Restaurante
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
          Burguer Bros 🍔 · <span className="gradient-text">Panel de Control</span>
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Monitoreo de órdenes entrantes, despacho a domiciliarios y facturación diaria.
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
        <StatCard icon="📦" label="Total Pedidos" value={stats.total} accent="#8b5cf6" />
        <StatCard icon="🟡" label="Pendientes" value={stats.pendiente} accent="#facc15" />
        <StatCard icon="🍳" label="En Cocina" value={stats.preparando} accent="#60a5fa" />
        <StatCard icon="🛵" label="En Camino" value={stats.enCamino} accent="#c4b5fd" />
        <StatCard icon="✅" label="Entregados" value={stats.entregado} accent="#22c55e" />
        <StatCard
          icon="💰"
          label="Ingresos Facturados"
          value={`$${stats.revenue.toLocaleString('es-CO')}`}
          accent="#14b8a6"
        />
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Pedidos en Tiempo Real</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sincronizado con base de datos PostgreSQL y eventos Socket.io</p>
          </div>
          <a
            href="/dashboard/orders"
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#38bdf8',
              textDecoration: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.5rem',
              background: 'rgba(56, 189, 248, 0.1)',
            }}
          >
            Administrar Pedidos →
          </a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div
              className="animate-spin"
              style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '3px solid #334155',
                borderTopColor: '#8b5cf6',
                borderRadius: '50%',
                marginBottom: '1rem',
              }}
            />
            <p>Cargando órdenes del restaurante...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No hay pedidos registrados aún.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Total (COP)</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c4b5fd' }}>
                    {order.orderNumber}
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    {order.customer?.name || 'Cliente Demo'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {order.deliveryAddress}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[order.status]?.badge || ''}`}>
                      {STATUS_CONFIG[order.status]?.icon} {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#ffffff' }}>
                    ${Number(order.total).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: order.paymentStatus === 'COMPLETED' ? '#4ade80' : '#facc15' }}>
                      {order.paymentStatus === 'COMPLETED' ? '✓ PAGADO' : '⏳ PENDIENTE'}
                    </span>
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
