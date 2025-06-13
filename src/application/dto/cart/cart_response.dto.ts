import { Exclude, Expose, Type } from 'class-transformer';
import { CartItemResponseDto } from './cart_item_response.dto';

@Exclude()
export class CartResponseDto {
  @Expose()
  id: string;

  @Expose()
  totalPrice: number;

  @Expose()
  @Type(() => CartItemResponseDto)
  items: CartItemResponseDto[] = [];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
