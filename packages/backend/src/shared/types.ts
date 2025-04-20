export interface CarDTO {
  id: string;
  brand: string;
  model: string;
  stock: number;
  peakSeasonPrice: number;
  midSeasonPrice: number;
  offSeasonPrice: number;
}

export interface BookingDTO {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  drivingLicenseNumber: string;
  drivingLicenseExpiryDate: string;
}

export interface AvailableCarDTO {
  id: string;
  brand: string;
  model: string;
  totalPrice: number;
  averageDailyPrice: number;
}

export interface CreateBookingDTO {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
}

export interface DrivingLicenseDTO {
  licenseNumber: string;
  expiryDate: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  drivingLicense: DrivingLicenseDTO;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  drivingLicense: DrivingLicenseDTO;
}
