import { describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { CreateBookingUseCase } from '../../booking-service/application/CreateBookingUseCase';
import { BookingController } from '../BookingController';

describe('BookingController', () => {
  // Mock the CreateBookingUseCase
  const mockCreateBookingUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CreateBookingUseCase>;

  // Create controller with mocked dependencies
  const bookingController = new BookingController(mockCreateBookingUseCase);

  // Mock Express request and response objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    // Reset mock function calls
    jest.clearAllMocks();

    // Setup response mock - use proper type assertions
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as unknown as Response['status'],
      json: jsonSpy as unknown as Response['json'],
    };
  });

  describe('createBooking', () => {
    it('should return 400 if required fields are missing', async () => {
      // Test with missing userId
      mockRequest = {
        body: {
          carId: 'car123',
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('required'),
        })
      );
    });

    it('should return 201 when booking is created successfully', async () => {
      mockRequest = {
        body: {
          userId: 'user123',
          carId: 'car123',
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      const bookingId = 'booking123';
      mockCreateBookingUseCase.execute.mockResolvedValueOnce(bookingId);

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCreateBookingUseCase.execute).toHaveBeenCalledWith({
        userId: 'user123',
        carId: 'car123',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
      });
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('created successfully'),
          bookingId,
        })
      );
    });

    it('should return 404 when user or car not found', async () => {
      mockRequest = {
        body: {
          userId: 'nonexistent',
          carId: 'car123',
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      mockCreateBookingUseCase.execute.mockRejectedValueOnce(
        new Error('User not found')
      );

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 400 for domain validation errors', async () => {
      mockRequest = {
        body: {
          userId: 'user123',
          carId: 'car123',
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      mockCreateBookingUseCase.execute.mockRejectedValueOnce(
        new Error('Driving license must be valid')
      );

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Driving license must be valid',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        body: {
          userId: 'user123',
          carId: 'car123',
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      mockCreateBookingUseCase.execute.mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Unexpected error',
      });
    });
  });
});
