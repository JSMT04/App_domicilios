import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderItemDto {
  @ApiProperty({ example: 'uuid-del-menu-item' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-del-restaurante' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ example: 'Calle 72 #15-30, Barranquilla' })
  @IsString()
  deliveryAddress: string;

  @ApiPropertyOptional({ example: 10.9878 })
  @IsOptional()
  @IsLatitude()
  deliveryLat?: number;

  @ApiPropertyOptional({ example: -74.7889 })
  @IsOptional()
  @IsLongitude()
  deliveryLng?: number;

  @ApiPropertyOptional({ example: 'Llamar al llegar' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'MOCK_CARD' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'El cliente no estaba en la dirección' })
  @IsOptional()
  @IsString()
  notes?: string;
}
