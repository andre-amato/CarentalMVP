// src/car-service/infrastructure/__tests__/MongoCarRepository.test.ts
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Collection, Db, ObjectId, WithId, Document } from 'mongodb';
import { Car } from '../../domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { MongoCarRepository } from '../MongoCarRepository';

describe('MongoCarRepository', () => {
  let repository: MongoCarRepository;
  let mockCollection: jest.Mocked<Collection>;
  let mockDb: jest.Mocked<Db>;
  let mockCar: Car;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    repository = new MongoCarRepository(mockDb);

    mockCar = new Car({
      id: '507f1f77bcf86cd799439011',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });
  });

  it('should find a car by id', async () => {
    const carData = {
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    };

    mockCollection.findOne.mockResolvedValueOnce(carData as WithId<Document>);

    const result = await repository.findById('507f1f77bcf86cd799439011');

    expect(result).toBeDefined();
    expect(result?.brand).toBe('Toyota');
    expect(mockCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId('507f1f77bcf86cd799439011'),
    });
  });

  it('should return null when car not found', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null);

    const result = await repository.findById('507f1f77bcf86cd799439011');

    expect(result).toBeNull();
  });

  it('should find all cars', async () => {
    const carsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        brand: 'Toyota',
        model: 'Yaris',
        stock: 3,
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      },
      {
        _id: new ObjectId('507f1f77bcf86cd799439012'),
        brand: 'Nissan',
        model: 'Qashqai',
        stock: 2,
        peakSeasonPrice: 101.46,
        midSeasonPrice: 82.94,
        offSeasonPrice: 59.87,
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(carsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
    expect(result[0].brand).toBe('Toyota');
    expect(result[1].brand).toBe('Nissan');
  });

  it('should find available cars', async () => {
    const carsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        brand: 'Toyota',
        model: 'Yaris',
        stock: 3,
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(carsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const dateRange = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const result = await repository.findAvailableCars(dateRange);

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalledWith({ stock: { $gt: 0 } });
  });

  it('should save a car', async () => {
    await repository.save(mockCar);

    const expectedId = new ObjectId('507f1f77bcf86cd799439011');

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expectedId },
      {
        $set: {
          _id: expectedId,
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
      },
      { upsert: true }
    );
  });

  it('should handle errors when finding by id', async () => {
    const error = new Error('Database error');
    mockCollection.findOne.mockRejectedValueOnce(error);

    await expect(
      repository.findById('507f1f77bcf86cd799439011')
    ).rejects.toThrow('Database error');
  });

  it('should handle errors when finding all cars', async () => {
    const findMock = {
      toArray: jest.fn<() => Promise<WithId<Document>[]>>(),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);
    findMock.toArray.mockRejectedValueOnce(new Error('Database error'));

    await expect(repository.findAll()).rejects.toThrow('Database error');
  });

  it('should handle errors when finding available cars', async () => {
    const findMock = {
      toArray: jest.fn<() => Promise<WithId<Document>[]>>(),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);
    findMock.toArray.mockRejectedValueOnce(new Error('Database error'));

    const dateRange = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    await expect(repository.findAvailableCars(dateRange)).rejects.toThrow(
      'Database error'
    );
  });

  it('should handle errors when saving a car', async () => {
    const error = new Error('Database error');
    mockCollection.updateOne.mockRejectedValueOnce(error);

    await expect(repository.save(mockCar)).rejects.toThrow('Database error');
  });
});
