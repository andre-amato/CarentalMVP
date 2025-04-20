import { InMemoryBookingRepository } from '../../../booking-service/infrastructure/InMemoryBookingRepository';
import { Car } from '../../domain/Car';
import { InMemoryCarRepository } from '../../infrastructure/InMemoryCarRepository';
import { GetAvailableCarsUseCase } from '../GetAvailableCarsUseCase';

describe('GetAvailableCarsUseCase', () => {
  let carRepository: InMemoryCarRepository;
  let bookingRepository: InMemoryBookingRepository;
  let useCase: GetAvailableCarsUseCase;

  beforeEach(async () => {
    carRepository = new InMemoryCarRepository();
    bookingRepository = new InMemoryBookingRepository();
    useCase = new GetAvailableCarsUseCase(carRepository, bookingRepository);

    // Seed car repository with test data
    await carRepository.save(
      new Car({
        brand: 'Toyota',
        model: 'Yaris',
        stock: 3,
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      })
    );

    await carRepository.save(
      new Car({
        brand: 'Seat',
        model: 'Ibiza',
        stock: 0, // No stock, but should still be returned now
        peakSeasonPrice: 85.12,
        midSeasonPrice: 65.73,
        offSeasonPrice: 46.85,
      })
    );
  });

  it('should return all cars with correct pricing for peak season', async () => {
    // Peak season dates
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');

    const availableCars = await useCase.execute(startDate, endDate);

    // Now we expect both cars to be returned
    expect(availableCars.length).toBe(2);

    const toyotaCar = availableCars.find((car) => car.model === 'Yaris');
    const seatCar = availableCars.find((car) => car.model === 'Ibiza');

    expect(toyotaCar).toBeDefined();
    expect(toyotaCar!.brand).toBe('Toyota');
    expect(toyotaCar!.stock).toBe(3); // Full stock
    expect(toyotaCar!.totalPrice).toBeCloseTo(98.43 * 5, 2); // 5 days at peak price
    expect(toyotaCar!.averageDailyPrice).toBeCloseTo(98.43, 2);

    expect(seatCar).toBeDefined();
    expect(seatCar!.brand).toBe('Seat');
    expect(seatCar!.stock).toBe(0); // Zero stock
    expect(seatCar!.totalPrice).toBeCloseTo(85.12 * 5, 2);
  });

  it('should return all cars with correct pricing for off season', async () => {
    // Off season dates
    const startDate = new Date('2023-12-01');
    const endDate = new Date('2023-12-03');

    const availableCars = await useCase.execute(startDate, endDate);

    // Now we expect both cars to be returned
    expect(availableCars.length).toBe(2);

    const toyotaCar = availableCars.find((car) => car.model === 'Yaris');
    const seatCar = availableCars.find((car) => car.model === 'Ibiza');

    expect(toyotaCar).toBeDefined();
    expect(toyotaCar!.totalPrice).toBeCloseTo(53.65 * 3, 2); // 3 days at off season price
    expect(toyotaCar!.averageDailyPrice).toBeCloseTo(53.65, 2);

    expect(seatCar).toBeDefined();
    expect(seatCar!.stock).toBe(0);
  });

  it('should include cars with no stock in results', async () => {
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');

    const availableCars = await useCase.execute(startDate, endDate);

    // Now we expect both cars to be returned
    expect(availableCars.length).toBe(2);
    expect(availableCars.find((car) => car.model === 'Ibiza')).toBeDefined();
    expect(availableCars.find((car) => car.model === 'Ibiza')?.stock).toBe(0);
  });
});
