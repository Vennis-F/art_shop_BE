import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

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

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
