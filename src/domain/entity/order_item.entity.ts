import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Artwork } from './artwork.entity';
import { Order } from './order.entity';

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => Artwork, {
    eager: true,
    onDelete: 'SET NULL',
  })
  artwork: Artwork;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number; // snapshot when order is placed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
