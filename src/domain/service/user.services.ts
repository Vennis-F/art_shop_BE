import { Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "src/application/dto/users/create_user.dto";
import { UserRepository } from "src/infrastructure/repository/user.repository";

@Injectable()
export class UserService {
  private logger = new Logger('UserService', { timestamp: true });

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(body: CreateUserDto){
    const user = await this.userRepository.createUser(body)
    this.logger.log(`User with ID: ${user.id} has been created.`);
  }

  async getUsers(){
    return this.userRepository.getUsers();
  }
}
