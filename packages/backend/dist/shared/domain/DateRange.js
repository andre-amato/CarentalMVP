export class DateRange {
    constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.validate();
    }
    validate() {
        if (this.startDate > this.endDate) {
            throw new Error('Start date cannot be after end date');
        }
    }
    containsDate(date) {
        return date >= this.startDate && date <= this.endDate;
    }
    overlaps(other) {
        return this.startDate <= other.endDate && this.endDate >= other.startDate;
    }
    getDays() {
        const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    }
}
