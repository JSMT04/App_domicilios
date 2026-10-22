'use client';

import { FormEvent, useEffect, useState } from 'react';
import { menuApi, restaurantApi } from '@/lib/api';

export default function MenuPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState<{ categoryId: string; name: string } | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Category form
  const [catName, setCatName] = useState('');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('rp_token') || '' : '';
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rp_user') || '{}') : {};

  useEffect(() => {
    if (!token) return;
    restaurantApi.getAll()
      .then((list: any[]) => {
        setRestaurants(list);
        // Priorizar el restaurante del usuario actual
        const myRest = list.find((r) => r.ownerId === user.id || r.owner?.id === user.id) || list[0];
        if (myRest) setSelectedRestId(myRest.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user.id]);

  const restaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    try {
      const cat = await menuApi.createCategory(token, restaurant.id, { name: catName });
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant.id
            ? { ...r, categories: [...(r.categories || []), { ...cat, menuItems: [] }] }
            : r
        )
      );
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
        imageUrl: itemImageUrl || undefined,
        isAvailable: itemAvailable,
      });
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant.id
            ? {
                ...r,
                categories: r.categories.map((c: any) =>
                  c.id === showItemForm.categoryId
                    ? { ...c, menuItems: [...(c.menuItems || []), item] }
                    : c
                ),
              }
            : r
        )
      );
      setShowItemForm(null);
      setItemName('');
      setItemDesc('');
      setItemPrice('');
      setItemImageUrl('');
      setItemAvailable(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: any, categoryId: string) {
    try {
      const updated = await menuApi.updateItem(token, item.id, { isAvailable: !item.isAvailable });
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant.id
            ? {
                ...r,
                categories: r.categories.map((c: any) =>
                  c.id === categoryId
                    ? {
                        ...c,
                        menuItems: c.menuItems.map((m: any) =>
                          m.id === item.id ? { ...m, isAvailable: updated.isAvailable } : m
                        ),
                      }
                    : c
                ),
              }
            : r
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #334155', borderTopColor: '#f97316', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }} className="glass-card">
        <div style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            No tienes restaurante registrado
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
            Para gestionar un menú, primero registra los datos de tu empresa.
          </p>
          <a href="/dashboard/restaurant" className="btn-primary">
            🏪 Registrar Mi Restaurante
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🍽️ Catálogo de Platos
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Gestión de Menú · <span style={{ color: '#f97316' }}>{restaurant.name}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {restaurant.categories?.reduce((acc: number, c: any) => acc + (c.menuItems?.length || 0), 0) || 0} productos activos en {restaurant.categories?.length || 0} categorías
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {restaurants.length > 1 && (
            <select
              className="form-input"
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <button
            id="add-category-btn"
            className="btn-primary"
            onClick={() => setShowCatForm(true)}
            style={{ fontSize: '0.85rem' }}
          >
            + Nueva Categoría
          </button>
        </div>
      </div>

      {/* Add category form */}
      {showCatForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1.5px solid #f97316' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Nueva Categoría de Menú
          </h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                id="category-name-input"
                className="form-input"
                placeholder="Ej: Pizzas, Hamburguesas, Postres, Bebidas..."
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear Categoría'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowCatForm(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Categories & Items List */}
      {(!restaurant.categories || restaurant.categories.length === 0) ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ marginBottom: '1rem' }}>Aún no has creado categorías para este restaurante.</p>
          <button className="btn-primary" onClick={() => setShowCatForm(true)}>
            + Agregar Primera Categoría
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {restaurant.categories.map((category: any) => (
            <div key={category.id} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {category.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {category.menuItems?.length || 0} productos
                  </p>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => setShowItemForm({ categoryId: category.id, name: category.name })}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  + Agregar Plato
                </button>
              </div>

              {/* Add item form modal/inline */}
              {showItemForm?.categoryId === category.id && (
                <form
                  onSubmit={handleAddItem}
                  style={{
                    background: '#0f172a',
                    padding: '1.25rem',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #334155',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f97316' }}>
                    Nuevo plato en: {category.name}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nombre del plato *"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Precio en COP *"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Descripción del plato..."
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                  />
                  <input
                    type="url"
                    className="form-input"
                    placeholder="URL de foto (opcional)"
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar Plato'}
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => setShowItemForm(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Items grid */}
              {(!category.menuItems || category.menuItems.length === 0) ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No hay productos en esta categoría todavía.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {category.menuItems.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      {item.imageUrl && (
                        <div
                          style={{
                            height: '110px',
                            borderRadius: '0.375rem',
                            backgroundImage: `url(${item.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            marginBottom: '0.75rem',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                            {item.name}
                          </h5>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f97316' }}>
                            ${Number(item.price).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.3', marginBottom: '0.75rem' }}>
                          {item.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '0.5rem', marginTop: 'auto' }}>
                        <span style={{ fontSize: '0.75rem', color: item.isAvailable ? '#10b981' : '#f87171', fontWeight: 600 }}>
                          {item.isAvailable ? '● Disponible' : '○ Agotado'}
                        </span>
                        <button
                          onClick={() => toggleAvailability(item, category.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: '0.375rem',
                            color: '#cbd5e1',
                            fontSize: '0.72rem',
                            padding: '0.3rem 0.6rem',
                            cursor: 'pointer',
                          }}
                        >
                          {item.isAvailable ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
