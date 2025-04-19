import { beforeEach, describe, expect, it } from '@jest/globals';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { Booking } from '../Booking';
import { DrivingLicense } from '../DrivingLicense';
import { User } from '../User';

describe('Booking', () => {
  let validUser: User;
  let validCar: Car;
  let validDateRange: DateRange;

  beforeEach(() => {
    // Create a user with a valid license
    const validLicense = new DrivingLicense('ABC123', new Date('2025-12-31'));
    validUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: validLicense,
    });

    // Create a car
    validCar = new Car({
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    // Create a date range
    validDateRange = new DateRange(
      new Date('2023-07-15'),
      new Date('2023-07-20')
    );
  });

  it('should create a valid booking', () => {
    const booking = new Booking({
      user: validUser,
      car: validCar,
      dateRange: validDateRange,
      totalPrice: 500,
    });

    expect(booking.getId()).toBeDefined();
    expect(booking.user).toBe(validUser);
    expect(booking.car).toBe(validCar);
    expect(booking.dateRange).toBe(validDateRange);
    expect(booking.totalPrice).toBe(500);
    expect(booking.getCreatedAt()).toBeInstanceOf(Date);
  });

  it('should throw an error if driving license expires during booking', () => {
    // Create a user with a license that expires during the booking
    const expiringSoonLicense = new DrivingLicense(
      'XYZ789',
      new Date('2023-07-18')
    );
    const userWithExpiringLicense = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      drivingLicense: expiringSoonLicense,
    });

    expect(() => {
      new Booking({
        user: userWithExpiringLicense,
        car: validCar,
        dateRange: validDateRange,
        totalPrice: 500,
      });
    }).toThrow('Driving license must be valid for the entire booking period');
  });
});
