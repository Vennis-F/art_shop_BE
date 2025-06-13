import { Expose } from 'class-transformer';

export class AddImageResponseDto {
  @Expose()
  key: string;

  @Expose()
  url: string;
}
