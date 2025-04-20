import { Collection, Db, ObjectId } from 'mongodb';
import { Car } from '../../car-service/domain/Car';
import { DateRange } from '../../shared/domain/DateRange';
import { DrivingLicense } from '../../user-service/domain/DrivingLicense';
import { User } from '../../user-service/domain/User';
import { Booking } from '../domain/Booking';
import { BookingRepository } from '../domain/BookingRepository';

export class MongoBookingRepository implements BookingRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('bookings');
  }

  async findById(id: string): Promise<Booking | null> {
    try {
      const objectId = new ObjectId(id);
      const bookingData = await this.collection.findOne({ _id: objectId });

      if (!bookingData) {
        return null;
      }

      return this.mapToDomain(bookingData);
    } catch (error) {
      // Handle invalid ObjectId format
      if (error instanceof Error && error.message.includes('ObjectId')) {
        return null;
      }
      throw error;
    }
  }

  async findByUserAndDateRange(
    userId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    try {
      const userObjectId = new ObjectId(userId);

      // Find bookings where the user is the same and date ranges overlap
      const bookingsData = await this.collection
        .find({
          'user._id': userObjectId,
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
    } catch (error) {
      // Handle invalid ObjectId format
      if (error instanceof Error && error.message.includes('ObjectId')) {
        return [];
      }
      throw error;
    }
  }

  async findByCarAndDateRange(
    carId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    try {
      const carObjectId = new ObjectId(carId);

      // Find bookings where the car is the same and date ranges overlap
      const bookingsData = await this.collection
        .find({
          'car._id': carObjectId,
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
    } catch (error) {
      // Handle invalid ObjectId format
      if (error instanceof Error && error.message.includes('ObjectId')) {
        return [];
      }
      throw error;
    }
  }

  async save(booking: Booking): Promise<void> {
    try {
      const bookingId = booking.getId();
      const objectId = new ObjectId(bookingId);

      // Try to convert user and car IDs to ObjectId
      const userObjectId = new ObjectId(booking.user.getId());
      const carObjectId = new ObjectId(booking.car.getId());

      await this.collection.updateOne(
        { _id: objectId },
        {
          $set: {
            user: {
              _id: userObjectId,
              name: booking.user.name,
              email: booking.user.email,
              drivingLicense: {
                licenseNumber: booking.user.drivingLicense.licenseNumber,
                expiryDate: booking.user.drivingLicense.expiryDate,
              },
            },
            car: {
              _id: carObjectId,
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
    } catch (error) {
      // If any ID is not a valid ObjectId, insert with new ones
      if (error instanceof Error && error.message.includes('ObjectId')) {
        await this.collection.insertOne({
          _id: new ObjectId(),
          user: {
            _id: new ObjectId(),
            name: booking.user.name,
            email: booking.user.email,
            drivingLicense: {
              licenseNumber: booking.user.drivingLicense.licenseNumber,
              expiryDate: booking.user.drivingLicense.expiryDate,
            },
          },
          car: {
            _id: new ObjectId(),
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
        });
      } else {
        throw error;
      }
    }
  }

  private mapToDomain(bookingData: any): Booking {
    const drivingLicense = new DrivingLicense(
      bookingData.user.drivingLicense.licenseNumber,
      new Date(bookingData.user.drivingLicense.expiryDate)
    );

    const user = new User({
      id: bookingData.user._id.toString(),
      name: bookingData.user.name,
      email: bookingData.user.email,
      drivingLicense,
    });

    const car = new Car({
      id: bookingData.car._id.toString(),
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
      id: bookingData._id.toString(),
      user,
      car,
      dateRange,
      totalPrice: bookingData.totalPrice,
      createdAt: new Date(bookingData.createdAt),
    });
  }

  async delete(id: string): Promise<void> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return;

    const objectId = new ObjectId(id);
    await this.collection.deleteOne({ _id: objectId });
  }
}
