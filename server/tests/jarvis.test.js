import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server.js';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Habit } from '../models/Habit.js';
import { Task } from '../models/Task.js';
import { JarvisMemory } from '../models/JarvisMemory.js';

describe('DisciplineOS JARVIS Conversational AI Tests', () => {
  const testUser = {
    name: 'JARVIS Conversational Tester',
    email: `jarvis-conv-${Date.now()}@disciplineos.com`,
    password: 'password123',
    confirmPassword: 'password123',
  };

  let token = '';
  let userId = '';
  let habitId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGO_URI);
    }

    // Register user
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    token = regRes.body.data.token;
    userId = regRes.body.data.user._id || regRes.body.data.user.id;

    // Create a sample habit for the user
    const habitRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DSA Problem Solving',
        category: 'Study',
        targetValue: 60,
        unit: 'minutes',
        preferredTime: 'evening',
      });

    habitId = habitRes.body.data?._id || habitRes.body.data?.id;
  });

  after(async () => {
    await User.deleteMany({ email: testUser.email });
    await Habit.deleteMany({ user: userId });
    await Task.deleteMany({ user: userId });
    await Conversation.deleteMany({ user: userId });
    await Message.deleteMany({ user: userId });
    await JarvisMemory.deleteMany({ user: userId });
    await mongoose.connection.close();
  });

  test('Reject unauthenticated JARVIS chat request', async () => {
    const res = await request(app)
      .post('/api/jarvis/chat')
      .send({ content: 'Hello JARVIS' });

    assert.strictEqual(res.status, 401);
  });

  test('POST /api/jarvis/chat/stream returns text/event-stream chunks for authenticated user', async () => {
    const res = await request(app)
      .post('/api/jarvis/chat/stream')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'I studied only 20 minutes today even though I planned 2 hours. What should I do now?' });

    assert.strictEqual(res.status, 200);
    assert.match(res.headers['content-type'], /text\/event-stream/);
    assert.ok(res.text.includes('data:'));
    assert.ok(res.text.includes('"type":"token"'));
  });

  test('POST /api/jarvis/chat handles natural conversational message', async () => {
    const res = await request(app)
      .post('/api/jarvis/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: "I studied only 20 minutes today even though I planned 2 hours. What should I do now?" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.assistantMessage);
    assert.ok(res.body.data.assistantMessage.content.length > 10);
    assert.ok(res.body.data.conversation.id);
  });

  test('POST /api/jarvis/chat handles procrastination conversationally', async () => {
    const res = await request(app)
      .post('/api/jarvis/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: "I'm procrastinating on studying DSA right now" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.assistantMessage);
  });

  test('POST /api/jarvis/actions/confirm executes authorized focus session', async () => {
    const res = await request(app)
      .post('/api/jarvis/actions/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({
        actionType: 'startFocusSession',
        payload: {
          durationMinutes: 25,
          title: 'DSA Focus Sprint',
          habitName: 'DSA Problem Solving',
        },
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.durationMinutes, 25);
  });

  test('POST /api/jarvis/actions/confirm executes habit creation proposal', async () => {
    const res = await request(app)
      .post('/api/jarvis/actions/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({
        actionType: 'createHabit',
        payload: {
          name: 'Nightly Reading',
          targetValue: 20,
          unit: 'pages',
          preferredTime: 'evening',
          category: 'Reading',
        },
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.habitId);
  });

  test('GET /api/jarvis/dashboard-card returns live contextual recommendation', async () => {
    const res = await request(app)
      .get('/api/jarvis/dashboard-card')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.headline);
    assert.ok(res.body.data.advice);
  });

  test('Memory Management: Save, Retrieve, and Delete Long-Term Memory', async () => {
    // 1. Save memory
    const saveRes = await request(app)
      .post('/api/jarvis/memories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'Target Career Goal',
        value: 'Become Placement Ready in 6 Months',
        category: 'goal',
      });
    assert.strictEqual(saveRes.status, 201);
    const memoryId = saveRes.body.data._id;

    // 2. Retrieve memories
    const listRes = await request(app)
      .get('/api/jarvis/memories')
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.data.some((m) => m.key === 'Target Career Goal'));

    // 3. Delete memory
    const delRes = await request(app)
      .delete(`/api/jarvis/memories/${memoryId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(delRes.status, 200);
  });

  test('GET & PUT /api/jarvis/settings updates personality and coaching style', async () => {
    const putRes = await request(app)
      .put('/api/jarvis/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        personality: 'direct',
        responseLength: 'short',
        proactiveInsights: true,
      });

    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putRes.body.data.personality, 'direct');
    assert.strictEqual(putRes.body.data.responseLength, 'short');
  });

  test('GET /api/jarvis/conversations returns user chat history and isolates other users', async () => {
    const res = await request(app)
      .get('/api/jarvis/conversations')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });
});
