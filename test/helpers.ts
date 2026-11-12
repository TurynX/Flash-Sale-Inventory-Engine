import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function Token(app: INestApplication) {
  const response = await request(app.getHttpServer()).post('/auth').send({
    email: 'john@example.com',
    password: 'securepassword123',
  });

  const userId = response.body.data.id;

  const login = await request(app.getHttpServer()).post('/auth/login').send({
    email: 'john@example.com',
    password: 'securepassword123',
  });

  await request(app.getHttpServer()).post('/auth').send({
    email: 'secretadmin@gmail.com',
    password: 'secretadminpassword',
  });

  const loginAdmin = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'secretadmin@gmail.com',
      password: 'secretadminpassword',
    });

  return {
    admin: loginAdmin.body.data.token,
    user: login.body.data.token,
    userId: userId,
  };
}

export async function Product(app: INestApplication) {
  const token = await Token(app);
  const res = await request(app.getHttpServer())
    .post('/product')
    .set('Authorization', `Bearer ${token.admin}`)
    .send({ name: 'Test Product', price: 10, totalStock: 10 })
    .expect(201);
  expect(res.body).toHaveProperty('message');
  expect(res.body).toHaveProperty('data');
  expect(res.body.data).toHaveProperty('id');
  expect(res.body.data).toHaveProperty('name');
  expect(res.body.data).toHaveProperty('price');
  expect(res.body.data).toHaveProperty('totalStock');
  const data = res.body.data;

  return {
    token: token.user,
    id: data.id,
    totalStock: data.totalStock,
    userId: token.userId,
  };
}
