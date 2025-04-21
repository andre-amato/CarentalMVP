import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { GetAllUsersUseCase } from '../GetAllUsersUseCase';

describe('GetAllUsersUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let getAllUsersUseCase: GetAllUsersUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    getAllUsersUseCase = new GetAllUsersUseCase(mockUserRepository);
  });

  it('should return all users', async () => {
    const mockUsers = [
      new User({
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: new DrivingLicense('ABC123', new Date('2026-12-31')),
      }),
      new User({
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        drivingLicense: new DrivingLicense('XYZ789', new Date('2025-06-30')),
      }),
    ];

    mockUserRepository.findAll.mockResolvedValueOnce(mockUsers);

    const result = await getAllUsersUseCase.execute();

    expect(result).toEqual(mockUsers);
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no users exist', async () => {
    mockUserRepository.findAll.mockResolvedValueOnce([]);

    const result = await getAllUsersUseCase.execute();

    expect(result).toEqual([]);
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    mockUserRepository.findAll.mockRejectedValueOnce(
      new Error('Database error')
    );

    await expect(getAllUsersUseCase.execute()).rejects.toThrow(
      'Database error'
    );
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });
});
