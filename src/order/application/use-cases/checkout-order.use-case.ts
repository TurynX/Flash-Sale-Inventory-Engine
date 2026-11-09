import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import { OrderPort } from 'src/order/domain/ports/order.port';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class CheckoutUseCase {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly orderRepository: OrderPort,
    private readonly productRepository: ProductPort,
    private readonly logger: Logger,
  ) {}
  async execute(userId: string, productId: string, quantity: number) {
    try {
      this.logger.log(
        `Starting checkout for user ${userId}, product ${productId}, quantity ${quantity}`,
      );
      const result = await this.orderRepository.checkout(
        userId,
        productId,
        quantity,
        'complete',
      );
      if (!result) {
        throw new InternalServerErrorException('Failed to complete checkout');
      }

      this.logger.log('Created order successfully');

      const updateProduct = await this.productRepository.update(
        productId,
        quantity,
      );
      if (!updateProduct) {
        throw new InternalServerErrorException('Failed to update product');
      }

      this.logger.log('Updated product stock successfully');

      await this.redis.decrby(`product:${productId}:stock`, quantity);
      await this.redis.del(`reservation:${userId}:${productId}`);
      await this.redis.set(
        `order:${userId}:${productId}:${Date.now().toString()}`,
        'completed',
        'EX',
        604800, // 7 days in seconds
      );

      return result;
    } catch (error: any) {
      this.logger.error(
        `Checkout failed for user ${userId}, product ${productId}: ${error.message}`,
      );
      await this.productRepository.update(productId, quantity, 'rollback');
      await this.redis.incrby(`product:${productId}:stock`, quantity);
    }
  }
}
