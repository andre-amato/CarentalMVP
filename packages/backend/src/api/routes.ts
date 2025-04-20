import { Router } from 'express';
import { BookingController } from './BookingController';
import { CarController } from './CarController';
import { UserController } from './UserController';

export function setupRoutes(
  carController: CarController,
  bookingController: BookingController,
  userController: UserController
): Router {
  const router = Router();

  /**
   * @swagger
   * /api/cars/available:
   *   get:
   *     description: Get available cars for a date range with stock information
   *     parameters:
   *       - name: from
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - name: to
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: List of available cars with pricing and stock information
   */
  router.get('/cars/available', (req, res) =>
    carController.getAvailableCars(req, res)
  );

  /**
   * @swagger
   * /api/cars/all:
   *   get:
   *     description: Get all cars regardless of availability
   *     responses:
   *       200:
   *         description: List of all cars with full details
   */
  router.get('/cars/all', (req, res) => carController.getAllCars(req, res));

  /**
   * @swagger
   * /api/cars/{id}:
   *   get:
   *     description: Get a car by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Car details
   *       404:
   *         description: Car not found
   */
  router.get('/cars/:id', (req, res) => carController.getCarById(req, res));

  /**
   * @swagger
   * /api/bookings:
   *   get:
   *     description: Get all bookings
   *     responses:
   *       200:
   *         description: List of all bookings
   */
  router.get('/bookings', (req, res) =>
    bookingController.getAllBookings(req, res)
  );

  /**
   * @swagger
   * /api/bookings:
   *   post:
   *     description: Create a new booking
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - carId
   *               - startDate
   *               - endDate
   *             properties:
   *               userId:
   *                 type: string
   *               carId:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Booking created successfully
   */
  router.post('/bookings', (req, res) =>
    bookingController.createBooking(req, res)
  );

  /**
   * @swagger
   * /api/bookings/car/{carId}:
   *   get:
   *     description: Get all bookings for a specific car
   *     parameters:
   *       - name: carId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of bookings for the specified car
   */
  router.get('/bookings/car/:carId', (req, res) =>
    bookingController.getBookingsByCarId(req, res)
  );

  /**
   * @swagger
   * /api/bookings/user/{userId}:
   *   get:
   *     description: Get all bookings for a specific user
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of bookings for the specified user
   */
  router.get('/bookings/user/:userId', (req, res) =>
    bookingController.getBookingsByUserId(req, res)
  );

  /**
   * @swagger
   * /api/bookings/{id}:
   *   delete:
   *     description: Delete a booking by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Booking deleted successfully
   *       404:
   *         description: Booking not found
   */
  router.delete('/bookings/:id', (req, res) =>
    bookingController.deleteBooking(req, res)
  );

  /**
   * @swagger
   * /api/users:
   *   post:
   *     description: Create a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - drivingLicense
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               drivingLicense:
   *                 type: object
   *                 properties:
   *                   licenseNumber:
   *                     type: string
   *                   expiryDate:
   *                     type: string
   *                     format: date
   *     responses:
   *       201:
   *         description: User created successfully
   */
  router.post('/users', (req, res) => userController.createUser(req, res));

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     description: Get a user by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User found
   *       404:
   *         description: User not found
   */
  router.get('/users/:id', (req, res) => userController.getUser(req, res));

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     description: Delete a user by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  router.delete('/users/:id', (req, res) =>
    userController.deleteUser(req, res)
  );

  /**
   * @swagger
   * /api/users:
   *   get:
   *     description: Get all users
   *     responses:
   *       200:
   *         description: List of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   name:
   *                     type: string
   *                   email:
   *                     type: string
   *                   drivingLicense:
   *                     type: object
   *                     properties:
   *                       licenseNumber:
   *                         type: string
   *                       expiryDate:
   *                         type: string
   *                         format: date
   */
  router.get('/users', (req, res) => userController.getAllUsers(req, res));

  return router;
}
