import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { Logger } from 'nestjs-pino';
import { OrderPort } from 'src/order/domain/ports/order.port';

@Processor('reservation')
export class ReservationExpiredWorker extends WorkerHost {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: Logger,
    private readonly orderPort: OrderPort,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, productId, quantity } = job.data;
    this.logger.log('Proccessing Worker');

    const key = `reservation:${userId}:${productId}`;
    const order = await this.orderPort.find(productId, userId, quantity);
    if (order) {
      return;
    }
    const reservation = await this.redis.get(key);
    if (!reservation) {
      this.logger.error(
        'Reservation does not exist or has already been completed',
      );

      await this.redis.incrby(`product:${productId}:stock`, quantity);
      await this.redis.del(key);
    } else {
      this.logger.log('Reservation completed, no action needed');
      return;
    }
  }
}
