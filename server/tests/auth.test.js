import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server.js';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';

describe('DisciplineOS Authentication Tests', () => {
  const testUser = {
    name: 'Test Tester',
    email: `test-${Date.now()}@disciplineos.com`,
    password: 'password123',
    confirmPassword: 'password123',
  };

  let token = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }
  });

  after(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  test('POST /api/auth/register should create a new user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, testUser.email);
    token = res.body.data.token;
  });

  test('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/auth/login should authenticate user with valid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  test('POST /api/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /api/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.email, testUser.email);
  });
});
