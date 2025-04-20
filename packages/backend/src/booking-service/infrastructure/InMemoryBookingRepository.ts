import { DateRange } from '../../shared/domain/DateRange';
import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class InMemoryBookingRepository implements BookingRepository {
  private bookings: Map<string, Booking> = new Map();

  async findById(id: string): Promise<Booking | null> {
    const booking = this.bookings.get(id);
    return booking || null;
  }

  async findByUserAndDateRange(
    userId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter((booking) => {
      return (
        booking.user.getId() === userId && booking.dateRange.overlaps(dateRange)
      );
    });
  }

  async findByCarAndDateRange(
    carId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter((booking) => {
      return (
        booking.car.getId() === carId && booking.dateRange.overlaps(dateRange)
      );
    });
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.set(booking.getId(), booking);
  }

  // Helper methods for testing
  async clear(): Promise<void> {
    this.bookings.clear();
  }

  // Optional: Get all bookings (useful for testing)
  async findAll(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async delete(id: string): Promise<void> {
    this.bookings.delete(id);
  }
}
