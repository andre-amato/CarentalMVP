import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateBookingUseCase } from '../CreateBookingUseCase';
import { UserRepository } from '../../domain/UserRepository';
import { CarRepository } from '../../../car-service/domain/CarRepository';
import { BookingRepository } from '../../domain/BookingRepository';
import { User } from '../../domain/User';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { Booking } from '../../domain/Booking';
import { CreateBookingDTO } from '../../../shared/types';

// Instead of mocking DateRange, we'll use the real implementation
// and mock only the methods we need to control
jest.mock('../../domain/Booking', () => {
  return {
    Booking: jest.fn().mockImplementation(() => ({
      getId: jest.fn().mockReturnValue('booking123'),
      getCreatedAt: jest.fn().mockReturnValue(new Date()),
    })),
  };
});

// Define an interface for the Booking constructor parameters
interface BookingConstructorParams {
  user: User;
  car: Car;
  dateRange: DateRange;
  totalPrice: number;
  id?: string;
  createdAt?: Date;
}

describe('CreateBookingUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCarRepository: jest.Mocked<CarRepository>;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let createBookingUseCase: CreateBookingUseCase;

  const userId = 'user123';
  const carId = 'car123';
  const startDate = '2023-01-01';
  const endDate = '2023-01-05';
  let mockUser: User;
  let mockCar: Car;
  let dto: CreateBookingDTO;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockCarRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAvailableCars: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CarRepository>;

    mockBookingRepository = {
      findById: jest.fn(),
      findByUserAndDateRange: jest.fn(),
      findByCarAndDateRange: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    createBookingUseCase = new CreateBookingUseCase(
      mockBookingRepository,
      mockCarRepository,
      mockUserRepository
    );

    const drivingLicense = new DrivingLicense('ABC123', new Date('2025-01-01'));
    mockUser = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense,
    });

    mockCar = new Car({
      id: carId,
      brand: 'Toyota',
      model: 'Yaris',
      stock: 1,
      peakSeasonPrice: 100,
      midSeasonPrice: 80,
      offSeasonPrice: 60,
    });

    dto = {
      userId,
      carId,
      startDate,
      endDate,
    };

    // Mock repository responses
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockCarRepository.findById.mockResolvedValue(mockCar);
    mockBookingRepository.findByUserAndDateRange.mockResolvedValue([]);

    // Mock car methods
    jest.spyOn(mockCar, 'calculatePriceForDateRange').mockReturnValue({
      totalPrice: 400,
      averageDailyPrice: 80,
    });
    jest.spyOn(mockCar, 'isAvailable').mockReturnValue(true);
    jest.spyOn(mockCar, 'decrementStock').mockImplementation(() => {});

    // Mock user methods
    jest.spyOn(mockUser, 'canDriveFor').mockReturnValue(true);

    // Mock Booking constructor
    (Booking as unknown as jest.Mock).mockClear();
  });

  it('should create a booking successfully', async () => {
    const bookingId = await createBookingUseCase.execute(dto);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockCarRepository.findById).toHaveBeenCalledWith(carId);
    expect(mockCar.isAvailable).toHaveBeenCalled();

    // We don't check the exact DateRange object, just verify method calls
    expect(mockBookingRepository.findByUserAndDateRange).toHaveBeenCalled();
    expect(mockUser.canDriveFor).toHaveBeenCalled();
    expect(mockCar.calculatePriceForDateRange).toHaveBeenCalled();
    expect(mockCar.decrementStock).toHaveBeenCalled();

    expect(mockCarRepository.save).toHaveBeenCalledWith(mockCar);
    expect(mockBookingRepository.save).toHaveBeenCalled();

    // Check that Booking constructor received expected objects
    const bookingConstructorCall = (Booking as unknown as jest.Mock).mock
      .calls[0][0] as BookingConstructorParams;
    expect(bookingConstructorCall.user).toBe(mockUser);
    expect(bookingConstructorCall.car).toBe(mockCar);
    expect(bookingConstructorCall.totalPrice).toBe(400);
    expect(bookingConstructorCall.dateRange).toBeInstanceOf(DateRange);

    expect(bookingId).toBe('booking123');
  });

  it('should throw error if user is not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(createBookingUseCase.execute(dto)).rejects.toThrow(
      'User not found'
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if car is not found', async () => {
    mockCarRepository.findById.mockResolvedValue(null);

    await expect(createBookingUseCase.execute(dto)).rejects.toThrow(
      'Car not found'
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if car is not available', async () => {
    jest.spyOn(mockCar, 'isAvailable').mockReturnValue(false);

    await expect(createBookingUseCase.execute(dto)).rejects.toThrow(
      'Car is not available'
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if user already has a booking for the date range', async () => {
    const existingBooking = {} as Booking;
    mockBookingRepository.findByUserAndDateRange.mockResolvedValue([
      existingBooking,
    ]);

    await expect(createBookingUseCase.execute(dto)).rejects.toThrow(
      'User already has a booking for this date range'
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if driving license is invalid', async () => {
    jest.spyOn(mockUser, 'canDriveFor').mockReturnValue(false);

    await expect(createBookingUseCase.execute(dto)).rejects.toThrow(
      'Driving license must be valid for the entire booking period'
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });
});
