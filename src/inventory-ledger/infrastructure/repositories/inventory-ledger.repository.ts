import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { InventoryLedgerEntity } from 'src/inventory-ledger/domain/entities/inventory-ledger.entity';
import { InventoryLedgerPort } from 'src/inventory-ledger/domain/ports/inventory-ledger.port';
import { PG_CONNECTION } from 'src/lib/db/db.provider';

@Injectable()
export class InventoryLedgerRepository implements InventoryLedgerPort {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}
  mapToEntity(row: any) {
    return new InventoryLedgerEntity(
      row.id,
      row.product_id,
      row.user_id,
      row.quantity_change,
      row.type,
      row.created_at,
    );
  }

  async create(
    productId: string,
    userId: string,
    quantity_change: number,
    type: string,
  ) {
    const query = `INSERT INTO inventory_ledger (product_id, user_id, quantity_change, type) VALUES($1, $2, $3, $4) RETURNING *`;

    const result = await this.db.query(query, [
      productId,
      userId,
      quantity_change,
      type,
    ]);

    if (!result.rows[0]) {
      throw new BadRequestException('Failed to create inventory ledger entry');
    }

    return this.mapToEntity(result.rows[0]);
  }

  async find(
    productId: string,
    userId: string,
    quantity_change: number,
  ): Promise<InventoryLedgerEntity> {
    const query = `SELECT * FROM inventory_ledger where product_id = $1 AND user_id = $2 AND quantity_change = $3 RETURNING *`;
    const result = await this.db.query(query, [
      productId,
      userId,
      quantity_change,
    ]);

    if (!result.rows[0]) {
      throw new NotFoundException('Inventory ledger entry not found');
    }

    return this.mapToEntity(result.rows[0]);
  }
}
