import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { ProductEntity } from 'src/product/domain/entities/product.entity';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class ProductRepository implements ProductPort {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}

  mapToEntity(row: any): ProductEntity {
    return new ProductEntity(row.id, row.name, row.price, row.total_stock);
  }

  async create(
    name: string,
    price: number,
    totalStock: number,
  ): Promise<ProductEntity> {
    const query = `INSERT INTO products (name, price, total_stock) VALUES ($1, $2, $3) RETURNING *`;
    const result = await this.db.query(query, [name, price, totalStock]);
    return this.mapToEntity(result.rows[0]);
  }

  async findAll(): Promise<ProductEntity[]> {
    const query = `SELECT * FROM products`;
    const result = await this.db.query(query);
    if (!result.rows[0]) throw new NotFoundException('No products found');
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<ProductEntity> {
    try {
      const query = `SELECT * FROM products WHERE id = $1`;
      const result = await this.db.query(query, [id]);

      if (!result.rows[0]) {
        throw new NotFoundException('Product not found');
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error: any) {
      if (error.code === '22P02') {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  async update(
    productId: string,
    quantityChange: number,
    action?: string,
  ): Promise<ProductEntity> {
    if (action === 'rollback') {
      const query = `UPDATE products SET total_stock = total_stock + $1 WHERE id = $2 RETURNING *`;
      const result = await this.db.query(query, [quantityChange, productId]);
      if (!result.rows[0]) throw new NotFoundException('Product not found');
      return this.mapToEntity(result.rows[0]);
    }
    const query = `UPDATE products SET total_stock = total_stock - $1 WHERE id = $2 RETURNING *`;
    const result = await this.db.query(query, [quantityChange, productId]);
    if (!result.rows[0]) throw new NotFoundException('Product not found');
    return this.mapToEntity(result.rows[0]);
  }
}
