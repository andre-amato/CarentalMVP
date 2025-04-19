export class BookingController {
    constructor(createBookingUseCase) {
        this.createBookingUseCase = createBookingUseCase;
    }
    async createBooking(req, res) {
        try {
            const { userId, carId, startDate, endDate } = req.body;
            if (!userId || !carId || !startDate || !endDate) {
                res
                    .status(400)
                    .json({
                    message: 'userId, carId, startDate, and endDate are required',
                });
                return;
            }
            const bookingId = await this.createBookingUseCase.execute({
                userId,
                carId,
                startDate,
                endDate,
            });
            res.status(201).json({
                message: 'Booking created successfully',
                bookingId,
            });
        }
        catch (error) {
            console.error('Error in createBooking:', error);
            // Handle specific domain errors with appropriate status codes
            if (error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes('User not found') ||
                    errorMessage.includes('Car not found')) {
                    res.status(404).json({ message: errorMessage });
                    return;
                }
                if (errorMessage.includes('User already has a booking') ||
                    errorMessage.includes('Car is not available') ||
                    errorMessage.includes('Driving license must be valid')) {
                    res.status(400).json({ message: errorMessage });
                    return;
                }
            }
            res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            });
        }
    }
}
