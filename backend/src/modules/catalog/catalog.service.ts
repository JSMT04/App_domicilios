import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from './dto/restaurant.dto';
import {
  CreateCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Restaurants ─────────────────────────────────────────────────────────────

  async findAllRestaurants() {
    return this.prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        categories: {
          include: { menuItems: { where: { isAvailable: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRestaurantById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          include: { menuItems: { orderBy: { name: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
        owner: { select: { id: true, name: true } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    return restaurant;
  }

  async createRestaurant(dto: CreateRestaurantDto, ownerId: string) {
    // One restaurant per owner
    const existing = await this.prisma.restaurant.findUnique({
      where: { ownerId },
    });
    if (existing) {
      throw new BadRequestException('Ya tienes un restaurante registrado');
    }

    return this.prisma.restaurant.create({
      data: { ...dto, ownerId },
    });
  }

  async updateRestaurant(id: string, dto: UpdateRestaurantDto, ownerId: string) {
    await this.assertOwner(id, ownerId);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  async createCategory(restaurantId: string, dto: CreateCategoryDto, ownerId: string) {
    await this.assertOwner(restaurantId, ownerId);
    return this.prisma.category.create({ data: { ...dto, restaurantId } });
  }

  async deleteCategory(categoryId: string, ownerId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { restaurant: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.restaurant.ownerId !== ownerId)
      throw new ForbiddenException('No autorizado');
    return this.prisma.category.delete({ where: { id: categoryId } });
  }

  // ─── Menu Items ───────────────────────────────────────────────────────────────

  async createMenuItem(categoryId: string, dto: CreateMenuItemDto, ownerId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { restaurant: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.restaurant.ownerId !== ownerId)
      throw new ForbiddenException('No autorizado');

    return this.prisma.menuItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        categoryId,
      },
    });
  }

  async updateMenuItem(itemId: string, dto: UpdateMenuItemDto, ownerId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: { include: { restaurant: true } } },
    });
    if (!item) throw new NotFoundException('Ítem de menú no encontrado');
    if (item.category.restaurant.ownerId !== ownerId)
      throw new ForbiddenException('No autorizado');

    return this.prisma.menuItem.update({ where: { id: itemId }, data: dto });
  }

  async deleteMenuItem(itemId: string, ownerId: string) {
    await this.updateMenuItem(itemId, { isAvailable: false }, ownerId);
    return { message: 'Ítem desactivado correctamente' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async assertOwner(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('No autorizado');
    return restaurant;
  }
}
