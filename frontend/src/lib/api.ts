// ─── API Client ─────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API error ${res.status}`);
  }

  return json.data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }) =>
    apiFetch<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Restaurants ─────────────────────────────────────────────────────────────

export const restaurantApi = {
  getAll: () => apiFetch<any[]>('/restaurants'),
  getById: (id: string) => apiFetch<any>(`/restaurants/${id}`),
  create: (token: string, data: any) =>
    apiFetch<any>('/restaurants', { method: 'POST', body: JSON.stringify(data), token }),
  update: (token: string, id: string, data: any) =>
    apiFetch<any>(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
};

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menuApi = {
  createCategory: (token: string, restaurantId: string, data: any) =>
    apiFetch<any>(`/restaurants/${restaurantId}/categories`, {
      method: 'POST', body: JSON.stringify(data), token,
    }),
  createItem: (token: string, categoryId: string, data: any) =>
    apiFetch<any>(`/categories/${categoryId}/menu-items`, {
      method: 'POST', body: JSON.stringify(data), token,
    }),
  updateItem: (token: string, itemId: string, data: any) =>
    apiFetch<any>(`/menu-items/${itemId}`, {
      method: 'PATCH', body: JSON.stringify(data), token,
    }),
  deleteItem: (token: string, itemId: string) =>
    apiFetch<any>(`/menu-items/${itemId}`, { method: 'DELETE', token }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  getAll: (token: string) => apiFetch<any[]>('/orders', { token }),
  getById: (token: string, id: string) => apiFetch<any>(`/orders/${id}`, { token }),
  updateStatus: (token: string, id: string, status: string) =>
    apiFetch<any>(`/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }), token,
    }),
};

// ─── Ratings ──────────────────────────────────────────────────────────────────

export const ratingsApi = {
  getForRestaurant: (restaurantId: string) =>
    apiFetch<any>(`/ratings/restaurant/${restaurantId}`),
};
