import {
  IsString,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsPhoneNumber('VN')
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
