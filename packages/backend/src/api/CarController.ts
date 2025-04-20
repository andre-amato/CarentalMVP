import { Request, Response } from 'express';
import { GetAllCarsUseCase } from '../car-service/application/GetAllCarsUseCase';
import { GetAvailableCarsUseCase } from '../car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from '../car-service/application/GetCarByIdUseCase';

export class CarController {
  constructor(
    private getAvailableCarsUseCase: GetAvailableCarsUseCase,
    private getAllCarsUseCase: GetAllCarsUseCase,
    private getCarByIdUseCase: GetCarByIdUseCase
  ) {}

  async getAvailableCars(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        res
          .status(400)
          .json({ message: 'Both from and to dates are required' });
        return;
      }

      const startDate = new Date(from as string);
      const endDate = new Date(to as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res
          .status(400)
          .json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
        return;
      }

      const availableCars = await this.getAvailableCarsUseCase.execute(
        startDate,
        endDate
      );

      res.status(200).json(availableCars);
    } catch (error) {
      console.error('Error in getAvailableCars:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
  async getAllCars(req: Request, res: Response): Promise<void> {
    try {
      const cars = await this.getAllCarsUseCase.execute();

      // Map to DTOs to avoid exposing domain objects
      const carDTOs = cars.map((car) => ({
        id: car.getId(),
        brand: car.brand,
        model: car.model,
        peakSeasonPrice: car.getPeakSeasonPrice(),
        midSeasonPrice: car.getMidSeasonPrice(),
        offSeasonPrice: car.getOffSeasonPrice(),
      }));

      res.status(200).json(carDTOs);
    } catch (error) {
      console.error('Error in getAllCars:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async getCarById(req: Request, res: Response): Promise<void> {
    try {
      const carId = req.params.id;

      if (!carId) {
        res.status(400).json({ message: 'Car ID is required' });
        return;
      }

      const car = await this.getCarByIdUseCase.execute(carId);

      if (!car) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      // Map to DTO
      const carDTO = {
        id: car.getId(),
        brand: car.brand,
        model: car.model,
        peakSeasonPrice: car.getPeakSeasonPrice(),
        midSeasonPrice: car.getMidSeasonPrice(),
        offSeasonPrice: car.getOffSeasonPrice(),
      };

      res.status(200).json(carDTO);
    } catch (error) {
      console.error('Error in getCarById:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
