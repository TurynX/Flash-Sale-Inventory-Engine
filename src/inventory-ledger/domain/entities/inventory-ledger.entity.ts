export class InventoryLedgerEntity {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly userId: string,
    public readonly quantity_change: number,
    public readonly type: string,
    public readonly created_at: Date,
  ) {}
}
