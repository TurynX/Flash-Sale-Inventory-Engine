import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { OrderPort } from 'src/order/domain/ports/order.port';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class CheckoutUseCase {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly orderRepository: OrderPort,
    private readonly productRepository: ProductPort,
  ) {}
  async execute(userId: string, productId: string, quantity: number) {
    const key = `reservation:${userId}:${productId}`;
    const cachedReservation = await this.redis.get(key);
    if (!cachedReservation) {
      throw new NotFoundException('Reservation expired');
    }
    const result = await this.orderRepository.checkout(
      userId,
      productId,
      quantity,
    );
    if (!result) {
      throw new InternalServerErrorException('Failed to complete checkout');
    }

    const updateProduct = await this.productRepository.update(
      productId,
      quantity,
    );
    if (!updateProduct) {
      throw new InternalServerErrorException('Failed to update product');
    }

    return result;
  }
}
