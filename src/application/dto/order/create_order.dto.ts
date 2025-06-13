import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from 'src/domain/entity/order.entity';

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  shippingPhone: string;

  @IsString()
  @IsNotEmpty()
  shippingName: string;
}
