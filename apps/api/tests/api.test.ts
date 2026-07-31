import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { app } from '../src/app';

const prisma = new PrismaClient();

describe('Auth API', () => {
  beforeAll(async () => {
    const hashed = await bcrypt.hash('testpass', 10);
    await prisma.user.upsert({
      where: { email: 'test@tgph.com' },
      update: {},
      create: {
        email: 'test@tgph.com',
        passwordHash: hashed,
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
  });

  it('should login and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@tgph.com', password: 'testpass' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@tgph.com');
  });

  it('should reject invalid login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@tgph.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});

describe('Patients API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@tgph.com', password: 'testpass' });
    token = res.body.token;
  });

  it('should register a patient', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        phone: '08012345678',
        address: 'Lagos',
        state: 'Lagos'
      });

    expect(res.status).toBe(201);
    expect(res.body.hospitalId).toBeDefined();
  });

  it('should search patients', async () => {
    const res = await request(app)
      .get('/api/v1/patients/search?q=John')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
