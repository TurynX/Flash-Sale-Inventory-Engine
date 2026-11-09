export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly totalStock: number,
  ) {}
}
