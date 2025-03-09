import { Exclude, Expose } from 'class-transformer';
import { IsHash, IsJWT, IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class TokenResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
