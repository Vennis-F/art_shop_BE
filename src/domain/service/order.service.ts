import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CartRepository } from 'src/infrastructure/repository/cart.repository';
import { User } from 'src/domain/entity/user.entity';
import {
  Order,
  OrderStatus,
  PaymentMethod,
} from 'src/domain/entity/order.entity';
import { OrderItem } from 'src/domain/entity/order_item.entity';
import { CreateOrderDto } from 'src/application/dto/order/create_order.dto';
import { OrderRepository } from 'src/infrastructure/repository/order.repository';
import { CartItem } from '../entity/cart_item.entity';
import { ArtworkRepository } from 'src/infrastructure/repository/artwork.respository';
import { DataSource, EntityManager } from 'typeorm';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';
import { UpdateOrderDto } from 'src/application/dto/order/update_order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly artworkRepository: ArtworkRepository,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  async createOrder(user: User, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const cart = await this.cartRepository.findByUser(user.id);
      if (!cart || !cart.items.length) {
        throw new BadRequestException('Your cart is empty.');
      }

      const { orderItems, totalPrice } = await this.validateAndBuildOrderItems(
        cart.items,
        manager,
      );

      const order = new Order();
      order.user = user;
      order.items = orderItems;
      order.totalPrice = totalPrice;
      order.status = OrderStatus.PENDING;
      order.paymentMethod = dto.paymentMethod;
      order.shippingAddress = dto.shippingAddress;
      order.shippingPhone = dto.shippingPhone;
      order.shippingName = dto.shippingName;

      const savedOrder = await manager.save(order);

      await this.cartRepository.deleteCartItems(cart.id);

      return savedOrder;
    });
  }

  async getOrdersByUser(user: User): Promise<Order[]> {
    return this.orderRepository.findByUser(user.id);
  }

  async getOrders(): Promise<Order[]> {
    const orders = await this.orderRepository.findAll();

    for (const order of orders) {
      for (const item of order.items) {
        item.artwork.imageUrl = this.s3Service.getFileUrl(
          item.artwork.imageUrl,
        );
      }
    }

    return orders;
  }

  async getOrderById(user: User, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.user.id !== user.id) {
      throw new NotFoundException('Order not found.');
    }

    // Điều chỉnh URL ảnh trực tiếp trên entity
    order.items.forEach((item) => {
      item.artwork.imageUrl = this.s3Service.getFileUrl(item.artwork.imageUrl);
    });

    return order; // <-- vẫn là instance của Order
  }

  private async validateAndBuildOrderItems(
    cartItems: CartItem[],
    manager: EntityManager,
  ): Promise<{ orderItems: OrderItem[]; totalPrice: number }> {
    const orderItems: OrderItem[] = [];
    let totalPrice = 0;

    for (const item of cartItems) {
      const artwork =
        await this.artworkRepository.findByIdPessimisticWithManager(
          item.artwork.id,
          manager,
        );

      if (!artwork) {
        throw new BadRequestException(
          `Artwork with ID ${item.artwork.id} does not exist.`,
        );
      }

      if (item.quantity > artwork.quantity) {
        await this.cartRepository.updateCartItemQuantity(
          item.id,
          artwork.quantity,
        );

        throw new ConflictException(
          `Số lượng tác phẩm "${artwork.title}" không đủ. Chỉ còn ${artwork.quantity} sản phẩm.`,
        );
      }

      // Trừ số lượng còn lại
      artwork.quantity -= item.quantity;
      await this.artworkRepository.saveArtwork(artwork, manager);

      const orderItem = new OrderItem();
      orderItem.artwork = artwork;
      orderItem.price = artwork.price; // dùng giá mới của artwork
      orderItem.quantity = item.quantity;

      orderItems.push(orderItem);

      totalPrice += artwork.price * item.quantity;
    }

    return { orderItems, totalPrice };
  }

  async cancelOrder(user: User, orderId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findById(orderId);

      if (!order || order.user.id !== user.id) {
        throw new NotFoundException('Order not found.');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Only pending orders can be cancelled.');
      }

      order.status = OrderStatus.CANCELLED;
      await manager.save(order);

      // Restore artwork quantities
      for (const item of order.items) {
        const artwork =
          await this.artworkRepository.findByIdPessimisticWithManager(
            item.artwork.id,
            manager,
          );

        if (!artwork) {
          throw new NotFoundException(
            `Artwork with ID ${item.artwork.id} not found.`,
          );
        }

        artwork.quantity += item.quantity;
        await this.artworkRepository.saveArtwork(artwork, manager);
      }

      return order;
    });
  }

  async updateOrderAsAdmin(
    orderId: string,
    dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findById(orderId);
      if (!order) throw new NotFoundException('Order not found.');

      const oldStatus = order.status;
      Object.assign(order, dto);
      const updated = await manager.save(order);

      // If status changed to CANCELLED from something else, restore artworks
      if (
        oldStatus !== OrderStatus.CANCELLED &&
        dto.status === OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          const artwork =
            await this.artworkRepository.findByIdPessimisticWithManager(
              item.artwork.id,
              manager,
            );

          if (!artwork) {
            throw new NotFoundException(
              `Artwork with ID ${item.artwork.id} not found.`,
            );
          }

          artwork.quantity += item.quantity;
          await this.artworkRepository.saveArtwork(artwork, manager);
        }
      }

      return updated;
    });
  }
}
