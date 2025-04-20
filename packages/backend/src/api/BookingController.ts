import { Request, Response } from 'express';
import { CreateBookingUseCase } from '../booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from '../booking-service/application/DeleteBookingUseCase';

export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private deleteBookingUseCase: DeleteBookingUseCase
  ) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { userId, carId, startDate, endDate } = req.body;

      if (!userId || !carId || !startDate || !endDate) {
        res.status(400).json({
          message: 'userId, carId, startDate, and endDate are required',
        });
        return;
      }

      const bookingId = await this.createBookingUseCase.execute({
        userId,
        carId,
        startDate,
        endDate,
      });

      res.status(201).json({
        message: 'Booking created successfully',
        bookingId,
      });
    } catch (error) {
      console.error('Error in createBooking:', error);

      // Handle specific domain errors with appropriate status codes
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (
          errorMessage.includes('User not found') ||
          errorMessage.includes('Car not found')
        ) {
          res.status(404).json({ message: errorMessage });
          return;
        }

        if (
          errorMessage.includes('User already has a booking') ||
          errorMessage.includes('Car is not available') ||
          errorMessage.includes('Driving license must be valid')
        ) {
          res.status(400).json({ message: errorMessage });
          return;
        }
      }

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id;

      if (!bookingId) {
        res.status(400).json({ message: 'Booking ID is required' });
        return;
      }

      await this.deleteBookingUseCase.execute(bookingId);

      res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error in deleteBooking:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
