import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { ProductEntity } from 'src/product/domain/entities/product.entity';
import { ProductPort } from 'src/product/domain/ports/product.port';

@Injectable()
export class ProductRepository implements ProductPort {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}

  mapToEntity(row: any): ProductEntity {
    return new ProductEntity(row.id, row.name, row.total_stock);
  }

  async create(name: string, totalStock: number): Promise<ProductEntity> {
    const query = `INSERT INTO products (name,total_stock) VALUES ($1,$2) RETURNING  *`;
    const result = await this.db.query(query, [name, totalStock]);
    return this.mapToEntity(result.rows[0]);
  }

  async findAll(): Promise<ProductEntity[] | null> {
    const query = `SELECT * FROM products`;
    const result = await this.db.query(query);
    if (!result.rows[0]) return null;
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const query = `SELECT * FROM products WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    if (!result.rows[0]) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async update(
    productId: string,
    quantityChange: number,
  ): Promise<ProductEntity | null> {
    const query = `UPDATE products SET total_stock = total_stock - $1 WHERE id = $2`;
    const result = await this.db.query(query, [quantityChange, productId]);
    if (!result.rows[0]) return null;
    return this.mapToEntity(result.rows[0]);
  }
}
