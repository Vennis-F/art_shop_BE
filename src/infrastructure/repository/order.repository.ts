import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/domain/entity/order.entity';
import { OrderItem } from 'src/domain/entity/order_item.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async save(order: Order): Promise<Order> {
    return this.orderRepo.save(order);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.artwork', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['items', 'items.artwork', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.artwork', 'user'],
    });
  }
}
