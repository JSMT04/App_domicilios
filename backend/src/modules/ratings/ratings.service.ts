import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRating(dto: CreateRatingDto, userId: string) {
    // 1. Verify order exists and belongs to user
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.customerId !== userId)
      throw new BadRequestException('Solo puedes calificar tus propios pedidos');

    // 2. Only delivered orders can be rated
    if (order.status !== OrderStatus.ENTREGADO)
      throw new BadRequestException(
        'Solo puedes calificar pedidos en estado ENTREGADO',
      );

    // 3. Check for duplicate rating
    const existing = await this.prisma.rating.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing)
      throw new ConflictException('Ya calificaste este pedido');

    return this.prisma.rating.create({
      data: {
        orderId: dto.orderId,
        userId,
        score: dto.score,
        comment: dto.comment,
      },
    });
  }

  async getRestaurantRatings(restaurantId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { order: { restaurantId } },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

    return {
      restaurantId,
      averageScore: Math.round(avg * 10) / 10,
      totalRatings: ratings.length,
      ratings,
    };
  }
}
