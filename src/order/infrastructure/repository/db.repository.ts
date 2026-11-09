import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { Pool } from 'pg';
import { OrderEntity } from 'src/order/domain/entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}

  async checkout(
    userId: string,
    productId: string,
    quantity: string,
  ): Promise<OrderEntity> {
    const query = `INSERT into orders(user_id,product_id,quantity,status)VALUES ($1,$2,$3,'complete')`;
    const order = await this.db.query(query, [userId, productId, quantity]);
    if (!order.rows[0]) {
      throw new BadRequestException('Failed to create order');
    }
    return new OrderEntity(
      order.rows[0].id,
      order.rows[0].user_id,
      order.rows[0].status,
      order.rows[0].idempotency_key,
      order.rows[0].created_at,
    );
  }
}
