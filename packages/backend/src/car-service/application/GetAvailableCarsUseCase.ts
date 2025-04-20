import { BookingRepository } from '../../booking-service/domain/BookingRepository';
import { DateRange } from '../../shared/domain/DateRange';
import { AvailableCarDTO } from '../../shared/types';
import { CarRepository } from '../domain/CarRepository';

export class GetAvailableCarsUseCase {
  constructor(
    private carRepository: CarRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<AvailableCarDTO[]> {
    console.log(
      `Getting available cars from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // Normalize dates - set start date to beginning of day and end date to end of day
    const cleanStartDate = new Date(startDate);
    cleanStartDate.setHours(0, 0, 0, 0);

    const cleanEndDate = new Date(endDate);
    cleanEndDate.setHours(23, 59, 59, 999);

    const requestedDateRange = new DateRange(cleanStartDate, cleanEndDate);

    // Get all cars
    const allCars = await this.carRepository.findAll();

    const result: AvailableCarDTO[] = [];

    // Process each car to calculate its effective stock for the requested date range
    for (const car of allCars) {
      try {
        const baseStock = car.getStock();
        console.log(
          `Car ${car.getId()} (${car.brand} ${
            car.model
          }) has base stock: ${baseStock}`
        );

        // Get all bookings for this car that overlap with the requested date range
        const bookings = await this.bookingRepository.findByCarAndDateRange(
          car.getId(),
          requestedDateRange
        );

        // Calculate effective stock by subtracting the number of overlapping bookings
        const effectiveStock = Math.max(0, baseStock - bookings.length);
        console.log(
          `Effective stock for car ${car.getId()}: ${effectiveStock}`
        );

        // Calculate price for the requested date range
        const { totalPrice, averageDailyPrice } =
          car.calculatePriceForDateRange(requestedDateRange);

        // Include all cars in the response with their effective stock
        result.push({
          id: car.getId(),
          brand: car.brand,
          model: car.model,
          stock: effectiveStock,
          totalPrice: totalPrice,
          averageDailyPrice: averageDailyPrice,
        });
      } catch (error) {
        console.error(`Error processing car ${car.getId()}:`, error);
        // Include the car with zero stock in case of error
        result.push({
          id: car.getId(),
          brand: car.brand,
          model: car.model,
          stock: 0,
          totalPrice: 0,
          averageDailyPrice: 0,
        });
      }
    }

    return result;
  }
}
