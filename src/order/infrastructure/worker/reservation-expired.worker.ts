import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('reservation')
export class ReservationExpiredWorker extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, productId, quantity } = job.data;

    console.log('Reservation expired');
  }
}
