import { Router } from 'express';
export function setupRoutes(carController, bookingController) {
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
    router.post('/bookings', (req, res) => bookingController.createBooking(req, res));
    return router;
}
