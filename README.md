# Carental - Car Rental System MVP

A clean, maintainable MVP for a car rental booking system built with modern technologies and best practices.

## Overview

This project demonstrates a car rental booking engine with a robust architecture following Domain-Driven Design principles. The application features a monorepo structure with separate backend and frontend components that share common utilities and types.

## Features

- User registration and authentication
- Vehicle browsing by availability and date range
- Booking creation and management
- Dynamic seasonal pricing (peak, mid, off-season)
- Inventory management for multiple vehicles of the same model

## Architecture

The application implements Clean Architecture with clear separation between:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases orchestrating domain operations
- **Infrastructure Layer**: Implementation details (databases, APIs)
- **API Layer**: Controllers and routes for external communication

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- MongoDB
- Swagger for API documentation

### Frontend

- React with TypeScript
- Vite for build optimization
- Tailwind CSS
- Responsive Design
- React Query for data fetching
- React Router for navigation
- Lucide React for icons
- React DatePicker for date selection

### Testing

- E2E tests with Cypress
- Unit tests with Vitest and React Testing Library

### DevOps

- Docker and Docker Compose
- Multi-stage builds for optimized images

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm

### Running with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/carental.git
cd carental
```

2. Start the backend:

```bash
docker-compose up
```

This will start:

- MongoDB on port 27017
- Backend API with Express (proxied through Nginx)
- API Documentation: http://localhost:8080/api-docs

3. Start the frontend:

```bash
npm i
npm run dev
```

4. Access the application:

```
http://localhost:5173
```

## Testing

### Running End-to-End/Integration Tests

These tests cover the application functionality from start to end and focus on two user stories:

- US 1: As a customer I want to see the availability of cars on concrete time slots so I can be informed of pricing and stock

  - All available cars for the complete time slot will be returned
  - All cars returned will have the complete booking price and an average day/price

- US 2: As a customer I want to create a booking for a car
  - A user can have only one booking on the same dates
  - Driving license must be valid through all booking period

#### Frontend Tests (E2E)

**IMPORTANT NOTE:**
Before running Cypress tests, always restart Docker! The populated database can cause errors in testing.
Restart with these commands:

```bash
docker-compose down
docker-compose up
```

Now, in a other terminal:

```bash
npx cypress open
```

Click on E2E testing, select one of the suggested Cypress Browsers (Google Chrome or Electron)

##### US1.cy.js Test Flow:

1. Visit the homepage
2. Click "Create Account" (open account modal)
3. Fill out name, email, license number, and expiry date (enter user details)
4. Submit the form and log in (create account and authenticate)
5. Confirm "My Dashboard" is visible (verify successful login)
6. Click "Book a Car" (navigate to booking page)
7. Check default car availability (verify initial state)
8. Set booking dates to June 1–5, 2028 (4 days) - Peak Season Check Prices
   - Update pick-up and drop-off dates (enter date range)
   - Wait for API refresh (load updated data)
   - Confirm "Booking Duration: 4 days" is shown (verify duration)
   - Check daily and total prices for all cars (validate price display)
9. Set booking dates to September 20–25, 2028 (5 days) - Mid Season Check Prices
   - Change pick-up and drop-off dates (enter new date range)
   - Wait for API refresh (load new prices)
   - Confirm "Booking Duration: 5 days" is shown (verify duration)
   - Check updated pricing for all cars (validate price changes)
10. Set booking dates to September 15–19, 2028 (4 days, seasonal transition Peak to Mid to check average price)
    - Update date range again (adjust pick-up and drop-off)
    - Wait for API refresh (load seasonal rates)
    - Confirm "Booking Duration: 4 days" is shown (verify duration)
    - Check prices and availability per car (verify seasonal pricing)
    - Confirm availability info for each car (e.g., "Available: 3 units") (check stock levels)
11. Click on "Jaguar" and confirm booking (simulate a booking and check correct availability)
    - Click "Book Another Car" (return to booking view)
    - Re-enter September 15–19, 2028 (repeat previous range to check availability)
    - Confirm Jaguar now shows "Available: 0 unit" (verify updated availability after booking)

##### US2.cy.js Test Flow:

1. Visit the homepage
2. Click "Create Account" (open account modal)
3. Fill in name, email, license number, and expiry date (2030-12-01) (enter user details)
4. Submit the form and log in (create account and authenticate)
5. Confirm "My Dashboard" is visible (verify login success)
6. Click "Book a Car" (navigate to booking page)
7. Check default car availability (verify initial state)
8. Set booking dates to September 15–19, 2030 (4 days)
   - Update pick-up and drop-off fields (enter date range)
   - Wait for API refresh (load prices and availability)
   - Confirm "Booking Duration: 4 days" is shown (verify duration)
   - Verify daily and total prices for all cars (confirm pricing display)
   - Confirm availability info is displayed (check stock levels for all cars)
   - Click on "Jaguar" and confirm booking (book the car)
   - Click "Book Another Car" (start another booking process)
9. Set booking dates to September 16–17, 2030 (Testing the booked car blocked period)
   - Update pick-up and drop-off dates (enter new short range)
   - Verify car availability info again (check updated stock)
   - Confirm Jaguar now shows "Available: 0 unit" (verify booking impact)
   - Click on "Vito" and try to book (attempt overlapping booking)
   - Verify error: "User already has a booking for this date range" (check for conflict message)
   - Reload the page (reset UI state)
10. Set booking dates to November 29 – December 15, 2030 (Testing the drive license expired scenarios)
    - Update pick-up and drop-off dates (enter future range)
    - Click on "Vito" and try to confirm booking (attempt new booking)
    - Verify error: "Driving license must be valid for the entire booking period" (check license validation)

#### Backend Tests (E2E and Integration)

Run these commands to test the backend:

```bash
npm run test:backend:integration
```

This tests:

- US1: View car availability and pricing:

  - Should return all available cars for complete time slot with pricing during peak season
  - Should return correct pricing for mid-season booking
  - Should return correct pricing for off-season booking
  - Should validate invalid date parameters

- US2: Create Booking:
  - Should create a booking successfully
  - Should fail if driving license expires before booking ends
  - Should fail if the same user tries to book the same period with the same car
  - Should not allow booking another car for the same period

```bash
npm run test:backend:e2e
```

This tests the complete booking flow:

- Should create user, list cars, book one, and verify booking is registered

### Running Unit Tests

Frontend unit tests:

```bash
npm run test:frontend
```

Backend unit tests:

```bash
npm run test:backend:unit
```

## API Documentation

Once the application is running, access the Swagger UI at:

```
http://localhost:8080/api-docs
```

## Seeded Data

The application includes pre-seeded data for testing:

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

- Centralizes business logic in the domain layer
- Separates business rules from infrastructure
- Enables easier adaptation to changing requirements

### Repository Pattern

- Decouples domain logic from data storage
- Facilitates testing through dependency injection
- Ensures consistent data access patterns

## Future Improvements

- JWT authentication
- Role-based access control
- Payment processing integration
- Email/SMS notifications
- Admin panel for fleet management
- Enhanced test coverage
- Error tracking and monitoring
