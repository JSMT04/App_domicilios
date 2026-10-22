import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './tracking.service';

interface LocationUpdatePayload {
  deliveryId: string;
  lat: number;
  lng: number;
}

interface OrderSubscribePayload {
  orderId: string;
}

/**
 * Real-Time Tracking Gateway
 *
 * Namespace: /tracking
 *
 * Events:
 *   Client → Server:
 *     location:update    { deliveryId, lat, lng }
 *     order:subscribe    { orderId }
 *     order:unsubscribe  { orderId }
 *
 *   Server → Room (order:{orderId}):
 *     location:updated   { deliveryId, lat, lng, timestamp }
 *     order:status-changed { orderId, status }
 */
@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  constructor(private readonly trackingService: TrackingService) {}

  afterInit(server: Server) {
    this.logger.log('TrackingGateway initialized on namespace /tracking');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Repartidor sends GPS update every 5 seconds.
   * Event: location:update → { deliveryId, lat, lng }
   */
  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LocationUpdatePayload,
  ) {
    try {
      const { deliveryId, lat, lng } = payload;

      // Validate payload
      if (!deliveryId || lat == null || lng == null) {
        throw new WsException('Payload inválido: se requiere deliveryId, lat, lng');
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new WsException('Coordenadas GPS fuera de rango');
      }

      // 1. Store coordinates in Redis with TTL
      await this.trackingService.storeLocation(deliveryId, lat, lng);

      // 2. Resolve orderId for this delivery
      const orderId = await this.trackingService.getOrderIdForDelivery(deliveryId);

      if (orderId) {
        // 3. Broadcast to all subscribers in the order room
        this.server.to(`order:${orderId}`).emit('location:updated', {
          deliveryId,
          lat,
          lng,
          timestamp: new Date().toISOString(),
        });
      }

      return { event: 'location:ack', data: { ok: true } };
    } catch (error) {
      this.logger.error(`Error in location:update for client ${client.id}`, error);
      throw new WsException(error.message || 'Error al procesar ubicación');
    }
  }

  /**
   * Customer subscribes to order tracking updates.
   * Event: order:subscribe → { orderId }
   */
  @SubscribeMessage('order:subscribe')
  async handleOrderSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OrderSubscribePayload,
  ) {
    const { orderId } = payload;
    if (!orderId) throw new WsException('orderId es requerido');

    const roomName = `order:${orderId}`;
    await client.join(roomName);
    this.logger.log(`Client ${client.id} subscribed to room ${roomName}`);

    // Send latest known location if available
    // (In a full impl, look up deliveryId from orderId and get coords)
    return { event: 'order:subscribed', data: { orderId, room: roomName } };
  }

  /**
   * Customer leaves order tracking room.
   * Event: order:unsubscribe → { orderId }
   */
  @SubscribeMessage('order:unsubscribe')
  async handleOrderUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OrderSubscribePayload,
  ) {
    const { orderId } = payload;
    const roomName = `order:${orderId}`;
    await client.leave(roomName);
    this.logger.log(`Client ${client.id} unsubscribed from room ${roomName}`);
    return { event: 'order:unsubscribed', data: { orderId } };
  }

  /**
   * Broadcast an order status change to all subscribers in the room.
   * Called internally by OrdersService via TrackingService.
   */
  broadcastStatusChange(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('order:status-changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
