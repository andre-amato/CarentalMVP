import { ObjectId } from 'mongodb';
export class User {
    constructor(props) {
        this.id = props.id || new ObjectId().toHexString();
        this.name = props.name;
        this.email = props.email;
        this.drivingLicense = props.drivingLicense;
    }
    getId() {
        return this.id;
    }
    // Business rule: Driving license must be valid through all booking period
    canDriveFor(dateRange) {
        return this.drivingLicense.isValidFor(dateRange);
    }
}
