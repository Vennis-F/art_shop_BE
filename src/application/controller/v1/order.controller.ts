import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Patch,
  Put,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';

import { plainToInstance } from 'class-transformer';
import { User, UserRole } from 'src/domain/entity/user.entity';
import { CreateOrderDto } from 'src/application/dto/order/create_order.dto';
import { OrderService } from 'src/domain/service/order.service';
import { OrderResponseDto } from 'src/application/dto/order/order_response.dto';
import { RolesGuard } from 'src/application/guard/roles.guard';
import { Roles } from 'src/application/decorator/roles.decorator';
import { UpdateOrderDto } from 'src/application/dto/order/update_order.dto';

@Controller('v1/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() body: CreateOrderDto, @Req() req: Request) {
    const user = req.user as User;
    console.log(body);
    const order = await this.orderService.createOrder(user, body);
    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/user')
  async getMyOrders(@Req() req: Request) {
    const user = req.user as User;
    const orders = await this.orderService.getOrdersByUser(user);
    return plainToInstance(OrderResponseDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async getOrders() {
    const orders = await this.orderService.getOrders();
    return plainToInstance(OrderResponseDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    const order = await this.orderService.getOrderById(user, id);
    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Customer)
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    const order = await this.orderService.cancelOrder(user, id);
    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async updateOrder(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    const updatedOrder = await this.orderService.updateOrderAsAdmin(id, body);
    return plainToInstance(OrderResponseDto, updatedOrder, {
      excludeExtraneousValues: true,
    });
  }
}
