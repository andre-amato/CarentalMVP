import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { GetAllCarsUseCase } from '../../car-service/application/GetAllCarsUseCase';
import { GetAvailableCarsUseCase } from '../../car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from '../../car-service/application/GetCarByIdUseCase';
import { Car } from '../../car-service/domain/Car';
import { CarController } from '../CarController';

describe('CarController', () => {
  let mockGetAvailableCarsUseCase: jest.Mocked<GetAvailableCarsUseCase>;
  let mockGetAllCarsUseCase: jest.Mocked<GetAllCarsUseCase>;
  let mockGetCarByIdUseCase: jest.Mocked<GetCarByIdUseCase>;
  let carController: CarController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAvailableCarsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAvailableCarsUseCase>;

    mockGetAllCarsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllCarsUseCase>;

    mockGetCarByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCarByIdUseCase>;

    carController = new CarController(
      mockGetAvailableCarsUseCase,
      mockGetAllCarsUseCase,
      mockGetCarByIdUseCase
    );

    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as Response['status'],
      json: jsonSpy as Response['json'],
    };
  });

  describe('getAvailableCars', () => {
    it('should return 400 if from date is missing', async () => {
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
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Both from and to dates are required',
      });
    });

    it('should return 400 if to date is missing', async () => {
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
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Both from and to dates are required',
      });
    });

    it('should return 400 if from date is invalid', async () => {
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
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Invalid date format. Use YYYY-MM-DD format.',
      });
    });

    it('should return 400 if to date is invalid', async () => {
      mockRequest = {
        query: {
          from: '2023-01-01',
          to: 'invalid-date',
        },
      };

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Invalid date format. Use YYYY-MM-DD format.',
      });
    });

    it('should return available cars successfully', async () => {
      const availableCars = [
        {
          id: 'car1',
          brand: 'Toyota',
          model: 'Yaris',
          stock: 2,
          averageDailyPrice: 50,
          totalPrice: 250,
        },
      ];

      mockRequest = {
        query: {
          from: '2023-01-01',
          to: '2023-01-05',
        },
      };

      mockGetAvailableCarsUseCase.execute.mockResolvedValueOnce(availableCars);

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetAvailableCarsUseCase.execute).toHaveBeenCalledWith(
        new Date('2023-01-01'),
        new Date('2023-01-05')
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(availableCars);
    });

    it('should return 500 when use case throws error', async () => {
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

    it('should return 500 with default message when error is not Error instance', async () => {
      mockRequest = {
        query: {
          from: '2023-01-01',
          to: '2023-01-05',
        },
      };

      mockGetAvailableCarsUseCase.execute.mockRejectedValueOnce(
        'Some string error'
      );

      await carController.getAvailableCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'An unexpected error occurred',
      });
    });
  });

  describe('getAllCars', () => {
    it('should return all cars successfully', async () => {
      const mockCars = [
        {
          getId: () => 'car1',
          brand: 'Toyota',
          model: 'Yaris',
          getPeakSeasonPrice: () => 98.43,
          getMidSeasonPrice: () => 76.89,
          getOffSeasonPrice: () => 53.65,
        },
      ] as Car[];

      mockRequest = {};
      mockGetAllCarsUseCase.execute.mockResolvedValueOnce(mockCars);

      await carController.getAllCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetAllCarsUseCase.execute).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith([
        {
          id: 'car1',
          brand: 'Toyota',
          model: 'Yaris',
          peakSeasonPrice: 98.43,
          midSeasonPrice: 76.89,
          offSeasonPrice: 53.65,
        },
      ]);
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {};
      mockGetAllCarsUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await carController.getAllCars(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('getCarById', () => {
    it('should return car by ID', async () => {
      const mockCar = {
        getId: () => 'car1',
        brand: 'Toyota',
        model: 'Yaris',
        getPeakSeasonPrice: () => 98.43,
        getMidSeasonPrice: () => 76.89,
        getOffSeasonPrice: () => 53.65,
      } as Car;

      mockRequest = {
        params: { id: 'car1' },
      };

      mockGetCarByIdUseCase.execute.mockResolvedValueOnce(mockCar);

      await carController.getCarById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetCarByIdUseCase.execute).toHaveBeenCalledWith('car1');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        id: 'car1',
        brand: 'Toyota',
        model: 'Yaris',
        peakSeasonPrice: 98.43,
        midSeasonPrice: 76.89,
        offSeasonPrice: 53.65,
      });
    });

    it('should return 400 if car ID is missing', async () => {
      mockRequest = {
        params: {},
      };

      await carController.getCarById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Car ID is required',
      });
    });

    it('should return 404 if car not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
      };

      mockGetCarByIdUseCase.execute.mockResolvedValueOnce(null);

      await carController.getCarById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Car not found',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest = {
        params: { id: 'car1' },
      };

      mockGetCarByIdUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      await carController.getCarById(
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
