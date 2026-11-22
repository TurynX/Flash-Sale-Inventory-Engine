import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, NotFoundException } from '@nestjs/common';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import { OrderPort } from 'src/order/domain/ports/order.port';

@Processor('order-ttl')
export class OrderTtlWorker extends WorkerHost {
  constructor(
    private readonly orderPort: OrderPort,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { orderId, productId, quantity } = job.data;

    const order = await this.orderPort.find('', '', 0, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'complete') {
      return;
    }
    this.logger.log('Order is not complete, time out, cancelling order');

    await this.redis.incrby(`product:${productId}:stock`, quantity);
  }
}
