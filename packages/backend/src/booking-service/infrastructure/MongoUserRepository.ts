import { Collection, Db, ObjectId } from 'mongodb';
import { DrivingLicense } from '../domain/DrivingLicense';
import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';

export class MongoUserRepository implements UserRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('users');
  }

  async findById(id: string): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      const userData = await this.collection.findOne({ _id: objectId });

      if (!userData) {
        return null;
      }

      return this.mapToDomain(userData);
    } catch (error) {
      // Handle invalid ObjectId format
      if (error instanceof Error && error.message.includes('ObjectId')) {
        return null;
      }
      throw error;
    }
  }

  async save(user: User): Promise<void> {
    try {
      const objectId = new ObjectId(user.getId());

      await this.collection.updateOne(
        { _id: objectId },
        {
          $set: {
            name: user.name,
            email: user.email,
            drivingLicense: {
              licenseNumber: user.drivingLicense.licenseNumber,
              expiryDate: user.drivingLicense.expiryDate,
            },
          },
        },
        { upsert: true }
      );
    } catch (error) {
      // If the ID is not a valid ObjectId, insert with a new one
      if (error instanceof Error && error.message.includes('ObjectId')) {
        await this.collection.insertOne({
          _id: new ObjectId(),
          name: user.name,
          email: user.email,
          drivingLicense: {
            licenseNumber: user.drivingLicense.licenseNumber,
            expiryDate: user.drivingLicense.expiryDate,
          },
        });
      } else {
        throw error;
      }
    }
  }

  private mapToDomain(userData: any): User {
    const drivingLicense = new DrivingLicense(
      userData.drivingLicense.licenseNumber,
      new Date(userData.drivingLicense.expiryDate)
    );

    return new User({
      id: userData._id.toString(), // Convert ObjectId to string for domain entity
      name: userData.name,
      email: userData.email,
      drivingLicense,
    });
  }
}
