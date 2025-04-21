import express from 'express';
import { Db } from 'mongodb';
import { BookingController } from '../../../api/BookingController';
import { CarController } from '../../../api/CarController';
import { setupRoutes } from '../../../api/routes';
import { UserController } from '../../../api/UserController';
import { CreateBookingUseCase } from '../../../booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from '../../../booking-service/application/DeleteBookingUseCase';
import { GetAllBookingsUseCase } from '../../../booking-service/application/GetAllBookingsUseCase';
import { GetBookingsByCarIdUseCase } from '../../../booking-service/application/GetBookingsByCarIdUseCase';
import { GetBookingsByUserIdUseCase } from '../../../booking-service/application/GetBookingsByUserIdUseCase';
import { MongoBookingRepository } from '../../../booking-service/infrastructure/MongoBookingRepository';
import { GetAllCarsUseCase } from '../../../car-service/application/GetAllCarsUseCase';
import { GetAvailableCarsUseCase } from '../../../car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from '../../../car-service/application/GetCarByIdUseCase';
import { MongoCarRepository } from '../../../car-service/infrastructure/MongoCarRepository';
import { CreateUserUseCase } from '../../../user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from '../../../user-service/application/DeleteUserUseCase';
import { GetAllUsersUseCase } from '../../../user-service/application/GetAllUsersUseCase';
import { GetUserUseCase } from '../../../user-service/application/GetUserUseCase';
import { MongoUserRepository } from '../../../user-service/infrastructure/MongoUserRepository';

export function createTestApp(db: Db): express.Application {
  const app = express();
  app.use(express.json());

  // Initialize repositories
  const carRepository = new MongoCarRepository(db);
  const bookingRepository = new MongoBookingRepository(db);
  const userRepository = new MongoUserRepository(db);

  // Initialize use cases
  const getAvailableCarsUseCase = new GetAvailableCarsUseCase(
    carRepository,
    bookingRepository
  );
  const getAllCarsUseCase = new GetAllCarsUseCase(carRepository);
  const getCarByIdUseCase = new GetCarByIdUseCase(carRepository);
  const createBookingUseCase = new CreateBookingUseCase(
    bookingRepository,
    carRepository,
    userRepository
  );
  const getAllBookingsUseCase = new GetAllBookingsUseCase(bookingRepository);
  const getBookingsByCarIdUseCase = new GetBookingsByCarIdUseCase(
    bookingRepository
  );
  const getBookingsByUserIdUseCase = new GetBookingsByUserIdUseCase(
    bookingRepository
  );
  const deleteBookingUseCase = new DeleteBookingUseCase(bookingRepository);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(
    userRepository,
    bookingRepository
  );
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

  // Initialize controllers
  const carController = new CarController(
    getAvailableCarsUseCase,
    getAllCarsUseCase,
    getCarByIdUseCase
  );
  const bookingController = new BookingController(
    createBookingUseCase,
    deleteBookingUseCase,
    getAllBookingsUseCase,
    getBookingsByCarIdUseCase,
    getBookingsByUserIdUseCase
  );
  const userController = new UserController(
    createUserUseCase,
    getUserUseCase,
    deleteUserUseCase,
    getAllUsersUseCase
  );

  // Setup routes
  const router = setupRoutes(carController, bookingController, userController);
  app.use('/api', router);

  return app;
}
