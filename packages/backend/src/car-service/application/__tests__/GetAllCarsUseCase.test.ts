import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Car } from '../../domain/Car';
import { CarRepository } from '../../domain/CarRepository';
import { GetAllCarsUseCase } from '../GetAllCarsUseCase';

describe('GetAllCarsUseCase', () => {
  let mockCarRepository: jest.Mocked<CarRepository>;
  let getAllCarsUseCase: GetAllCarsUseCase;

  beforeEach(() => {
    mockCarRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<CarRepository>;

    getAllCarsUseCase = new GetAllCarsUseCase(mockCarRepository);
  });

  it('should return all cars', async () => {
    const mockCars = [
      new Car({
        id: 'car1',
        brand: 'Toyota',
        model: 'Yaris',
        stock: 3,
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      }),
      new Car({
        id: 'car2',
        brand: 'Nissan',
        model: 'Qashqai',
        stock: 2,
        peakSeasonPrice: 101.46,
        midSeasonPrice: 82.94,
        offSeasonPrice: 59.87,
      }),
    ];

    mockCarRepository.findAll.mockResolvedValueOnce(mockCars);

    const result = await getAllCarsUseCase.execute();

    expect(result).toEqual(mockCars);
    expect(mockCarRepository.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no cars exist', async () => {
    mockCarRepository.findAll.mockResolvedValueOnce([]);

    const result = await getAllCarsUseCase.execute();

    expect(result).toEqual([]);
    expect(mockCarRepository.findAll).toHaveBeenCalled();
  });

  it('should handle errors from repository', async () => {
    const error = new Error('Database error');
    mockCarRepository.findAll.mockRejectedValueOnce(error);

    await expect(getAllCarsUseCase.execute()).rejects.toThrow('Database error');
    expect(mockCarRepository.findAll).toHaveBeenCalled();
  });
});
