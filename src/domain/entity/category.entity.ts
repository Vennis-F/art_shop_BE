import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Artwork } from './artwork.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Index()
  parentCategoryId: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  children: Category[];

  @ManyToOne(() => User, (user) => user.categories, { eager: true })
  user: User;

  @ManyToMany(() => Artwork, (artwork) => artwork.categories)
  artworks: Artwork[];

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
