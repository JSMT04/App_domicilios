// ─── API Client ─────────────────────────────────────────────────────────────
import { mockStore } from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ─── Helper: detect if the backend is reachable ───────────────────────────────
// We try a real fetch and return false on network errors (CORS/fetch failures).
// A real HTTP error (4xx/5xx) is NOT treated as "offline" — it reaches the server.
function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // "Failed to fetch", "Network request failed"
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('econnrefused') ||
      msg.includes('load failed') ||
      msg.includes('networkerror')
    );
  }
  return false;
}

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
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = Array.isArray(json.message)
      ? json.message.join(', ')
      : json.message || `API error ${res.status}`;
    throw new Error(errorMsg);
  }

  return (json.data !== undefined ? json.data : json) as T;
}

// ─── Helper: get current user from localStorage ───────────────────────────────
function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('rp_user') || 'null');
  } catch {
    return null;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      return await apiFetch<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      if (isNetworkError(err)) {
        // ── Offline / Demo fallback ──
        const result = mockStore.login(email);
        if (!result) throw new Error('Credenciales inválidas (modo demo)');
        return result;
      }
      throw err;
    }
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }): Promise<{ user: any; token: string }> {
    try {
      return await apiFetch<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (isNetworkError(err)) {
        return mockStore.register(data);
      }
      throw err;
    }
  },
};

// ─── Restaurants ─────────────────────────────────────────────────────────────

export const restaurantApi = {
  async getAll(): Promise<any[]> {
    try {
      return await apiFetch<any[]>('/restaurants');
    } catch (err) {
      if (isNetworkError(err)) return mockStore.getRestaurants();
      throw err;
    }
  },

  async getById(id: string): Promise<any> {
    try {
      return await apiFetch<any>(`/restaurants/${id}`);
    } catch (err) {
      if (isNetworkError(err)) {
        const r = mockStore.getRestaurantById(id);
        if (!r) throw new Error('Restaurante no encontrado');
        return r;
      }
      throw err;
    }
  },

  async create(token: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>('/restaurants', { method: 'POST', body: JSON.stringify(data), token });
    } catch (err) {
      if (isNetworkError(err)) {
        const user = getCurrentUser();
        return mockStore.createRestaurant(data, user?.id || 'unknown');
      }
      throw err;
    }
  },

  async update(token: string, id: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
    } catch (err) {
      if (isNetworkError(err)) return mockStore.updateRestaurant(id, data);
      throw err;
    }
  },
};

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menuApi = {
  async createCategory(token: string, restaurantId: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>(`/restaurants/${restaurantId}/categories`, {
        method: 'POST', body: JSON.stringify(data), token,
      });
    } catch (err) {
      if (isNetworkError(err)) return mockStore.createCategory(restaurantId, data.name);
      throw err;
    }
  },

  async createItem(token: string, categoryId: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>(`/categories/${categoryId}/menu-items`, {
        method: 'POST', body: JSON.stringify(data), token,
      });
    } catch (err) {
      if (isNetworkError(err)) return mockStore.createMenuItem(categoryId, data);
      throw err;
    }
  },

  async updateItem(token: string, itemId: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>(`/menu-items/${itemId}`, {
        method: 'PATCH', body: JSON.stringify(data), token,
      });
    } catch (err) {
      if (isNetworkError(err)) return mockStore.updateMenuItem(itemId, data);
      throw err;
    }
  },

  async deleteItem(token: string, itemId: string): Promise<any> {
    try {
      return await apiFetch<any>(`/menu-items/${itemId}`, { method: 'DELETE', token });
    } catch (err) {
      if (isNetworkError(err)) {
        mockStore.deleteMenuItem(itemId);
        return { success: true };
      }
      throw err;
    }
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  async create(token: string, data: any): Promise<any> {
    try {
      return await apiFetch<any>('/orders', { method: 'POST', body: JSON.stringify(data), token });
    } catch (err) {
      if (isNetworkError(err)) {
        const user = getCurrentUser();
        return mockStore.createOrder({
          ...data,
          customerId: user?.id || 'guest',
          customerName: user?.name || 'Cliente',
        });
      }
      throw err;
    }
  },

  async getAll(token: string): Promise<any[]> {
    try {
      return await apiFetch<any[]>('/orders', { token });
    } catch (err) {
      if (isNetworkError(err)) {
        const user = getCurrentUser();
        return mockStore.getOrders(user?.id, user?.role);
      }
      throw err;
    }
  },

  async getById(token: string, id: string): Promise<any> {
    try {
      return await apiFetch<any>(`/orders/${id}`, { token });
    } catch (err) {
      if (isNetworkError(err)) {
        const o = mockStore.getOrderById(id);
        if (!o) throw new Error('Pedido no encontrado');
        return o;
      }
      throw err;
    }
  },

  async updateStatus(token: string, id: string, status: string): Promise<any> {
    try {
      return await apiFetch<any>(`/orders/${id}/status`, {
        method: 'PATCH', body: JSON.stringify({ status }), token,
      });
    } catch (err) {
      if (isNetworkError(err)) return mockStore.updateOrderStatus(id, status as any);
      throw err;
    }
  },
};

// ─── Ratings ──────────────────────────────────────────────────────────────────

export const ratingsApi = {
  async getForRestaurant(restaurantId: string): Promise<any> {
    try {
      return await apiFetch<any>(`/ratings/restaurant/${restaurantId}`);
    } catch (err) {
      if (isNetworkError(err)) {
        // Return simulated rating data
        return { average: 4.8, count: 127, distribution: { 5: 89, 4: 28, 3: 7, 2: 2, 1: 1 } };
      }
      throw err;
    }
  },
};
