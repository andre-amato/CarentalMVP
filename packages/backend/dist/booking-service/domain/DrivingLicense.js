export class DrivingLicense {
    constructor(licenseNumber, expiryDate) {
        this.licenseNumber = licenseNumber;
        this.expiryDate = expiryDate;
    }
    isValid(onDate = new Date()) {
        return this.expiryDate > onDate;
    }
    isValidFor(dateRange) {
        // License must be valid for the entire booking period
        return this.expiryDate > dateRange.endDate;
    }
}
