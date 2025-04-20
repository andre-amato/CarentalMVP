import { DateRange } from '../../shared/domain/DateRange';
import { Booking } from './Booking';

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findAll(): Promise<Booking[]>;
  findByUserAndDateRange(
    userId: string,
    dateRange: DateRange
  ): Promise<Booking[]>;
  findByCarAndDateRange(
    carId: string,
    dateRange: DateRange
  ): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  findByCarId(carId: string): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  delete(id: string): Promise<void>;
}
