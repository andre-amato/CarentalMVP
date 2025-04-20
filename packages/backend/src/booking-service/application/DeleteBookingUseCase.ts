import { BookingRepository } from '../domain/BookingRepository';

export class DeleteBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Simply delete the booking without modifying car stock
    await this.bookingRepository.delete(id);
  }
}
