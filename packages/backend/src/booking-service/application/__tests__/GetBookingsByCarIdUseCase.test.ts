import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../../user-service/domain/DrivingLicense';
import { User } from '../../../user-service/domain/User';
import { Booking } from '../../domain/Booking';
import { BookingRepository } from '../../domain/BookingRepository';
import { GetBookingsByCarIdUseCase } from '../GetBookingsByCarIdUseCase';

describe('GetBookingsByCarIdUseCase', () => {
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let getBookingsByCarIdUseCase: GetBookingsByCarIdUseCase;

  beforeEach(() => {
    mockBookingRepository = {
      findByCarId: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    getBookingsByCarIdUseCase = new GetBookingsByCarIdUseCase(
      mockBookingRepository
    );
  });

  it('should return bookings for a specific car', async () => {
    const carId = 'car123';
    const mockUser1 = new User({
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2025-12-31')),
    });
    const mockUser2 = new User({
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      drivingLicense: new DrivingLicense('XYZ789', new Date('2026-01-31')),
    });

    const mockCar = new Car({
      id: carId,
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    const dateRange1 = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const dateRange2 = new DateRange(
      new Date('2023-08-10'),
      new Date('2023-08-15')
    );

    const mockBookings = [
      new Booking({
        id: 'booking1',
        user: mockUser1,
        car: mockCar,
        dateRange: dateRange1,
        totalPrice: 492.15,
        createdAt: new Date(),
      }),
      new Booking({
        id: 'booking2',
        user: mockUser2,
        car: mockCar,
        dateRange: dateRange2,
        totalPrice: 492.15,
        createdAt: new Date(),
      }),
    ];

    mockBookingRepository.findByCarId.mockResolvedValueOnce(mockBookings);

    const result = await getBookingsByCarIdUseCase.execute(carId);

    expect(result).toEqual(mockBookings);
    expect(mockBookingRepository.findByCarId).toHaveBeenCalledWith(carId);
  });

  it('should return empty array when no bookings found for car', async () => {
    const carId = 'car123';
    mockBookingRepository.findByCarId.mockResolvedValueOnce([]);

    const result = await getBookingsByCarIdUseCase.execute(carId);

    expect(result).toEqual([]);
    expect(mockBookingRepository.findByCarId).toHaveBeenCalledWith(carId);
  });
});
