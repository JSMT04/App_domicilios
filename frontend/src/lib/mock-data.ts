// ─── Mock / Fallback Data Store ──────────────────────────────────────────────
// Used when the backend is unreachable (Vercel demo mode).
// All mutations operate on this in-memory store and are persisted in
// localStorage so state survives page refreshes within the same tab session.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'RESTAURANTE' | 'REPARTIDOR' | 'CLIENTE' | 'ADMIN';
  phone?: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface MockCategory {
  id: string;
  name: string;
  restaurantId: string;
  menuItems: MockMenuItem[];
}

export interface MockRestaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  imageUrl?: string;
  openingTime: string;
  closingTime: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  categories: MockCategory[];
}

export interface MockOrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  subtotal: number;
  notes?: string;
  menuItem: { name: string };
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId: string;
  status: 'PENDIENTE' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  deliveryAddress: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  restaurant: { name: string };
  customer: { name: string };
  items: MockOrderItem[];
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_RESTAURANTS: MockRestaurant[] = [
  {
    id: 'rest-001',
    ownerId: 'user-rest-001',
    name: 'Burguer Bros 🍔',
    description: 'Las mejores hamburguesas artesanales de Bogotá. Carne 100% angus, pan brioche horneado diario.',
    address: 'Cra. 15 # 93-40, Bogotá',
    phone: '+576015550100',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop',
    openingTime: '10:00',
    closingTime: '23:00',
    latitude: 4.676,
    longitude: -74.048,
    isActive: true,
    categories: [
      {
        id: 'cat-001',
        name: 'Hamburguesas',
        restaurantId: 'rest-001',
        menuItems: [
          {
            id: 'item-001',
            name: 'Classic Smash Burger',
            description: 'Carne angus 180g aplastada, queso americano doble, pepinillos, mostaza y kétchup casero.',
            price: 24000,
            imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=180&fit=crop',
            isAvailable: true,
          },
          {
            id: 'item-002',
            name: 'BBQ Bacon Burger',
            description: 'Doble carne, tocino crocante, cebolla caramelizada, queso cheddar y salsa BBQ ahumada.',
            price: 29000,
            imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=180&fit=crop',
            isAvailable: true,
          },
          {
            id: 'item-003',
            name: 'Veggie Burger',
            description: 'Medallón de legumbres, queso suizo, lechuga, tomate, aguacate y aderezo de cilantro.',
            price: 22000,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'cat-002',
        name: 'Acompañamientos',
        restaurantId: 'rest-001',
        menuItems: [
          {
            id: 'item-004',
            name: 'Papas Fritas Caseras',
            description: 'Papa criolla frita en aceite de girasol, sal marina y romero. Porción generosa.',
            price: 9000,
            isAvailable: true,
          },
          {
            id: 'item-005',
            name: 'Aros de Cebolla',
            description: 'Cebolla española en tempura crujiente con salsa ranch de la casa.',
            price: 11000,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'cat-003',
        name: 'Bebidas',
        restaurantId: 'rest-001',
        menuItems: [
          {
            id: 'item-006',
            name: 'Limonada de Coco',
            description: 'Limonada natural con leche de coco y menta fresca. 500ml.',
            price: 8000,
            isAvailable: true,
          },
          {
            id: 'item-007',
            name: 'Malteada de Fresa',
            description: 'Malteada artesanal con fresa fresca y helado de vainilla. 400ml.',
            price: 12000,
            isAvailable: true,
          },
        ],
      },
    ],
  },
  {
    id: 'rest-002',
    ownerId: 'user-rest-002',
    name: 'Pizza Nostra 🍕',
    description: 'Pizzas artesanales al horno de leña. Masa madre, ingredientes importados.',
    address: 'Calle 85 # 11-55, Bogotá',
    phone: '+576015550200',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop',
    openingTime: '12:00',
    closingTime: '22:00',
    latitude: 4.669,
    longitude: -74.052,
    isActive: true,
    categories: [
      {
        id: 'cat-004',
        name: 'Pizzas Clásicas',
        restaurantId: 'rest-002',
        menuItems: [
          {
            id: 'item-008',
            name: 'Margherita',
            description: 'Salsa de tomate San Marzano, mozzarella di bufala, albahaca fresca y aceite de oliva.',
            price: 32000,
            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=180&fit=crop',
            isAvailable: true,
          },
          {
            id: 'item-009',
            name: 'Pepperoni',
            description: 'Salsa de tomate, mozzarella, pepperoni importado de Italia y orégano.',
            price: 36000,
            isAvailable: true,
          },
        ],
      },
    ],
  },
];

const SEED_USERS: Record<string, MockUser> = {
  'restaurante@demo.com': {
    id: 'user-rest-001',
    email: 'restaurante@demo.com',
    name: 'Burguer Bros Admin',
    role: 'RESTAURANTE',
    phone: '+576015550100',
  },
  'repartidor@demo.com': {
    id: 'user-rep-001',
    email: 'repartidor@demo.com',
    name: 'Andrés Moto',
    role: 'REPARTIDOR',
    phone: '+573001234567',
  },
  'cliente@demo.com': {
    id: 'user-cli-001',
    email: 'cliente@demo.com',
    name: 'Laura Pérez',
    role: 'CLIENTE',
    phone: '+573009876543',
  },
  'cliente2@demo.com': {
    id: 'user-cli-002',
    email: 'cliente2@demo.com',
    name: 'Mario Salinas',
    role: 'CLIENTE',
    phone: '+573001112233',
  },
  'admin@rapipedido.com': {
    id: 'user-admin-001',
    email: 'admin@rapipedido.com',
    name: 'Admin RapiPedido',
    role: 'ADMIN',
  },
};

const SEED_ORDERS: MockOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'RP-2024-0001',
    restaurantId: 'rest-001',
    customerId: 'user-cli-001',
    status: 'EN_CAMINO',
    deliveryAddress: 'Calle 85 # 15-20, Apto 402, Bogotá',
    total: 46000,
    paymentMethod: 'NEQUI',
    paymentStatus: 'COMPLETED',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    restaurant: { name: 'Burguer Bros 🍔' },
    customer: { name: 'Laura Pérez' },
    items: [
      { id: 'oi-001', menuItemId: 'item-001', quantity: 1, subtotal: 24000, menuItem: { name: 'Classic Smash Burger' } },
      { id: 'oi-002', menuItemId: 'item-004', quantity: 1, subtotal: 9000, menuItem: { name: 'Papas Fritas Caseras' } },
      { id: 'oi-003', menuItemId: 'item-006', quantity: 1, subtotal: 8000, menuItem: { name: 'Limonada de Coco' } },
    ],
  },
  {
    id: 'ord-002',
    orderNumber: 'RP-2024-0002',
    restaurantId: 'rest-001',
    customerId: 'user-cli-002',
    status: 'PENDIENTE',
    deliveryAddress: 'Av. Eldorado # 68C-61, Of. 301, Bogotá',
    total: 58000,
    paymentMethod: 'TARJETA',
    paymentStatus: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    restaurant: { name: 'Burguer Bros 🍔' },
    customer: { name: 'Mario Salinas' },
    items: [
      { id: 'oi-004', menuItemId: 'item-002', quantity: 2, subtotal: 58000, menuItem: { name: 'BBQ Bacon Burger' } },
    ],
  },
  {
    id: 'ord-003',
    orderNumber: 'RP-2024-0003',
    restaurantId: 'rest-001',
    customerId: 'user-cli-001',
    status: 'PREPARANDO',
    deliveryAddress: 'Cra. 7 # 32-16, Bogotá',
    total: 36000,
    paymentMethod: 'EFECTIVO',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    restaurant: { name: 'Burguer Bros 🍔' },
    customer: { name: 'Laura Pérez' },
    items: [
      { id: 'oi-005', menuItemId: 'item-003', quantity: 1, subtotal: 22000, menuItem: { name: 'Veggie Burger' } },
      { id: 'oi-006', menuItemId: 'item-005', quantity: 1, subtotal: 11000, menuItem: { name: 'Aros de Cebolla' } },
    ],
  },
  {
    id: 'ord-004',
    orderNumber: 'RP-2024-0004',
    restaurantId: 'rest-002',
    customerId: 'user-cli-002',
    status: 'ENTREGADO',
    deliveryAddress: 'Calle 100 # 19-57, Bogotá',
    total: 37000,
    paymentMethod: 'NEQUI',
    paymentStatus: 'COMPLETED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    restaurant: { name: 'Pizza Nostra 🍕' },
    customer: { name: 'Mario Salinas' },
    items: [
      { id: 'oi-007', menuItemId: 'item-008', quantity: 1, subtotal: 32000, menuItem: { name: 'Margherita' } },
    ],
  },
];

// ─── LocalStorage persistence ─────────────────────────────────────────────────

const LS_KEY = 'rp_mock_store';

interface MockStore {
  restaurants: MockRestaurant[];
  orders: MockOrder[];
  nextOrderNum: number;
}

function loadStore(): MockStore {
  if (typeof window === 'undefined') {
    return { restaurants: SEED_RESTAURANTS, orders: SEED_ORDERS, nextOrderNum: 5 };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { restaurants: JSON.parse(JSON.stringify(SEED_RESTAURANTS)), orders: JSON.parse(JSON.stringify(SEED_ORDERS)), nextOrderNum: 5 };
}

function saveStore(store: MockStore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {}
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const mockStore = {
  // AUTH
  login(email: string): { user: MockUser; token: string } | null {
    const user = SEED_USERS[email.toLowerCase().trim()];
    if (!user) {
      // For unknown emails, create a guest CLIENTE session
      const guestUser: MockUser = {
        id: `guest-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'CLIENTE',
      };
      return { user: guestUser, token: `mock-token-guest-${Date.now()}` };
    }
    return { user, token: `mock-token-${user.role.toLowerCase()}-${user.id}` };
  },

  register(data: { email: string; name: string; role: string }): { user: MockUser; token: string } {
    const user: MockUser = {
      id: `user-new-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: (data.role as MockUser['role']) || 'CLIENTE',
    };
    return { user, token: `mock-token-${user.role.toLowerCase()}-${user.id}` };
  },

  // RESTAURANTS
  getRestaurants(): MockRestaurant[] {
    return loadStore().restaurants;
  },

  getRestaurantById(id: string): MockRestaurant | null {
    return loadStore().restaurants.find((r) => r.id === id) || null;
  },

  createRestaurant(data: Partial<MockRestaurant>, ownerId: string): MockRestaurant {
    const store = loadStore();
    const newRest: MockRestaurant = {
      id: `rest-${Date.now()}`,
      ownerId,
      name: data.name || 'Nuevo Restaurante',
      description: data.description || '',
      address: data.address || '',
      phone: data.phone || '',
      imageUrl: data.imageUrl,
      openingTime: data.openingTime || '10:00',
      closingTime: data.closingTime || '22:00',
      latitude: data.latitude || 4.676,
      longitude: data.longitude || -74.048,
      isActive: true,
      categories: [],
    };
    store.restaurants.push(newRest);
    saveStore(store);
    return newRest;
  },

  updateRestaurant(id: string, data: Partial<MockRestaurant>): MockRestaurant {
    const store = loadStore();
    const idx = store.restaurants.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Restaurante no encontrado');
    store.restaurants[idx] = { ...store.restaurants[idx], ...data };
    saveStore(store);
    return store.restaurants[idx];
  },

  // CATEGORIES
  createCategory(restaurantId: string, name: string): MockCategory {
    const store = loadStore();
    const restIdx = store.restaurants.findIndex((r) => r.id === restaurantId);
    if (restIdx === -1) throw new Error('Restaurante no encontrado');
    const cat: MockCategory = {
      id: `cat-${Date.now()}`,
      name,
      restaurantId,
      menuItems: [],
    };
    store.restaurants[restIdx].categories = [...(store.restaurants[restIdx].categories || []), cat];
    saveStore(store);
    return cat;
  },

  // MENU ITEMS
  createMenuItem(categoryId: string, data: Partial<MockMenuItem>): MockMenuItem {
    const store = loadStore();
    let saved = false;
    const item: MockMenuItem = {
      id: `item-${Date.now()}`,
      name: data.name || 'Nuevo Plato',
      description: data.description || '',
      price: data.price || 0,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable !== false,
    };
    store.restaurants = store.restaurants.map((r) => ({
      ...r,
      categories: r.categories.map((c) => {
        if (c.id === categoryId) {
          saved = true;
          return { ...c, menuItems: [...(c.menuItems || []), item] };
        }
        return c;
      }),
    }));
    if (!saved) throw new Error('Categoría no encontrada');
    saveStore(store);
    return item;
  },

  updateMenuItem(itemId: string, data: Partial<MockMenuItem>): MockMenuItem {
    const store = loadStore();
    let updated: MockMenuItem | null = null;
    store.restaurants = store.restaurants.map((r) => ({
      ...r,
      categories: r.categories.map((c) => ({
        ...c,
        menuItems: c.menuItems.map((m) => {
          if (m.id === itemId) {
            updated = { ...m, ...data };
            return updated;
          }
          return m;
        }),
      })),
    }));
    if (!updated) throw new Error('Plato no encontrado');
    saveStore(store);
    return updated;
  },

  deleteMenuItem(itemId: string): void {
    const store = loadStore();
    store.restaurants = store.restaurants.map((r) => ({
      ...r,
      categories: r.categories.map((c) => ({
        ...c,
        menuItems: c.menuItems.filter((m) => m.id !== itemId),
      })),
    }));
    saveStore(store);
  },

  // ORDERS
  getOrders(userId?: string, role?: string): MockOrder[] {
    const store = loadStore();
    if (!userId) return store.orders;
    if (role === 'RESTAURANTE' || role === 'ADMIN') return store.orders;
    if (role === 'REPARTIDOR') return store.orders.filter((o) => ['EN_CAMINO', 'PREPARANDO', 'ENTREGADO'].includes(o.status));
    // CLIENTE
    return store.orders.filter((o) => o.customerId === userId);
  },

  getOrderById(id: string): MockOrder | null {
    return loadStore().orders.find((o) => o.id === id) || null;
  },

  createOrder(data: {
    restaurantId: string;
    deliveryAddress: string;
    notes?: string;
    paymentMethod: string;
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
    customerId: string;
    customerName: string;
  }): MockOrder {
    const store = loadStore();
    const restaurant = store.restaurants.find((r) => r.id === data.restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    const orderItems: MockOrderItem[] = data.items.map((i, idx) => {
      const allItems = restaurant.categories.flatMap((c) => c.menuItems);
      const menuItem = allItems.find((m) => m.id === i.menuItemId);
      const price = menuItem?.price || 0;
      return {
        id: `oi-${Date.now()}-${idx}`,
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        subtotal: price * i.quantity,
        notes: i.notes,
        menuItem: { name: menuItem?.name || 'Plato' },
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.subtotal, 0);
    const total = subtotal + 5000; // delivery fee

    const newOrder: MockOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `RP-DEMO-${String(store.nextOrderNum).padStart(4, '0')}`,
      restaurantId: data.restaurantId,
      customerId: data.customerId,
      status: 'PENDIENTE',
      deliveryAddress: data.deliveryAddress,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'COMPLETED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      restaurant: { name: restaurant.name },
      customer: { name: data.customerName },
      items: orderItems,
    };

    store.orders.unshift(newOrder);
    store.nextOrderNum += 1;
    saveStore(store);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: MockOrder['status']): MockOrder {
    const store = loadStore();
    const idx = store.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Pedido no encontrado');
    store.orders[idx] = { ...store.orders[idx], status };
    saveStore(store);
    return store.orders[idx];
  },

  // RESET (utility to restore seed data)
  reset() {
    if (typeof window !== 'undefined') localStorage.removeItem(LS_KEY);
  },
};
