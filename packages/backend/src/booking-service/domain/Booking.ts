import { Car } from '../../car-service/domain/Car';
import { DateRange } from '../../shared/domain/DateRange';
import { User } from './User';

export interface BookingProps {
  id?: string;
  user: User;
  car: Car;
  dateRange: DateRange;
  totalPrice: number;
  createdAt?: Date;
}

export class Booking {
  private readonly id: string;
  readonly user: User;
  readonly car: Car;
  readonly dateRange: DateRange;
  readonly totalPrice: number;
  readonly createdAt: Date;

  constructor(props: BookingProps) {
    this.id = props.id || this.generateId();
    this.user = props.user;
    this.car = props.car;
    this.dateRange = props.dateRange;
    this.totalPrice = props.totalPrice;
    this.createdAt = props.createdAt || new Date();

    this.validate();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  private validate(): void {
    // Validate that the driving license is valid for the booking period
    if (!this.user.canDriveFor(this.dateRange)) {
      throw new Error(
        'Driving license must be valid for the entire booking period'
      );
    }
  }
}
