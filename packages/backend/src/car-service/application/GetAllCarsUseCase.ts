// src/car-service/application/GetAllCarsUseCase.ts
import { Car } from '../domain/Car';
import { CarRepository } from '../domain/CarRepository';

export class GetAllCarsUseCase {
  constructor(private carRepository: CarRepository) {}

  async execute(): Promise<Car[]> {
    return this.carRepository.findAll();
  }
}
