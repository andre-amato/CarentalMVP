import { CreateBookingDTO } from '../../shared/types';
import { CarRepository } from '../../car-service/domain/CarRepository';
import { DateRange } from '../../shared/domain/DateRange';
import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';
import { UserRepository } from '../domain/UserRepository';

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private carRepository: CarRepository,
    private userRepository: UserRepository
  ) {}

  async execute(dto: CreateBookingDTO): Promise<string> {
    const { userId, carId, startDate, endDate } = dto;

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

    // Check if car is available
    if (!car.isAvailable()) {
      throw new Error('Car is not available');
    }

    // Check if user already has booking for this date range
    const existingBookings =
      await this.bookingRepository.findByUserAndDateRange(userId, dateRange);
    if (existingBookings.length > 0) {
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

    // Update car stock
    car.decrementStock();

    // Save changes
    await this.carRepository.save(car);
    await this.bookingRepository.save(booking);

    return booking.getId();
  }
}
