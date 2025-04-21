import { Application } from 'express';
import { Db } from 'mongodb';
import request from 'supertest';
import { TestDatabase } from '../support/testDatabase';
import { createTestApp } from '../support/testServer';

let db: Db;
let app: Application;

beforeAll(async () => {
  db = await TestDatabase.connect();
  await TestDatabase.clear();
  await TestDatabase.seed();
  app = createTestApp(db);
});

afterAll(async () => {
  await TestDatabase.disconnect();
});

describe('US1: View car availability and pricing', () => {
  it('should return all available cars for complete time slot with pricing during peak season', async () => {
    const res = await request(app).get(
      '/api/cars/available?from=2024-07-01&to=2024-07-07'
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const toyota = res.body.find(
      (car: any) => car.brand === 'Toyota' && car.model === 'Yaris'
    );
    expect(toyota).toBeDefined();
    expect(toyota.stock).toBe(3);
    expect(toyota.totalPrice).toBeCloseTo(7 * 98.43, 2);
    expect(toyota.averageDailyPrice).toBeCloseTo(98.43, 2);
  });

  it('should return correct pricing for mid-season booking', async () => {
    const res = await request(app).get(
      '/api/cars/available?from=2024-05-01&to=2024-05-05'
    );

    expect(res.status).toBe(200);
    const seat = res.body.find(
      (car: any) => car.brand === 'Seat' && car.model === 'Ibiza'
    );
    expect(seat).toBeDefined();
    expect(seat.totalPrice).toBeCloseTo(5 * 65.73, 2);
    expect(seat.averageDailyPrice).toBeCloseTo(65.73, 2);
  });

  it('should return correct pricing for off-season booking', async () => {
    const res = await request(app).get(
      '/api/cars/available?from=2025-01-10&to=2025-01-15'
    );

    expect(res.status).toBe(200);
    const nissan = res.body.find(
      (car: any) => car.brand === 'Nissan' && car.model === 'Qashqai'
    );
    expect(nissan).toBeDefined();
    expect(nissan.totalPrice).toBeCloseTo(6 * 59.87, 2);
    expect(nissan.averageDailyPrice).toBeCloseTo(59.87, 2);
  });

  it('should validate invalid date parameters', async () => {
    const res = await request(app).get(
      '/api/cars/available?from=invalid-date&to=2024-07-07'
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid date/i);
  });
});
