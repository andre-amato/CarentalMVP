import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class GetAllBookingsUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }
}
