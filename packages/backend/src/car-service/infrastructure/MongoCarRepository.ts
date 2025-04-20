import { Collection, Db, ObjectId } from 'mongodb';
import { DateRange } from '../../shared/domain/DateRange';
import { Car } from '../domain/Car';
import { CarRepository } from '../domain/CarRepository';

export class MongoCarRepository implements CarRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('cars');
  }

  async findById(id: string): Promise<Car | null> {
    const carData = await this.collection.findOne({ _id: new ObjectId(id) });

    if (!carData) {
      return null;
    }

    return this.mapToDomain(carData);
  }

  async findAll(): Promise<Car[]> {
    const carsData = await this.collection.find().toArray();

    return carsData.map((carData) => this.mapToDomain(carData));
  }

  async findAvailableCars(dateRange: DateRange): Promise<Car[]> {
    const carsData = await this.collection
      .find({ stock: { $gt: 0 } })
      .toArray();

    return carsData.map((carData) => this.mapToDomain(carData));
  }

  async save(car: Car): Promise<void> {
    const carId = car.getId();
    const objectId = new ObjectId(carId);

    await this.collection.updateOne(
      { _id: objectId },
      {
        $set: {
          _id: objectId,
          brand: car.brand,
          model: car.model,
          stock: car.getStock(),
          peakSeasonPrice: car.peakSeasonPrice,
          midSeasonPrice: car.midSeasonPrice,
          offSeasonPrice: car.offSeasonPrice,
        },
      },
      { upsert: true }
    );
  }

  private mapToDomain(carData: any): Car {
    return new Car({
      id: carData._id,
      brand: carData.brand,
      model: carData.model,
      stock: carData.stock,
      peakSeasonPrice: carData.peakSeasonPrice,
      midSeasonPrice: carData.midSeasonPrice,
      offSeasonPrice: carData.offSeasonPrice,
    });
  }
}
