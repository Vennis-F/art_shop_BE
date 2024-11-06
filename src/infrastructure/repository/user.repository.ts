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
  
  createUser(body: CreateUserDto): Promise<User> {
    return this.userRepository.save(body)
  }

  getUsers(){
    return this.userRepository.find();
  }
}
