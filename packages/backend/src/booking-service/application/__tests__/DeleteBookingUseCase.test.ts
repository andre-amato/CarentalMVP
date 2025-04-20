import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../../user-service/domain/DrivingLicense';
import { User } from '../../../user-service/domain/User';
import { Booking } from '../../domain/Booking';
import { BookingRepository } from '../../domain/BookingRepository';
import { DeleteBookingUseCase } from '../DeleteBookingUseCase';

describe('DeleteBookingUseCase', () => {
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let deleteBookingUseCase: DeleteBookingUseCase;

  beforeEach(() => {
    mockBookingRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    deleteBookingUseCase = new DeleteBookingUseCase(mockBookingRepository);
  });

  it('should delete a booking when it exists', async () => {
    const bookingId = 'booking123';
    const mockUser = new User({
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2025-12-31')),
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
    const dateRange = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );

    const mockBooking = new Booking({
      id: bookingId,
      user: mockUser,
      car: mockCar,
      dateRange: dateRange,
      totalPrice: 492.15,
      createdAt: new Date(),
    });

    mockBookingRepository.findById.mockResolvedValueOnce(mockBooking);
    mockBookingRepository.delete.mockResolvedValueOnce(undefined);

    await deleteBookingUseCase.execute(bookingId);

    expect(mockBookingRepository.findById).toHaveBeenCalledWith(bookingId);
    expect(mockBookingRepository.delete).toHaveBeenCalledWith(bookingId);
  });

  it('should throw an error when booking does not exist', async () => {
    const bookingId = 'nonexistent';

    mockBookingRepository.findById.mockResolvedValueOnce(null);

    await expect(deleteBookingUseCase.execute(bookingId)).rejects.toThrow(
      'Booking not found'
    );
    expect(mockBookingRepository.findById).toHaveBeenCalledWith(bookingId);
    expect(mockBookingRepository.delete).not.toHaveBeenCalled();
  });
});
