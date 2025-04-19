export class Booking {
    constructor(props) {
        this.id = props.id || this.generateId();
        this.user = props.user;
        this.car = props.car;
        this.dateRange = props.dateRange;
        this.totalPrice = props.totalPrice;
        this.createdAt = props.createdAt || new Date();
        this.validate();
    }
    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
    getId() {
        return this.id;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    validate() {
        // Validate that the driving license is valid for the booking period
        if (!this.user.canDriveFor(this.dateRange)) {
            throw new Error('Driving license must be valid for the entire booking period');
        }
    }
}
