import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
    while (true) {
      try {
        const stockKey = `product:${productId}:stock`;

        await this.redis.watch(stockKey);

        const cachedStock = await this.redis.get(stockKey);
        let currentStock: number;
        if (!cachedStock) {
          const product = await this.productRepository.findById(productId);
          if (!product) {
            await this.redis.unwatch();
            throw new NotFoundException('Product not found');
          }
          currentStock = product.totalStock;
          await this.redis.set(stockKey, JSON.stringify(product.totalStock));
        } else {
          currentStock = parseInt(cachedStock, 10);
        }

        console.log(currentStock, quantity);

        if (currentStock < quantity) {
          await this.redis.unwatch();
          return false;
        }

        const reservationKey = `reservation:${userId}:${productId}:${quantity}`;

        const result = await this.redis
          .multi()
          .decrby(stockKey, quantity)
          .set(reservationKey, 'PENDING', 'EX', 600)
          .exec();

        if (result !== null) {
          return true;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}
