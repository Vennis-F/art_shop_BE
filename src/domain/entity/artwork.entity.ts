import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { Category } from './category.entity';

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

  @Column({ unique: true, nullable: true })
  code: string;

  @ManyToOne(() => User, (user) => user.artworks, { eager: true })
  user: User;

  @ManyToMany(() => Category, (category) => category.artworks)
  @JoinTable({
    name: 'artwork_category',
    joinColumn: { name: 'artwork_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCode(): void {
    if (!this.code) {
      this.code = `ART-${uuidv4().slice(0, 8).toUpperCase()}`;
    }
  }
}
