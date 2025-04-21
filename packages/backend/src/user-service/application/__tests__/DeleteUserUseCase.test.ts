import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Booking } from '../../../booking-service/domain/Booking';
import { BookingRepository } from '../../../booking-service/domain/BookingRepository';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { DeleteUserUseCase } from '../DeleteUserUseCase';

describe('DeleteUserUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let deleteUserUseCase: DeleteUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockBookingRepository = {
      findByUserId: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    deleteUserUseCase = new DeleteUserUseCase(
      mockUserRepository,
      mockBookingRepository
    );
  });

  it('should delete user and their bookings successfully', async () => {
    const userId = 'user123';
    const mockUser = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });

    const mockCar = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    const mockBooking = new Booking({
      id: 'booking1',
      user: mockUser,
      car: mockCar,
      dateRange: new DateRange(new Date('2023-07-01'), new Date('2023-07-05')),
      totalPrice: 492.15,
    });

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockBookingRepository.findByUserId.mockResolvedValueOnce([mockBooking]);
    mockBookingRepository.delete.mockResolvedValueOnce(undefined);
    mockUserRepository.delete.mockResolvedValueOnce(undefined);

    await deleteUserUseCase.execute(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockBookingRepository.delete).toHaveBeenCalledWith(
      mockBooking.getId()
    );
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw error if user not found', async () => {
    const userId = 'nonexistent';
    mockUserRepository.findById.mockResolvedValueOnce(null);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
      'User not found'
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockBookingRepository.findByUserId).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle case with no bookings', async () => {
    const userId = 'user123';
    const mockUser = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockBookingRepository.findByUserId.mockResolvedValueOnce([]);
    mockUserRepository.delete.mockResolvedValueOnce(undefined);

    await deleteUserUseCase.execute(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockBookingRepository.delete).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
  });
});
