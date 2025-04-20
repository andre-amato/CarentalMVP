import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Collection, Db, Document, ObjectId, WithId } from 'mongodb';
import { Car } from '../../../car-service/domain/Car';
import { DateRange } from '../../../shared/domain/DateRange';
import { DrivingLicense } from '../../../user-service/domain/DrivingLicense';
import { User } from '../../../user-service/domain/User';
import { Booking } from '../../domain/Booking';
import { MongoBookingRepository } from '../MongoBookingRepository';

describe('MongoBookingRepository', () => {
  let repository: MongoBookingRepository;
  let mockCollection: jest.Mocked<Collection>;
  let mockDb: jest.Mocked<Db>;
  let mockUser: User;
  let mockCar: Car;
  let dateRange: DateRange;

  // Mock console.log and console.error to silence them during tests
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    repository = new MongoBookingRepository(mockDb);

    mockUser = new User({
      id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });

    mockCar = new Car({
      id: '507f1f77bcf86cd799439012',
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    dateRange = new DateRange(new Date('2023-07-01'), new Date('2023-07-05'));
  });

  it('should find a booking by id', async () => {
    const bookingData = {
      _id: new ObjectId('507f1f77bcf86cd799439013'),
      user: {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: new Date('2026-12-31'),
        },
      },
      car: {
        _id: new ObjectId('507f1f77bcf86cd799439012'),
        brand: 'Toyota',
        model: 'Yaris',
        stock: 3,
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      },
      dateRange: {
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-07-05'),
      },
      totalPrice: 492.15,
      createdAt: new Date(),
    };

    mockCollection.findOne.mockResolvedValueOnce(
      bookingData as WithId<Document>
    );

    const result = await repository.findById('507f1f77bcf86cd799439013');

    expect(result).toBeDefined();
    expect(result?.getId()).toBe('507f1f77bcf86cd799439013');
    expect(mockCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId('507f1f77bcf86cd799439013'),
    });
  });

  it('should return null when booking not found', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null);

    const result = await repository.findById('507f1f77bcf86cd799439013');

    expect(result).toBeNull();
  });

  it('should save a booking', async () => {
    const booking = new Booking({
      id: '507f1f77bcf86cd799439013',
      user: mockUser,
      car: mockCar,
      dateRange,
      totalPrice: 492.15,
    });

    await repository.save(booking);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId('507f1f77bcf86cd799439013') },
      { $set: expect.any(Object) },
      { upsert: true }
    );
  });

  it('should find bookings by user and date range', async () => {
    const bookingsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        user: {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        car: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
        dateRange: {
          startDate: new Date('2023-07-01'),
          endDate: new Date('2023-07-05'),
        },
        totalPrice: 492.15,
        createdAt: new Date(),
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(bookingsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findByUserAndDateRange(
      '507f1f77bcf86cd799439011',
      dateRange
    );

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalled();
  });

  it('should find bookings by car and date range', async () => {
    const bookingsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        user: {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        car: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
        dateRange: {
          startDate: new Date('2023-07-01'),
          endDate: new Date('2023-07-05'),
        },
        totalPrice: 492.15,
        createdAt: new Date(),
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(bookingsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findByCarAndDateRange(
      '507f1f77bcf86cd799439012',
      dateRange
    );

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalled();
  });

  it('should delete a booking', async () => {
    await repository.delete('507f1f77bcf86cd799439013');

    expect(mockCollection.deleteOne).toHaveBeenCalledWith({
      _id: new ObjectId('507f1f77bcf86cd799439013'),
    });
  });

  it('should not attempt delete for invalid ObjectId', async () => {
    await repository.delete('invalid-id');

    expect(mockCollection.deleteOne).not.toHaveBeenCalled();
  });

  it('should find all bookings', async () => {
    const bookingsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        user: {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        car: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
        dateRange: {
          startDate: new Date('2023-07-01'),
          endDate: new Date('2023-07-05'),
        },
        totalPrice: 492.15,
        createdAt: new Date(),
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(bookingsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalled();
  });

  it('should find bookings by user id', async () => {
    const bookingsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        user: {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        car: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
        dateRange: {
          startDate: new Date('2023-07-01'),
          endDate: new Date('2023-07-05'),
        },
        totalPrice: 492.15,
        createdAt: new Date(),
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(bookingsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findByUserId('507f1f77bcf86cd799439011');

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalledWith({
      'user._id': new ObjectId('507f1f77bcf86cd799439011'),
    });
  });

  it('should find bookings by car id', async () => {
    const bookingsData = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        user: {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        car: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          brand: 'Toyota',
          model: 'Yaris',
          stock: 3,
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
        dateRange: {
          startDate: new Date('2023-07-01'),
          endDate: new Date('2023-07-05'),
        },
        totalPrice: 492.15,
        createdAt: new Date(),
      },
    ];

    const findMock = {
      toArray: jest
        .fn<() => Promise<WithId<Document>[]>>()
        .mockResolvedValueOnce(bookingsData as WithId<Document>[]),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);

    const result = await repository.findByCarId('507f1f77bcf86cd799439012');

    expect(result).toHaveLength(1);
    expect(mockCollection.find).toHaveBeenCalledWith({
      'car._id': new ObjectId('507f1f77bcf86cd799439012'),
    });
  });

  it('should handle other errors in findByUserId', async () => {
    const findMock = {
      toArray: jest.fn<() => Promise<WithId<Document>[]>>(),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);
    findMock.toArray.mockRejectedValueOnce(new Error('Database error'));

    await expect(
      repository.findByUserId('507f1f77bcf86cd799439011')
    ).rejects.toThrow('Database error');
  });

  it('should handle other errors in findByCarId', async () => {
    const findMock = {
      toArray: jest.fn<() => Promise<WithId<Document>[]>>(),
    };
    mockCollection.find.mockReturnValueOnce(findMock as any);
    findMock.toArray.mockRejectedValueOnce(new Error('Database error'));

    await expect(
      repository.findByCarId('507f1f77bcf86cd799439012')
    ).rejects.toThrow('Database error');
  });
});
