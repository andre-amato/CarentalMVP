export class DateRange {
  constructor(readonly startDate: Date, readonly endDate: Date) {
    this.validate();
  }

  private validate(): void {
    if (this.startDate > this.endDate) {
      throw new Error('Start date cannot be after end date');
    }
  }

  containsDate(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  getDays(): number {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }
}
