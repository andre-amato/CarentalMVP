export interface Car {
  id: string;
  brand: string;
  model: string;
  peakSeasonPrice: number;
  midSeasonPrice: number;
  offSeasonPrice: number;
}

export interface AvailableCar extends Car {
  totalPrice: number;
  averageDailyPrice: number;
  stock: number;
}

export interface DrivingLicense {
  licenseNumber: string;
  expiryDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  drivingLicense: DrivingLicense;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  drivingLicense: DrivingLicense;
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  carId: string;
  carModel?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
}

export interface CreateBookingRequest {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
}

export interface CarAvaiableBooking {
  id: string;
  brand: string;
  model: string;
  stock: number;
  averageDailyPrice: number;
  totalPrice: number;
}
