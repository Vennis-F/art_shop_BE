import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/application/decorator/roles.decorator';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { RolesGuard } from 'src/application/guard/roles.guard';
import { User, UserRole } from 'src/domain/entity/user.entity';
import { UserService } from 'src/domain/service/user.services';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Post('/signup')
  async signupUser(@Body() body: CreateUserDto): Promise<void> {
    return await this.userService.signupUser(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Manager)
  @Get('/profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
