import { DateRange } from '../../shared/domain/DateRange';
import { Car } from '../domain/Car';
import { CarRepository } from '../domain/CarRepository';

export class InMemoryCarRepository implements CarRepository {
  private cars: Map<string, Car> = new Map();

  async findById(id: string): Promise<Car | null> {
    const car = this.cars.get(id);
    return car || null;
  }

  async findAll(): Promise<Car[]> {
    return Array.from(this.cars.values());
  }

  async findAvailableCars(dateRange: DateRange): Promise<Car[]> {
    return Array.from(this.cars.values()).filter((car) => car.isAvailable());
  }

  async save(car: Car): Promise<void> {
    this.cars.set(car.getId(), car);
  }

  // Helper method for testing
  async clear(): Promise<void> {
    this.cars.clear();
  }
}
