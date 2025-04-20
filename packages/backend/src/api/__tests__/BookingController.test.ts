import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { CreateBookingUseCase } from '../../booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from '../../booking-service/application/DeleteBookingUseCase';
import { GetAllBookingsUseCase } from '../../booking-service/application/GetAllBookingsUseCase';
import { GetBookingsByCarIdUseCase } from '../../booking-service/application/GetBookingsByCarIdUseCase';
import { GetBookingsByUserIdUseCase } from '../../booking-service/application/GetBookingsByUserIdUseCase';
import { BookingController } from '../BookingController';

describe('BookingController', () => {
  // Mock the use cases
  const mockCreateBookingUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CreateBookingUseCase>;

  const mockDeleteBookingUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<DeleteBookingUseCase>;

  const mockGetAllBookingsUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetAllBookingsUseCase>;

  const mockGetBookingsByCarIdUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetBookingsByCarIdUseCase>;

  const mockGetBookingsByUserIdUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetBookingsByUserIdUseCase>;

  // Create controller with mocked dependencies
  const bookingController = new BookingController(
    mockCreateBookingUseCase,
    mockDeleteBookingUseCase,
    mockGetAllBookingsUseCase,
    mockGetBookingsByCarIdUseCase,
    mockGetBookingsByUserIdUseCase
  );

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
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
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
          userId: '507f1f77bcf86cd799439011', // Valid ObjectId format
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
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
        userId: '507f1f77bcf86cd799439011',
        carId: '507f1f77bcf86cd799439012',
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
          userId: '507f1f77bcf86cd799439011', // Valid ObjectId format
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
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
          userId: '507f1f77bcf86cd799439011', // Valid ObjectId format
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
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

    it('should return 400 for invalid ID format', async () => {
      mockRequest = {
        body: {
          userId: 'invalid-id',
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
          startDate: '2023-01-01',
          endDate: '2023-01-05',
        },
      };

      mockCreateBookingUseCase.execute.mockRejectedValueOnce(
        new Error('Invalid user ID format')
      );

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Invalid user ID format',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        body: {
          userId: '507f1f77bcf86cd799439011', // Valid ObjectId format
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
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

  describe('getAllBookings', () => {
    it('should return all bookings successfully', async () => {
      const mockBookings = [
        {
          getId: () => 'booking1',
          user: { getId: () => 'user1', name: 'User 1' },
          car: { getId: () => 'car1', brand: 'Toyota', model: 'Yaris' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 100,
          getCreatedAt: () => new Date(),
        },
        {
          getId: () => 'booking2',
          user: { getId: () => 'user2', name: 'User 2' },
          car: { getId: () => 'car2', brand: 'Seat', model: 'Ibiza' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 200,
          getCreatedAt: () => new Date(),
        },
      ];
      mockGetAllBookingsUseCase.execute.mockResolvedValueOnce(
        mockBookings as any
      );

      await bookingController.getAllBookings(
        {} as Request,
        mockResponse as Response
      );

      expect(mockGetAllBookingsUseCase.execute).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('getBookingsByCarId', () => {
    it('should return 400 if car ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await bookingController.getBookingsByCarId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Car ID is required',
      });
    });

    it('should return bookings for a car ID', async () => {
      mockRequest = {
        params: {
          carId: '507f1f77bcf86cd799439012', // Valid ObjectId format
        },
      };

      const mockBookings = [
        {
          getId: () => 'booking1',
          user: { getId: () => 'user1', name: 'User 1' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 100,
          getCreatedAt: () => new Date(),
        },
        {
          getId: () => 'booking2',
          user: { getId: () => 'user2', name: 'User 2' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 200,
          getCreatedAt: () => new Date(),
        },
      ];
      mockGetBookingsByCarIdUseCase.execute.mockResolvedValueOnce(
        mockBookings as any
      );

      await bookingController.getBookingsByCarId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetBookingsByCarIdUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012'
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('getBookingsByUserId', () => {
    it('should return 400 if user ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await bookingController.getBookingsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return bookings for a user ID', async () => {
      mockRequest = {
        params: {
          userId: '507f1f77bcf86cd799439011', // Valid ObjectId format
        },
      };

      const mockBookings = [
        {
          getId: () => 'booking1',
          car: { getId: () => 'car1', brand: 'Toyota', model: 'Yaris' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 100,
          getCreatedAt: () => new Date(),
        },
        {
          getId: () => 'booking2',
          car: { getId: () => 'car2', brand: 'Seat', model: 'Ibiza' },
          dateRange: { startDate: new Date(), endDate: new Date() },
          totalPrice: 200,
          getCreatedAt: () => new Date(),
        },
      ];
      mockGetBookingsByUserIdUseCase.execute.mockResolvedValueOnce(
        mockBookings as any
      );

      await bookingController.getBookingsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetBookingsByUserIdUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('deleteBooking', () => {
    it('should return 400 if booking ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await bookingController.deleteBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Booking ID is required',
      });
    });

    it('should delete a booking successfully', async () => {
      mockRequest = {
        params: {
          id: '507f1f77bcf86cd799439013', // Valid ObjectId format
        },
      };

      mockDeleteBookingUseCase.execute.mockResolvedValueOnce();

      await bookingController.deleteBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDeleteBookingUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013'
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Booking deleted successfully',
      });
    });

    it('should return 404 if booking is not found', async () => {
      mockRequest = {
        params: {
          id: '507f1f77bcf86cd799439013', // Valid ObjectId format
        },
      };

      mockDeleteBookingUseCase.execute.mockRejectedValueOnce(
        new Error('Booking not found')
      );

      await bookingController.deleteBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Booking not found',
      });
    });
  });
});
