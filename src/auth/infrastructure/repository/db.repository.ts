import { Inject, Injectable } from '@nestjs/common';
import { AuthPort } from 'src/auth/domain/ports/auth.port';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { Pool } from 'pg';
import { UserEntity } from 'src/auth/domain/entities/auth.entity';

@Injectable()
export class AuthRepository implements AuthPort {
  constructor(@Inject(PG_CONNECTION) private readonly db: Pool) {}
  mapToEntity(row: any): UserEntity {
    return new UserEntity(row.id, row.email, row.password);
  }

  async create(email: string, password: string): Promise<UserEntity> {
    const query = `INSERT INTO USERS (email, password) VALUES ($1, $2) RETURNING *`;
    const result = await this.db.query(query, [email, password]);
    return this.mapToEntity(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const query = `SELECT * FROM USERS WHERE email = $1`;
    const result = await this.db.query(query, [email]);
    if (!result.rows[0]) return null;
    return this.mapToEntity(result.rows[0]);
  }
}
