import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { plainToInstance } from 'class-transformer';
import { CartResponseDto } from 'src/application/dto/cart/cart_response.dto';
import { CartService } from 'src/domain/service/cart.service';
import { AddToCartDto } from 'src/application/dto/cart/art_to_cart.dto';
import { User } from 'src/domain/entity/user.entity';

@Controller('v1/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: Request) {
    const user = req.user as User;
    const cart = await this.cartService.getCart(user);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/items')
  async addToCart(@Body() body: AddToCartDto, @Req() req: Request) {
    const user = req.user as User;
    const cart = await this.cartService.addToCart(user, body);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/items/:id')
  async removeItem(@Param('id') itemId: string, @Req() req: Request) {
    const user = req.user as User;
    const cart = await this.cartService.removeItem(user, itemId);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/items')
  async clearCart(@Req() req: Request) {
    const user = req.user as User;
    const cart = await this.cartService.clearCart(user);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }
}
