import { OrderEntity } from '../entities/order.entity';

export abstract class OrderPort {
  abstract checkout(
    userId: string,
    productId: string,
    quantity: Number,
  ): Promise<OrderEntity>;
}
