import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Collection, Db } from 'mongodb';
import { Car } from '../../../car-service/domain/Car';
import { seedDatabase } from '../seedDatabase';

describe('seedDatabase', () => {
  let mockDb: jest.Mocked<Db>;
  let mockCarsCollection: jest.Mocked<Collection>;
  let mockUsersCollection: jest.Mocked<Collection>;
  let mockBookingsCollection: jest.Mocked<Collection>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock collections
    mockCarsCollection = {
      drop: jest.fn(),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
    } as unknown as jest.Mocked<Collection>;

    mockUsersCollection = {
      drop: jest.fn(),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
    } as unknown as jest.Mocked<Collection>;

    mockBookingsCollection = {
      drop: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    // Mock DB
    mockDb = {
      collection: jest.fn((name: string) => {
        switch (name) {
          case 'cars':
            return mockCarsCollection;
          case 'users':
            return mockUsersCollection;
          case 'bookings':
            return mockBookingsCollection;
          default:
            throw new Error(`Unknown collection: ${name}`);
        }
      }),
    } as unknown as jest.Mocked<Db>;

    // Mock console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should drop existing collections', async () => {
    await seedDatabase(mockDb);

    expect(mockCarsCollection.drop).toHaveBeenCalled();
    expect(mockUsersCollection.drop).toHaveBeenCalled();
    expect(mockBookingsCollection.drop).toHaveBeenCalled();
  });

  it('should handle errors when dropping collections', async () => {
    mockCarsCollection.drop.mockRejectedValueOnce(
      new Error('Collection not found')
    );
    mockUsersCollection.drop.mockRejectedValueOnce(
      new Error('Collection not found')
    );
    mockBookingsCollection.drop.mockRejectedValueOnce(
      new Error('Collection not found')
    );

    await seedDatabase(mockDb);

    expect(consoleSpy).toHaveBeenCalledWith(
      'No collections to drop yet or error dropping collections'
    );
  });

  it('should seed cars with correct data', async () => {
    await seedDatabase(mockDb);

    // Check that insertOne was called 5 times (once for each car)
    expect(mockCarsCollection.insertOne).toHaveBeenCalledTimes(5);

    // Check that the data for the first car is correct
    const firstCarCall = mockCarsCollection.insertOne.mock.calls[0][0];
    expect(firstCarCall).toMatchObject({
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    });

    // Check that the data for another car is correct
    const lastCarCall = mockCarsCollection.insertOne.mock.calls[4][0];
    expect(lastCarCall).toMatchObject({
      brand: 'Mercedes',
      model: 'Vito',
      stock: 2,
      peakSeasonPrice: 109.16,
      midSeasonPrice: 89.64,
      offSeasonPrice: 64.97,
    });
  });

  it('should seed users with correct data', async () => {
    await seedDatabase(mockDb);

    // Check that insertOne was called 2 times (once for each user)
    expect(mockUsersCollection.insertOne).toHaveBeenCalledTimes(2);

    // Check that the data for the first user is correct
    const firstUserCall = mockUsersCollection.insertOne.mock.calls[0][0];
    expect(firstUserCall).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: {
        licenseNumber: 'ABC123',
        expiryDate: expect.any(Date),
      },
    });

    // Check that the data for the second user is correct
    const secondUserCall = mockUsersCollection.insertOne.mock.calls[1][0];
    expect(secondUserCall).toMatchObject({
      name: 'Jane Smith',
      email: 'jane@example.com',
      drivingLicense: {
        licenseNumber: 'XYZ789',
        expiryDate: expect.any(Date),
      },
    });
  });

  it('should log the correct number of seeded entities', async () => {
    await seedDatabase(mockDb);

    expect(consoleSpy).toHaveBeenCalledWith('Seeded 5 cars and 2 users');
  });

  it('should create valid Car entities before insertion', async () => {
    await seedDatabase(mockDb);

    // Verify that valid Car entities were created by checking the structure
    mockCarsCollection.insertOne.mock.calls.forEach((call) => {
      const carData = call[0];
      expect(carData).toHaveProperty('_id');
      expect(carData).toHaveProperty('brand');
      expect(carData).toHaveProperty('model');
      expect(carData).toHaveProperty('stock');
      expect(carData).toHaveProperty('peakSeasonPrice');
      expect(carData).toHaveProperty('midSeasonPrice');
      expect(carData).toHaveProperty('offSeasonPrice');
    });
  });

  it('should create valid User entities before insertion', async () => {
    await seedDatabase(mockDb);

    // Verify that valid User entities were created by checking the structure
    mockUsersCollection.insertOne.mock.calls.forEach((call) => {
      const userData = call[0];
      expect(userData).toHaveProperty('_id');
      expect(userData).toHaveProperty('name');
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('drivingLicense');
      expect(userData.drivingLicense).toHaveProperty('licenseNumber');
      expect(userData.drivingLicense).toHaveProperty('expiryDate');
    });
  });

  it('should handle database insertion errors', async () => {
    mockCarsCollection.insertOne.mockRejectedValueOnce(
      new Error('Database error')
    );

    await expect(seedDatabase(mockDb)).rejects.toThrow('Database error');
  });

  it('should correctly map User entity IDs to ObjectIds', async () => {
    await seedDatabase(mockDb);

    // Check that the user IDs are correctly mapped to ObjectIds
    mockUsersCollection.insertOne.mock.calls.forEach((call) => {
      const userData = call[0];
      expect(userData._id).toBeDefined();
      expect(userData._id.toString()).toMatch(/^[a-f\d]{24}$/i); // Check for valid ObjectId format
    });
  });

  it('should correctly use the getStock method on Car entities', async () => {
    const carSpy = jest.spyOn(Car.prototype, 'getStock');

    await seedDatabase(mockDb);

    // Verify that getStock was called for each car
    expect(carSpy).toHaveBeenCalledTimes(5);

    carSpy.mockRestore();
  });
});
