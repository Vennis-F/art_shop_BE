import { IsHash, IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class TokenResponseDto {
  @IsJWT()
  access_token: string;

  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
