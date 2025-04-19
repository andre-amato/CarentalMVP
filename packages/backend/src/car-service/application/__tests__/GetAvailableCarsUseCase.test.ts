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
        stock: 0, // No stock, should not be returned
        peakSeasonPrice: 85.12,
        midSeasonPrice: 65.73,
        offSeasonPrice: 46.85,
      })
    );
  });

  it('should return available cars with correct pricing for peak season', async () => {
    // Peak season dates
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');

    const availableCars = await useCase.execute(startDate, endDate);

    expect(availableCars.length).toBe(1);
    expect(availableCars[0].brand).toBe('Toyota');
    expect(availableCars[0].model).toBe('Yaris');
    expect(availableCars[0].totalPrice).toBeCloseTo(98.43 * 5, 2); // 5 days at peak price
    expect(availableCars[0].averageDailyPrice).toBeCloseTo(98.43, 2);
  });

  it('should return available cars with correct pricing for off season', async () => {
    // Off season dates
    const startDate = new Date('2023-12-01');
    const endDate = new Date('2023-12-03');

    const availableCars = await useCase.execute(startDate, endDate);

    expect(availableCars.length).toBe(1);
    expect(availableCars[0].brand).toBe('Toyota');
    expect(availableCars[0].model).toBe('Yaris');
    expect(availableCars[0].totalPrice).toBeCloseTo(53.65 * 3, 2); // 3 days at off season price
    expect(availableCars[0].averageDailyPrice).toBeCloseTo(53.65, 2);
  });

  it('should not return cars with no stock', async () => {
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');

    const availableCars = await useCase.execute(startDate, endDate);

    expect(availableCars.length).toBe(1);
    expect(availableCars.find((car) => car.model === 'Ibiza')).toBeUndefined();
  });
});
