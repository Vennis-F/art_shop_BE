import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repository/category.repository';
import { CreateCategoryDto } from '../../application/dto/category/create_category.dto';
import { Category } from '../entity/category.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateCategoryDto } from '../../application/dto/category/update_category.dto';
import { User } from '../entity/user.entity';
import { CategoryResponseDto } from 'src/application/dto/category/category_response.dto';
import { AddImageResponseDto } from 'src/application/dto/category/add_image_response.dto';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';

@Injectable()
export class CategoryService {
  private logger = new Logger(CategoryService.name, { timestamp: true });

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createCategory(body: CreateCategoryDto, user: User): Promise<void> {
    const { parentCategoryId, name } = body;

    if (
      parentCategoryId &&
      !(await this.categoryRepository.findParentCategoryByIdAndParentIdIsNull(
        parentCategoryId,
      ))
    ) {
      this.logger.warn(
        `method=createCategory, parent category with ID: ${parentCategoryId} is not valid`,
      );
      throw new NotFoundException(
        `method=createCategory, parent category with ID: ${parentCategoryId} is not valid`,
      );
    }

    if (await this.categoryRepository.isNameExist(name)) {
      this.logger.error(`Name ${name} already exists.`);
      throw new ConflictException(
        `Name ${name} already exists. Please use a different name.`,
      );
    }

    const category = await this.categoryRepository.createCategory({
      ...body,
      user,
    });

    this.cacheCategories();

    this.logger.log(
      `method=createCategory, category with ID: ${category.id} has been created.`,
    );
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

  async fetchCategory(id: string) {
    const category = await this.categoryRepository.findCategoryById(id);

    if (!category) {
      this.logger.error(
        `method=fetchCategory, Category not found with ID: '${id}'`,
      );

      throw new NotFoundException(`Category not found with ID: '${id}'`);
    }

    return {
      ...category,
      imageUrl: this.s3Service.getFileUrl(category.imageUrl),
    };
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findCategoryById(id);
    const childrenCategories =
      await this.categoryRepository.findChildrenCategoriesByParentId(id);

    if (childrenCategories.length > 0) {
      throw new NotFoundException(
        `method=deleteCategory, category with ID: ${id} has children categories`,
      );
    }

    if (!category) {
      throw new NotFoundException(
        `method=deleteCategory, category with ID: ${id} not found`,
      );
    }

    const result = await this.categoryRepository.deleteCategory(id);
    if (result.affected === 0) {
      throw new InternalServerErrorException(
        `method=deleteCategory, category with ID: ${id} is deleted failed`,
      );
    }

    const parentCategories = await this.loadParentCategories();
    const categories = await this.loadCategories();
    await this.cacheManager.set('categories', categories);
    await this.cacheManager.set('parentCategories', parentCategories);

    this.logger.log(
      `method=deleteCategory, category with ID: ${id} has been deleted.`,
    );
  }

  async updateCategory(id: string, body: UpdateCategoryDto): Promise<void> {
    const category = await this.categoryRepository.findCategoryById(id);

    if (!category) {
      throw new NotFoundException(
        `method=updateCategory, category with ID: ${id} not found`,
      );
    }

    // Kiểm tra parentCategoryId hợp lệ
    if (body.parentCategoryId) {
      const parentCategory =
        await this.categoryRepository.findParentCategoryByIdAndParentIdIsNull(
          body.parentCategoryId,
        );
      if (!parentCategory) {
        throw new NotFoundException(
          `method=updateCategory, parent category with ID: ${body.parentCategoryId} is not valid`,
        );
      }
    }

    // ✅ Kiểm tra nếu name mới đã tồn tại trong category khác
    if (body.name && body.name !== category.name) {
      const nameExist = await this.categoryRepository.isNameExist(body.name);
      if (nameExist) {
        throw new ConflictException(
          `Name ${body.name} already exists. Please use a different name.`,
        );
      }
    }

    const result = await this.categoryRepository.updateCategory(id, body);
    if (result.affected === 0) {
      throw new InternalServerErrorException(
        `method=updateCategory, category with ID: ${id} update failed`,
      );
    }

    const parentCategories = await this.loadParentCategories();
    const categories = await this.loadCategories();
    await this.cacheManager.set('categories', categories);
    await this.cacheManager.set('parentCategories', parentCategories);

    this.logger.log(
      `method=updateCategory, category with ID: ${id} has been updated.`,
    );
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const cachedCategories =
      await this.cacheManager.get<Category[]>('categories');

    if (cachedCategories) {
      this.logger.log(
        `method=findAll, categories found in cache with size: ${cachedCategories.length}`,
      );
      return await Promise.all(
        cachedCategories.map((category) => this.mapToCategoryDto(category)),
      );
    }

    const categories = await this.loadCategories();

    this.logger.log(
      `method=findAll, categories not found in cache, loading from database, size:${categories.length}`,
    );

    await this.cacheManager.set('categories', categories);

    return await Promise.all(
      categories.map((category) => this.mapToCategoryDto(category)),
    );
  }

  async findTreeCategories(): Promise<Category[]> {
    const categories =
      await this.categoryRepository.findParentAndChildrenCategories();

    // this.logger.log(
    //   `method=findAll, categories not found in cache, loading from database, size:${categories.length}`,
    // );

    // await this.cacheManager.set('categories', categories);

    return categories.map((category) => ({
      ...category,
      imageUrl: this.s3Service.getFileUrl(category.imageUrl),
    }));
  }

  private async loadParentCategories(): Promise<Category[]> {
    return this.categoryRepository.findParentCategories();
  }

  private async loadCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  private async cacheCategories() {
    const parentCategories = await this.loadParentCategories();
    const categories = await this.loadCategories();
    await this.cacheManager.set('parentCategories', parentCategories);
    await this.cacheManager.set('categories', categories);

    this.logger.log(
      `method=cacheCategories, cached parent categories: ${parentCategories.length}, categories: ${categories.length}`,
    );
  }

  private async mapToCategoryDto(
    category: Category,
  ): Promise<CategoryResponseDto> {
    return {
      id: category.id,
      name: category.name,
      parentCategoryId: category.parentCategoryId,
      imageUrl: category.imageUrl,
      deletedAt: category.deletedAt,
      description: category.description,
    };
  }

  async uploadImage(file: Express.Multer.File): Promise<AddImageResponseDto> {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const timestamp = Date.now();
    const key = `images/category/${timestamp}_${file.originalname}`;
    const url = await this.s3Service.uploadFile(
      bucketName,
      key,
      file.buffer,
      file.mimetype,
    );

    return { url, key };
  }
}
