import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Collection, Db, Document, ObjectId, WithId } from 'mongodb';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { User } from '../../domain/User';
import { MongoUserRepository } from '../MongoUserRepository';

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  let mockCollection: jest.Mocked<Collection>;
  let mockDb: jest.Mocked<Db>;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    repository = new MongoUserRepository(mockDb);
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userData = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: new Date('2026-12-31'),
        },
      };

      mockCollection.findOne.mockResolvedValueOnce(
        userData as WithId<Document>
      );

      const result = await repository.findById('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: new ObjectId('507f1f77bcf86cd799439011'),
      });
      expect(result?.name).toBe('John Doe');
    });

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const result = await repository.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const userData = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: new Date('2026-12-31'),
        },
      };

      mockCollection.findOne.mockResolvedValueOnce(
        userData as WithId<Document>
      );

      const result = await repository.findByEmail('john@example.com');

      expect(result).toBeDefined();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null when email not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user', async () => {
      const user = new User({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
      });

      await repository.save(user);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId('507f1f77bcf86cd799439011') },
        {
          $set: {
            name: 'John Doe',
            email: 'john@example.com',
            drivingLicense: {
              licenseNumber: 'ABC123',
              expiryDate: new Date('2026-12-31'),
            },
          },
        },
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await repository.delete('507f1f77bcf86cd799439011');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: new ObjectId('507f1f77bcf86cd799439011'),
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const usersData = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2026-12-31'),
          },
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          name: 'Jane Smith',
          email: 'jane@example.com',
          drivingLicense: {
            licenseNumber: 'XYZ789',
            expiryDate: new Date('2025-06-30'),
          },
        },
      ];

      const findMock = {
        toArray: jest
          .fn<() => Promise<WithId<Document>[]>>()
          .mockResolvedValueOnce(usersData as WithId<Document>[]),
      };
      mockCollection.find.mockReturnValueOnce(findMock as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(mockCollection.find).toHaveBeenCalled();
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
    });

    it('should return empty array when no users exist', async () => {
      const findMock = {
        toArray: jest
          .fn<() => Promise<WithId<Document>[]>>()
          .mockResolvedValueOnce([]),
      };
      mockCollection.find.mockReturnValueOnce(findMock as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle errors in findById', async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        repository.findById('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Database error');
    });

    it('should handle errors in findByEmail', async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.findByEmail('john@example.com')).rejects.toThrow(
        'Database error'
      );
    });

    it('should handle errors in save', async () => {
      const user = new User({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
      });

      mockCollection.updateOne.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(repository.save(user)).rejects.toThrow('Database error');
    });

    it('should handle errors in delete', async () => {
      mockCollection.deleteOne.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(
        repository.delete('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Database error');
    });

    it('should handle errors in findAll', async () => {
      const findMock = {
        toArray: jest
          .fn<() => Promise<WithId<Document>[]>>()
          .mockRejectedValueOnce(new Error('Database error')),
      };
      mockCollection.find.mockReturnValueOnce(findMock as any);

      await expect(repository.findAll()).rejects.toThrow('Database error');
    });
  });
});
