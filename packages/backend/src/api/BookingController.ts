import { Request, Response } from 'express';
import { CreateBookingUseCase } from '../booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from '../booking-service/application/DeleteBookingUseCase';
import { GetAllBookingsUseCase } from '../booking-service/application/GetAllBookingsUseCase';
import { GetBookingsByCarIdUseCase } from '../booking-service/application/GetBookingsByCarIdUseCase';
import { GetBookingsByUserIdUseCase } from '../booking-service/application/GetBookingsByUserIdUseCase';

export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private deleteBookingUseCase: DeleteBookingUseCase,
    private getAllBookingsUseCase: GetAllBookingsUseCase,
    private getBookingsByCarIdUseCase: GetBookingsByCarIdUseCase,
    private getBookingsByUserIdUseCase: GetBookingsByUserIdUseCase
  ) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { userId, carId, startDate, endDate } = req.body;

      // Validate required fields
      if (!userId || !carId || !startDate || !endDate) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }

      // Call use case
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
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error in createBooking:', error);

      // Determine appropriate status code based on error message
      if (errorMessage.includes('not found')) {
        res.status(404).json({ message: errorMessage });
      } else if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('Invalid') ||
        errorMessage.includes('required') ||
        errorMessage.includes('not available') ||
        errorMessage.includes('must be valid') ||
        errorMessage.includes('already has a booking')
      ) {
        res.status(400).json({ message: errorMessage });
      } else {
        res.status(500).json({ message: errorMessage });
      }
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await this.getAllBookingsUseCase.execute();

      // Map to DTOs
      const bookingDTOs = bookings.map((booking) => ({
        id: booking.getId(),
        userId: booking.user.getId(),
        userName: booking.user.name,
        carId: booking.car.getId(),
        carModel: `${booking.car.brand} ${booking.car.model}`,
        startDate: booking.dateRange.startDate,
        endDate: booking.dateRange.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.getCreatedAt(),
      }));

      res.status(200).json(bookingDTOs);
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async getBookingsByCarId(req: Request, res: Response): Promise<void> {
    try {
      const carId = req.params.carId;

      if (!carId) {
        res.status(400).json({ message: 'Car ID is required' });
        return;
      }

      const bookings = await this.getBookingsByCarIdUseCase.execute(carId);

      // Map to DTOs
      const bookingDTOs = bookings.map((booking) => ({
        id: booking.getId(),
        userId: booking.user.getId(),
        userName: booking.user.name,
        startDate: booking.dateRange.startDate,
        endDate: booking.dateRange.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.getCreatedAt(),
      }));

      res.status(200).json(bookingDTOs);
    } catch (error) {
      console.error('Error in getBookingsByCarId:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async getBookingsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const bookings = await this.getBookingsByUserIdUseCase.execute(userId);

      // Map to DTOs
      const bookingDTOs = bookings.map((booking) => ({
        id: booking.getId(),
        carId: booking.car.getId(),
        carModel: `${booking.car.brand} ${booking.car.model}`,
        startDate: booking.dateRange.startDate,
        endDate: booking.dateRange.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.getCreatedAt(),
      }));

      res.status(200).json(bookingDTOs);
    } catch (error) {
      console.error('Error in getBookingsByUserId:', error);
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
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'Booking ID is required' });
        return;
      }

      await this.deleteBookingUseCase.execute(id);

      res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error in deleteBooking:', error);

      if (errorMessage.includes('not found')) {
        res.status(404).json({ message: errorMessage });
      } else {
        res.status(500).json({ message: errorMessage });
      }
    }
  }
}
