import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserRepository } from '../../domain/UserRepository';
import { CreateUserUseCase } from '../CreateUserUseCase';
import { User } from '../../domain/User';
import { DrivingLicense } from '../../domain/DrivingLicense';
import { CreateUserDTO } from '../../../shared';

describe('CreateUserUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a new user successfully', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: {
        licenseNumber: 'ABC123',
        expiryDate: '2026-12-31',
      },
    };

    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.save.mockResolvedValueOnce(undefined);

    const result = await createUserUseCase.execute(dto);

    expect(result).toBeDefined();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw error if user with email already exists', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: {
        licenseNumber: 'ABC123',
        expiryDate: '2026-12-31',
      },
    };

    const existingUser = new User({
      id: 'existing-id',
      name: 'Existing User',
      email: dto.email,
      drivingLicense: new DrivingLicense('XYZ789', new Date('2026-12-31')),
    });

    mockUserRepository.findByEmail.mockResolvedValueOnce(existingUser);

    await expect(createUserUseCase.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
