import { Car } from '../domain/Car';
import { CarRepository } from '../domain/CarRepository';

export class GetCarByIdUseCase {
  constructor(private carRepository: CarRepository) {}

  async execute(id: string): Promise<Car | null> {
    return this.carRepository.findById(id);
  }
}
