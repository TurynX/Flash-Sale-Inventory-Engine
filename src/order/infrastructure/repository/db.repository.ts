import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { Pool } from 'pg';

@Injectable()
export class OrderRepository {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}

  async checkout(userId: string, productId: string, quantity: string) {
    const query = `INSERT into orders(user_id,product_id,quantity,status)VALUES ($1,$2,$3,'PAID')`;
    const order = await this.db.query(query, [userId, productId, quantity]);
  }
}
