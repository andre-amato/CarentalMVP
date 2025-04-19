import { AvailableCarDTO } from '../../shared/types';
import { BookingRepository } from '../../booking-service/domain/BookingRepository';
import { DateRange } from '../../shared/domain/DateRange';
import { CarRepository } from '../domain/CarRepository';
import { describe, beforeEach, it, expect } from '@jest/globals';

export class GetAvailableCarsUseCase {
  constructor(
    private carRepository: CarRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<AvailableCarDTO[]> {
    const dateRange = new DateRange(startDate, endDate);

    // Get all cars with stock > 0
    const availableCars = await this.carRepository.findAvailableCars(dateRange);

    // Map to DTOs with price calculations
    return availableCars.map((car) => {
      const { totalPrice, averageDailyPrice } =
        car.calculatePriceForDateRange(dateRange);

      return {
        id: car.getId(),
        brand: car.brand,
        model: car.model,
        totalPrice,
        averageDailyPrice,
      };
    });
  }
}
