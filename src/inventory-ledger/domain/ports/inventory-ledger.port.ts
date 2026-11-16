import { InventoryLedgerEntity } from '../entities/inventory-ledger.entity';

export abstract class InventoryLedgerPort {
  abstract create(
    productId: string,
    userId: string,
    quantity_change: number,
    type: string,
  ): Promise<InventoryLedgerEntity>;
  abstract find(
    productId: string,
    userId: string,
    quantity_change: number,
  ): Promise<InventoryLedgerEntity>;
}
