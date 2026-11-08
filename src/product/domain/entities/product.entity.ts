export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly totalStock: number,
  ) {}
}
