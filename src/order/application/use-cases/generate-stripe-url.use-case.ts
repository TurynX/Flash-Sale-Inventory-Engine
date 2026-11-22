import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import { OrderPort } from 'src/order/domain/ports/order.port';
import { StripeService } from 'src/payment/payment.service';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class GenerateStripeUrlUseCase {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly stripeService: StripeService,
    private readonly productRepository: ProductPort,
    private readonly logger: Logger,
    private readonly orderRepository: OrderPort,
    @InjectQueue('order-ttl') private readonly orderTtlQueue: Queue,
  ) {}
  async execute(userId: string, productId: string) {
    const key = `reservation:${userId}:${productId}`;
    const cachedReservation = await this.redis.get(key);
    if (!cachedReservation) {
      throw new NotFoundException('Reservation expired');
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const reservedQuantity = parseInt(cachedReservation, 10);
    if (reservedQuantity > product.totalStock) {
      throw new NotFoundException('Insufficient reserved quantity');
    }

    const session = await this.stripeService.createCheckoutSession(
      userId,
      product.id,
      product.name,
      product.price,
      reservedQuantity,
    );

    const order = await this.orderRepository.checkout(
      userId,
      productId,
      reservedQuantity,
      'pending',
    );

    await this.orderTtlQueue.add(
      'order-ttl',
      { orderId: order.id, productId, reservedQuantity },
      {
        delay: process.env.ORDER_TTL_WORKER_DELAY
          ? parseInt(process.env.ORDER_TTL_WORKER_DELAY, 10)
          : 1200000,
      },
    );

    this.logger.log('Stripe checkout session created');

    return session;
  }
}
