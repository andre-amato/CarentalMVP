export class InMemoryUserRepository {
    constructor() {
        this.users = new Map();
    }
    async findById(id) {
        const user = this.users.get(id);
        return user || null;
    }
    async save(user) {
        this.users.set(user.getId(), user);
    }
    // Helper method for testing
    async clear() {
        this.users.clear();
    }
}
