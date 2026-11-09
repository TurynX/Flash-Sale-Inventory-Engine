import { Module } from '@nestjs/common';
import { OrderController } from './infrastructure/controllers/order.controller';
import { ReserveUseCase } from './application/use-cases/reserve.use-case';
import { RedisInventoryAdapter } from './infrastructure/services/redis-inventory.adapter';
import { OrderRepository } from './infrastructure/repository/db.repository';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../lib/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ReservationExpiredWorker } from './infrastructure/worker/reservation-expired.worker';
import { ProductModule } from '../product/product.module';
import { ProductRepository } from '../product/infrastructure/repository/db.repository';
import { CheckoutUseCase } from './application/use-cases/checkout-order.use-case';
import { BullModule } from '@nestjs/bullmq';
import { OrderPort } from './domain/ports/order.port';
import { GenerateStripeUrlUseCase } from './application/use-cases/generate-stripe-url.use-case';
import { PaymentModule } from 'src/payment/payment.module';
import { StripeService } from 'src/payment/payment.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DbModule,
    ProductModule,
    BullModule.registerQueue({
      name: 'reservation',
    }),
    PaymentModule,
  ],
  controllers: [OrderController],
  providers: [
    { provide: OrderPort, useClass: OrderRepository },
    ReserveUseCase,
    GenerateStripeUrlUseCase,
    CheckoutUseCase,
    JwtService,
    ProductRepository,
    RedisInventoryAdapter,
    ReservationExpiredWorker,
    StripeService,
  ],
  exports: [],
})
export class OrderModule {}
