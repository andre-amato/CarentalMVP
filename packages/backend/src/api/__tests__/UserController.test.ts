import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from '../../user-service/application/DeleteUserUseCase';
import { GetAllUsersUseCase } from '../../user-service/application/GetAllUsersUseCase';
import { GetUserUseCase } from '../../user-service/application/GetUserUseCase';
import { User } from '../../user-service/domain/User';
import { UserController } from '../UserController';

describe('UserController', () => {
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockGetUserUseCase: jest.Mocked<GetUserUseCase>;
  let mockDeleteUserUseCase: jest.Mocked<DeleteUserUseCase>;
  let mockGetAllUsersUseCase: jest.Mocked<GetAllUsersUseCase>;
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  // Mock console.error to silence it during tests
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks for use cases
    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUserUseCase>;

    mockGetUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserUseCase>;

    mockDeleteUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteUserUseCase>;

    mockGetAllUsersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllUsersUseCase>;

    userController = new UserController(
      mockCreateUserUseCase,
      mockGetUserUseCase,
      mockDeleteUserUseCase,
      mockGetAllUsersUseCase
    );

    // Setup response mocks
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as Response['status'],
      json: jsonSpy as Response['json'],
    };
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: '2025-12-31',
        },
      };

      mockRequest = {
        body: userData,
      };

      mockCreateUserUseCase.execute.mockResolvedValueOnce('user123');

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData);
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User created successfully',
        userId: 'user123',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          // Missing email and drivingLicense
        },
      };

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });

    it('should return 409 if user already exists', async () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: '2025-12-31',
          },
        },
      };

      mockCreateUserUseCase.execute.mockRejectedValueOnce(
        new Error('User with this email already exists')
      );

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(409);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User with this email already exists',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: '2025-12-31',
          },
        },
      };

      mockCreateUserUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        getId: () => 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: new Date('2025-12-31'),
        },
      } as User;

      mockRequest = {
        params: { id: 'user123' },
      };

      mockGetUserUseCase.execute.mockResolvedValueOnce(mockUser);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetUserUseCase.execute).toHaveBeenCalledWith('user123');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        drivingLicense: {
          licenseNumber: 'ABC123',
          expiryDate: new Date('2025-12-31'),
        },
      });
    });

    it('should return 400 if user ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
      };

      mockGetUserUseCase.execute.mockResolvedValueOnce(null);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        params: { id: 'user123' },
      };

      mockGetUserUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest = {
        params: { id: 'user123' },
      };

      mockDeleteUserUseCase.execute.mockResolvedValueOnce(undefined);

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith('user123');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 400 if user ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
      };

      mockDeleteUserUseCase.execute.mockRejectedValueOnce(
        new Error('User not found')
      );

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        params: { id: 'user123' },
      };

      mockDeleteUserUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        {
          getId: () => 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2025-12-31'),
          },
        },
        {
          getId: () => 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          drivingLicense: {
            licenseNumber: 'DEF456',
            expiryDate: new Date('2026-01-01'),
          },
        },
      ] as User[];

      mockRequest = {};
      mockGetAllUsersUseCase.execute.mockResolvedValueOnce(mockUsers);

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith([
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          drivingLicense: {
            licenseNumber: 'ABC123',
            expiryDate: new Date('2025-12-31'),
          },
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          drivingLicense: {
            licenseNumber: 'DEF456',
            expiryDate: new Date('2026-01-01'),
          },
        },
      ]);
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {};
      mockGetAllUsersUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });
});
