import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class GetBookingsByCarIdUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(carId: string): Promise<Booking[]> {
    return this.bookingRepository.findByCarId(carId);
  }
}
