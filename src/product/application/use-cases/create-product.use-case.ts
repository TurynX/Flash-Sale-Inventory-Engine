import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../../infrastructure/dtos/product-dto';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productPort: ProductPort) {}
  async execute(body: CreateProductDto) {
    const { name, price, totalStock } = body;
    return this.productPort.create(name, price, totalStock);
  }
}
