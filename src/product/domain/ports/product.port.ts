import { ProductEntity } from '../entities/product.entity';

export abstract class ProductPort {
  abstract create(
    name: string,
    price: number,
    totalStock: number,
  ): Promise<ProductEntity>;
  abstract findAll(): Promise<ProductEntity[]>;
  abstract findById(id: string): Promise<ProductEntity>;
  abstract update(
    productId: string,
    quantityChange: number,
    action?: 'complete' | 'rollback',
  ): Promise<ProductEntity>;
}
