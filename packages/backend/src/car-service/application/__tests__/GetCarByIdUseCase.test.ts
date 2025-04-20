import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Car } from '../../domain/Car';
import { CarRepository } from '../../domain/CarRepository';
import { GetCarByIdUseCase } from '../GetCarByIdUseCase';

describe('GetCarByIdUseCase', () => {
  let mockCarRepository: jest.Mocked<CarRepository>;
  let getCarByIdUseCase: GetCarByIdUseCase;

  beforeEach(() => {
    mockCarRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<CarRepository>;

    getCarByIdUseCase = new GetCarByIdUseCase(mockCarRepository);
  });

  it('should return a car by id', async () => {
    const mockCar = new Car({
      id: 'car1',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    mockCarRepository.findById.mockResolvedValueOnce(mockCar);

    const result = await getCarByIdUseCase.execute('car1');

    expect(result).toEqual(mockCar);
    expect(mockCarRepository.findById).toHaveBeenCalledWith('car1');
  });

  it('should return null when car is not found', async () => {
    mockCarRepository.findById.mockResolvedValueOnce(null);

    const result = await getCarByIdUseCase.execute('nonexistent');

    expect(result).toBeNull();
    expect(mockCarRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('should handle errors from repository', async () => {
    const error = new Error('Database error');
    mockCarRepository.findById.mockRejectedValueOnce(error);

    await expect(getCarByIdUseCase.execute('car1')).rejects.toThrow(
      'Database error'
    );
    expect(mockCarRepository.findById).toHaveBeenCalledWith('car1');
  });
});
