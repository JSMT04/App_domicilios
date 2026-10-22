import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { RatingsModule } from './modules/ratings/ratings.module';

@Module({
  imports: [
    // Global config from .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Global infrastructure
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    CatalogModule,
    OrdersModule,
    TrackingModule,
    RatingsModule,
  ],
})
export class AppModule {}
