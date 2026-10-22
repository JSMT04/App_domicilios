'use client';

import { FormEvent, useEffect, useState } from 'react';
import { menuApi, restaurantApi } from '@/lib/api';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState<{ categoryId: string; name: string } | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Category form
  const [catName, setCatName] = useState('');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('rp_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    restaurantApi.getAll()
      .then((list: any[]) => {
        if (list.length > 0) setRestaurant(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    try {
      const cat = await menuApi.createCategory(token, restaurant.id, { name: catName });
      setRestaurant((r: any) => ({ ...r, categories: [...r.categories, { ...cat, menuItems: [] }] }));
      setCatName('');
      setShowCatForm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!showItemForm) return;
    setSaving(true);
    try {
      const item = await menuApi.createItem(token, showItemForm.categoryId, {
        name: itemName,
        description: itemDesc,
        price: Number(itemPrice),
        isAvailable: itemAvailable,
      });
      setRestaurant((r: any) => ({
        ...r,
        categories: r.categories.map((c: any) =>
          c.id === showItemForm.categoryId
            ? { ...c, menuItems: [...c.menuItems, item] }
            : c,
        ),
      }));
      setShowItemForm(null);
      setItemName(''); setItemDesc(''); setItemPrice(''); setItemAvailable(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: any, categoryId: string) {
    try {
      const updated = await menuApi.updateItem(token, item.id, { isAvailable: !item.isAvailable });
      setRestaurant((r: any) => ({
        ...r,
        categories: r.categories.map((c: any) =>
          c.id === categoryId
            ? { ...c, menuItems: c.menuItems.map((m: any) => (m.id === item.id ? { ...m, isAvailable: updated.isAvailable } : m)) }
            : c,
        ),
      }));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--color-surface-500)', borderTopColor: 'var(--color-brand-violet)', borderRadius: '50%' }} />
    </div>
  );

  if (!restaurant) return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No tienes restaurante</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Crea tu restaurante primero para gestionar el menú.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Gestión de <span className="gradient-text">Menú</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {restaurant.name} · {restaurant.categories.reduce((acc: number, c: any) => acc + c.menuItems.length, 0)} ítems en {restaurant.categories.length} categorías
          </p>
        </div>
        <button
          id="add-category-btn"
          className="btn-primary"
          onClick={() => setShowCatForm(true)}
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Add category form */}
      {showCatForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Nueva Categoría</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <input
                id="category-name-input"
                className="form-input"
                placeholder="Ej: Hamburguesas, Pizzas, Bebidas..."
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            <button id="save-category-btn" type="submit" className="btn-primary" disabled={saving}>
              {saving ? '...' : '💾 Guardar'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowCatForm(false)}>Cancelar</button>
          </form>
        </div>
      )}

      {/* Add item form */}
      {showItemForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
            Nuevo Ítem en "{showItemForm.name}"
          </h3>
          <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre del ítem *</label>
              <input id="item-name-input" className="form-input" placeholder="Hamburguesa Clásica" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Descripción</label>
              <input id="item-desc-input" className="form-input" placeholder="Con queso, lechuga y tomate..." value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Precio (COP) *</label>
              <input id="item-price-input" type="number" min="0" className="form-input" placeholder="18500" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.4rem' }}>
              <input id="item-available-check" type="checkbox" checked={itemAvailable} onChange={(e) => setItemAvailable(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand-violet)' }} />
              <label htmlFor="item-available-check" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Disponible</label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.6rem' }}>
              <button id="save-item-btn" type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : '💾 Agregar Ítem'}</button>
              <button type="button" className="btn-ghost" onClick={() => setShowItemForm(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {restaurant.categories.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍽️</div>
            <p>Crea tu primera categoría para empezar a agregar ítems</p>
          </div>
        ) : (
          restaurant.categories.map((cat: any) => (
            <div key={cat.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{cat.name}</h3>
                <button
                  id={`add-item-${cat.id}`}
                  className="btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => { setShowItemForm({ categoryId: cat.id, name: cat.name }); setShowCatForm(false); }}
                >
                  + Agregar Ítem
                </button>
              </div>

              {cat.menuItems.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Sin ítems aún</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {cat.menuItems.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-700)',
                        border: `1px solid ${item.isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                              {item.description}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, color: 'var(--color-brand-teal)', fontSize: '0.9rem' }}>
                            ${Number(item.price).toLocaleString('es-CO')}
                          </div>
                        </div>
                        <button
                          id={`toggle-item-${item.id}`}
                          onClick={() => toggleAvailability(item, cat.id)}
                          title={item.isAvailable ? 'Desactivar' : 'Activar'}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                            background: item.isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: item.isAvailable ? 'var(--color-success)' : 'var(--color-error)',
                            flexShrink: 0,
                          }}
                        >
                          {item.isAvailable ? '✓' : '✕'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
