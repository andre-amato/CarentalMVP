import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { TestDatabase } from './support/testDatabase';
import { createTestApp } from './support/testServer';

describe('US1: View car availability and pricing', () => {
  let app: Application;
  let db: any;

  before(async () => {
    db = await TestDatabase.connect();
    await TestDatabase.clear();
    await TestDatabase.seed();
    app = createTestApp(db);
  });

  after(async () => {
    await TestDatabase.disconnect();
  });

  it('should return all available cars for a complete time slot with pricing during peak season', async () => {
    // Query for peak season dates (June 1st to September 15th)
    const response = await request(app).get(
      '/api/cars/available?from=2024-07-01&to=2024-07-07'
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');

    // All 5 cars should be available since no bookings exist yet
    expect(response.body).to.have.lengthOf(5);

    // Check Toyota Yaris (from seeded data)
    const toyota = response.body.find(
      (car: any) => car.brand === 'Toyota' && car.model === 'Yaris'
    );
    expect(toyota).to.exist;
    expect(toyota.stock).to.equal(3);
    expect(toyota.peakSeasonPrice).to.equal(98.43);
    expect(toyota.midSeasonPrice).to.equal(76.89);
    expect(toyota.offSeasonPrice).to.equal(53.65);

    // Peak season: 7 days at 98.43 per day
    expect(toyota.totalPrice).to.equal(7 * 98.43);
    expect(toyota.averageDailyPrice).to.equal(98.43);
  });

  it('should return correct pricing for mid-season booking', async () => {
    // Query for mid-season dates (March 1st to June 1st)
    const response = await request(app).get(
      '/api/cars/available?from=2024-05-01&to=2024-05-05'
    );

    expect(response.status).to.equal(200);

    const seat = response.body.find(
      (car: any) => car.brand === 'Seat' && car.model === 'Ibiza'
    );
    expect(seat).to.exist;

    // Mid-season: 5 days at 65.73 per day
    expect(seat.totalPrice).to.equal(5 * 65.73);
    expect(seat.averageDailyPrice).to.equal(65.73);
  });

  it('should return correct pricing for off-season booking', async () => {
    // Query for off-season dates (November 1st to March 1st)
    const response = await request(app).get(
      '/api/cars/available?from=2025-01-10&to=2025-01-15'
    );

    expect(response.status).to.equal(200);

    const nissan = response.body.find(
      (car: any) => car.brand === 'Nissan' && car.model === 'Qashqai'
    );
    expect(nissan).to.exist;

    // Off-season: 6 days at 59.87 per day
    expect(nissan.totalPrice).to.equal(6 * 59.87);
    expect(nissan.averageDailyPrice).to.equal(59.87);
  });

  it('should handle date ranges spanning multiple seasons', async () => {
    // Query that spans from off-season to mid-season
    const response = await request(app).get(
      '/api/cars/available?from=2024-02-28&to=2024-03-04'
    );

    expect(response.status).to.equal(200);

    const mercedes = response.body.find(
      (car: any) => car.brand === 'Mercedes' && car.model === 'Vito'
    );
    expect(mercedes).to.exist;

    // 2 days off-season (Feb 28-29) + 3 days mid-season (Mar 1-3)
    const expectedTotal = 2 * 64.97 + 3 * 89.64;
    expect(mercedes.totalPrice).to.be.closeTo(expectedTotal, 0.01);
    expect(mercedes.averageDailyPrice).to.be.closeTo(expectedTotal / 5, 0.01);
  });

  it('should validate date parameters', async () => {
    const response = await request(app).get(
      '/api/cars/available?from=invalid-date&to=2024-07-07'
    );

    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('Invalid date format');
  });
});
