import {
  IsBoolean,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Hamburguesas' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Nuestras jugosas hamburguesas artesanales' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Hamburguesa Clásica' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Con carne, queso, lechuga y tomate' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 18500 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/hamburguesa.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
