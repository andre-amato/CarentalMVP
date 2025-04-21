import { Db, MongoClient } from 'mongodb';
import { seedDatabase } from '../../../shared/infrastructure/seedDatabase';

export class TestDatabase {
  private static client: MongoClient;
  private static db: Db;

  static async connect(): Promise<Db> {
    if (!this.client) {
      const uri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017';
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('carental_test');
    }
    return this.db;
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  static async clear(): Promise<void> {
    if (this.db) {
      const collections = await this.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  }

  static async seed(): Promise<void> {
    if (this.db) {
      await seedDatabase(this.db);
    }
  }
}
