import { DateRange } from '../../shared/domain/DateRange';
export class GetAvailableCarsUseCase {
    constructor(carRepository, bookingRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }
    async execute(startDate, endDate) {
        const dateRange = new DateRange(startDate, endDate);
        // Get all cars with stock > 0
        const availableCars = await this.carRepository.findAvailableCars(dateRange);
        // Map to DTOs with price calculations
        return availableCars.map((car) => {
            const { totalPrice, averageDailyPrice } = car.calculatePriceForDateRange(dateRange);
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
