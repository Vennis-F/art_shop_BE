import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../domain/entity/category.entity';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { CreateCategoryDto } from '../../application/dto/category/create_category.dto';
import { UpdateCategoryDto } from '../../application/dto/category/update_category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  findParentCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentCategoryId: IsNull() },
    });
  }

  findChildrenCategoriesByParentId(
    parentCategoryId: string,
  ): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentCategoryId: parentCategoryId },
    });
  }

  createCategory(body: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.save(body);
  }

  findParentCategoryByIdAndParentIdIsNull(
    id: string,
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id: id, parentCategoryId: IsNull() },
    });
  }

  findCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id: id },
    });
  }

  deleteCategory(id: string): Promise<UpdateResult> {
    return this.categoryRepository.softDelete(id);
  }

  updateCategory(id: string, body: UpdateCategoryDto): Promise<UpdateResult> {
    return this.categoryRepository.update(id, body);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }
}
