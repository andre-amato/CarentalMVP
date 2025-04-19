import { DrivingLicense } from './DrivingLicense';
import { DateRange } from '../../shared/domain/DateRange';

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
    this.id = props.id || this.generateId();
    this.name = props.name;
    this.email = props.email;
    this.drivingLicense = props.drivingLicense;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  getId(): string {
    return this.id;
  }

  // Business rule: Driving license must be valid through all booking period
  canDriveFor(dateRange: DateRange): boolean {
    return this.drivingLicense.isValidFor(dateRange);
  }
}
