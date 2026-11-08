import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { ProductEntity } from 'src/product/domain/entities/product.entity';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    private readonly productPort: ProductPort,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async execute(): Promise<ProductEntity[]> {
    const key = 'product';
    const cachedProduct = await this.redis.get(key);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }
    const result = await this.productPort.findAll();
    if (!result) throw new NotFoundException('No products found');

    await this.redis.set(key, JSON.stringify(result), 'EX', 60);
    return result;
  }
}
