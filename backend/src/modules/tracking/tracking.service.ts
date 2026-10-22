import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

const LOCATION_TTL_SECONDS = 60; // GPS coordinates expire after 60s if no update
const DELIVERY_ORDER_MAP_TTL = 86400; // 24h

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Store the latest GPS coordinates for a delivery.
   * Key: tracking:location:{deliveryId}
   */
  async storeLocation(deliveryId: string, lat: number, lng: number): Promise<void> {
    const key = `tracking:location:${deliveryId}`;
    const value = JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() });
    await this.redis.set(key, value, LOCATION_TTL_SECONDS);
    this.logger.debug(`Location stored for delivery ${deliveryId}: ${lat},${lng}`);
  }

  /**
   * Retrieve the latest GPS coordinates for a delivery.
   */
  async getLocation(deliveryId: string): Promise<{ lat: number; lng: number; updatedAt: string } | null> {
    const key = `tracking:location:${deliveryId}`;
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Map a deliveryId → orderId so the gateway can route to the correct room.
   * Key: tracking:delivery-order:{deliveryId}
   */
  async mapDeliveryToOrder(deliveryId: string, orderId: string): Promise<void> {
    const key = `tracking:delivery-order:${deliveryId}`;
    await this.redis.set(key, orderId, DELIVERY_ORDER_MAP_TTL);
  }

  /**
   * Retrieve the orderId for a given deliveryId.
   */
  async getOrderIdForDelivery(deliveryId: string): Promise<string | null> {
    const key = `tracking:delivery-order:${deliveryId}`;
    return this.redis.get(key);
  }

  /**
   * Publish a status-change event to a Redis channel.
   * Consumers (e.g. notification service) can subscribe.
   */
  async publishStatusChange(orderId: string, status: string): Promise<void> {
    await this.redis.publish(
      'order:status-changed',
      JSON.stringify({ orderId, status, timestamp: new Date().toISOString() }),
    );
  }
}
