import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';
import { dirname, join } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

import { BookingController } from './api/BookingController';
import { CarController } from './api/CarController';
import { UserController } from './api/UserController';
import { setupRoutes } from './api/routes';

import { CreateBookingUseCase } from './booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from './booking-service/application/DeleteBookingUseCase';
import { GetAllBookingsUseCase } from './booking-service/application/GetAllBookingsUseCase';
import { GetBookingsByCarIdUseCase } from './booking-service/application/GetBookingsByCarIdUseCase';
import { GetBookingsByUserIdUseCase } from './booking-service/application/GetBookingsByUserIdUseCase';
import { MongoBookingRepository } from './booking-service/infrastructure/MongoBookingRepository';

import { GetAllCarsUseCase } from './car-service/application/GetAllCarsUseCase';
import { GetAvailableCarsUseCase } from './car-service/application/GetAvailableCarsUseCase';
import { GetCarByIdUseCase } from './car-service/application/GetCarByIdUseCase';
import { MongoCarRepository } from './car-service/infrastructure/MongoCarRepository';

import { CreateUserUseCase } from './user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from './user-service/application/DeleteUserUseCase';
import { GetUserUseCase } from './user-service/application/GetUserUseCase';
import { MongoUserRepository } from './user-service/infrastructure/MongoUserRepository';

import { seedDatabase } from './shared/infrastructure/seedDatabase';
import { GetAllUsersUseCase } from './user-service/application/GetAllUsersUseCase';

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Then set up CORS
  app.use(
    cors({
      origin: function (origin, callback) {
        // For development - allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // List of allowed origins - add your frontend URL
        const allowedOrigins = [
          'http://localhost:5174',
          'http://localhost:5173',
        ];
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:')
        ) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
  });

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`[CORS CHECK] Origin: ${req.headers.origin}`);
    next();
  });
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017';
  const DB_NAME = process.env.DB_NAME || 'carental';

  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(DB_NAME);

    // Repositories
    const carRepository = new MongoCarRepository(db);
    const bookingRepository = new MongoBookingRepository(db);
    const userRepository = new MongoUserRepository(db);

    // Car Use Cases
    const getAvailableCarsUseCase = new GetAvailableCarsUseCase(
      carRepository,
      bookingRepository
    );
    const getAllCarsUseCase = new GetAllCarsUseCase(carRepository);
    const getCarByIdUseCase = new GetCarByIdUseCase(carRepository);

    // Booking Use Cases
    const createBookingUseCase = new CreateBookingUseCase(
      bookingRepository,
      carRepository,
      userRepository
    );
    const deleteBookingUseCase = new DeleteBookingUseCase(bookingRepository);
    const getAllBookingsUseCase = new GetAllBookingsUseCase(bookingRepository);
    const getBookingsByCarIdUseCase = new GetBookingsByCarIdUseCase(
      bookingRepository
    );
    const getBookingsByUserIdUseCase = new GetBookingsByUserIdUseCase(
      bookingRepository
    );

    // User Use Cases
    const createUserUseCase = new CreateUserUseCase(userRepository);
    const getUserUseCase = new GetUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(
      userRepository,
      bookingRepository
    );
    const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

    // Controllers
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

    // Routes
    app.use(
      '/api',
      setupRoutes(carController, bookingController, userController)
    );

    // Swagger
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Carental API',
          version: '1.0.0',
          description: 'API for car rental service',
        },
        servers: [
          {
            url: 'http://localhost:8080',
            description: 'Development server',
          },
        ],
      },
      apis: [join(__dirname, './api/routes.ts')],
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Optional DB seeding
    if (process.env.SEED_DB === 'true') {
      await seedDatabase(db);
      console.log('Database seeded successfully');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      const publicPort = 8080;
      console.log(`🚀 Server running on http://localhost:${publicPort}`);
      console.log(`📚 Swagger UI: http://localhost:${publicPort}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❗ Unhandled promise rejection:', error);
  process.exit(1);
});

bootstrap();
