import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('artwork')
@Index('idx_title', ['title'])
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column('decimal', { nullable: true })
  price: number;

  @Column({ nullable: true })
  shortDescription: string;

  @Column({ nullable: true })
  medium: string;

  @Column({ nullable: true })
  status: string;

  @Column('timestamp', { nullable: true })
  timestamp: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  quantity: number;

  @Column('decimal', { nullable: true })
  discount: number;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.artworks, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
