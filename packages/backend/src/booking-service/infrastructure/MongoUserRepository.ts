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
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return null;
    }

    const objectId = new ObjectId(id);
    const userData = await this.collection.findOne({ _id: objectId });

    if (!userData) {
      return null;
    }

    return this.mapToDomain(userData);
  }

  async save(user: User): Promise<void> {
    const id = user.getId();

    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      const objectId = new ObjectId(id);

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
    } else {
      // Insert with a new ObjectId
      await this.collection.insertOne({
        _id: new ObjectId(),
        name: user.name,
        email: user.email,
        drivingLicense: {
          licenseNumber: user.drivingLicense.licenseNumber,
          expiryDate: user.drivingLicense.expiryDate,
        },
      });
    }
  }

  private mapToDomain(userData: any): User {
    const drivingLicense = new DrivingLicense(
      userData.drivingLicense.licenseNumber,
      new Date(userData.drivingLicense.expiryDate)
    );

    return new User({
      id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      drivingLicense,
    });
  }
}
