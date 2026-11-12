import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { store, createStore } from '../stores/dataStore.js';

function reseed(): void {
  const fresh = createStore();
  store.gyms = fresh.gyms;
  store.members = fresh.members;
  store.classes = fresh.classes;
  store.checkIns = fresh.checkIns;
}

describe('API endpoints (fastify.inject)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    reseed();
    app = buildApp();
    await app.ready();
  });

  it('GET /api/members/:id returns a member profile', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/members/m-1' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.name).toBe('Thandiwe Mokoena');
    expect(body.tier).toBe('elite');
  });

  it('GET /api/members/:id returns 404 for an unknown member', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/members/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('NOT_FOUND');
  });

  it('GET /api/members/:id/stats computes a streak', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/members/m-1/stats' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('currentStreak');
  });

  it('POST /api/check-in records a visit (201)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/check-in',
      payload: { memberId: 'm-3', gymId: 'gym-1' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().memberId).toBe('m-3');
  });

  it('rejects an invalid body with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/check-in',
      payload: { memberId: 'm-3' },
    });
    expect(res.statusCode).toBe(400);
  });
});
