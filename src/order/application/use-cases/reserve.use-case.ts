import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { OrderDto } from 'src/order/infrastructure/dtos/order-dto';
import { RedisInventoryAdapter } from 'src/order/infrastructure/services/redis-inventory.adapter';

@Injectable()
export class ReserveUseCase {
  constructor(
    private readonly redisInventoryAdapter: RedisInventoryAdapter,
    @InjectQueue('reservation') private readonly reservationQueue: Queue,
  ) {}
  async execute(body: OrderDto, userId: string) {
    const result = await this.redisInventoryAdapter.reserveWithOptimisticLock(
      userId,
      body.productId,
      body.quantity,
    );

    if (!result)
      throw new BadRequestException(
        'Stock insufficient or order already placed',
      );

    await this.reservationQueue.add(
      'expire-reservation',
      {
        userId,
        productId: body.productId,
        quantity: body.quantity,
      },
      {
        delay: 10 * 60 * 1000,
      },
    );

    return true;
  }
}
