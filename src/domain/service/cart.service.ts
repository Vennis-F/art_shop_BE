import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CartRepository } from 'src/infrastructure/repository/cart.repository';
import { ArtworkRepository } from 'src/infrastructure/repository/artwork.respository';
import { User } from 'src/domain/entity/user.entity';
import { Cart } from 'src/domain/entity/cart.entity';
import { AddToCartDto } from 'src/application/dto/cart/art_to_cart.dto';
import { Artwork } from '../entity/artwork.entity';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name, { timestamp: true });

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly artworkRepository: ArtworkRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findByUser(user.id);
    if (!cart) {
      cart = await this.cartRepository.createCart(user);
    }

    const cartItems = cart.items.map((item) => {
      const artwork = item.artwork;
      artwork.imageUrl = this.s3Service.getFileUrl(artwork.imageUrl);
      return { ...item, artwork };
    });

    return { ...cart, items: cartItems };
  }

  async removeItem(user: User, itemId: string): Promise<Cart> {
    const cart = await this.getCart(user);
    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item not found.`);
    }
    await this.cartRepository.removeCartItem(cartItem);
    this.logger.log(`User ${user.id} removed cart item ${itemId} from cart.`);

    await this.updateCartTotalPrice(cart, user);

    return this.getCart(user);
  }

  async clearCart(user: User): Promise<Cart> {
    const cart = await this.getCart(user);
    await this.cartRepository.deleteCartItems(cart.id);
    this.logger.log(`User ${user.id} cleared their cart.`);

    await this.updateCartTotalPrice(cart, user);

    return this.getCart(user);
  }

  async addToCart(user: User, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(user);
    const artwork = await this.validateArtwork(dto.artworkId);

    await this.processCartItem(cart, artwork, dto.quantity);
    await this.updateCartTotalPrice(cart, user);

    this.logger.log(
      `User ${user.id} added artwork ${artwork.id} (quantity: ${dto.quantity}) to cart.`,
    );
    return this.getCart(user);
  }

  /**
   * Validates the artwork's existence and availability.
   */
  private async validateArtwork(artworkId: string): Promise<Artwork> {
    const artwork = await this.artworkRepository.findById(artworkId);
    if (!artwork) {
      throw new NotFoundException(`Artwork with ID '${artworkId}' not found.`);
    }
    if (artwork.quantity === 0) {
      throw new ConflictException(
        `Artwork '${artwork.title}' is out of stock.`,
      );
    }
    return artwork;
  }

  /**
   * Processes the cart item by updating the quantity if it exists,
   * or creating a new cart item if it does not exist.
   */
  private async processCartItem(
    cart: Cart,
    artwork: Artwork,
    quantity: number,
  ): Promise<void> {
    if (quantity > artwork.quantity) {
      throw new ConflictException(
        `Cannot set quantity to ${quantity}. Only ${artwork.quantity} items are available.`,
      );
    }

    let cartItem = await this.cartRepository.findCartItem(cart.id, artwork.id);

    if (cartItem) {
      cartItem.quantity = quantity;
      await this.cartRepository.updateCartItem(cartItem);
    } else {
      await this.cartRepository.createCartItem({
        cart,
        artwork,
        quantity,
        price: artwork.price,
      });
    }
  }

  /**
   * Calculates and updates the total price of the cart based on its items.
   */
  private async updateCartTotalPrice(cart: Cart, user: User): Promise<void> {
    const updatedCart = await this.getCart(user);
    updatedCart.totalPrice = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    await this.cartRepository.saveCart(updatedCart);
  }
}
