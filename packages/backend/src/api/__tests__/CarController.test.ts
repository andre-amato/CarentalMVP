import { describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { GetAvailableCarsUseCase } from '../../car-service/application/GetAvailableCarsUseCase';
import { CarController } from '../CarController';
import { AvailableCarDTO } from '../../shared/types';

describe('CarController', () => {
  // Mock the GetAvailableCarsUseCase
  const mockGetAvailableCarsUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetAvailableCarsUseCase>;

  // Create controller with mocked dependencies
  const carController = new CarController(mockGetAvailableCarsUseCase);

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

  describe('getAvailableCars', () => {
    it('should return 400 if dates are missing', async () => {
      // Test with missing from date
      mockRequest = {
        query: {
          to: '2023-01-05',
        },
      };

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('required'),
        })
      );

      // Test with missing to date
      jest.clearAllMocks();
      mockRequest = {
        query: {
          from: '2023-01-01',
        },
      };

      await carController.getAvailableCars(
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

    it('should return 400 if dates are invalid', async () => {
      mockRequest = {
        query: {
          from: 'invalid-date',
          to: '2023-01-05',
        },
      };

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid date format'),
        })
      );
    });

    it('should return 200 with available cars when request is valid', async () => {
      mockRequest = {
        query: {
          from: '2023-01-01',
          to: '2023-01-05',
        },
      };

      const availableCars: AvailableCarDTO[] = [
        {
          id: 'car123',
          brand: 'Toyota',
          model: 'Yaris',
          averageDailyPrice: 50,
          totalPrice: 250,
        },
      ];

      mockGetAvailableCarsUseCase.execute.mockResolvedValueOnce(availableCars);

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetAvailableCarsUseCase.execute).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(availableCars);
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockRequest = {
        query: {
          from: '2023-01-01',
          to: '2023-01-05',
        },
      };

      mockGetAvailableCarsUseCase.execute.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database connection failed',
      });
    });
  });
});
