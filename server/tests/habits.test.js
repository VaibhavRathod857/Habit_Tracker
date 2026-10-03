import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server.js';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { getTodayString } from '../utils/dateHelpers.js';

describe('DisciplineOS Habit & Tracking Tests', () => {
  let token = '';
  let userId = '';
  let createdHabitId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }

    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Habit Tester',
        email: `habit-tester-${Date.now()}@disciplineos.com`,
        password: 'password123',
      });

    token = reg.body.data.token;
    userId = reg.body.data.user.id;
  });

  after(async () => {
    if (userId) {
      await Habit.deleteMany({ user: userId });
      await HabitLog.deleteMany({ user: userId });
      await User.deleteOne({ _id: userId });
    }
    await mongoose.connection.close();
  });

  test('POST /api/habits should create a custom numeric habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'LeetCode Practice',
        category: 'Study',
        target: { value: 60, unit: 'minutes' },
        frequency: { type: 'daily' },
        whyReason: 'Master algorithm patterns',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.name, 'LeetCode Practice');
    assert.strictEqual(res.body.data.target.value, 60);
    createdHabitId = res.body.data._id;
  });

  test('POST /api/habits/:id/log should log partial progress and calculate percentage', async () => {
    const today = getTodayString();
    const res = await request(app)
      .post(`/api/habits/${createdHabitId}/log`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: today,
        actualValue: 45, // 45 / 60 = 75%
        notes: 'Good session, solved 1 medium',
        mood: 'good',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.log.actualValue, 45);
    assert.strictEqual(res.body.data.log.completionRate, 75);
    assert.strictEqual(res.body.data.log.isCompleted, false);
  });

  test('POST /api/habits/:id/log should mark habit completed when meeting target', async () => {
    const today = getTodayString();
    const res = await request(app)
      .post(`/api/habits/${createdHabitId}/log`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: today,
        actualValue: 60,
        notes: 'Target fully accomplished!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.log.isCompleted, true);
    assert.strictEqual(res.body.data.streak.currentStreak, 1);
  });

  test('GET /api/dashboard should return populated dashboard with NOW/NEXT prioritization', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.actionPriority);
    assert.ok(res.body.data.todayHabits);
  });
});
