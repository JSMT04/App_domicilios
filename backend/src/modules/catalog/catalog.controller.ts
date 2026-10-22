import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CatalogService } from './catalog.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

// ─── Restaurants ─────────────────────────────────────────────────────────────

@ApiTags('Catalog - Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes activos con sus menús' })
  findAll() {
    return this.catalogService.findAllRestaurants();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un restaurante con su menú completo' })
  findOne(@Param('id') id: string) {
    return this.catalogService.findRestaurantById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear restaurante (solo rol RESTAURANTE)' })
  create(@Body() dto: CreateRestaurantDto, @CurrentUser('id') ownerId: string) {
    return this.catalogService.createRestaurant(dto, ownerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar restaurante propio' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.catalogService.updateRestaurant(id, dto, ownerId);
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

@ApiTags('Catalog - Menu')
@Controller()
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('restaurants/:restaurantId/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar categoría al menú del restaurante' })
  createCategory(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.catalogService.createCategory(restaurantId, dto, ownerId);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar categoría' })
  deleteCategory(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    return this.catalogService.deleteCategory(id, ownerId);
  }
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

@ApiTags('Catalog - Menu')
@Controller()
export class MenuItemsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('categories/:categoryId/menu-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar ítem al menú' })
  createMenuItem(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.catalogService.createMenuItem(categoryId, dto, ownerId);
  }

  @Patch('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ítem del menú' })
  updateMenuItem(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.catalogService.updateMenuItem(id, dto, ownerId);
  }

  @Delete('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar ítem del menú' })
  deleteMenuItem(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    return this.catalogService.deleteMenuItem(id, ownerId);
  }
}
