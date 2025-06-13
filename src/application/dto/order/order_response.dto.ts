import { Exclude, Expose, Type } from 'class-transformer';
import { OrderItemResponseDto } from './order_item_response.dto';
import { PaymentMethod } from 'src/domain/entity/order.entity';

@Exclude()
export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  totalPrice: number;

  @Expose()
  status: string;

  @Expose()
  code: string;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  shippingAddress: string;

  @Expose()
  shippingPhone: string;

  @Expose()
  shippingName: string;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
