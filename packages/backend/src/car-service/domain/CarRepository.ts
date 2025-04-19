import { DateRange } from '../../shared/domain/DateRange';
import { Car } from './Car';

export interface CarRepository {
  findById(id: string): Promise<Car | null>;
  findAll(): Promise<Car[]>;
  findAvailableCars(dateRange: DateRange): Promise<Car[]>;
  save(car: Car): Promise<void>;
}
