import { beforeEach, describe, expect, it } from '@jest/globals';
import { DateRange } from '../../../shared/domain/DateRange';
import { Car } from '../../domain/Car';
import { InMemoryCarRepository } from '../InMemoryCarRepository';

describe('InMemoryCarRepository', () => {
  let repository: InMemoryCarRepository;
  let mockCar: Car;

  beforeEach(() => {
    repository = new InMemoryCarRepository();

    mockCar = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });
  });

  it('should save and find a car by id', async () => {
    await repository.save(mockCar);
    const found = await repository.findById('car1');

    expect(found).toBeDefined();
    expect(found?.getId()).toBe('car1');
    expect(found?.brand).toBe('Toyota');
  });

  it('should return null when car not found', async () => {
    const found = await repository.findById('nonexistent');
    expect(found).toBeNull();
  });

  it('should find all cars', async () => {
    const car1 = mockCar;
    const car2 = new Car({
      id: 'car2',
      brand: 'Nissan',
      model: 'Qashqai',
      stock: 2,
      peakSeasonPrice: 101.46,
      midSeasonPrice: 82.94,
      offSeasonPrice: 59.87,
    });

    await repository.save(car1);
    await repository.save(car2);

    const allCars = await repository.findAll();
    expect(allCars).toHaveLength(2);
    expect(allCars[0].getId()).toBe('car1');
    expect(allCars[1].getId()).toBe('car2');
  });

  it('should find available cars', async () => {
    const car1 = mockCar;
    const car2 = new Car({
      id: 'car2',
      brand: 'Nissan',
      model: 'Qashqai',
      stock: 0, // Out of stock
      peakSeasonPrice: 101.46,
      midSeasonPrice: 82.94,
      offSeasonPrice: 59.87,
    });

    await repository.save(car1);
    await repository.save(car2);

    const dateRange = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const availableCars = await repository.findAvailableCars(dateRange);

    expect(availableCars).toHaveLength(1);
    expect(availableCars[0].getId()).toBe('car1');
  });

  it('should update existing car', async () => {
    await repository.save(mockCar);

    const updatedCar = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 5, // Updated stock
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    await repository.save(updatedCar);
    const found = await repository.findById('car1');

    expect(found?.getStock()).toBe(5);
  });

  it('should clear all cars', async () => {
    await repository.save(mockCar);
    await repository.clear();

    const allCars = await repository.findAll();
    expect(allCars).toHaveLength(0);
  });
});
