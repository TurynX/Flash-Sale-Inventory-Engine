import { Module } from '@nestjs/common';
import { StripeService } from './payment.service';

@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentModule {}
