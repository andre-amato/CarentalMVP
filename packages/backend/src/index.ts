import express from 'express';
import { MongoClient } from 'mongodb';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { BookingController } from './api/BookingController';
import { CarController } from './api/CarController';
import { UserController } from './api/UserController';
import { setupRoutes } from './api/routes';

import { CreateBookingUseCase } from './booking-service/application/CreateBookingUseCase';
import { DeleteBookingUseCase } from './booking-service/application/DeleteBookingUseCase';
import { MongoBookingRepository } from './booking-service/infrastructure/MongoBookingRepository';
import { MongoUserRepository } from './user-service/infrastructure/MongoUserRepository';

import { GetAvailableCarsUseCase } from './car-service/application/GetAvailableCarsUseCase';
import { MongoCarRepository } from './car-service/infrastructure/MongoCarRepository';

import { CreateUserUseCase } from './user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from './user-service/application/DeleteUserUseCase';
import { GetUserUseCase } from './user-service/application/GetUserUseCase';

import { seedDatabase } from './shared/infrastructure/seedDatabase';

async function bootstrap() {
  const app = express();
  app.use(express.json());

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

    // Use Cases
    const getAvailableCarsUseCase = new GetAvailableCarsUseCase(
      carRepository,
      bookingRepository
    );

    const createBookingUseCase = new CreateBookingUseCase(
      bookingRepository,
      carRepository,
      userRepository
    );

    const deleteBookingUseCase = new DeleteBookingUseCase(
      bookingRepository,
      carRepository
    );

    const createUserUseCase = new CreateUserUseCase(userRepository);
    const getUserUseCase = new GetUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);

    // Controllers
    const carController = new CarController(getAvailableCarsUseCase);
    const bookingController = new BookingController(
      createBookingUseCase,
      deleteBookingUseCase
    );
    const userController = new UserController(
      createUserUseCase,
      getUserUseCase,
      deleteUserUseCase
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
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
      },
      apis: ['./src/api/routes.ts'],
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
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
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
