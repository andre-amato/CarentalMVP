import { expect } from 'chai';
import request from 'supertest';
import { Application } from 'express';
import { TestDatabase } from './support/testDatabase';
import { createTestApp } from './support/testServer';

describe('US2: Create car booking', () => {
  let app: Application;
  let db: any;
  let seededUsers: any[];
  let seededCars: any[];

  before(async () => {
    db = await TestDatabase.connect();
    await TestDatabase.clear();
    await TestDatabase.seed();
    app = createTestApp(db);

    // Fetch seeded data for use in tests
    seededUsers = await db.collection('users').find().toArray();
    seededCars = await db.collection('cars').find().toArray();
  });

  after(async () => {
    await TestDatabase.disconnect();
  });

  it('should create a booking successfully', async () => {
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[0]._id.toString(),
      carId: seededCars[0]._id.toString(),
      startDate: '2024-07-01',
      endDate: '2024-07-07',
    });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Booking created successfully');
    expect(response.body.bookingId).to.exist;
  });

  it('should prevent double booking for same user and dates', async () => {
    // Create first booking
    await request(app).post('/api/bookings').send({
      userId: seededUsers[0]._id.toString(),
      carId: seededCars[1]._id.toString(),
      startDate: '2024-08-01',
      endDate: '2024-08-10',
    });

    // Attempt second booking with overlapping dates
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[0]._id.toString(),
      carId: seededCars[2]._id.toString(),
      startDate: '2024-08-05',
      endDate: '2024-08-15',
    });

    expect(response.status).to.equal(409);
    expect(response.body.message).to.include('already has a booking');
  });

  it('should validate driving license for entire booking period', async () => {
    // Jane Smith's license expires on 2025-07-15
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[1]._id.toString(),
      carId: seededCars[0]._id.toString(),
      startDate: '2025-07-10',
      endDate: '2025-07-20', // Extends beyond license expiry
    });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('Driving license must be valid');
  });

  it('should allow booking different cars on same dates', async () => {
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[1]._id.toString(),
      carId: seededCars[1]._id.toString(),
      startDate: '2024-09-01',
      endDate: '2024-09-05',
    });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Booking created successfully');
  });

  it('should not allow booking when car is out of stock', async () => {
    // Create multiple bookings to deplete stock for Jaguar (stock: 1)
    const jaguarId = seededCars
      .find((car: any) => car.brand === 'Jaguar')
      ._id.toString();

    // First booking should succeed
    await request(app).post('/api/bookings').send({
      userId: seededUsers[0]._id.toString(),
      carId: jaguarId,
      startDate: '2024-10-01',
      endDate: '2024-10-05',
    });

    // Second booking should fail due to stock
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[1]._id.toString(),
      carId: jaguarId,
      startDate: '2024-10-10',
      endDate: '2024-10-15',
    });

    expect(response.status).to.equal(409);
    expect(response.body.message).to.include('No available stock');
  });

  it('should calculate correct total price for booking in peak season', async () => {
    const toyota = seededCars.find((car: any) => car.brand === 'Toyota');
    const response = await request(app).post('/api/bookings').send({
      userId: seededUsers[0]._id.toString(),
      carId: toyota._id.toString(),
      startDate: '2024-07-20',
      endDate: '2024-07-25',
    });

    expect(response.status).to.equal(201);

    // Verify booking total price
    const booking = await db
      .collection('bookings')
      .findOne({ _id: response.body.bookingId });
    expect(booking.totalPrice).to.equal(6 * toyota.peakSeasonPrice); // 6 days in peak season
  });
});
