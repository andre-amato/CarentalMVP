import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { GetAvailableCarsUseCase } from '../../car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from '../../car-service/application/GetCarByIdUseCase';
import { AvailableCarDTO } from '../../shared/types';
import { CarController } from '../CarController';
import { GetAllCarsUseCase } from '../../car-service/application/GetAllCarsUseCase';

// Mocks for other dependencies used by the CarController
const mockGetAvailableCarsUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<GetAvailableCarsUseCase>;

const mockGetAllCarsUseCase = {
  execute: jest.fn(),
  carRepository: {}, // Provide required dependency or dummy object
} as unknown as jest.Mocked<GetAllCarsUseCase>;

const mockGetCarByIdUseCase = {
  execute: jest.fn(),
  carRepository: {}, // if GetCarByIdUseCase requires it
} as unknown as jest.Mocked<GetCarByIdUseCase>;

describe('CarController', () => {
  const carController = new CarController(
    mockGetAvailableCarsUseCase,
    mockGetAllCarsUseCase,
    mockGetCarByIdUseCase
  );

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as Response['status'],
      json: jsonSpy as Response['json'],
    };
  });

  describe('getAvailableCars', () => {
    it('should return 400 if dates are missing', async () => {
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
          id: '507f1f77bcf86cd799439011',
          brand: 'Toyota',
          model: 'Yaris',
          stock: 2,
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
