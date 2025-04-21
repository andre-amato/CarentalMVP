import { Application } from 'express';
import { Db, ObjectId } from 'mongodb';
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

describe('US2: Create Booking', () => {
  it('should create a booking successfully', async () => {
    const users = await db.collection('users').find().toArray();
    const cars = await db.collection('cars').find().toArray();

    const user = users[0];
    const car = cars[0];

    const res = await request(app).post('/api/bookings').send({
      userId: user._id.toString(),
      carId: car._id.toString(),
      startDate: '2024-08-01',
      endDate: '2024-08-05',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('bookingId');
    expect(typeof res.body.bookingId).toBe('string');
  });

  it('should fail if driving license expires before booking ends', async () => {
    const userId = new ObjectId();
    const car = (await db.collection('cars').findOne({}))!;

    await db.collection('users').insertOne({
      _id: userId,
      name: 'Expired License',
      email: 'expired@example.com',
      drivingLicense: {
        licenseNumber: 'EXP123',
        expiryDate: new Date('2024-08-02'),
      },
    });

    const res = await request(app).post('/api/bookings').send({
      userId: userId.toString(),
      carId: car._id.toString(),
      startDate: '2024-08-01',
      endDate: '2024-08-05',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(
      /must be valid for the entire booking period/i
    );
  });

  it('should fail if the same user tries to book the same period with the same car', async () => {
    const user = await db.collection('users').findOne({});
    const car = await db.collection('cars').findOne({});

    // First booking
    const first = await request(app).post('/api/bookings').send({
      userId: user!._id.toString(),
      carId: car!._id.toString(),
      startDate: '2024-09-10',
      endDate: '2024-09-15',
    });

    expect(first.status).toBe(201);

    // Try to book again with same data
    const second = await request(app).post('/api/bookings').send({
      userId: user!._id.toString(),
      carId: car!._id.toString(),
      startDate: '2024-09-10',
      endDate: '2024-09-15',
    });

    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already has a booking/i);
  });

  it('should not allow booking another car for the same period', async () => {
    const user = await db.collection('users').findOne({});
    const cars = await db.collection('cars').find().toArray();
    const car1 = cars[0];
    const car2 = cars.find((c) => c._id.toString() !== car1._id.toString())!;

    // First booking with car1
    const first = await request(app).post('/api/bookings').send({
      userId: user!._id.toString(),
      carId: car1._id.toString(),
      startDate: '2024-10-01',
      endDate: '2024-10-05',
    });

    expect(first.status).toBe(201);

    // Second booking with a different car
    const second = await request(app).post('/api/bookings').send({
      userId: user!._id.toString(),
      carId: car2._id.toString(),
      startDate: '2024-10-01',
      endDate: '2024-10-05',
    });

    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already has a booking/i);
  });
});
