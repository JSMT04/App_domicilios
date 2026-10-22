import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calificar un pedido entregado (1–5 estrellas)' })
  create(@Body() dto: CreateRatingDto, @CurrentUser('id') userId: string) {
    return this.ratingsService.createRating(dto, userId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Ver calificaciones y promedio de un restaurante' })
  getRestaurantRatings(@Param('restaurantId') restaurantId: string) {
    return this.ratingsService.getRestaurantRatings(restaurantId);
  }
}
