import { Db, ObjectId } from 'mongodb';
import { DrivingLicense } from '../../booking-service/domain/DrivingLicense';
import { User } from '../../booking-service/domain/User';
import { Car } from '../../car-service/domain/Car';

export async function seedDatabase(db: Db): Promise<void> {
  // Drop existing collections to avoid duplicates
  try {
    await db.collection('cars').drop();
    await db.collection('users').drop();
    await db.collection('bookings').drop();
  } catch (error) {
    // Collections might not exist yet
    console.log('No collections to drop or error dropping collections');
  }

  // Seed cars
  const carData = [
    {
      brand: 'Toyota',
      model: 'Yaris',
      stock: 3,
      peakSeasonPrice: 98.43,
      midSeasonPrice: 76.89,
      offSeasonPrice: 53.65,
    },
    {
      brand: 'Seat',
      model: 'Ibiza',
      stock: 5,
      peakSeasonPrice: 85.12,
      midSeasonPrice: 65.73,
      offSeasonPrice: 46.85,
    },
    {
      brand: 'Nissan',
      model: 'Qashqai',
      stock: 2,
      peakSeasonPrice: 101.46,
      midSeasonPrice: 82.94,
      offSeasonPrice: 59.87,
    },
    {
      brand: 'Jaguar',
      model: 'e-pace',
      stock: 1,
      peakSeasonPrice: 120.54,
      midSeasonPrice: 91.35,
      offSeasonPrice: 70.27,
    },
    {
      brand: 'Mercedes',
      model: 'Vito',
      stock: 2,
      peakSeasonPrice: 109.16,
      midSeasonPrice: 89.64,
      offSeasonPrice: 64.97,
    },
  ];

  // Create car entities and save to database
  const carEntities = carData.map((data) => new Car(data));
  for (const car of carEntities) {
    await db.collection('cars').insertOne({
      _id: new ObjectId(car.getId()),
      brand: car.brand,
      model: car.model,
      stock: car.getStock(),
      peakSeasonPrice: car.peakSeasonPrice,
      midSeasonPrice: car.midSeasonPrice,
      offSeasonPrice: car.offSeasonPrice,
    });
  }

  // Seed sample users
  const userData = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      drivingLicense: new DrivingLicense('ABC123', new Date('2026-01-01')),
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      drivingLicense: new DrivingLicense('XYZ789', new Date('2025-07-15')),
    },
  ];

  // Create user entities and save to database
  const userEntities = userData.map((data) => new User(data));
  for (const user of userEntities) {
    await db.collection('users').insertOne({
      _id: new ObjectId(user.getId()),
      name: user.name,
      email: user.email,
      drivingLicense: {
        licenseNumber: user.drivingLicense.licenseNumber,
        expiryDate: user.drivingLicense.expiryDate,
      },
    });
  }

  console.log(
    `Seeded ${carEntities.length} cars and ${userEntities.length} users`
  );
}
