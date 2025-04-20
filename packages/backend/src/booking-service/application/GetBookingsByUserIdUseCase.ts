import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class GetBookingsByUserIdUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(userId: string): Promise<Booking[]> {
    return this.bookingRepository.findByUserId(userId);
  }
}
