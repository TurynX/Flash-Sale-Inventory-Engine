import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import { InventoryLedgerPort } from 'src/inventory-ledger/domain/ports/inventory-ledger.port';
import { OrderPort } from 'src/order/domain/ports/order.port';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class CheckoutUseCase {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly orderRepository: OrderPort,
    private readonly productRepository: ProductPort,
    private readonly logger: Logger,
    private readonly inventoryLedgerPort: InventoryLedgerPort,
  ) {}
  async execute(userId: string, productId: string, quantity: number) {
    let updateProductSuccess = false;
    let stockRedisUpdateSuccess = false;
    try {
      this.logger.log(
        `Starting checkout for user ${userId}, product ${productId}, quantity ${quantity}`,
      );

      const find = await this.orderRepository.find(productId, userId, quantity);
      if (!find) {
        throw new NotFoundException('Invalid order details');
      }

      this.logger.log('Order details found');

      const result = await this.orderRepository.update(find.id, 'complete');

      if (!result) {
        throw new InternalServerErrorException('Failed to complete checkout');
      }

      this.logger.log('Updated order successfully');

      const updateProduct = await this.productRepository.update(
        productId,
        quantity,
      );
      if (!updateProduct) {
        throw new InternalServerErrorException('Failed to update product');
      }
      updateProductSuccess = true;

      this.logger.log('Updated product stock successfully');

      const stockRedisUpdate = await this.redis.decrby(
        `product:${productId}:stock`,
        quantity,
      );
      if (stockRedisUpdate == null) {
        await this.redis.del(`reservation:${userId}:${productId}`);
        stockRedisUpdateSuccess = true;
      }

      const quantityNeg = -quantity;
      await this.inventoryLedgerPort.create(
        productId,
        userId,
        quantityNeg,
        'checkout',
      );

      return result;
    } catch (error: any) {
      this.logger.error(
        `Checkout failed for user ${userId}, product ${productId}: ${error.message}`,
      );
    }

    try {
      this.logger.log(
        `Rolled back stock update for product ${productId} by ${quantity}`,
      );
      if (updateProductSuccess === true) {
        await this.productRepository.update(productId, quantity, 'rollback');
        return;
      }
      if (stockRedisUpdateSuccess === true) {
        await this.redis.incrby(`product:${productId}:stock`, quantity);
      }
    } catch (error: any) {
      this.logger.error(
        `Rollback failed for product ${productId}: ${error.message}`,
      );
    }
    throw new InternalServerErrorException('Checkout failed');
  }
}
