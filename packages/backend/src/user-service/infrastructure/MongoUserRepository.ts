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
    const userData = await this.collection.findOne({ _id: new ObjectId(id) });

    if (!userData) {
      return null;
    }

    return this.mapToDomain(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.collection.findOne({ email });

    if (!userData) {
      return null;
    }

    return this.mapToDomain(userData);
  }

  async save(user: User): Promise<void> {
    const userId = new ObjectId(user.getId());

    await this.collection.updateOne(
      { _id: userId },
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
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  private mapToDomain(userData: any): User {
    const drivingLicense = new DrivingLicense(
      userData.drivingLicense.licenseNumber,
      new Date(userData.drivingLicense.expiryDate)
    );

    return new User({
      id: userData._id,
      name: userData.name,
      email: userData.email,
      drivingLicense,
    });
  }
}
