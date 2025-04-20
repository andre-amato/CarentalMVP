import { beforeEach, describe, expect, it } from '@jest/globals';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../../user-service/domain/DrivingLicense';
import { User } from '../../../user-service/domain/User';
import { Booking } from '../../domain/Booking';
import { InMemoryBookingRepository } from '../InMemoryBookingRepository';

describe('InMemoryBookingRepository', () => {
  let repository: InMemoryBookingRepository;
  let mockUser: User;
  let mockCar: Car;
  let dateRange: DateRange;

  beforeEach(() => {
    repository = new InMemoryBookingRepository();

    mockUser = new User({
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });

    mockCar = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    dateRange = new DateRange(new Date('2023-07-01'), new Date('2023-07-05'));
  });

  it('should save and find a booking by id', async () => {
    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    const found = await repository.findById('booking1');

    expect(found).toBeDefined();
    expect(found?.getId()).toBe('booking1');
  });

  it('should return null when booking not found', async () => {
    const found = await repository.findById('nonexistent');
    expect(found).toBeNull();
  });

  it('should find bookings by user and date range', async () => {
    const overlappingRange = new DateRange(
      new Date('2023-07-03'),
      new Date('2023-07-07')
    );
    const nonOverlappingRange = new DateRange(
      new Date('2023-08-01'),
      new Date('2023-08-05')
    );

    const booking1 = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    const booking2 = new Booking({
      id: 'booking2',
      user: mockUser,
      car: mockCar,
      dateRange: nonOverlappingRange,
      totalPrice: 492.15,
    });

    await repository.save(booking1);
    await repository.save(booking2);

    const found = await repository.findByUserAndDateRange(
      'user1',
      overlappingRange
    );
    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('booking1');
  });

  it('should find bookings by car and date range', async () => {
    const overlappingRange = new DateRange(
      new Date('2023-07-03'),
      new Date('2023-07-07')
    );

    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    const found = await repository.findByCarAndDateRange(
      'car1',
      overlappingRange
    );

    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('booking1');
  });

  it('should delete a booking', async () => {
    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    await repository.delete('booking1');
    const found = await repository.findById('booking1');

    expect(found).toBeNull();
  });

  it('should find all bookings', async () => {
    const booking1 = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    const booking2 = new Booking({
      id: 'booking2',
      user: mockUser,
      car: mockCar,
      dateRange: new DateRange(new Date('2023-08-01'), new Date('2023-08-05')),
      totalPrice: 492.15,
    });

    await repository.save(booking1);
    await repository.save(booking2);

    const allBookings = await repository.findAll();
    expect(allBookings).toHaveLength(2);
  });

  it('should find bookings by user id', async () => {
    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    const found = await repository.findByUserId('user1');

    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('booking1');
  });

  it('should find bookings by car id', async () => {
    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    const found = await repository.findByCarId('car1');

    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('booking1');
  });

  it('should clear all bookings', async () => {
    const booking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);
    await repository.clear();
    const allBookings = await repository.findAll();

    expect(allBookings).toHaveLength(0);
  });
});
