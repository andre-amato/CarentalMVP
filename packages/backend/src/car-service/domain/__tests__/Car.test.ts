import { beforeEach, describe, expect, it } from '@jest/globals';
import { DateRange } from '../../../shared/domain/DateRange';
import { Car } from '../Car';

describe('Car', () => {
  let carProps;

  beforeEach(() => {
    carProps = {
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    };
  });

  it('should create a car with valid properties', () => {
    const car = new Car(carProps);

    expect(car.getId()).toBeDefined();
    expect(car.brand).toBe('Toyota');
    expect(car.model).toBe('Yaris');
    expect(car.getStock()).toBe(3);
  });

  it('should calculate price for date range in peak season', () => {
    const car = new Car(carProps);
    const dateRange = new DateRange(
      new Date('2023-07-01'), // Peak season
      new Date('2023-07-05')
    );

    const { totalPrice, averageDailyPrice } =
      car.calculatePriceForDateRange(dateRange);

    // 5 days in peak season
    expect(totalPrice).toBeCloseTo(98.43 * 5, 2);
    expect(averageDailyPrice).toBeCloseTo(98.43, 2);
  });

  it('should calculate price for date range in mid season', () => {
    const car = new Car(carProps);
    const dateRange = new DateRange(
      new Date('2023-10-01'), // Mid season
      new Date('2023-10-03')
    );

    const { totalPrice, averageDailyPrice } =
      car.calculatePriceForDateRange(dateRange);

    // 3 days in mid season
    expect(totalPrice).toBeCloseTo(76.89 * 3, 2);
    expect(averageDailyPrice).toBeCloseTo(76.89, 2);
  });

  it('should calculate price for date range spanning different seasons', () => {
    const car = new Car(carProps);
    const dateRange = new DateRange(
      new Date('2023-09-14'), // Peak season
      new Date('2023-09-16') // 2 days peak, 1 day mid
    );

    const { totalPrice, averageDailyPrice } =
      car.calculatePriceForDateRange(dateRange);

    const expectedTotal = 98.43 * 2 + 76.89; // 2 days peak + 1 day mid
    expect(totalPrice).toBeCloseTo(expectedTotal, 2);
    expect(averageDailyPrice).toBeCloseTo(expectedTotal / 3, 2);
  });

  it('should decrement stock', () => {
    const car = new Car(carProps);
    car.decrementStock();
    expect(car.getStock()).toBe(2);
  });

  it('should throw error when decrementing stock below zero', () => {
    const car = new Car({ ...carProps, stock: 0 });
    expect(() => car.decrementStock()).toThrow(
      'Cannot decrement stock below zero'
    );
  });

  it('should increment stock', () => {
    const car = new Car(carProps);
    car.incrementStock();
    expect(car.getStock()).toBe(4);
  });

  it('should report availability based on stock', () => {
    const car = new Car(carProps);
    expect(car.isAvailable()).toBe(true);

    const unavailableCar = new Car({ ...carProps, stock: 0 });
    expect(unavailableCar.isAvailable()).toBe(false);
  });
});
