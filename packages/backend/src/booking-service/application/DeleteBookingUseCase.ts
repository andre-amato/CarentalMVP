import { BookingRepository } from '../domain/BookingRepository';
import { CarRepository } from '../../car-service/domain/CarRepository';

export class DeleteBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private carRepository: CarRepository
  ) {}

  async execute(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Increment car stock when booking is deleted
    const car = await this.carRepository.findById(booking.car.getId());

    if (car) {
      car.incrementStock();
      await this.carRepository.save(car);
    }

    await this.bookingRepository.delete(id);
  }
}
