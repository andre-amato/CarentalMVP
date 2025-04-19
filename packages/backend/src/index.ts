import express from 'express';
import { MongoClient } from 'mongodb';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { BookingController } from './api/BookingController';
import { CarController } from './api/CarController';
import { setupRoutes } from './api/routes';
import { CreateBookingUseCase } from './booking-service/application/CreateBookingUseCase';
import { MongoBookingRepository } from './booking-service/infrastructure/MongoBookingRepository';
import { MongoUserRepository } from './booking-service/infrastructure/MongoUserRepository';
import { GetAvailableCarsUseCase } from './car-service/application/GetAvailableCarsUseCase';
import { MongoCarRepository } from './car-service/infrastructure/MongoCarRepository';
import { seedDatabase } from './shared/infrastructure/seedDatabase';

async function bootstrap() {
  // Set up Express app
  const app = express();
  app.use(express.json());

  // MongoDB Connection
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const DB_NAME = process.env.DB_NAME || 'carental';

  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Set up repositories
    const carRepository = new MongoCarRepository(db);
    const bookingRepository = new MongoBookingRepository(db);
    const userRepository = new MongoUserRepository(db);

    // Set up use cases
    const getAvailableCarsUseCase = new GetAvailableCarsUseCase(
      carRepository,
      bookingRepository
    );
    const createBookingUseCase = new CreateBookingUseCase(
      bookingRepository,
      carRepository,
      userRepository
    );

    // Set up controllers
    const carController = new CarController(getAvailableCarsUseCase);
    const bookingController = new BookingController(createBookingUseCase);

    // Set up API routes
    app.use('/api', setupRoutes(carController, bookingController));

    // Set up Swagger documentation
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

    // Seed the database if needed
    const shouldSeedDb = process.env.SEED_DB === 'true';
    if (shouldSeedDb) {
      await seedDatabase(db);
      console.log('Database seeded successfully');
    }

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

bootstrap();
