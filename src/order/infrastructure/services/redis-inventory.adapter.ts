import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ProductRepository } from 'src/product/infrastructure/repository/db.repository';

@Injectable()
export class RedisInventoryAdapter {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly productRepository: ProductRepository,
  ) {}

  async reserveWithOptimisticLock(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const stockKey = `product:${productId}:stock`;

    const cachedStock = await this.redis.get(stockKey);
    let currentStock: number;
    if (!cachedStock) {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      currentStock = product.totalStock;
      await this.redis.set(stockKey, product.totalStock.toString());
    } else {
      currentStock = parseInt(cachedStock, 10);
    }

    const newStock = await this.redis.decrby(stockKey, quantity);

    if (newStock < 0) {
      await this.redis.incrby(stockKey, quantity);
      throw new BadRequestException('Insufficient stock');
    }

    const reservationKey = `reservation:${userId}:${productId}`;

    await this.redis.set(reservationKey, quantity.toString(), 'EX', 60);
    return true;
  }
}
