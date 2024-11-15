import {
  Column,
  CreateDateColumn,
  Entity,
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
  parentCategoryId: string;

  @CreateDateColumn()
  createAt: string;

  @Column({ default: false })
  isDeleted: boolean = false;
}
