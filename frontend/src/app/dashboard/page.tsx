'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string; icon: string }> = {
  PENDIENTE:  { label: 'Pendiente',  badge: 'badge-pendiente',  color: '#f59e0b', icon: '🟡' },
  PREPARANDO: { label: 'Preparando', badge: 'badge-preparando', color: '#0284c7', icon: '🍳' },
  EN_CAMINO:  { label: 'En Camino',  badge: 'badge-en_camino',  color: '#f97316', icon: '🛵' },
  ENTREGADO:  { label: 'Entregado',  badge: 'badge-entregado',  color: '#10b981', icon: '✅' },
  CANCELADO:  { label: 'Cancelado',  badge: 'badge-cancelado',  color: '#ef4444', icon: '🔴' },
};

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number | string; accent: string }) {
  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{
        borderTop: `4px solid ${accent}`,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderTopColor: accent,
        padding: '1.25rem 1.5rem',
        borderRadius: '0.75rem',
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
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🛵 Vista: Repartidor Activo
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Panel de Reparto · <span style={{ color: '#f97316' }}>{user?.name || 'Andrés'}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Gestión de entregas asignadas, estado de ruta y transmisión de coordenadas GPS en tiempo real.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="🛵" label="Pedidos en Ruta" value={orders.filter((o) => o.status === 'EN_CAMINO').length} accent="#f97316" />
          <StatCard icon="✅" label="Entregas Realizadas" value={completedOrders.length} accent="#10b981" />
          <StatCard icon="💰" label="Ganancias del Día" value={`$${(completedOrders.length * 5000).toLocaleString('es-CO')}`} accent="#0284c7" />
          <StatCard icon="⭐" label="Calificación Promedio" value="5.0 ★" accent="#f59e0b" />
        </div>

        {/* Live GPS Telemetry Card */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-pulse-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', background: gpsSimulating ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  Telemetría GPS en Vivo (WebSocket Gateway)
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Canal WebSocket: <code style={{ color: '#38bdf8' }}>ws://localhost:3000/tracking</code> (Emisión cada 5s hacia Redis)
              </p>
            </div>
            <button
              onClick={() => setGpsSimulating(!gpsSimulating)}
              className="btn-primary"
              style={{
                background: gpsSimulating ? '#ef4444' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                fontSize: '0.85rem',
              }}
            >
              {gpsSimulating ? '⏹️ Detener Emisión GPS' : '🛰️ Iniciar Emisión GPS en Tiempo Real'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
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
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{o.orderNumber}</td>
                  <td>{o.deliveryAddress}</td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[o.status]?.badge || ''}`}>
                      {STATUS_CONFIG[o.status]?.icon} {o.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>$5.000 COP</td>
                  <td>
                    {o.status === 'EN_CAMINO' ? (
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>🚴‍♂️ En entrega</span>
                    ) : o.status === 'ENTREGADO' ? (
                      <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Completado</span>
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
        {/* Header with Call to Action to Order */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              👤 Portal del Cliente
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              Hola, <span style={{ color: '#f97316' }}>{user?.name || 'Laura'}</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Rastrea tus domicilios en tiempo real y pide comida de tus restaurantes preferidos.
            </p>
          </div>

          <a
            href="/dashboard/order"
            className="btn-primary"
            style={{ fontSize: '0.95rem', padding: '0.85rem 1.5rem' }}
          >
            🍔 Hacer un Nuevo Pedido
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="🛍️" label="Tus Pedidos Realizados" value={orders.length} accent="#0284c7" />
          <StatCard icon="🛵" label="Pedidos Activos" value={orders.filter((o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO').length} accent="#f97316" />
          <StatCard icon="🍔" label="Restaurante Favorito" value="Burguer Bros" accent="#ea580c" />
          <StatCard icon="💳" label="Total en Compras" value={`$${totalSpent.toLocaleString('es-CO')}`} accent="#10b981" />
        </div>

        {/* Active Order Tracker */}
        {activeOrder && (
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1.5px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>Pedido en Curso</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeOrder.orderNumber} · {activeOrder.restaurant?.name || 'Burguer Bros 🍔'}
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
                      background: isPassed ? 'rgba(249, 115, 22, 0.15)' : '#0f172a',
                      border: isPassed ? '1.5px solid #f97316' : '1px solid #334155',
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

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dirección de Entrega:</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{activeOrder.deliveryAddress}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total:</div>
                <div style={{ fontSize: '1.15rem', color: '#10b981', fontWeight: 800 }}>${Number(activeOrder.total).toLocaleString('es-CO')} COP</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders History */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              📜 Historial de Tus Pedidos
            </h2>
            <a href="/dashboard/order" style={{ fontSize: '0.85rem', color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
              + Hacer otro pedido
            </a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Restaurante</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{o.orderNumber}</td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{o.restaurant?.name || 'Burguer Bros'}</td>
                  <td>
                    <span className={`badge ${STATUS_CONFIG[o.status]?.badge || ''}`}>
                      {STATUS_CONFIG[o.status]?.icon} {o.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>${Number(o.total).toLocaleString('es-CO')}</td>
                  <td>{o.paymentMethod || 'EFECTIVO'}</td>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🍽️ Panel del Restaurante
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Burguer Bros 🍔 · <span style={{ color: '#f97316' }}>Panel de Control</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Monitoreo de órdenes entrantes, despacho a domiciliarios y facturación diaria.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/dashboard/menu" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
            🍽️ Ver Menú
          </a>
          <a href="/dashboard/restaurant" className="btn-primary" style={{ fontSize: '0.85rem' }}>
            🏪 Configurar Empresa
          </a>
        </div>
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
        <StatCard icon="📦" label="Total Pedidos" value={stats.total} accent="#0284c7" />
        <StatCard icon="🟡" label="Pendientes" value={stats.pendiente} accent="#f59e0b" />
        <StatCard icon="🍳" label="En Cocina" value={stats.preparando} accent="#38bdf8" />
        <StatCard icon="🛵" label="En Camino" value={stats.enCamino} accent="#f97316" />
        <StatCard icon="✅" label="Entregados" value={stats.entregado} accent="#10b981" />
        <StatCard
          icon="💰"
          label="Ingresos Facturados"
          value={`$${stats.revenue.toLocaleString('es-CO')}`}
          accent="#10b981"
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
              color: '#f97316',
              textDecoration: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.5rem',
              background: 'rgba(249, 115, 22, 0.1)',
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
                borderTopColor: '#f97316',
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
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                    {order.orderNumber}
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    {order.customer?.name || 'Cliente'}
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: order.paymentStatus === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
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
