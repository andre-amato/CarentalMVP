import { Request, Response } from 'express';
import { GetAvailableCarsUseCase } from '../car-service/application/GetAvailableCarsUseCase';

export class CarController {
  constructor(private getAvailableCarsUseCase: GetAvailableCarsUseCase) {}

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
}
