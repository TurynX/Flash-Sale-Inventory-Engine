export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly product_id: string,
    public readonly quantity: number,
    public readonly status: 'pending' | 'complete' | 'cancelled',
    public readonly created_at: Date,
  ) {}
}
