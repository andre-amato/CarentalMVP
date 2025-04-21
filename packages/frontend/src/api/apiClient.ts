import axios from 'axios';

// Create base axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Car API interfaces
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

// User API interfaces
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

// Booking API interfaces
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

// API methods
export const carApi = {
  getAvailableCars: async (
    from: string,
    to: string
  ): Promise<AvailableCar[]> => {
    const response = await apiClient.get<AvailableCar[]>(
      `/cars/available?from=${from}&to=${to}`
    );
    return response.data;
  },

  getAllCars: async (): Promise<Car[]> => {
    const response = await apiClient.get<Car[]>('/cars/all');
    return response.data;
  },

  getCarById: async (id: string): Promise<Car> => {
    const response = await apiClient.get<Car>(`/cars/${id}`);
    return response.data;
  },
};

export const userApi = {
  createUser: async (
    userData: CreateUserRequest
  ): Promise<{ userId: string }> => {
    const response = await apiClient.post<{ message: string; userId: string }>(
      '/users',
      userData
    );
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
};

export const bookingApi = {
  createBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<{ bookingId: string }> => {
    const response = await apiClient.post<{
      message: string;
      bookingId: string;
    }>('/bookings', bookingData);
    return response.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings');
    return response.data;
  },

  getBookingsByCarId: async (carId: string): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(`/bookings/car/${carId}`);
    return response.data;
  },

  getBookingsByUserId: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(`/bookings/user/${userId}`);
    return response.data;
  },

  deleteBooking: async (id: string): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`);
  },
};

export default apiClient;
