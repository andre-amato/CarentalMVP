import { DateRange } from '../../shared/domain/DateRange';

export class DrivingLicense {
  constructor(readonly licenseNumber: string, readonly expiryDate: Date) {}

  isValid(onDate: Date = new Date()): boolean {
    return this.expiryDate > onDate;
  }

  isValidFor(dateRange: DateRange): boolean {
    // License must be valid for the entire booking period
    return this.expiryDate > dateRange.endDate;
  }
}
