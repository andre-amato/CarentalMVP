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
   * /api/cars:
   *   get:
   *     description: Get available cars for a date range
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
   *         description: List of available cars with pricing
   */
  router.get('/cars', (req, res) => carController.getAvailableCars(req, res));

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

  return router;
}
