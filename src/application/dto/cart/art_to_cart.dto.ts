import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  artworkId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
