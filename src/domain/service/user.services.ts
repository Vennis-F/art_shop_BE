import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';
import { UserRepository } from 'src/infrastructure/repository/user.repository';
import { UserRole } from '../entity/user.entity';
import { HashingHelper } from 'src/infrastructure/helper/hashing.helper';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name, { timestamp: true });

  constructor(private readonly userRepository: UserRepository) {}

  async signupUser(body: CreateUserDto) {
    if (await this.userRepository.isEmailExist(body.email)) {
      this.logger.error(`Email ${body.email} already exists.`);
      throw new ConflictException(
        `Email ${body.email} already exists. Please use a different email.`,
      );
    }

    const hashedPassword = await HashingHelper.hashData(body.password);

    const user = await this.userRepository.createUser({
      ...body,
      password: hashedPassword,
      role: UserRole.Customer,
    });

    this.logger.log(`User with ID: ${user.id} has been created.`);
  }

  async getUsers() {
    return this.userRepository.getUsers();
  }
}
