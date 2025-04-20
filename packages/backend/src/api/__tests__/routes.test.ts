import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response, Router } from 'express';
import { BookingController } from '../BookingController';
import { CarController } from '../CarController';
import { UserController } from '../UserController';
import { setupRoutes } from '../routes';

// Mock express Router
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('Routes', () => {
  let mockCarController: jest.Mocked<CarController>;
  let mockBookingController: jest.Mocked<BookingController>;
  let mockUserController: jest.Mocked<UserController>;
  let mockRouter: jest.Mocked<Router>;
  let mockGet: jest.Mock;
  let mockPost: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCarController = {
      getAvailableCars: jest.fn(),
      getAllCars: jest.fn(),
      getCarById: jest.fn(),
    } as unknown as jest.Mocked<CarController>;

    mockBookingController = {
      createBooking: jest.fn(),
      getAllBookings: jest.fn(),
      getBookingsByCarId: jest.fn(),
      getBookingsByUserId: jest.fn(),
      deleteBooking: jest.fn(),
    } as unknown as jest.Mocked<BookingController>;

    mockUserController = {
      createUser: jest.fn(),
      getUser: jest.fn(),
      deleteUser: jest.fn(),
      getAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserController>;

    mockGet = jest.fn();
    mockPost = jest.fn();
    mockDelete = jest.fn();

    mockRouter = {
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    } as unknown as jest.Mocked<Router>;

    (Router as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Car routes', () => {
    it('should setup car routes correctly', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      expect(mockGet).toHaveBeenCalledWith(
        '/cars/available',
        expect.any(Function)
      );
      expect(mockGet).toHaveBeenCalledWith('/cars/all', expect.any(Function));
      expect(mockGet).toHaveBeenCalledWith('/cars/:id', expect.any(Function));
    });

    it('should handle getAvailableCars route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/cars/available'
      );

      expect(call).toBeDefined();

      if (!call) throw new Error('Handler not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockCarController.getAvailableCars).toHaveBeenCalledWith(req, res);
    });

    it('should handle getAllCars route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/cars/all'
      );

      expect(call).toBeDefined();
      if (!call) throw new Error('Handler for /cars/all not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockCarController.getAllCars).toHaveBeenCalledWith(req, res);
    });

    it('should handle getCarById route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/cars/:id'
      );

      expect(call).toBeDefined();
      if (!call) throw new Error('Handler for /cars/:id not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockCarController.getCarById).toHaveBeenCalledWith(req, res);
    });
  });

  describe('Booking routes', () => {
    it('should setup booking routes correctly', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      expect(mockGet).toHaveBeenCalledWith('/bookings', expect.any(Function));
      expect(mockPost).toHaveBeenCalledWith('/bookings', expect.any(Function));
      expect(mockGet).toHaveBeenCalledWith(
        '/bookings/car/:carId',
        expect.any(Function)
      );
      expect(mockGet).toHaveBeenCalledWith(
        '/bookings/user/:userId',
        expect.any(Function)
      );
      expect(mockDelete).toHaveBeenCalledWith(
        '/bookings/:id',
        expect.any(Function)
      );
    });

    it('should handle getAllBookings route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/bookings'
      );

      if (!call) throw new Error('Handler for /bookings not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockBookingController.getAllBookings).toHaveBeenCalledWith(
        req,
        res
      );
    });

    it('should handle createBooking route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockPost.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/bookings'
      );

      if (!call) throw new Error('Handler for POST /bookings not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockBookingController.createBooking).toHaveBeenCalledWith(
        req,
        res
      );
    });

    it('should handle getBookingsByCarId route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/bookings/car/:carId'
      );

      if (!call) throw new Error('Handler for /bookings/car/:carId not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockBookingController.getBookingsByCarId).toHaveBeenCalledWith(
        req,
        res
      );
    });

    it('should handle getBookingsByUserId route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/bookings/user/:userId'
      );

      if (!call)
        throw new Error('Handler for /bookings/user/:userId not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockBookingController.getBookingsByUserId).toHaveBeenCalledWith(
        req,
        res
      );
    });

    it('should handle deleteBooking route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockDelete.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/bookings/:id'
      );

      if (!call) throw new Error('Handler for DELETE /bookings/:id not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockBookingController.deleteBooking).toHaveBeenCalledWith(
        req,
        res
      );
    });
  });

  describe('User routes', () => {
    it('should setup user routes correctly', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      expect(mockPost).toHaveBeenCalledWith('/users', expect.any(Function));
      expect(mockGet).toHaveBeenCalledWith('/users/:id', expect.any(Function));
      expect(mockDelete).toHaveBeenCalledWith(
        '/users/:id',
        expect.any(Function)
      );
      expect(mockGet).toHaveBeenCalledWith('/users', expect.any(Function));
    });

    it('should handle createUser route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockPost.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/users'
      );

      if (!call) throw new Error('Handler for POST /users not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockUserController.createUser).toHaveBeenCalledWith(req, res);
    });

    it('should handle getUser route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/users/:id'
      );

      if (!call) throw new Error('Handler for GET /users/:id not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockUserController.getUser).toHaveBeenCalledWith(req, res);
    });

    it('should handle deleteUser route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockDelete.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/users/:id'
      );

      if (!call) throw new Error('Handler for DELETE /users/:id not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockUserController.deleteUser).toHaveBeenCalledWith(req, res);
    });

    it('should handle getAllUsers route', () => {
      setupRoutes(mockCarController, mockBookingController, mockUserController);

      const call = mockGet.mock.calls.find(
        (c): c is [string, (req: Request, res: Response) => void] =>
          c[0] === '/users'
      );

      if (!call) throw new Error('Handler for GET /users not found');

      const handler = call[1];
      const req = {} as Request;
      const res = {} as Response;

      handler(req, res);
      expect(mockUserController.getAllUsers).toHaveBeenCalledWith(req, res);
    });
  });

  it('should return the router', () => {
    const result = setupRoutes(
      mockCarController,
      mockBookingController,
      mockUserController
    );
    expect(result).toBe(mockRouter);
  });
});
