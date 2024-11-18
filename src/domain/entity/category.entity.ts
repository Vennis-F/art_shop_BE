import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  @Index()
  parentCategoryId: string;

  @CreateDateColumn()
  createAt: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
