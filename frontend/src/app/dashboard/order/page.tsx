'use client';

import { useEffect, useState } from 'react';
import { restaurantApi, ordersApi } from '@/lib/api';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function OrderFoodPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('Calle 85 # 15-20, Apto 402, Bogotá');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const token = typeof window !== 'undefined' ? localStorage.getItem('rp_token') || '' : '';

  useEffect(() => {
    restaurantApi.getAll()
      .then((data: any[]) => {
        setRestaurants(data);
        if (data.length > 0) setSelectedRestId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 5000 : 0;
  const total = subtotal + deliveryFee;

  async function handleCheckout() {
    if (cart.length === 0) return alert('Agrega al menos un plato a tu pedido');
    if (!deliveryAddress) return alert('Ingresa la dirección de entrega');
    setSubmitting(true);
    try {
      const payload = {
        restaurantId: currentRestaurant.id,
        deliveryAddress,
        notes: orderNotes,
        paymentMethod,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
      };
      const created = await ordersApi.create(token, payload);
      setSuccessOrder(created);
      setCart([]);
    } catch (err: any) {
      alert(err.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        <div className="animate-spin" style={{ display: 'inline-block', width: '2.5rem', height: '2.5rem', border: '3px solid #334155', borderTopColor: '#f97316', borderRadius: '50%', marginBottom: '1rem' }} />
        <p>Cargando restaurantes disponibles...</p>
      </div>
    );
  }

  if (successOrder) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }} className="glass-card animate-fade-in-up">
        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            ¡Pedido Realizado con Éxito!
          </h2>
          <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Tu orden <strong style={{ color: '#f97316' }}>{successOrder.orderNumber}</strong> ha sido enviada a <strong>{currentRestaurant?.name}</strong> y entrará en preparación en breve.
          </p>

          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Restaurante:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentRestaurant?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dirección de Entrega:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{successOrder.deliveryAddress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total a Pagar:</span>
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>${Number(successOrder.total).toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => { setSuccessOrder(null); window.location.href = '/dashboard'; }}
              className="btn-primary"
              style={{ fontSize: '0.9rem' }}
            >
              📍 Ir a Rastrear Mi Pedido
            </button>
            <button
              onClick={() => setSuccessOrder(null)}
              className="btn-ghost"
              style={{ fontSize: '0.9rem' }}
            >
              Pedir Más Comida
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allItems = currentRestaurant?.categories?.flatMap((c: any) =>
    (c.menuItems || []).map((m: any) => ({ ...m, categoryName: c.name, categoryId: c.id }))
  ) || [];

  const filteredItems = selectedCategory === 'ALL'
    ? allItems
    : allItems.filter((i: any) => i.categoryId === selectedCategory);

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🍔 Explorar Restaurantes & Menús
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
          Pedir Comida en Línea
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Selecciona tu restaurante favorito, arma tu carrito y recibe tu domicilio en minutos.
        </p>
      </div>

      {/* Restaurant Selector Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Restaurantes Disponibles ({restaurants.length}):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {restaurants.map((rest) => {
            const isSelected = rest.id === currentRestaurant?.id;
            return (
              <div
                key={rest.id}
                onClick={() => { setSelectedRestId(rest.id); setCart([]); setSelectedCategory('ALL'); }}
                style={{
                  background: isSelected ? '#1e293b' : '#0f172a',
                  border: isSelected ? '2px solid #f97316' : '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 16px rgba(249, 115, 22, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      background: '#334155',
                      backgroundImage: rest.imageUrl ? `url(${rest.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {!rest.imageUrl && '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rest.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {rest.address}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                      ● Abierto ({rest.openingTime || '10:00'} - {rest.closingTime || '22:00'})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Menu + Cart Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Menu Items Section */}
        <div>
          {/* Categories Tabs */}
          {currentRestaurant?.categories?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory('ALL')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedCategory === 'ALL' ? '#f97316' : '#334155',
                  background: selectedCategory === 'ALL' ? '#f97316' : '#1e293b',
                  color: selectedCategory === 'ALL' ? '#ffffff' : '#cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Todos los Platos ({allItems.length})
              </button>
              {currentRestaurant.categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: selectedCategory === c.id ? '#f97316' : '#334155',
                    background: selectedCategory === c.id ? '#f97316' : '#1e293b',
                    color: selectedCategory === c.id ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c.name} ({c.menuItems?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filteredItems.map((item: any) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                {item.imageUrl && (
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '0.5rem',
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      marginBottom: '1rem',
                    }}
                  />
                )}
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.3' }}>
                    {item.description || 'Delicioso plato preparado con ingredientes frescos.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f97316' }}>
                    ${Number(item.price).toLocaleString('es-CO')}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            position: 'sticky',
            top: '2rem',
            border: '1.5px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🛒</span> Tu Carrito
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: 700 }}>
              {cart.reduce((s, i) => s + i.quantity, 0)} productos
            </span>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛍️</div>
              <p style={{ fontSize: '0.85rem' }}>Tu carrito está vacío. Agrega tus platos favoritos.</p>
            </div>
          ) : (
            <div>
              {/* Item list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '220px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div key={item.menuItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#f97316' }}>
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery info inputs */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.3rem' }}>
                    Dirección de Entrega:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.3rem' }}>
                    Notas para el restaurante:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ej: Sin cebolla, llamar al llegar"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.3rem' }}>
                    Método de Pago:
                  </label>
                  <select
                    className="form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  >
                    <option value="EFECTIVO">💵 Efectivo contra entrega</option>
                    <option value="TARJETA">💳 Tarjeta Débito / Crédito</option>
                    <option value="NEQUI">📱 Nequi / Daviplata</option>
                  </select>
                </div>
              </div>

              {/* Order Totals */}
              <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #334155', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  <span>Tarifa Domicilio:</span>
                  <span>${deliveryFee.toLocaleString('es-CO')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#ffffff', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                  <span>Total:</span>
                  <span style={{ color: '#f97316' }}>${total.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                {submitting ? 'Enviando Pedido...' : '🚀 Confirmar Pedido'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
