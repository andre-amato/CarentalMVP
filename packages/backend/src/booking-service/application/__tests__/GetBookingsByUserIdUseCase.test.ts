import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../../user-service/domain/DrivingLicense';
import { User } from '../../../user-service/domain/User';
import { Booking } from '../../domain/Booking';
import { BookingRepository } from '../../domain/BookingRepository';
import { GetBookingsByUserIdUseCase } from '../GetBookingsByUserIdUseCase';

describe('GetBookingsByUserIdUseCase', () => {
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let getBookingsByUserIdUseCase: GetBookingsByUserIdUseCase;

  beforeEach(() => {
    mockBookingRepository = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    getBookingsByUserIdUseCase = new GetBookingsByUserIdUseCase(
      mockBookingRepository
    );
  });

  it('should return bookings for a specific user', async () => {
    const userId = 'user123';
    const mockUser = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2025-12-31')),
    });

    const mockCar1 = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });
    const mockCar2 = new Car({
      id: 'car2',
      brand: 'Nissan',
      model: 'Qashqai',
      stock: 2,
      peakSeasonPrice: 101.46,
      midSeasonPrice: 82.94,
      offSeasonPrice: 59.87,
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
        user: mockUser,
        car: mockCar1,
        dateRange: dateRange1,
        totalPrice: 492.15,
        createdAt: new Date(),
      }),
      new Booking({
        id: 'booking2',
        user: mockUser,
        car: mockCar2,
        dateRange: dateRange2,
        totalPrice: 507.3,
        createdAt: new Date(),
      }),
    ];

    mockBookingRepository.findByUserId.mockResolvedValueOnce(mockBookings);

    const result = await getBookingsByUserIdUseCase.execute(userId);

    expect(result).toEqual(mockBookings);
    expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return empty array when no bookings found for user', async () => {
    const userId = 'user123';
    mockBookingRepository.findByUserId.mockResolvedValueOnce([]);

    const result = await getBookingsByUserIdUseCase.execute(userId);

    expect(result).toEqual([]);
    expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
