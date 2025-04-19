export class InMemoryCarRepository {
    constructor() {
        this.cars = new Map();
    }
    async findById(id) {
        const car = this.cars.get(id);
        return car || null;
    }
    async findAll() {
        return Array.from(this.cars.values());
    }
    async findAvailableCars(dateRange) {
        return Array.from(this.cars.values()).filter((car) => car.isAvailable());
    }
    async save(car) {
        this.cars.set(car.getId(), car);
    }
    // Helper method for testing
    async clear() {
        this.cars.clear();
    }
}
