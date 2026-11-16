import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { Pool } from 'pg';
import { OrderEntity } from 'src/order/domain/entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}
  mapToEntity(rows: any): OrderEntity {
    return new OrderEntity(
      rows.id,
      rows.user_id,
      rows.product_id,
      rows.quantity,
      rows.status,
      rows.created_at,
    );
  }

  async checkout(
    userId: string,
    productId: string,
    quantity: number,
    status: 'pending' | 'complete' | 'cancelled',
  ): Promise<OrderEntity> {
    const query = `INSERT into orders(user_id,product_id,quantity,status)VALUES ($1,$2,$3,$4) RETURNING *`;
    const order = await this.db.query(query, [
      userId,
      productId,
      quantity,
      status,
    ]);

    if (!order.rows[0]) {
      throw new BadRequestException('Failed to create order');
    }
    return this.mapToEntity(order.rows[0]);
  }
  async update(orderId: string, status: string) {
    const query = `UPDATE orders SET status = $1  WHERE id = $2 RETURNING *`;
    const order = await this.db.query(query, [status, orderId]);

    if (!order.rows[0]) {
      throw new BadRequestException('Error to update order');
    }
    return this.mapToEntity(order.rows[0]);
  }

  async find(productId: string, userId: string, quantity: number) {
    const query = `SELECT * FROM orders WHERE product_id = $1 AND user_id = $2 AND quantity = $3`;
    const order = await this.db.query(query, [productId, userId, quantity]);

    if (!order.rows[0]) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToEntity(order.rows[0]);
  }
}
