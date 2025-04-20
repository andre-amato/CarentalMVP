import { Booking } from './Booking';
import { DateRange } from '../../shared/domain/DateRange';

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByUserAndDateRange(
    userId: string,
    dateRange: DateRange
  ): Promise<Booking[]>;
  findByCarAndDateRange(
    carId: string,
    dateRange: DateRange
  ): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  delete(id: string): Promise<void>;
}
