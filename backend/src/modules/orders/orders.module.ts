import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentService } from './payment.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService],
})
export class OrdersModule {}
