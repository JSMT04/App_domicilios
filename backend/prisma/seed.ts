import { PrismaClient, UserRole, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Iniciando seed de RapiPedido...\n');

  // ──────────────────────────────────────────────────
  // 1. USUARIOS
  // ──────────────────────────────────────────────────
  const password = await bcrypt.hash('rapipedido123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rapipedido.com' },
    update: {},
    create: { email: 'admin@rapipedido.com', passwordHash: password, name: 'Admin Sistema', role: UserRole.ADMIN, phone: '+573000000000' },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: 'restaurante@demo.com' },
    update: {},
    create: { email: 'restaurante@demo.com', passwordHash: password, name: 'Carlos Burguer', role: UserRole.RESTAURANTE, phone: '+573101234567' },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'repartidor@demo.com' },
    update: {},
    create: { email: 'repartidor@demo.com', passwordHash: password, name: 'Andrés Moto', role: UserRole.REPARTIDOR, phone: '+573209876543' },
  });

  const cliente1 = await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: { email: 'cliente@demo.com', passwordHash: password, name: 'Laura Pérez', role: UserRole.CLIENTE, phone: '+573153334444' },
  });

  const cliente2 = await prisma.user.upsert({
    where: { email: 'cliente2@demo.com' },
    update: {},
    create: { email: 'cliente2@demo.com', passwordHash: password, name: 'Mario Salinas', role: UserRole.CLIENTE, phone: '+573167778899' },
  });

  console.log('✅  Usuarios creados');

  // ──────────────────────────────────────────────────
  // 2. RESTAURANTE
  // ──────────────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { ownerId: ownerUser.id },
    update: {},
    create: {
      name: 'Burguer Bros 🍔',
      description: 'Las mejores hamburguesas artesanales de la ciudad. Ingredientes frescos y pan brioche horneado a diario.',
      address: 'Calle 85 # 12-30, Bogotá, Colombia',
      latitude: 4.676,
      longitude: -74.048,
      phone: '+576015550100',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      openingTime: '10:00',
      closingTime: '22:00',
      ownerId: ownerUser.id,
    },
  });

  console.log('✅  Restaurante creado');

  // ──────────────────────────────────────────────────
  // 3. CATEGORÍAS + MENÚ
  // ──────────────────────────────────────────────────
  const catHamburguesas = await prisma.category.upsert({
    where: { id: 'cat-hamburguesas-001' },
    update: {},
    create: { id: 'cat-hamburguesas-001', name: 'Hamburguesas', description: 'Clásicas y especiales', sortOrder: 1, restaurantId: restaurant.id },
  });

  const catBebidas = await prisma.category.upsert({
    where: { id: 'cat-bebidas-001' },
    update: {},
    create: { id: 'cat-bebidas-001', name: 'Bebidas', description: 'Refrescos, malteadas y más', sortOrder: 2, restaurantId: restaurant.id },
  });

  const catAcompañamientos = await prisma.category.upsert({
    where: { id: 'cat-acomp-001' },
    update: {},
    create: { id: 'cat-acomp-001', name: 'Acompañamientos', description: 'Papas, aros y más', sortOrder: 3, restaurantId: restaurant.id },
  });

  // Menú items
  const clasica = await prisma.menuItem.upsert({
    where: { id: 'item-clasica-001' },
    update: {},
    create: { id: 'item-clasica-001', name: 'Hamburguesa Clásica', description: 'Carne 150g, lechuga, tomate, cebolla, queso americano y salsa especial', price: 18500, imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', categoryId: catHamburguesas.id },
  });

  const doble = await prisma.menuItem.upsert({
    where: { id: 'item-doble-001' },
    update: {},
    create: { id: 'item-doble-001', name: 'Doble BBQ', description: 'Doble carne 300g, tocino crocante, salsa BBQ premium y cebolla caramelizada', price: 26900, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', categoryId: catHamburguesas.id },
  });

  const veggie = await prisma.menuItem.upsert({
    where: { id: 'item-veggie-001' },
    update: {},
    create: { id: 'item-veggie-001', name: 'Veggie Burger', description: 'Medallón de lentejas, aguacate, rúcula y aderezo de limón', price: 21000, imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', categoryId: catHamburguesas.id },
  });

  const papas = await prisma.menuItem.upsert({
    where: { id: 'item-papas-001' },
    update: {},
    create: { id: 'item-papas-001', name: 'Papas Fritas', description: 'Porción grande con sal marina y chimichurri', price: 8500, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', categoryId: catAcompañamientos.id },
  });

  const aros = await prisma.menuItem.upsert({
    where: { id: 'item-aros-001' },
    update: {},
    create: { id: 'item-aros-001', name: 'Aros de Cebolla', description: 'Crujientes y dorados, con salsa ranch', price: 9500, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', categoryId: catAcompañamientos.id },
  });

  const cocaCola = await prisma.menuItem.upsert({
    where: { id: 'item-coca-001' },
    update: {},
    create: { id: 'item-coca-001', name: 'Coca-Cola 400ml', description: 'Fría y helada', price: 5000, categoryId: catBebidas.id },
  });

  const malteada = await prisma.menuItem.upsert({
    where: { id: 'item-malta-001' },
    update: {},
    create: { id: 'item-malta-001', name: 'Malteada de Fresa', description: 'Con helado artesanal y frutillas naturales', price: 12000, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', categoryId: catBebidas.id },
  });

  console.log('✅  Menú creado (3 categorías, 7 productos)');

  // ──────────────────────────────────────────────────
  // 4. PEDIDOS (uno por cada estado del ciclo de vida)
  // ──────────────────────────────────────────────────

  // Pedido 1 – PENDIENTE (recién llegó)
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-001' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-001',
      status: OrderStatus.PENDIENTE,
      subtotal: 27000,
      deliveryFee: 5000,
      total: 32000,
      deliveryAddress: 'Cra 15 #85-32, Apto 201, Bogotá',
      deliveryLat: 4.673,
      deliveryLng: -74.054,
      notes: 'Sin cebolla por favor 🙏',
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: 'EFECTIVO',
      customerId: cliente1.id,
      restaurantId: restaurant.id,
      items: {
        create: [
          { quantity: 1, unitPrice: 18500, subtotal: 18500, menuItemId: clasica.id },
          { quantity: 1, unitPrice: 8500,  subtotal: 8500,  menuItemId: papas.id },
        ],
      },
    },
  });

  // Pedido 2 – PREPARANDO
  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-002' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-002',
      status: OrderStatus.PREPARANDO,
      subtotal: 31900,
      deliveryFee: 5000,
      total: 36900,
      deliveryAddress: 'Calle 90 #11-55, Bogotá',
      deliveryLat: 4.679,
      deliveryLng: -74.042,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'TARJETA',
      paymentRef: 'TXN-ABC-12345',
      customerId: cliente2.id,
      restaurantId: restaurant.id,
      items: {
        create: [
          { quantity: 1, unitPrice: 26900, subtotal: 26900, menuItemId: doble.id },
          { quantity: 1, unitPrice: 5000,  subtotal: 5000,  menuItemId: cocaCola.id },
        ],
      },
    },
  });

  // Pedido 3 – EN_CAMINO (con repartidor y coordenadas GPS)
  const order3 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-003' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-003',
      status: OrderStatus.EN_CAMINO,
      subtotal: 42000,
      deliveryFee: 5000,
      total: 47000,
      deliveryAddress: 'Av. El Dorado #68C-61, Bogotá',
      deliveryLat: 4.658,
      deliveryLng: -74.101,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'NEQUI',
      paymentRef: 'NEQ-776543',
      customerId: cliente1.id,
      restaurantId: restaurant.id,
      items: {
        create: [
          { quantity: 2, unitPrice: 18500, subtotal: 37000, menuItemId: clasica.id },
          { quantity: 1, unitPrice: 5000,  subtotal: 5000,  menuItemId: cocaCola.id },
        ],
      },
    },
  });

  // Asignar delivery al pedido 3
  await prisma.delivery.upsert({
    where: { orderId: order3.id },
    update: {},
    create: {
      orderId: order3.id,
      driverId: driver.id,
      currentLat: 4.665,
      currentLng: -74.080,
      pickedUpAt: new Date(Date.now() - 15 * 60 * 1000), // hace 15 min
    },
  });

  // Pedido 4 – ENTREGADO (con calificación)
  const order4 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-004' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-004',
      status: OrderStatus.ENTREGADO,
      subtotal: 38400,
      deliveryFee: 5000,
      total: 43400,
      deliveryAddress: 'Transv. 60 #25-10, Bogotá',
      deliveryLat: 4.621,
      deliveryLng: -74.074,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'TARJETA',
      paymentRef: 'TXN-DEF-99988',
      customerId: cliente2.id,
      restaurantId: restaurant.id,
      items: {
        create: [
          { quantity: 1, unitPrice: 21000, subtotal: 21000, menuItemId: veggie.id },
          { quantity: 1, unitPrice: 12000, subtotal: 12000, menuItemId: malteada.id },
          { quantity: 1, unitPrice: 5400,  subtotal: 5400,  menuItemId: aros.id, notes: 'Extra crujientes' },
        ],
      },
    },
  });

  await prisma.delivery.upsert({
    where: { orderId: order4.id },
    update: {},
    create: {
      orderId: order4.id,
      driverId: driver.id,
      currentLat: 4.621,
      currentLng: -74.074,
      pickedUpAt: new Date(Date.now() - 90 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 60 * 60 * 1000),
    },
  });

  await prisma.rating.upsert({
    where: { orderId: order4.id },
    update: {},
    create: {
      orderId: order4.id,
      userId: cliente2.id,
      score: 5,
      comment: '¡Excelente! La Veggie Burger estaba deliciosa y llegó rapidísimo 🌟',
    },
  });

  // Pedido 5 – CANCELADO
  await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-005' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-005',
      status: OrderStatus.CANCELADO,
      subtotal: 26900,
      deliveryFee: 5000,
      total: 31900,
      deliveryAddress: 'Calle 72 #9-45, Bogotá',
      deliveryLat: 4.664,
      deliveryLng: -74.056,
      notes: 'Cliente canceló por cambio de plans',
      paymentStatus: PaymentStatus.REFUNDED,
      paymentMethod: 'TARJETA',
      paymentRef: 'REF-CANCEL-002',
      customerId: cliente1.id,
      restaurantId: restaurant.id,
      items: {
        create: [
          { quantity: 1, unitPrice: 26900, subtotal: 26900, menuItemId: doble.id },
        ],
      },
    },
  });

  console.log('✅  5 pedidos creados (PENDIENTE, PREPARANDO, EN_CAMINO, ENTREGADO, CANCELADO)\n');

  console.log('──────────────────────────────────────────────────');
  console.log('🎉  Seed completado con éxito!\n');
  console.log('📧  Credenciales de acceso (contraseña: rapipedido123)');
  console.log('──────────────────────────────────────────────────');
  console.log('  🍽️  Restaurante : restaurante@demo.com');
  console.log('  🛵  Repartidor  : repartidor@demo.com');
  console.log('  👤  Cliente 1   : cliente@demo.com');
  console.log('  👤  Cliente 2   : cliente2@demo.com');
  console.log('  🔑  Admin       : admin@rapipedido.com');
  console.log('──────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
