import { ObjectId } from 'mongodb';
import { DateRange } from '../../shared/domain/DateRange';
import { DrivingLicense } from './DrivingLicense';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  drivingLicense: DrivingLicense;
}

export class User {
  private readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly drivingLicense: DrivingLicense;

  constructor(props: UserProps) {
    this.id = props.id || new ObjectId().toHexString();
    this.name = props.name;
    this.email = props.email;
    this.drivingLicense = props.drivingLicense;
  }

  getId(): string {
    return this.id;
  }

  // Business rule: Driving license must be valid through all booking period
  canDriveFor(dateRange: DateRange): boolean {
    return this.drivingLicense.isValidFor(dateRange);
  }
}
