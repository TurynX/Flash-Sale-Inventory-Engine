export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly status: 'complete' | 'cancelled',
    public readonly idempotency_key: string,
    public readonly created_at: Date,
  ) {}
}
