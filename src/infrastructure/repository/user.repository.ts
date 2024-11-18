import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user: Partial<User>): Promise<User> {
    return await this.userRepository.save(this.userRepository.create(user));
  }

  getUsers() {
    return this.userRepository.find();
  }

  isEmailExist(email: string) {
    return this.userRepository.findOneBy({ email: email.toLowerCase() });
  }
}
