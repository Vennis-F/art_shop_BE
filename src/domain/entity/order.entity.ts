import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order_item.entity';
import { v4 as uuidv4 } from 'uuid';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column('decimal', { default: 0 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // information for shipping
  @Column()
  shippingAddress: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ nullable: true })
  shippingPhone: string;

  @Column({ nullable: true })
  shippingName: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  note: string; // Ghi chú đơn hàng (nếu có)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCode(): void {
    if (!this.code) {
      this.code = `ORDER-${uuidv4().slice(0, 8).toUpperCase()}`;
    }
  }
}
