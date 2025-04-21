// src/user-service/application/__tests__/GetUserUseCase.test.ts
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserRepository } from '../../domain/UserRepository';
import { GetUserUseCase } from '../GetUserUseCase';
import { User } from '../../domain/User';
import { DrivingLicense } from '../../domain/DrivingLicense';

describe('GetUserUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let getUserUseCase: GetUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    getUserUseCase = new GetUserUseCase(mockUserRepository);
  });

  it('should return user by id', async () => {
    const userId = 'user123';
    const mockUser = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
    });

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await getUserUseCase.execute(userId);

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should return null when user not found', async () => {
    const userId = 'nonexistent';
    mockUserRepository.findById.mockResolvedValueOnce(null);

    const result = await getUserUseCase.execute(userId);

    expect(result).toBeNull();
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should handle repository errors', async () => {
    const userId = 'user123';
    mockUserRepository.findById.mockRejectedValueOnce(
      new Error('Database error')
    );

    await expect(getUserUseCase.execute(userId)).rejects.toThrow(
      'Database error'
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });
});
