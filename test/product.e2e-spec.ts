import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Logger } from 'nestjs-pino';
import { Pool } from 'pg';
import { AppModule } from 'src/app.module';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { App } from 'supertest/types';

import { Token } from './helpers';

describe('ProductController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Pool;
  let token: any;
  let product: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bufferLogs: true,
      logger: false,
    });

    db = moduleFixture.get<Pool>(PG_CONNECTION);

    app.useLogger(app.get(Logger));
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await db.query('TRUNCATE TABLE products,users RESTART IDENTITY CASCADE;');

    token = await Token(app);
  });

  it('should create a product being admin (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/product')
      .set('Authorization', `Bearer ${token.admin}`)
      .send({ name: 'Test Product', price: 10, totalStock: 5 })
      .expect(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('price');
    expect(res.body.data).toHaveProperty('totalStock');

    product = res.body.data;
  });

  it('should not create a product being user (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/product')
      .set('Authorization', `Bearer ${token.user}`)
      .send({ name: 'Test Product', price: 10, totalStock: 5 })
      .expect(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should get all products (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/product').expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('price');
    expect(res.body.data[0]).toHaveProperty('totalStock');
  });

  it('should get product by id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/product/${product.id}`)
      .expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('price');
    expect(res.body.data).toHaveProperty('totalStock');
  });

  it('should not get product by id if no exists (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/product/${product.id + 1}`)

      .expect(400);
    expect(res.body).toHaveProperty('message');
  });

  afterAll(async () => {
    await db.end();
    await app.close();
  });
});
