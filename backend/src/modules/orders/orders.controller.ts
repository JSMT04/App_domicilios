import {
  Body,
  Controller,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENTE)
  @ApiOperation({ summary: 'HU-02: Crear pedido con pago (simulado)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Ítems no disponibles o pago rechazado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') customerId: string) {
    return this.ordersService.createOrder(dto, customerId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos del usuario (filtrado por rol)' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ordersService.findOrders(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un pedido' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ordersService.findOrderById(id, userId, role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANTE, UserRole.REPARTIDOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Avanzar estado del pedido (PENDIENTE→PREPARANDO→EN_CAMINO→ENTREGADO)',
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, userId, role);
  }
}
