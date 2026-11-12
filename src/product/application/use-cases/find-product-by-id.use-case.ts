import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    private readonly productPort: ProductPort,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async execute(id: string) {
    const key = `product:${id}`;
    const cachedProduct = await this.redis.get(key);

    if (cachedProduct) {
      return cachedProduct;
    }

    const result = await this.productPort.findById(id);

    if (!result) throw new NotFoundException('Product not found');

    await this.redis.set(key, JSON.stringify(result), 'EX', 60);

    return result;
  }
}
