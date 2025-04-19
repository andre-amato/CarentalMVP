import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response, Router } from 'express';
import { BookingController } from '../BookingController';
import { CarController } from '../CarController';
import { setupRoutes } from '../routes';

// Mock express Router
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

describe('Routes', () => {
  let mockCarController: jest.Mocked<CarController>;
  let mockBookingController: jest.Mocked<BookingController>;
  let mockRouter: jest.Mocked<Router>;
  let mockGet: jest.Mock;
  let mockPost: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup controller mocks
    mockCarController = {
      getAvailableCars: jest.fn(),
    } as unknown as jest.Mocked<CarController>;

    mockBookingController = {
      createBooking: jest.fn(),
    } as unknown as jest.Mocked<BookingController>;

    // Setup router mocks
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockRouter = {
      get: mockGet,
      post: mockPost,
    } as unknown as jest.Mocked<Router>;

    // Setup Router constructor mock
    (Router as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should setup car routes correctly', () => {
    setupRoutes(mockCarController, mockBookingController);

    // Check that GET /cars route is set up
    expect(mockGet).toHaveBeenCalledWith('/cars', expect.any(Function));

    // Test the route handler
    const [_path, handler] = mockGet.mock.calls[0];
    const req = {} as Request;
    const res = {} as Response;

    // Cast the handler to the correct type
    const typedHandler = handler as (req: Request, res: Response) => void;
    typedHandler(req, res);

    expect(mockCarController.getAvailableCars).toHaveBeenCalledWith(req, res);
  });

  it('should setup booking routes correctly', () => {
    setupRoutes(mockCarController, mockBookingController);

    // Check that POST /bookings route is set up
    expect(mockPost).toHaveBeenCalledWith('/bookings', expect.any(Function));

    // Test the route handler
    const [_path, handler] = mockPost.mock.calls[0];
    const req = {} as Request;
    const res = {} as Response;

    // Cast the handler to the correct type
    const typedHandler = handler as (req: Request, res: Response) => void;
    typedHandler(req, res);

    expect(mockBookingController.createBooking).toHaveBeenCalledWith(req, res);
  });

  it('should return the router', () => {
    const result = setupRoutes(mockCarController, mockBookingController);
    expect(result).toBe(mockRouter);
  });
});
