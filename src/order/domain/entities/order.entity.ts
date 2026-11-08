export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly status: 'reserved' | 'complete' | 'cancelled',
    public readonly idempotency_key: string,
    public readonly expires_at: Date,
    public readonly created_at: Date,
  ) {}
}
