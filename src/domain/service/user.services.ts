import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';
import { UserRepository } from 'src/infrastructure/repository/user.repository';
import { User, UserRole } from '../entity/user.entity';
import { HashingHelper } from 'src/infrastructure/helper/hashing.helper';
import { AddImageResponseDto } from 'src/application/dto/artwork/add_image_response.dto';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';
import { UpdateUserDto } from 'src/application/dto/users/update_user.dto';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name, { timestamp: true });

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

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

  async uploadImage(file: Express.Multer.File): Promise<AddImageResponseDto> {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const timestamp = Date.now();
    const key = `images/user/${timestamp}_${file.originalname}`;
    const url = await this.s3Service.uploadFile(
      bucketName,
      key,
      file.buffer,
      file.mimetype,
    );

    return { url, key };
  }

  async updateUser(userId: string, body: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, body);
    return this.userRepository.saveUser(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await HashingHelper.compareData(
      oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác.');
    }

    const hashedNewPassword = await HashingHelper.hashData(newPassword);
    user.password = hashedNewPassword;
    await this.userRepository.saveUser(user);

    this.logger.log(`User ${user.id} changed password successfully.`);
  }
}
