const mockConstructEvent = jest.fn();
const mockCreateSession = jest.fn().mockResolvedValue({
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/test',
  status: 'open',
});

jest.mock('stripe', () => {
  return class {
    webhooks = {
      constructEvent: mockConstructEvent,
    };
    checkout = {
      sessions: {
        create: mockCreateSession,
      },
    };
  };
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { Pool } from 'pg';
import { AppModule } from 'src/app.module';
import { PG_CONNECTION } from 'src/lib/db/db.provider';
import { App } from 'supertest/types';
import { Product } from './helpers';
import request from 'supertest';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import Stripe from 'stripe';

describe('OrderController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Pool;
  let redis: Redis;
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
    redis = moduleFixture.get<Redis>(REDIS_CLIENT);

    app.useLogger(app.get(Logger));

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    await db.query(
      'TRUNCATE TABLE orders, products,users RESTART IDENTITY CASCADE;',
    );
    await redis.flushdb();

    const p = await Product(app);
    product = p;
  });

  it('should reserve product', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${product.token}`)
      .send({
        productId: product.id,
        quantity: product.totalStock,
      })
      .expect(201);

    // Debugging line to print the response body

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('productId');
    expect(res.body.data).toHaveProperty('quantity');
  });

  it('should generate stripe url if reserved', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders/generate-stripe-url')
      .set('Authorization', `Bearer ${product.token}`)
      .send({
        productId: product.id,
        quantity: product.totalStock,
      })
      .expect(201);

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(res.body.data.result).toHaveProperty('success');
    expect(res.body.data.result).toHaveProperty('chargeId');
    expect(res.body.data.result).toHaveProperty('url');
  });

  it('should checkout ', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_test_123',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            userId: product.userId,
            productId: product.id,
            quantity: `${product.totalStock}`,
          },
        } as unknown as Stripe.Checkout.Session,
      },
    });

    // 3. Send the request
    const response = await request(app.getHttpServer())
      .post('/orders/webhook/checkout')
      .set('stripe-signature', 't=123,v1=mocked')
      .send({ type: 'checkout.session.completed' })
      .expect(202);

    expect(response.body).toEqual({ message: 'Checkout completed' });
  });
  afterAll(() => {});
});
