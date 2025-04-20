import { Request, Response } from 'express';
import { CreateUserUseCase } from '../user-service/application/CreateUserUseCase';
import { DeleteUserUseCase } from '../user-service/application/DeleteUserUseCase';
import { GetUserUseCase } from '../user-service/application/GetUserUseCase';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase
  ) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, drivingLicense } = req.body;

      if (
        !name ||
        !email ||
        !drivingLicense ||
        !drivingLicense.licenseNumber ||
        !drivingLicense.expiryDate
      ) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const userId = await this.createUserUseCase.execute({
        name,
        email,
        drivingLicense,
      });

      res.status(201).json({
        message: 'User created successfully',
        userId,
      });
    } catch (error) {
      console.error('Error in createUser:', error);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const user = await this.getUserUseCase.execute(userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        id: user.getId(),
        name: user.name,
        email: user.email,
        drivingLicense: {
          licenseNumber: user.drivingLicense.licenseNumber,
          expiryDate: user.drivingLicense.expiryDate,
        },
      });
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      await this.deleteUserUseCase.execute(userId);

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error in deleteUser:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
