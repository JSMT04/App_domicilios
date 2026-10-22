import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 'uuid-del-pedido' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ example: 'Excelente servicio y comida deliciosa' })
  @IsOptional()
  @IsString()
  comment?: string;
}
