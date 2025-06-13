import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/domain/entity/cart.entity';
import { CartItem } from 'src/domain/entity/cart_item.entity';
import { User } from 'src/domain/entity/user.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  async findByUser(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.artwork'],
    });
  }

  async createCart(user: User): Promise<Cart> {
    const cart = this.cartRepository.create({ user });
    return this.cartRepository.save(cart);
  }

  async saveCart(cart: Cart): Promise<Cart> {
    return this.cartRepository.save(cart);
  }

  async findCartItem(
    cartId: string,
    artworkId: string,
  ): Promise<CartItem | null> {
    return this.cartItemRepo.findOne({
      where: { cart: { id: cartId }, artwork: { id: artworkId } },
    });
  }

  async createCartItem(cartItemData: Partial<CartItem>): Promise<CartItem> {
    const item = this.cartItemRepo.create(cartItemData);
    return this.cartItemRepo.save(item);
  }

  async updateCartItem(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemRepo.save(cartItem);
  }

  async removeCartItem(cartItem: CartItem): Promise<void> {
    await this.cartItemRepo.remove(cartItem);
  }

  async deleteCartItems(cartId: string): Promise<void> {
    await this.cartItemRepo.delete({ cart: { id: cartId } });
  }

  async updateCartItemQuantity(
    cartItemId: string,
    newQuantity: number,
  ): Promise<void> {
    await this.cartItemRepo.update(cartItemId, { quantity: newQuantity });
  }
}
