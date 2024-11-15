import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../../application/dto/category/create_category.dto';
import { CategoryRepository } from '../../infrastructure/repository/category.repository';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(body: CreateCategoryDto): Promise<void> {
    const { parentCategoryId } = body;
    const existedParentCategory =
      await this.categoryRepository.findCategoryByIdAndParentIdIsNull(
        parentCategoryId,
      );

    if (parentCategoryId === null || existedParentCategory !== null) {
      const category = await this.categoryRepository.createCategory(body);
      this.logger.log(`Category with ID: ${category.id} has been created.`);
    } else {
      throw new NotFoundException(
        `Parent category with ID: ${parentCategoryId} is not valid`,
      );
    }
  }
}
