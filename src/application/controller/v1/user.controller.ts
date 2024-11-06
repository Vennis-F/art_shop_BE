import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateUserDto } from "src/application/dto/users/create_user.dto";
import { User } from "src/domain/entity/user.entity";
import { UserService } from "src/domain/service/user.services";

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
  ): Promise<void> {
    return await this.userService.createUser(
      body
    );
  }
}
