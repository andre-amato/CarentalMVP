# Carental - Car Rental System MVP

This project is an MVP (Minimum Viable Product) for a car rental system in Barcelona. It demonstrates a booking engine for car rentals with clean, maintainable architecture.

## Project Structure

The project follows a monorepo structure with the following main components:

- **Backend**: Node.js API built with Express, MongoDB, and TypeScript
- **Frontend**: React application built with Vite, TypeScript, and Tailwind CSS
- **Shared**: Shared types and utilities between frontend and backend

The application is structured using Domain-Driven Design (DDD) principles, with clear separation between:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases orchestrating domain operations
- **Infrastructure Layer**: Implementation details (databases, APIs)
- **API Layer**: Controllers and routes for external communication

## Features

- User registration and management
- Browse available cars by date range
- Create and manage bookings
- Seasonal pricing (peak, mid, off-season)
- Inventory management for multiple cars of the same model

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- MongoDB for data storage
- Swagger for API documentation

### Frontend

- React with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation
- Lucide React for icons
- React DatePicker for date selection

### Testing

- Unit tests with Vitest and React Testing Library
- E2E tests with Cypress

### DevOps

- Docker and Docker Compose for containerization
- Multi-stage builds for optimized images

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm (for local development)

### Running with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/carental.git
cd carental
```

2. Start the application with Docker Compose:

```bash
docker-compose up
```

This will start:

- MongoDB on port 27017
- Backend API on port 3000
- Frontend on port 5173

3. Access the application:
   - Frontend: http://localhost:5173
   - API Documentation: http://localhost:3000/api-docs

### Development Setup

For local development without Docker:

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB (you can use Docker for just the database):

```bash
docker-compose up mongo
```

3. Start the backend in development mode:

```bash
cd packages/backend
npm run dev
```

4. Start the frontend in development mode:

```bash
cd packages/frontend
npm run dev
```

## Testing

### Running Unit Tests

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test
```

### Running End-to-End Tests

```bash
# Run E2E tests in headless mode
cd packages/frontend
npm run test:e2e

# Open Cypress for interactive testing
cd packages/frontend
npm run test:e2e:open
```

## API Documentation

The backend API is documented using Swagger. Once the application is running, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

## Seeded Data

The application comes with pre-seeded data for testing:

### Users

- John Doe (john@example.com / ABC123)
- Jane Smith (jane@example.com / XYZ789)

### Cars

- Toyota Yaris (3 units)
- Seat Ibiza (5 units)
- Nissan Qashqai (2 units)
- Jaguar e-pace (1 unit)
- Mercedes Vito (2 units)

## Architecture Decisions

### Domain-Driven Design

The backend follows DDD principles to ensure that business logic is centralized in the domain layer. This approach:

- Makes the code more maintainable and testable
- Separates business rules from infrastructure details
- Enables easier adaptation to changing requirements

### Clean Architecture

The application implements Clean Architecture with clear boundaries between:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and service orchestration
- **Infrastructure Layer**: External concerns like database access
- **API Layer**: HTTP controllers and routes

### Repository Pattern

Data access is abstracted through repositories, which:

- Decouple domain logic from data storage
- Make testing easier by allowing dependency injection
- Ensure consistent data access patterns

## Future Improvements

- Add authentication with JWT
- Implement role-based access control
- Add payment processing integration
- Implement notifications via email/SMS
- Add admin panel for fleet management
- Improve test coverage
- Add error tracking and monitoring

## License

This project is licensed under the MIT License - see the LICENSE file for details.
