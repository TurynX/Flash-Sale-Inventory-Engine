import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { ReserveDto } from '../../infrastructure/dtos/order-dto';
import { RedisInventoryAdapter } from 'src/order/infrastructure/services/redis-inventory.adapter';

@Injectable()
export class ReserveUseCase {
  constructor(
    private readonly redisInventoryAdapter: RedisInventoryAdapter,
    private readonly logger: Logger,

    @InjectQueue('reservation') private readonly reservationQueue: Queue,
  ) {}
  async execute(body: ReserveDto, userId: string) {
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
        delay: process.env.WORKER_DELAY
          ? parseInt(process.env.WORKER_DELAY, 10)
          : 60000, //10 minutes milliseconds
      },
    );

    this.logger.log('Product reserved successfully');

    return true;
  }
}
