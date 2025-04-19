import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId(), user);
  }

  // Helper method for testing
  async clear(): Promise<void> {
    this.users.clear();
  }
}
