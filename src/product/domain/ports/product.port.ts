import { ProductEntity } from '../entities/product.entity';

export abstract class ProductPort {
  abstract create(name: string, totalStock: number): Promise<ProductEntity>;
  abstract findAll(): Promise<ProductEntity[] | null>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract update(
    productId: string,
    quantityChange: number,
  ): Promise<ProductEntity | null>;
}
