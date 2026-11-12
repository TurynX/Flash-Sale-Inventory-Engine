import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger } from 'nestjs-pino';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/lib/db/db.provider';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Pool;

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

    await db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
  });

  it('should create as user  (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'testuser@gmail.com', password: 'testpassword' })
      .expect(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email');
  });

  it('should not create a user without email or password fields (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'testuser@gmail.com' })
      .expect(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should login a user  (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@gmail.com', password: 'testpassword' })
      .expect(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should not login a user with wrong credentials (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@gmail.com', password: 'wrongpassword' })

      .expect(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should not login a user with no email or password  (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@gmail.com' })

      .expect(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not login a user that not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notexist@gmail.com', password: 'password' })

      .expect(401);
    expect(res.body).toHaveProperty('message');
  });

  afterAll(async () => {
    await db.end();
    await app.close();
  });
});
