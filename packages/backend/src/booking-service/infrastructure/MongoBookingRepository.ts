import { Collection, Db } from 'mongodb';
import { Car } from '../../car-service/domain/Car';
import { DateRange } from '../../shared/domain/DateRange';
import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';
import { DrivingLicense } from '../domain/DrivingLicense';
import { User } from '../domain/User';

export class MongoBookingRepository implements BookingRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('bookings');
  }

  async findById(id: string): Promise<Booking | null> {
    const bookingData = await this.collection.findOne({ _id: id });

    if (!bookingData) {
      return null;
    }

    return this.mapToDomain(bookingData);
  }

  async findByUserAndDateRange(
    userId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    // Find bookings where the user is the same and date ranges overlap
    const bookingsData = await this.collection
      .find({
        'user._id': userId,
        $or: [
          {
            // Start date of booking falls within the requested range
            'dateRange.startDate': {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
          },
          {
            // End date of booking falls within the requested range
            'dateRange.endDate': {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
          },
          {
            // Booking encompasses the requested range
            $and: [
              { 'dateRange.startDate': { $lte: dateRange.startDate } },
              { 'dateRange.endDate': { $gte: dateRange.endDate } },
            ],
          },
        ],
      })
      .toArray();

    return bookingsData.map((bookingData) => this.mapToDomain(bookingData));
  }

  async findByCarAndDateRange(
    carId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    // Find bookings where the car is the same and date ranges overlap
    const bookingsData = await this.collection
      .find({
        'car._id': carId,
        $or: [
          {
            // Start date of booking falls within the requested range
            'dateRange.startDate': {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
          },
          {
            // End date of booking falls within the requested range
            'dateRange.endDate': {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
          },
          {
            // Booking encompasses the requested range
            $and: [
              { 'dateRange.startDate': { $lte: dateRange.startDate } },
              { 'dateRange.endDate': { $gte: dateRange.endDate } },
            ],
          },
        ],
      })
      .toArray();

    return bookingsData.map((bookingData) => this.mapToDomain(bookingData));
  }

  async save(booking: Booking): Promise<void> {
    await this.collection.updateOne(
      { _id: booking.getId() },
      {
        $set: {
          _id: booking.getId(),
          user: {
            _id: booking.user.getId(),
            name: booking.user.name,
            email: booking.user.email,
            drivingLicense: {
              licenseNumber: booking.user.drivingLicense.licenseNumber,
              expiryDate: booking.user.drivingLicense.expiryDate,
            },
          },
          car: {
            _id: booking.car.getId(),
            brand: booking.car.brand,
            model: booking.car.model,
            stock: booking.car.getStock(),
            peakSeasonPrice: booking.car.peakSeasonPrice,
            midSeasonPrice: booking.car.midSeasonPrice,
            offSeasonPrice: booking.car.offSeasonPrice,
          },
          dateRange: {
            startDate: booking.dateRange.startDate,
            endDate: booking.dateRange.endDate,
          },
          totalPrice: booking.totalPrice,
          createdAt: booking.getCreatedAt(),
        },
      },
      { upsert: true }
    );
  }

  private mapToDomain(bookingData: any): Booking {
    const drivingLicense = new DrivingLicense(
      bookingData.user.drivingLicense.licenseNumber,
      new Date(bookingData.user.drivingLicense.expiryDate)
    );

    const user = new User({
      id: bookingData.user._id,
      name: bookingData.user.name,
      email: bookingData.user.email,
      drivingLicense,
    });

    const car = new Car({
      id: bookingData.car._id,
      brand: bookingData.car.brand,
      model: bookingData.car.model,
      stock: bookingData.car.stock,
      peakSeasonPrice: bookingData.car.peakSeasonPrice,
      midSeasonPrice: bookingData.car.midSeasonPrice,
      offSeasonPrice: bookingData.car.offSeasonPrice,
    });

    const dateRange = new DateRange(
      new Date(bookingData.dateRange.startDate),
      new Date(bookingData.dateRange.endDate)
    );

    return new Booking({
      id: bookingData._id,
      user,
      car,
      dateRange,
      totalPrice: bookingData.totalPrice,
      createdAt: new Date(bookingData.createdAt),
    });
  }
}
