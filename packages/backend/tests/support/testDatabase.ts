import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from '../../src/shared/infrastructure/seedDatabase';

export class TestDatabase {
  private static mongoServer: MongoMemoryServer;
  private static client: MongoClient;
  private static db: Db;

  static async connect(): Promise<Db> {
    this.mongoServer = await MongoMemoryServer.create();
    const uri = this.mongoServer.getUri();
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db('carental_test');
    return this.db;
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
    if (this.mongoServer) {
      await this.mongoServer.stop();
    }
  }

  static async clear(): Promise<void> {
    const collections = await this.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  static async seed(): Promise<void> {
    await seedDatabase(this.db);
  }
}
