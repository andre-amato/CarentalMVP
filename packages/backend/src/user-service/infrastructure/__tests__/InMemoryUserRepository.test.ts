import { beforeEach, describe, expect, it } from '@jest/globals';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { User } from '../../domain/User';
import { InMemoryUserRepository } from '../InMemoryUserRepository';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let testUser: User;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    testUser = new User({
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      await repository.save(testUser);
      const found = await repository.findById('user123');
      expect(found).toBeDefined();
      expect(found?.getId()).toBe('user123');
    });

    it('should return null when user not found', async () => {
      const found = await repository.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await repository.save(testUser);
      const found = await repository.findByEmail('john@example.com');
      expect(found).toBeDefined();
      expect(found?.email).toBe('john@example.com');
    });

    it('should return null when email not found', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');
      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user', async () => {
      await repository.save(testUser);
      const found = await repository.findById('user123');
      expect(found).toBeDefined();
      expect(found?.name).toBe('John Doe');
    });

    it('should update an existing user', async () => {
      await repository.save(testUser);

      const updatedUser = new User({
        id: 'user123',
        name: 'John Updated',
        email: 'john@example.com',
        drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
      });

      await repository.save(updatedUser);
      const found = await repository.findById('user123');
      expect(found?.name).toBe('John Updated');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await repository.save(testUser);
      await repository.delete('user123');
      const found = await repository.findById('user123');
      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent user', async () => {
      await expect(repository.delete('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all users', async () => {
      await repository.save(testUser);
      await repository.clear();
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1 = testUser;
      const user2 = new User({
        id: 'user456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        drivingLicense: new DrivingLicense('XYZ789', new Date('2026-12-31')),
      });

      await repository.save(user1);
      await repository.save(user2);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });
  });
});
