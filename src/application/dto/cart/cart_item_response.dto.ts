import { Exclude, Expose, Type } from 'class-transformer';
import { ArtworkResponseDto } from '../artwork/artwork_response.dto';

@Exclude()
export class CartItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ArtworkResponseDto)
  artwork: ArtworkResponseDto;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
