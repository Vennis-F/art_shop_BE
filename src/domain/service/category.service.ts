import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repository/category.repository';
import { CreateCategoryDto } from '../../application/dto/category/create_category.dto';
import { Category } from '../entity/category.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CategoryResponseDto } from '../../application/dto/category/category_response.dto';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createCategory(body: CreateCategoryDto): Promise<void> {
    const { parentCategoryId } = body;
    const existedParentCategory =
      await this.categoryRepository.findParentCategoryByIdAndParentIdIsNull(
        parentCategoryId,
      );

    if (parentCategoryId === null || existedParentCategory !== null) {
      const category = await this.categoryRepository.createCategory(body);

      const parentCategories = await this.loadParentCategories();
      await this.cacheManager.set('parentCategories', parentCategories);

      this.logger.log(
        `method=createCategory, category with ID: ${category.id} has been created.`,
      );
    } else {
      throw new NotFoundException(
        `method=createCategory, parent category with ID: ${parentCategoryId} is not valid`,
      );
    }
  }

  async getParentCategories(): Promise<CategoryResponseDto[]> {
    const cachedParentCategories =
      await this.cacheManager.get<Category[]>('parentCategories');

    if (cachedParentCategories) {
      this.logger.log(
        `method=getParentCategories, parent categories found in cache with size: ${cachedParentCategories.length}`,
      );
      return await Promise.all(
        cachedParentCategories.map((category) =>
          this.mapToCategoryDto(category),
        ),
      );
    }

    const parentCategories = await this.loadParentCategories();
    this.logger.log(
      `method=getParentCategories, parent categories not found in cache, loading from database, size:${parentCategories.length}`,
    );

    await this.cacheManager.set('parentCategories', parentCategories);

    return await Promise.all(
      parentCategories.map((category) => this.mapToCategoryDto(category)),
    );
  }

  async getChildrenCategories(
    parentCategoryId: string,
  ): Promise<CategoryResponseDto[]> {
    const childrenCategories =
      await this.categoryRepository.findChildrenCategoriesByParentId(
        parentCategoryId,
      );

    this.logger.log(
      `method=getChildrenCategories, children categories found with size: ${childrenCategories.length}`,
    );

    return await Promise.all(
      childrenCategories.map((category) => this.mapToCategoryDto(category)),
    );
  }

  private async loadParentCategories(): Promise<Category[]> {
    return this.categoryRepository.findParentCategories();
  }

  private async mapToCategoryDto(
    category: Category,
  ): Promise<CategoryResponseDto> {
    return {
      id: category.id,
      name: category.name,
      parentCategoryId: category.parentCategoryId,
      imageUrl: category.imageUrl,
      isDeleted: category.isDeleted,
    };
  }
}
