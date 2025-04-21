import request from 'supertest';
import { createTestApp } from '../support/testServer';
import { TestDatabase } from '../support/testDatabase';
import { Db, ObjectId } from 'mongodb';
import { Application } from 'express';

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

describe('E2E: Complete Booking Flow', () => {
  it('should create user, list cars, book one, and verify booking is registered', async () => {
    // 1. Create user
    const userRes = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        drivingLicense: {
          licenseNumber: 'ABC987',
          expiryDate: '2026-12-31',
        },
      });

    expect(userRes.status).toBe(201);
    const userId = userRes.body.userId;

    // 2. List cars
    const carsRes = await request(app).get(
      '/api/cars/available?from=2024-08-10&to=2024-08-15'
    );
    expect(carsRes.status).toBe(200);
    const availableCar = carsRes.body[0];
    expect(availableCar).toBeDefined();

    // 3. Create booking
    const bookingData = {
      userId: userId,
      carId: availableCar.id,
      startDate: '2024-08-10',
      endDate: '2024-08-15',
    };

    const bookingRes = await request(app)
      .post('/api/bookings')
      .send(bookingData);

    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.bookingId;

    // 4. Fetch booking by user
    const userBookings = await request(app).get(`/api/bookings/user/${userId}`);
    expect(userBookings.status).toBe(200);
    const foundBooking = userBookings.body.find((b: any) => b.id === bookingId);
    expect(foundBooking).toBeDefined();
  });
});
