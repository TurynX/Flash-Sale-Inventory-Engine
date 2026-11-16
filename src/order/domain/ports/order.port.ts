import { OrderEntity } from '../entities/order.entity';

export abstract class OrderPort {
  abstract checkout(
    userId: string,
    productId: string,
    quantity: Number,
    status: 'pending' | 'complete' | 'cancelled ',
  ): Promise<OrderEntity>;
  abstract update(
    orderId: string,
    status: 'pending' | 'complete' | 'cancelled',
  ): Promise<OrderEntity>;
  abstract find(
    productId: string,
    userId: string,
    quantity: number,
  ): Promise<OrderEntity>;
}
