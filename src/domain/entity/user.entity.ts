import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { RefreshToken } from './refresh_token.entity';
import { Category } from './category.entity';
import { Artwork } from './artwork.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';

export enum UserRole {
  Admin = 1,
  Manager = 2,
  Customer = 3,
}

export enum UserStatus {
  Active = 1,
  Pending = 2,
  Inactive = 3,
  Banned = 4,
  Deleted = 5,
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Pending,
    nullable: false,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
  })
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Artwork, (artwork) => artwork.user)
  artworks: Artwork[];

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  @JoinColumn()
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
