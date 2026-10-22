'use client';

import { FormEvent, useEffect, useState } from 'react';
import { restaurantApi } from '@/lib/api';

export default function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openingTime, setOpeningTime] = useState('10:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [latitude, setLatitude] = useState(4.676);
  const [longitude, setLongitude] = useState(-74.048);

  const token = typeof window !== 'undefined' ? localStorage.getItem('rp_token') || '' : '';
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rp_user') || '{}') : {};

  useEffect(() => {
    if (!token) return;
    restaurantApi.getAll()
      .then((list: any[]) => {
        // Encontrar el restaurante del usuario actual si existe
        const myRest = list.find((r) => r.ownerId === user.id || r.owner?.id === user.id) || (user.role === 'RESTAURANTE' && list.length > 0 ? list[0] : null);
        if (myRest) {
          setRestaurant(myRest);
          setName(myRest.name || '');
          setDescription(myRest.description || '');
          setAddress(myRest.address || '');
          setPhone(myRest.phone || '');
          setImageUrl(myRest.imageUrl || '');
          setOpeningTime(myRest.openingTime || '10:00');
          setClosingTime(myRest.closingTime || '22:00');
          setLatitude(myRest.latitude || 4.676);
          setLongitude(myRest.longitude || -74.048);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user.id, user.role]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (restaurant) {
        // Actualizar restaurante existente
        const updated = await restaurantApi.update(token, restaurant.id, {
          name,
          description,
          address,
          phone,
          imageUrl,
          openingTime,
          closingTime,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
        setRestaurant(updated);
        setSuccessMsg('¡Información del restaurante actualizada exitosamente!');
      } else {
        // Crear nuevo restaurante para el usuario
        const created = await restaurantApi.create(token, {
          name,
          description,
          address,
          phone,
          imageUrl,
          openingTime,
          closingTime,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
        setRestaurant(created);
        setSuccessMsg('¡Restaurante registrado con éxito! Ahora está disponible para clientes y repartidores.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los datos del restaurante');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        <div className="animate-spin" style={{ display: 'inline-block', width: '2.5rem', height: '2.5rem', border: '3px solid #334155', borderTopColor: '#f97316', borderRadius: '50%', marginBottom: '1rem' }} />
        <p>Cargando información de tu restaurante...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🏪 Personalización de Empresa
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
          {restaurant ? `Configuración: ${restaurant.name}` : 'Registrar Nuevo Restaurante'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Personaliza los datos de tu empresa. Cada restaurante que registres quedará habilitado en tiempo real en el catálogo para clientes y en los despachos de los repartidores.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-card" style={{ padding: '2rem', border: '1.5px solid #334155' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Logo Preview if URL exists */}
          {imageUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '0.5rem',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #475569',
                }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Vista Previa del Banner / Logo</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Así verán los clientes la imagen de tu restaurante en el menú</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Nombre del Restaurante *
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Pizza Nostra Artesanal 🍕"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Teléfono de Contacto
              </label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+576015550100"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
              Descripción del Negocio
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tus especialidades, historia o tipo de comida..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
              Dirección Física del Local *
            </label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Carrera 11 # 93-40, Bogotá"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
              URL de Imagen o Logo (Unsplash / Web)
            </label>
            <input
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Hora de Apertura
              </label>
              <input
                type="time"
                className="form-input"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Hora de Cierre
              </label>
              <input
                type="time"
                className="form-input"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Latitud (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.4rem' }}>
                Longitud (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
            >
              {saving ? 'Guardando...' : restaurant ? '💾 Guardar Cambios del Restaurante' : '✨ Registrar Mi Restaurante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
