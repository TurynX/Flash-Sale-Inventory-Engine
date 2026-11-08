import { Module } from '@nestjs/common';
import { ProductController } from './infrastructure/controllers/product.controller';
import { ProductPort } from './domain/ports/product.port';
import { ProductRepository } from './infrastructure/repository/db.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from './application/use-cases/find-all-product.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule],
  controllers: [ProductController],
  providers: [
    { provide: ProductPort, useClass: ProductRepository },
    CreateProductUseCase,
    JwtService,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
  ],
  exports: [ProductPort],
})
export class ProductModule {}
