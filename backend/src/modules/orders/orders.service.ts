import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { transition } from './order-state-machine';
import { PaymentService } from './payment.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly paymentService: PaymentService,
  ) {}

  // ─── HU-02: Create Order ──────────────────────────────────────────────────

  async createOrder(dto: CreateOrderDto, customerId: string) {
    // 1. Validate restaurant exists and is active
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId, isActive: true },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado o no disponible');
    }

    // 2. Validate and price each item
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException(
        'Uno o más ítems del menú no están disponibles',
      );
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // 3. Calculate totals
    let subtotal = 0;
    const orderItemsData = dto.items.map((item) => {
      const menuItem = menuMap.get(item.menuItemId)!;
      const unitPrice = Number(menuItem.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes: item.notes,
      };
    });

    const deliveryFee = 3500; // Fixed delivery fee (COP)
    const total = subtotal + deliveryFee;

    // 4. Process payment (mock)
    const paymentResult = await this.paymentService.processPayment({
      amount: total,
      currency: 'COP',
      method: dto.paymentMethod,
      orderId: 'PENDING', // Will be replaced after order creation
    });

    if (!paymentResult.success) {
      throw new BadRequestException(
        `Error al procesar el pago: ${paymentResult.message}`,
      );
    }

    // 5. Create order + items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId,
          restaurantId: dto.restaurantId,
          deliveryAddress: dto.deliveryAddress,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          notes: dto.notes,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentRef: paymentResult.ref,
          subtotal,
          deliveryFee,
          total,
          status: OrderStatus.PENDIENTE,
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { menuItem: true } },
          restaurant: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      });
      return newOrder;
    });

    // 6. Publish event to Redis for downstream consumers (tracking, notifications)
    await this.redis.publish(
      'order:created',
      JSON.stringify({
        orderId: order.id,
        restaurantId: order.restaurantId,
        customerId: order.customerId,
        total: order.total,
        createdAt: order.createdAt,
      }),
    );

    this.logger.log(`Order created: ${order.id} (${order.orderNumber})`);
    return order;
  }

  // ─── List Orders ─────────────────────────────────────────────────────────────

  async findOrders(userId: string, userRole: string) {
    const whereClause =
      userRole === UserRole.CLIENTE
        ? { customerId: userId }
        : userRole === UserRole.RESTAURANTE
          ? { restaurant: { ownerId: userId } }
          : userRole === UserRole.REPARTIDOR
            ? { delivery: { driverId: userId } }
            : {}; // ADMIN sees all

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: { include: { menuItem: { select: { id: true, name: true } } } },
        restaurant: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        delivery: { select: { id: true, driverId: true, currentLat: true, currentLng: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Get Single Order ─────────────────────────────────────────────────────────

  async findOrderById(orderId: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { id: true, name: true, address: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
        delivery: {
          include: { driver: { select: { id: true, name: true, phone: true } } },
        },
        rating: true,
      },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Authorization check
    const isOwner = order.customerId === userId;
    const isRestaurantOwner = order.restaurant?.['ownerId'] === userId;
    const isDriver = order.delivery?.driverId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isRestaurantOwner && !isDriver && !isAdmin) {
      throw new ForbiddenException('No autorizado para ver este pedido');
    }

    return order;
  }

  // ─── Update Order Status (State Machine) ─────────────────────────────────────

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    userId: string,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Role-based authorization on which transitions are allowed
    if (
      userRole === UserRole.RESTAURANTE &&
      order.restaurant.ownerId !== userId
    ) {
      throw new ForbiddenException('No autorizado para modificar este pedido');
    }

    // Apply state machine
    const newStatus = transition(order.status, dto.status);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        notes: dto.notes ?? order.notes,
      },
    });

    // Publish status change event to Redis
    await this.redis.publish(
      'order:status-changed',
      JSON.stringify({ orderId, status: newStatus, updatedAt: new Date().toISOString() }),
    );

    this.logger.log(`Order ${orderId} status: ${order.status} → ${newStatus}`);
    return updated;
  }
}
