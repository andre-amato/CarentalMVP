import { DrivingLicense } from '../domain/DrivingLicense';
import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { CreateUserDTO } from '../../shared';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: CreateUserDTO): Promise<string> {
    const { name, email, drivingLicense } = dto;

    // Check if user already exists with this email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create driving license
    const license = new DrivingLicense(
      drivingLicense.licenseNumber,
      new Date(drivingLicense.expiryDate)
    );

    // Create user
    const user = new User({
      name,
      email,
      drivingLicense: license,
    });

    // Save user
    await this.userRepository.save(user);

    return user.getId();
  }
}
