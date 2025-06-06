import { CarRepository } from '../../car-service/domain/CarRepository';
import { DateRange } from '../../shared/domain/DateRange';
import { CreateBookingDTO } from '../../shared/types';
import { UserRepository } from '../../user-service/domain/UserRepository';
import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private carRepository: CarRepository,
    private userRepository: UserRepository
  ) {}

  async execute(dto: CreateBookingDTO): Promise<string> {
    const { userId, carId, startDate, endDate } = dto;

    // Validate ObjectId format for userId and carId
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(carId)) {
      throw new Error('Invalid car ID format');
    }

    // Convert string dates to Date objects
    const dateRange = new DateRange(new Date(startDate), new Date(endDate));

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find car
    const car = await this.carRepository.findById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    // Check if the car is available for the requested date range
    const existingCarBookings =
      await this.bookingRepository.findByCarAndDateRange(carId, dateRange);

    // Calculate effective availability
    const baseStock = car.getStock();
    if (existingCarBookings.length >= baseStock) {
      throw new Error('Car is not available for the selected dates');
    }

    // Check if user already has booking for this date range
    const existingUserBookings =
      await this.bookingRepository.findByUserAndDateRange(userId, dateRange);

    if (existingUserBookings.length > 0) {
      throw new Error('User already has a booking for this date range');
    }

    // Check if driving license is valid
    if (!user.canDriveFor(dateRange)) {
      throw new Error(
        'Driving license must be valid for the entire booking period'
      );
    }

    // Calculate price
    const { totalPrice } = car.calculatePriceForDateRange(dateRange);

    // Create booking entity
    const booking = new Booking({
      user,
      car,
      dateRange,
      totalPrice,
    });

    await this.bookingRepository.save(booking);

    return booking.getId();
  }
}
