import { ObjectId } from 'mongodb';
import { Car } from '../domain/Car';
export class MongoCarRepository {
    constructor(db) {
        this.collection = db.collection('cars');
    }
    async findById(id) {
        const carData = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!carData) {
            return null;
        }
        return this.mapToDomain(carData);
    }
    async findAll() {
        const carsData = await this.collection.find().toArray();
        return carsData.map((carData) => this.mapToDomain(carData));
    }
    async findAvailableCars(dateRange) {
        // Find cars with stock > 0
        const carsData = await this.collection
            .find({ stock: { $gt: 0 } })
            .toArray();
        return carsData.map((carData) => this.mapToDomain(carData));
    }
    async save(car) {
        const carId = car.getId();
        const objectId = new ObjectId(carId);
        await this.collection.updateOne({ _id: objectId }, {
            $set: {
                _id: objectId,
                brand: car.brand,
                model: car.model,
                stock: car.getStock(),
                peakSeasonPrice: car.peakSeasonPrice,
                midSeasonPrice: car.midSeasonPrice,
                offSeasonPrice: car.offSeasonPrice,
            },
        }, { upsert: true });
    }
    mapToDomain(carData) {
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
