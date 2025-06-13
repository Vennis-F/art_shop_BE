import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/application/decorator/roles.decorator';
import { AddImageResponseDto } from 'src/application/dto/category/add_image_response.dto';
import { ChangePasswordDto } from 'src/application/dto/users/change_password.dto';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';
import { UpdateUserDto } from 'src/application/dto/users/update_user.dto';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { RolesGuard } from 'src/application/guard/roles.guard';
import { User, UserRole } from 'src/domain/entity/user.entity';
import { UserService } from 'src/domain/service/user.services';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('/')
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Post('/signup')
  async signupUser(@Body() body: CreateUserDto): Promise<void> {
    return await this.userService.signupUser(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Manager, UserRole.Customer)
  @Get('/profile')
  async getProfile(@Request() req: any) {
    return {
      ...req.user,
      avatarUrl: this.s3Service.getFileUrl(req.user.avatarUrl),
    };
  }

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async addImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AddImageResponseDto> {
    return this.userService.uploadImage(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile')
  async updateUserInfo(
    @Request() req: any,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    const userId = req.user.id;
    return await this.userService.updateUser(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile/change-password')
  async changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
    return this.userService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }
}
