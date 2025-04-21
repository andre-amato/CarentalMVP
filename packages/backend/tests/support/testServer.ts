import express from 'express';
import { Db } from 'mongodb';

import { BookingController } from '../../src/api/BookingController';
import { CarController } from '../../src/api/CarController';
import { setupRoutes } from '../../src/api/routes';
import { UserController } from '../../src/api/UserController';

import { MongoBookingRepository } from '../../src/booking-service/infrastructure/MongoBookingRepository';
import { MongoCarRepository } from '../../src/car-service/infrastructure/MongoCarRepository';
import { MongoUserRepository } from '../../src/user-service/infrastructure/MongoUserRepository';

import { GetAllCarsUseCase } from '../../src/car-service/application/GetAllCarsUseCase';
import { GetAvailableCarsUseCase } from '../../src/car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from '../../src/car-service/application/GetCarByIdUseCase';

import { CreateBookingUseCase } from '../../src/booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from '../../src/booking-service/application/DeleteBookingUseCase';
import { GetAllBookingsUseCase } from '../../src/booking-service/application/GetAllBookingsUseCase';
import { GetBookingsByCarIdUseCase } from '../../src/booking-service/application/GetBookingsByCarIdUseCase';
import { GetBookingsByUserIdUseCase } from '../../src/booking-service/application/GetBookingsByUserIdUseCase';

import { CreateUserUseCase } from '../../src/user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from '../../src/user-service/application/DeleteUserUseCase';
import { GetAllUsersUseCase } from '../../src/user-service/application/GetAllUsersUseCase';
import { GetUserUseCase } from '../../src/user-service/application/GetUserUseCase';

export function createTestApp(db: Db): express.Application {
  const app = express();
  app.use(express.json());

  // Repositories
  const carRepo = new MongoCarRepository(db);
  const bookingRepo = new MongoBookingRepository(db);
  const userRepo = new MongoUserRepository(db);

  // Car Use Cases
  const getAvailableCars = new GetAvailableCarsUseCase(carRepo, bookingRepo);
  const getAllCars = new GetAllCarsUseCase(carRepo);
  const getCarById = new GetCarByIdUseCase(carRepo);

  // Booking Use Cases
  const createBooking = new CreateBookingUseCase(
    bookingRepo,
    carRepo,
    userRepo
  );
  const deleteBooking = new DeleteBookingUseCase(bookingRepo);
  const getAllBookings = new GetAllBookingsUseCase(bookingRepo);
  const getBookingsByCarId = new GetBookingsByCarIdUseCase(bookingRepo);
  const getBookingsByUserId = new GetBookingsByUserIdUseCase(bookingRepo);

  // User Use Cases
  const createUser = new CreateUserUseCase(userRepo);
  const getUser = new GetUserUseCase(userRepo);
  const deleteUser = new DeleteUserUseCase(userRepo, bookingRepo);
  const getAllUsers = new GetAllUsersUseCase(userRepo);

  // Controllers
  const carController = new CarController(
    getAvailableCars,
    getAllCars,
    getCarById
  );
  const bookingController = new BookingController(
    createBooking,
    deleteBooking,
    getAllBookings,
    getBookingsByCarId,
    getBookingsByUserId
  );
  const userController = new UserController(
    createUser,
    getUser,
    deleteUser,
    getAllUsers
  );

  // Routes
  app.use(
    '/api',
    setupRoutes(carController, bookingController, userController)
  );

  return app;
}
