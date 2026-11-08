import { Pool } from 'pg';

export const PG_CONNECTION = 'PG_CONNECTION';

export const dbProvider = {
  provide: PG_CONNECTION,
  useFactory: () => {
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'flash_sale',
      max: 20,
    });
  },
};
