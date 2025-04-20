import { UserRepository } from '../domain/UserRepository';
import { BookingRepository } from '../../booking-service/domain/BookingRepository';

export class DeleteUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Find and delete all bookings for this user
    const userBookings = await this.bookingRepository.findByUserId(id);

    for (const booking of userBookings) {
      await this.bookingRepository.delete(booking.getId());
    }

    await this.userRepository.delete(id);
  }
}
