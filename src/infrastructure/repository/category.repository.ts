import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../domain/entity/category.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from '../../application/dto/category/create_category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  findParentCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentCategoryId: IsNull(), isDeleted: false },
    });
  }

  findChildrenCategoriesByParentId(
    parentCategoryId: string,
  ): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentCategoryId: parentCategoryId, isDeleted: false },
    });
  }

  createCategory(body: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.save(body);
  }

  findParentCategoryByIdAndParentIdIsNull(
    id: string,
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id: id, parentCategoryId: IsNull(), isDeleted: false },
    });
  }
}
