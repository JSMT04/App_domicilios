import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'La Fogata Parrilla' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Especialidades en carnes a la brasa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Calle 72 #15-30, Barranquilla' })
  @IsString()
  address: string;

  @ApiProperty({ example: 10.9878 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -74.7889 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  closingTime?: string;
}

export class UpdateRestaurantDto {
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
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  closingTime?: string;
}
