export class InMemoryBookingRepository {
    constructor() {
        this.bookings = new Map();
    }
    async findById(id) {
        const booking = this.bookings.get(id);
        return booking || null;
    }
    async findByUserAndDateRange(userId, dateRange) {
        return Array.from(this.bookings.values()).filter((booking) => {
            return (booking.user.getId() === userId && booking.dateRange.overlaps(dateRange));
        });
    }
    async findByCarAndDateRange(carId, dateRange) {
        return Array.from(this.bookings.values()).filter((booking) => {
            return (booking.car.getId() === carId && booking.dateRange.overlaps(dateRange));
        });
    }
    async save(booking) {
        this.bookings.set(booking.getId(), booking);
    }
    // Helper methods for testing
    async clear() {
        this.bookings.clear();
    }
    // Optional: Get all bookings (useful for testing)
    async findAll() {
        return Array.from(this.bookings.values());
    }
}
